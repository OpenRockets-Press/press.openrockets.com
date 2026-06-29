interface Env {
  ADMIN_SESSION_SECRET?: string;
}

const COOKIE_NAME = "__orp_session";

async function deriveKey(secret: string): Promise<CryptoKey> {
  const raw = new TextEncoder().encode(secret);
  return crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await deriveKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${b64}.${btoa(payload)}`;
}

function getSessionSecret(env: Env): string {
  return env.ADMIN_SESSION_SECRET?.trim() || "openrockets-dev-secret-change-me-before-production";
}

async function makeSessionCookie(user: any, env: Env): Promise<string> {
  const token = await sign(JSON.stringify(user), getSessionSecret(env));
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  
  let returnTo = url.searchParams.get("returnTo");
  if (!returnTo || !returnTo.startsWith("/")) {
    returnTo = "/dashboard";
  }

  if (!token) {
    return Response.redirect(url.origin + "/login", 302);
  }

  try {
    const response = await fetch("https://openrocketsauth.alwaysdata.net/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("SSO Token validation failed");
      return Response.redirect(url.origin + "/login?error=sso_failed", 302);
    }

    const userData = await (response.json() as Promise<any>);

    // Construct the SessionUser matching the frontend type
    const sessionUser = {
      userId: String(userData.id),
      displayName: userData.name || "Contributor",
      email: userData.email,
      role: "contributor", // Default role
      accountStatus: "active", // Default status
      consentTier: "general", // Default tier
      avatarUrl: userData.profile?.avatar_url || null,
      dateOfBirth: userData.profile?.date_of_birth || null,
      token: token,
    };

    const cookie = await makeSessionCookie(sessionUser, env);

    return new Response(null, {
      status: 302,
      headers: {
        Location: url.origin + returnTo,
        "Set-Cookie": cookie,
      },
    });
  } catch (error) {
    console.error("SSO Exception:", error);
    return Response.redirect(url.origin + "/login?error=sso_exception", 302);
  }
};
