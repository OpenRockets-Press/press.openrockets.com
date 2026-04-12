import type {
  AdminDashboardData,
  CaseMessage,
  CasePriority,
  CaseStatus,
  CaseSummary,
  ConsentConfirmPayload,
  ContributorDashboardData,
  HomeFeedResponse,
  ModerationDashboardData,
  Publication,
  Role,
  RegisterPayload,
  RegisterResult,
} from "@shared/types";
import { REQUIRES_GUARDIAN } from "@/lib/consent";
import { clearSessionUser, getSessionUser, setSessionUser } from "@/lib/authStore";
import type { SessionUser } from "@/lib/authStore";
import {
  account,
  appwriteConfig,
  databases,
  ID,
  isAppwriteConfigured,
  Query,
  storage,
} from "@/lib/appwrite";
import type { HomeFeedFilters } from "@/lib/queryKeys";

interface AppwriteDocument {
  $id: string;
  [key: string]: unknown;
}

// ── JWT cache ────────────────────────────────────────────────────────────────

let jwtCache: { token: string; expiresAt: number } | null = null;
let remoteAuthBackoffUntil = 0;

const AUTH_PROBE_COOLDOWN_MS = 10_000;
const AUTH_PROBE_CORS_COOLDOWN_MS = 60_000;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.toLowerCase();
  return String(error).toLowerCase();
}

function isLikelyCorsOrTrackingBlock(error: unknown): boolean {
  const message = getErrorMessage(error);
  return (
    message.includes("access-control-allow-origin") ||
    message.includes("cross-origin") ||
    message.includes("cors") ||
    message.includes("failed to fetch") ||
    message.includes("network request failed") ||
    message.includes("load failed") ||
    message.includes("blocked")
  );
}

async function getJWT(): Promise<string | null> {
  if (!account) return null;
  if (jwtCache && Date.now() < jwtCache.expiresAt) return jwtCache.token;

  try {
    const result = await account.createJWT();
    jwtCache = { token: result.jwt, expiresAt: Date.now() + 14 * 60 * 1000 };
    remoteAuthBackoffUntil = 0;
    return result.jwt;
  } catch (error) {
    remoteAuthBackoffUntil = Date.now() +
      (isLikelyCorsOrTrackingBlock(error) ? AUTH_PROBE_CORS_COOLDOWN_MS : AUTH_PROBE_COOLDOWN_MS);
    return null;
  }
}

function invalidateJWT() {
  jwtCache = null;
  remoteAuthBackoffUntil = 0;
}

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
    const jwt = await getJWT();
    if (jwt) headers["X-Appwrite-JWT"] = jwt;
  }

  const res = await fetch(`/api/${path}`, {
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

// ── Appwrite utilities ───────────────────────────────────────────────────────

function requireBaseConfig() {
  if (!isAppwriteConfigured) {
    throw new Error(
      "Appwrite is not configured. Set VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID.",
    );
  }
}

function requireDatabaseServices() {
  requireBaseConfig();
  if (!databases || !appwriteConfig.databaseId) {
    throw new Error("Appwrite database is not configured.");
  }
  return { db: databases, databaseId: appwriteConfig.databaseId };
}

function requireStorageService() {
  requireBaseConfig();
  if (!storage) throw new Error("Appwrite Storage service is not configured.");
  return storage;
}

// ── Type helpers ─────────────────────────────────────────────────────────────


function mapPublication(doc: AppwriteDocument): Publication {
  return {
    id: doc.$id,
    pubId: (doc.pub_id as string) || undefined,
    title: (doc.title as string) || "Untitled",
    abstract: (doc.abstract as string) || undefined,
    authorDisplayName: (doc.author_display_name as string) || "Open Rockets Contributor",
    authorUserId: (doc.author_user_id as string) || "",
    type: (doc.type as Publication["type"]) ?? "other",
    status: (doc.status as Publication["status"]) ?? "draft",
    license: (doc.license as Publication["license"]) ?? "CC_BY",
    tags: Array.isArray(doc.tags) ? (doc.tags as string[]) : [],
    submittedAt: (doc.submitted_at as string) || new Date().toISOString(),
    reviewedAt: (doc.reviewed_at as string) || undefined,
    publishedAt: (doc.published_at as string) || undefined,
    reviewedBy: (doc.reviewed_by as string) || undefined,
    rejectionReason: (doc.rejection_reason as string) || undefined,
    fileStorageId: (doc.file_storage_id as string) || undefined,
    coverStorageId: (doc.cover_storage_id as string) || undefined,
    isFeatured: Boolean(doc.is_featured),
    featuredRank: typeof doc.featured_rank === "number" ? doc.featured_rank : undefined,
    viewCount: Number(doc.view_count ?? 0),
    downloadCount: Number(doc.download_count ?? 0),
  };
}


function mapCaseSummary(doc: AppwriteDocument): CaseSummary {
  return {
    id: doc.$id,
    caseNumber: (doc.case_number as string) || doc.$id,
    subject: (doc.subject as string) || "Moderation case",
    status: toCaseStatus(doc.status),
    priority: toCasePriority(doc.priority),
    contributorUserId: (doc.contributor_user_id as string) || "",
    openedBy: (doc.opened_by as string) || "",
    relatedPubId: (doc.related_pub_id as string) || undefined,
    labels: Array.isArray(doc.labels) ? (doc.labels as string[]) : [],
    openedAt: (doc.opened_at as string) || new Date().toISOString(),
    lastActivityAt: (doc.last_activity_at as string) || new Date().toISOString(),
  };
}

function mapCaseMessage(doc: AppwriteDocument): CaseMessage {
  const senderRole = String(doc.sender_role || "system");
  return {
    id: doc.$id,
    caseId: (doc.case_id as string) || "",
    senderUserId: (doc.sender_user_id as string) || "",
    senderRole:
      senderRole === "contributor" ||
      senderRole === "moderator" ||
      senderRole === "admin" ||
      senderRole === "system"
        ? senderRole
        : "system",
    body: (doc.body as string) || "",
    sentAt: (doc.sent_at as string) || new Date().toISOString(),
    readBy: Array.isArray(doc.read_by) ? (doc.read_by as string[]) : [],
  };
}

function toCaseStatus(value: unknown): CaseStatus {
  if (
    value === "open" ||
    value === "pending_contributor" ||
    value === "pending_moderator" ||
    value === "resolved" ||
    value === "closed"
  ) {
    return value;
  }
  return "open";
}

function toCasePriority(value: unknown): CasePriority {
  if (value === "low" || value === "normal" || value === "high" || value === "urgent") {
    return value;
  }
  return "normal";
}

async function hydrateCurrentUserFromRemote(forceProbe = false) {
  if (!isAppwriteConfigured || !account) return null;
  if (!forceProbe && Date.now() < remoteAuthBackoffUntil) return null;

  // Use the server-side /api/me endpoint for reliable role resolution.
  // It runs under the admin API key so it can read labels and the users
  // collection without browser-level permission issues.
  try {
    const profile = await callApi<{
      userId: string;
      displayName: string;
      email: string;
      role: Role;
      accountStatus: string;
      consentTier: string;
    }>("me", undefined, { method: "GET" });

    remoteAuthBackoffUntil = 0;

    const next = {
      userId: profile.userId,
      displayName: profile.displayName,
      email: profile.email,
      role: profile.role,
      accountStatus: profile.accountStatus as
        | "pending_parental"
        | "active"
        | "suspended"
        | "deletion_requested",
      consentTier: profile.consentTier as "coppa" | "gdpr_eu" | "gdpr_es" | "general",
    };

    setSessionUser(next);
    return next;
  } catch (error: unknown) {
    // 401 means no active session — clear local state so the UI reflects reality
    if (getErrorMessage(error).includes("request failed 401")) {
      clearSessionUser();
      return null;
    }
    remoteAuthBackoffUntil =
      Date.now() +
      (isLikelyCorsOrTrackingBlock(error)
        ? AUTH_PROBE_CORS_COOLDOWN_MS
        : AUTH_PROBE_COOLDOWN_MS);
    return null;
  }
}

async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("You must be signed in to continue.");
  return user;
}

// ── Exported API ─────────────────────────────────────────────────────────────

export async function getHomeFeed(filters: HomeFeedFilters): Promise<HomeFeedResponse> {
  const q = (filters.q ?? "").trim();
  const type = filters.type ?? "all";

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (type !== "all") params.set("type", type);
  const qs = params.toString();

  return callApi<HomeFeedResponse>(`home-feed${qs ? `?${qs}` : ""}`, undefined, {
    method: "GET",
    skipAuth: true,
  });
}

export interface SubmitPublicationPayload {
  title: string;
  abstract: string;
  type: Publication["type"];
  license: Publication["license"];
  tags: string[];
  file: File;
  coverFile?: File;
}

export async function submitPublication(payload: SubmitPublicationPayload) {
  if (!payload.file) throw new Error("A publication file is required.");

  const storageClient = requireStorageService();

  if (!appwriteConfig.pubFilesBucketId) {
    throw new Error(
      "Publication files bucket is not configured. Set VITE_APPWRITE_BUCKET_PUB_FILES.",
    );
  }

  const publicationUpload = await storageClient.createFile(
    appwriteConfig.pubFilesBucketId,
    ID.unique(),
    payload.file,
  );

  let coverStorageId = "";
  if (payload.coverFile && appwriteConfig.pubCoversBucketId) {
    const coverUpload = await storageClient.createFile(
      appwriteConfig.pubCoversBucketId,
      ID.unique(),
      payload.coverFile,
    );
    coverStorageId = coverUpload.$id;
  }

  return callApi<{ publication_id: string; status: string }>("submit-publication", {
    title: payload.title.trim(),
    abstract: payload.abstract.trim(),
    type: payload.type,
    license: payload.license,
    file_storage_id: publicationUpload.$id,
    cover_storage_id: coverStorageId,
    tags: payload.tags,
  });
}

export async function registerAccount(payload: RegisterPayload): Promise<RegisterResult> {
  if (REQUIRES_GUARDIAN.has(payload.consentTier) && !payload.guardianEmail) {
    throw new Error("Guardian email is required for this consent tier.");
  }

  const result = await callApi<{
    user_id: string;
    status: "pending_parental" | "active";
    consent_token?: string;
  }>(
    "register",
    {
      display_name: payload.displayName,
      email: payload.email,
      password: payload.password,
      consent_tier: payload.consentTier,
      guardian_email: payload.guardianEmail,
    },
    { skipAuth: true },
  );

  const normalized: RegisterResult = {
    userId: result.user_id,
    status: result.status,
    consentToken:
      typeof result.consent_token === "string" && result.consent_token
        ? result.consent_token
        : undefined,
  };

  setSessionUser({
    userId: normalized.userId,
    displayName: payload.displayName,
    email: payload.email,
    role: "contributor",
    accountStatus: normalized.status,
    consentTier: payload.consentTier,
  });

  return normalized;
}

export async function confirmConsent(payload: ConsentConfirmPayload): Promise<{ status: "active" }> {
  if (!payload.guardianEmail.trim()) {
    throw new Error("Guardian email is required.");
  }

  const result = await callApi<{ status: "active" }>(
    "confirm-consent",
    { token: payload.token, guardian_email: payload.guardianEmail },
    { skipAuth: true },
  );

  await getCurrentUser(true).catch(() => undefined);
  const currentSession = getSessionUser();
  if (currentSession) {
    setSessionUser({ ...currentSession, accountStatus: "active" });
  }

  return result;
}

export async function login(email: string, password: string): Promise<{ ok: true }> {
  requireBaseConfig();
  if (!account) throw new Error("Appwrite Account service is not configured.");

  remoteAuthBackoffUntil = 0;
  await account.createEmailPasswordSession(email, password);
  await hydrateCurrentUserFromRemote(true);

  return { ok: true };
}

export async function logout(): Promise<void> {
  if (isAppwriteConfigured && account) {
    await account.deleteSession("current").catch(() => undefined);
  }
  invalidateJWT();
  clearSessionUser();
}

export async function getCurrentUser(forceRefresh = false) {
  if (!forceRefresh) {
    const local = getSessionUser();
    if (local) return local;
  }

  const remote = await hydrateCurrentUserFromRemote(forceRefresh);
  if (remote) return remote;

  return getSessionUser();
}

export async function getContributorPublications(limit = 20): Promise<Publication[]> {
  const user = await requireCurrentUser();
  const { db, databaseId } = requireDatabaseServices();

  const publications = await db.listDocuments(databaseId, "publications", [
    Query.equal("author_user_id", user.userId),
    Query.orderDesc("submitted_at"),
    Query.limit(limit),
  ]);

  return publications.documents.map((doc) => mapPublication(doc as unknown as AppwriteDocument));
}

export async function getContributorCases(limit = 30): Promise<CaseSummary[]> {
  const user = await requireCurrentUser();
  const { db, databaseId } = requireDatabaseServices();

  const cases = await db.listDocuments(databaseId, "cases", [
    Query.equal("contributor_user_id", user.userId),
    Query.orderDesc("last_activity_at"),
    Query.limit(limit),
  ]);

  return cases.documents.map((doc) => mapCaseSummary(doc as unknown as AppwriteDocument));
}

export async function getCaseMessages(caseId: string): Promise<CaseMessage[]> {
  const user = await requireCurrentUser();
  const { db, databaseId } = requireDatabaseServices();

  const cases = await db.listDocuments(databaseId, "cases", [
    Query.equal("$id", caseId),
    Query.limit(1),
  ]);

  if (cases.total === 0) throw new Error("Case not found.");

  const targetCase = mapCaseSummary(cases.documents[0] as unknown as AppwriteDocument);
  if (
    targetCase.contributorUserId !== user.userId &&
    user.role !== "moderator" &&
    user.role !== "admin"
  ) {
    throw new Error("You do not have access to this case.");
  }

  const messages = await db.listDocuments(databaseId, "case_messages", [
    Query.equal("case_id", caseId),
    Query.orderAsc("sent_at"),
    Query.limit(200),
  ]);

  return messages.documents.map((doc) => mapCaseMessage(doc as unknown as AppwriteDocument));
}

export async function replyToCase(caseId: string, body: string) {
  const user = await requireCurrentUser();
  if (!body.trim()) throw new Error("Message body cannot be empty.");

  const senderRole =
    user.role === "admin" || user.role === "moderator" ? user.role : "contributor";

  return callApi<{ message_id: string; case_status: CaseStatus }>("reply-case", {
    case_id: caseId,
    sender_user_id: user.userId,
    sender_role: senderRole,
    body: body.trim(),
    attachment_storage_id: "",
  });
}

export async function getContributorDashboard(): Promise<ContributorDashboardData> {
  const user = await requireCurrentUser();
  const { db, databaseId } = requireDatabaseServices();

  const [recentPublications, openCases, recentCases] = await Promise.all([
    db.listDocuments(databaseId, "publications", [
      Query.equal("author_user_id", user.userId),
      Query.orderDesc("submitted_at"),
      Query.limit(5),
    ]),
    db.listDocuments(databaseId, "cases", [
      Query.equal("contributor_user_id", user.userId),
      Query.equal("status", ["open", "pending_contributor", "pending_moderator"]),
      Query.limit(1),
    ]),
    db.listDocuments(databaseId, "cases", [
      Query.equal("contributor_user_id", user.userId),
      Query.orderDesc("last_activity_at"),
      Query.limit(5),
    ]),
  ]);

  return {
    publicationCount: recentPublications.total,
    openCaseCount: openCases.total,
    recentPublications: recentPublications.documents.map((doc) =>
      mapPublication(doc as unknown as AppwriteDocument),
    ),
    recentCases: recentCases.documents.map((doc) =>
      mapCaseSummary(doc as unknown as AppwriteDocument),
    ),
  };
}

export async function getModerationDashboard(): Promise<ModerationDashboardData> {
  return callApi<ModerationDashboardData>("moderation-dashboard", undefined, { method: "GET" });
}

export async function reviewPublication(
  publicationId: string,
  decision: "approved" | "rejected",
  rejectionReason = "",
) {
  return callApi<{ status: string; pub_id?: string }>("review-publication", {
    publication_id: publicationId,
    decision,
    rejection_reason: rejectionReason,
  });
}

export async function openCase(payload: {
  contributorUserId: string;
  subject: string;
  openingMessage: string;
  priority?: CasePriority;
  relatedPubId?: string;
  labels?: string[];
}) {
  return callApi<{ case_id: string; case_number: string; status: string }>("open-case", {
    contributor_user_id: payload.contributorUserId,
    subject: payload.subject,
    opening_message: payload.openingMessage,
    priority: payload.priority ?? "normal",
    related_pub_id: payload.relatedPubId ?? "",
    labels: payload.labels ?? [],
    related_case_ids: [],
  });
}

export async function resolveCase(caseId: string, resolutionNote: string) {
  return callApi<{ case_id: string; status: string }>("resolve-case", {
    case_id: caseId,
    status: "resolved",
    resolution_note: resolutionNote,
  });
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  return callApi<AdminDashboardData>("admin-dashboard", undefined, { method: "GET" });
}

export async function createDsarRequest(userId: string, action: "export" | "delete") {
  return callApi<{ status: string; case_id: string }>("dsar-handler", {
    user_id: userId,
    action,
  });
}

export async function refreshCurrentUser(): Promise<SessionUser | null> {
  invalidateJWT();
  return hydrateCurrentUserFromRemote(true);
}

export async function getPublicationByPubId(pubId: string): Promise<Publication> {
  const { db, databaseId } = requireDatabaseServices();

  const results = await db.listDocuments(databaseId, "publications", [
    Query.equal("pub_id", pubId),
    Query.equal("status", "approved"),
    Query.limit(1),
  ]);

  const doc = results.documents[0];
  if (!doc) throw new Error("Publication not found or not yet approved.");

  return mapPublication(doc as unknown as AppwriteDocument);
}

export async function downloadPublication(pubId: string): Promise<void> {
  const res = await fetch(`/api/serve-pdf?pub_id=${encodeURIComponent(pubId)}`);

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "PDF could not be retrieved." }));
    throw new Error(
      (data as { error?: string }).error || "PDF could not be retrieved.",
    );
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${pubId}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function toUserFacingError(error: unknown): string {
  if (!(error instanceof Error)) return "Unexpected request failure";

  const lower = error.message.toLowerCase();

  if (lower.includes("too small") && lower.includes(">=3")) {
    return "Display name must be at least 3 characters.";
  }
  if (lower.includes("too small") && lower.includes(">=10")) {
    return "Password must be at least 10 characters.";
  }
  if (lower.includes("invalid email") || lower.includes("must be a valid email")) {
    return "Please enter a valid email address.";
  }
  if (lower.includes("invalid request payload")) {
    return "Please review the form fields and try again.";
  }
  if (lower.includes("invalid credentials") || lower.includes("user_invalid_credentials")) {
    return "The email or password is incorrect.";
  }
  if (lower.includes("user_session_already_exists")) {
    return "You are already signed in on this device.";
  }
  if (lower.includes("already exists") || lower.includes("user_already_exists")) {
    return "An account with that email already exists. Try logging in.";
  }
  if (lower.includes("access-control-allow-origin") || lower.includes("cors") || lower.includes("cross-origin")) {
    return "Connection to Appwrite is blocked by browser policy. Add this origin in Appwrite Platforms (Web), including https://press.openrockets.com and https://press-openrockets-com.pages.dev.";
  }
  if (lower.includes("network") || lower.includes("failed to fetch")) {
    if (isAppwriteConfigured) {
      return "Could not reach Appwrite. Check browser tracking protection and confirm both site origins are allowed in Appwrite Platforms (Web).";
    }
    return "Network request failed. Check your connection and try again.";
  }
  if (lower.includes("not configured")) {
    return error.message;
  }

  return error.message || "Unexpected request failure";
}
