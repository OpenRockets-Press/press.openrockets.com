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
