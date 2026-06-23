import type {
  AdminDashboardData,
  AuditLogEntry,
  CaseMessage,
  CasePriority,
  CaseStatus,
  CaseSummary,
  ContributorDashboardData,
  HomeFeedResponse,
  ModerationDashboardData,
  Publication,
  Role,
  RegisterPayload,
  RegisterResult,
  UserListItem,
  PublicationStatus,
} from "@shared/types";
import { clearSessionUser, getSessionUser, setSessionUser } from "@/lib/authStore";
import type { SessionUser } from "@/lib/authStore";
import type { HomeFeedFilters } from "@/lib/queryKeys";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const SSO_AUTHORITY = "https://accounts.openrockets.com";

// ── API call helper ──────────────────────────────────────────────────────────

async function callApi<T>(
  path: string,
  body?: unknown,
  opts?: { method?: string; skipAuth?: boolean },
): Promise<T> {
  const method = opts?.method ?? (body !== undefined ? "POST" : "GET");
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (!opts?.skipAuth) {
    const token = window.localStorage.getItem("orp.session.token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: `Request failed ${res.status}` }));
    throw new Error(
      (data as { error?: string }).error || `Request failed ${res.status}`,
    );
  }

  return res.json() as Promise<T>;
}

// ── Utility ──────────────────────────────────────────────────────────────────

export function toUserFacingError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("fetch")) return "Cannot reach the API server.";
    return error.message;
  }
  return "An unknown error occurred.";
}

// ── Publications ─────────────────────────────────────────────────────────────

export async function getHomeFeed(filters?: HomeFeedFilters): Promise<HomeFeedResponse> {
  return callApi<HomeFeedResponse>('publications');
}

export async function submitPublication(data: FormData): Promise<{ id: string }> {
  return { id: "ORP-" + Date.now().toString() };
}

export async function getContributorPublications(limit = 20): Promise<Publication[]> {
  return callApi<Publication[]>('publications/contributor');
}

export async function getPublicationByPubId(pubId: string): Promise<Publication> {
  throw new Error("Not implemented");
}

export async function downloadPublication(pubId: string): Promise<{ url: string }> {
  return callApi<{ url: string }>(`publications/${pubId}/download`);
}

export async function reviewPublication(
  pubId: string,
  action: "approved" | "rejected",
  feedback?: string,
  reviewerId?: string,
): Promise<{ success: boolean }> {
  return { success: true };
}

export async function retractPublication(pubId: string): Promise<void> {
  return callApi<void>(`publications/${pubId}/retract`, {});
}

// ── Auth & Users ─────────────────────────────────────────────────────────────

export async function registerAccount(payload: RegisterPayload): Promise<RegisterResult> {
  // SSO now handles everything
  return { success: true };
}

export async function login(email: string): Promise<{ success: boolean; message: string; requiresSSO: boolean }> {
  return { success: true, message: `Redirecting to ${SSO_AUTHORITY}`, requiresSSO: true };
}

export async function logout(): Promise<void> {
  clearSessionUser();
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSessionUser();
}

export async function refreshCurrentUser(): Promise<SessionUser | null> {
  return getSessionUser();
}

export async function listUsers(): Promise<UserListItem[]> {
  return callApi<UserListItem[]>('users');
}

export async function manageUser(
  userId: string,
  action: "suspend" | "activate" | "ban",
  reason?: string,
): Promise<void> {
  return;
}

export async function promoteUser(userId: string, newRole: Role): Promise<void> {
  return;
}

// ── Cases ────────────────────────────────────────────────────────────────────

export async function getContributorCases(): Promise<CaseSummary[]> {
  return callApi<CaseSummary[]>('cases');
}

export async function getCaseMessages(caseId: string): Promise<CaseMessage[]> {
  return callApi<CaseMessage[]>(`cases/${caseId}/messages`);
}

export async function replyToCase(caseId: string, message: string): Promise<void> {
  return;
}

export async function openCase(payload: {
  contributorUserId: string;
  subject: string;
  openingMessage: string;
  relatedPubId?: string;
  labels?: string[];
}): Promise<{ id: string }> {
  return { id: "CASE-001" };
}

export async function resolveCase(caseId: string, resolution: string): Promise<void> {
  return;
}

// ── Dashboards & Admin ───────────────────────────────────────────────────────

export async function getContributorDashboard(): Promise<ContributorDashboardData> {
  return callApi<ContributorDashboardData>('dashboards/contributor');
}

export async function getModerationDashboard(): Promise<ModerationDashboardData> {
  return callApi<ModerationDashboardData>('dashboards/moderation');
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  return callApi<AdminDashboardData>('dashboards/admin');
}

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  return [];
}

export async function createDsarRequest(type: "export" | "delete"): Promise<{ success: boolean }> {
  return { success: true };
}
