import type { AccountStatus, ConsentTier, Role } from "@shared/types";

export interface SessionUser {
  userId: string;
  displayName: string;
  email: string;
  role: Role;
  accountStatus: AccountStatus;
  consentTier: ConsentTier;
  avatarUrl?: string;
  dateOfBirth?: string;
}

let cachedSession: SessionUser | null = null;
let sessionPromise: Promise<SessionUser | null> | null = null;

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export async function fetchSessionUser(forceRefresh = false): Promise<SessionUser | null> {
  if (!hasWindow()) return null;
  
  // Globally intercept SSO token from URL
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get("token");
  if (urlToken) {
    window.localStorage.setItem("orp.session.token", urlToken);
    params.delete("token");
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newUrl);
  }

  const currentToken = window.localStorage.getItem("orp.session.token");

  if (sessionPromise && !forceRefresh) return sessionPromise;

  if (currentToken) {
    sessionPromise = fetch("https://openrocketsauth.alwaysdata.net/api/auth/me", {
      headers: { Authorization: `Bearer ${currentToken}` }
    })
    .then(async res => {
      if (!res.ok) throw new Error("Invalid token");
      const userData = await res.json();
      const user: SessionUser = {
        userId: String(userData.id || "mock-user-id"),
        email: userData.email || "user@example.com",
        displayName: userData.name || userData.displayName || "Contributor",
        role: "contributor",
        accountStatus: "active",
        consentTier: "general",
        avatarUrl: userData.avatarUrl || userData.avatar_url || userData.profile?.avatarUrl || null,
        dateOfBirth: userData.profile?.date_of_birth || userData.profile?.dateOfBirth || null,
      };
      window.localStorage.setItem("orp.session.v1", JSON.stringify(user));
      cachedSession = user;
      return user;
    })
    .catch((err) => {
      console.error("Failed to fetch session from auth server", err);
      // Fallback to local storage if network fails but token exists
      const raw = window.localStorage.getItem("orp.session.v1");
      if (raw) return JSON.parse(raw);
      return null;
    });
    
    return sessionPromise;
  }

  return Promise.resolve(null);
}

export function getSessionUser(): SessionUser | null {
  return cachedSession;
}

export function setSessionUser(user: SessionUser): void {
  cachedSession = user;
}

export function updateSessionStatus(status: AccountStatus): void {
  if (!cachedSession) return;
  cachedSession = { ...cachedSession, accountStatus: status };
}

export function updateSessionRole(role: Role): void {
  if (!cachedSession) return;
  cachedSession = { ...cachedSession, role };
}

export function clearSessionUser(): void {
  cachedSession = null;
  sessionPromise = Promise.resolve(null);
  if (hasWindow()) {
    // We could optionally trigger a logout request here if needed
    // fetch("/api/auth/logout", { method: "POST" });
  }
}
