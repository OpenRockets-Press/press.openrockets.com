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

async function verify(token: string, secret: string): Promise<string | null> {
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const sigB64 = token.slice(0, dot);
  const payloadB64 = token.slice(dot + 1);

  let payload: string;
  try {
    payload = atob(payloadB64);
  } catch {
    return null;
  }

  const key = await deriveKey(secret);
  let sigBytes: Uint8Array;
  try {
    sigBytes = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }

  const signature = sigBytes.slice().buffer;
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    new TextEncoder().encode(payload)
  );
  return valid ? payload : null;
}

function getSessionSecret(env: Env): string {
  return env.ADMIN_SESSION_SECRET?.trim() || "openrockets-dev-secret-change-me-before-production";
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const cookies = request.headers.get("Cookie") ?? "";
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  
  if (!match) {
    return Response.json({ authenticated: false, user: null });
  }

  const raw = decodeURIComponent(match[1]);
  const payload = await verify(raw, getSessionSecret(env));
  
  if (!payload) {
    return Response.json({ authenticated: false, user: null });
  }

  try {
    const user = JSON.parse(payload);
    return Response.json({ authenticated: true, user });
  } catch {
    return Response.json({ authenticated: false, user: null });
  }
};
