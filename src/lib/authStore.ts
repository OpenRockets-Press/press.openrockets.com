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
    try {
      const payloadBase64 = urlToken.split('.')[1];
      if (payloadBase64) {
        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const pad = base64.length % 4;
        const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
        const payload = JSON.parse(atob(padded));
        
        window.localStorage.setItem("orp.session.token", urlToken);
        
        const user: SessionUser = {
          userId: String(payload.sub || payload.id || "mock-user-id"),
          email: payload.email || "user@example.com",
          displayName: payload.name || "Contributor",
          role: "contributor",
          accountStatus: "active",
          consentTier: "general",
          avatarUrl: payload.avatar_url || payload.profile?.avatar_url || null,
          dateOfBirth: payload.profile?.date_of_birth || null,
        };
        window.localStorage.setItem("orp.session.v1", JSON.stringify(user));
        cachedSession = user;
        
        // Strip token from URL without reloading
        params.delete("token");
        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState({}, '', newUrl);
        
        return user;
      }
    } catch (e) {
      console.error("Failed to parse SSO token from URL", e);
    }
  }

  if (sessionPromise && !forceRefresh) return sessionPromise;

  sessionPromise = fetch("/api/auth/session")
    .then((res) => {
      const contentType = res.headers.get("content-type");
      if ((res.status === 404 || (contentType && contentType.includes("text/html"))) && hasWindow()) {
        const raw = window.localStorage.getItem("orp.session.v1");
        if (raw) return { authenticated: true, user: JSON.parse(raw) };
        return { authenticated: false, user: null };
      }
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then((data) => {
      if (data.authenticated && data.user) {
        cachedSession = data.user;
        return data.user;
      }
      cachedSession = null;
      return null;
    })
    .catch((err) => {
      console.error("Failed to fetch session", err);
      cachedSession = null;
      return null;
    });

  return sessionPromise;
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
