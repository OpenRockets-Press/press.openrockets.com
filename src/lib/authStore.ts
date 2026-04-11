import type { AccountStatus, ConsentTier, Role } from "@shared/types";

const STORAGE_KEY = "orp.session.v1";

export interface SessionUser {
  userId: string;
  displayName: string;
  email: string;
  role: Role;
  accountStatus: AccountStatus;
  consentTier: ConsentTier;
}

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function getSessionUser(): SessionUser | null {
  if (!hasWindow()) return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    if (!parsed.userId || !parsed.email) return null;
    return {
      userId: parsed.userId,
      displayName: parsed.displayName ?? "Contributor",
      email: parsed.email,
      role: parsed.role ?? "contributor",
      accountStatus: parsed.accountStatus ?? "active",
      consentTier: parsed.consentTier ?? "general",
    };
  } catch {
    return null;
  }
}

export function setSessionUser(user: SessionUser): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function updateSessionStatus(status: AccountStatus): void {
  const current = getSessionUser();
  if (!current) return;
  setSessionUser({ ...current, accountStatus: status });
}

export function updateSessionRole(role: Role): void {
  const current = getSessionUser();
  if (!current) return;
  setSessionUser({ ...current, role });
}

export function clearSessionUser(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
