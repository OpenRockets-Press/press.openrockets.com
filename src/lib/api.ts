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
  PublicationCardDTO,
  Role,
  RegisterPayload,
  RegisterResult,
} from "@shared/types";
import { REQUIRES_GUARDIAN } from "@/lib/consent";
import { clearSessionUser, getSessionUser, setSessionUser } from "@/lib/authStore";
import {
  account,
  appwriteConfig,
  databases,
  functions,
  ID,
  isAppwriteConfigured,
  Query,
  storage,
} from "@/lib/appwrite";
import type { HomeFeedFilters } from "@/lib/queryKeys";

interface FunctionResponseEnvelope<T> {
  data: T;
}

interface FunctionErrorEnvelope {
  error: string;
}

interface AppwriteDocument {
  $id: string;
  [key: string]: unknown;
}

const FUNCTION_TIMEOUT_MS = 20_000;

function requireBaseConfig() {
  if (!isAppwriteConfigured) {
    throw new Error(
      "Appwrite is not configured. Set VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT_ID in your environment.",
    );
  }
}

function requireDatabaseServices() {
  requireBaseConfig();

  if (!databases || !appwriteConfig.databaseId) {
    throw new Error("Appwrite database is not configured. Set VITE_APPWRITE_DATABASE_ID.");
  }

  return {
    db: databases,
    databaseId: appwriteConfig.databaseId,
  };
}

function requireFunctionsService(functionId: string | undefined, functionName: string) {
  requireBaseConfig();

  if (!functions) {
    throw new Error("Appwrite Functions service is not configured for this client.");
  }

  if (!functionId) {
    throw new Error(`Missing Appwrite function id for ${functionName}. Check your VITE_FUNCTION_* variables.`);
  }

  return {
    functionsClient: functions,
    functionId,
  };
}

function requireStorageService() {
  requireBaseConfig();

  if (!storage) {
    throw new Error("Appwrite Storage service is not configured for this client.");
  }

  return storage;
}

function parseRoleFromLabels(labels: unknown): Role {
  if (!Array.isArray(labels)) return "contributor";
  if (labels.includes("admin")) return "admin";
  if (labels.includes("moderator")) return "moderator";
  return "contributor";
}

function mapPublication(doc: AppwriteDocument): Publication {
  return {
    id: doc.$id,
    pubId: (doc.pub_id as string) || undefined,
    title: (doc.title as string) || "Untitled",
    abstract: (doc.abstract as string) || undefined,
    authorDisplayName: (doc.author_display_name as string) || "Open Rockets Contributor",
    authorUserId: (doc.author_user_id as string) || "",
    type: ((doc.type as Publication["type"]) ?? "other"),
    status: ((doc.status as Publication["status"]) ?? "draft"),
    license: ((doc.license as Publication["license"]) ?? "CC_BY"),
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

function toPublicationCard(doc: Publication): PublicationCardDTO {
  return {
    id: doc.id,
    pubId: doc.pubId,
    title: doc.title,
    authorDisplayName: doc.authorDisplayName,
    type: doc.type,
    license: doc.license,
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

async function hydrateCurrentUserFromRemote() {
  if (!isAppwriteConfigured || !account || !databases || !appwriteConfig.databaseId) {
    return null;
  }

  const authUser = await account.get().catch(() => null);
  if (!authUser) {
    return null;
  }

  const labels = (authUser as unknown as { labels?: unknown }).labels;

  const userDoc = await databases
    .getDocument(appwriteConfig.databaseId, "users", authUser.$id)
    .catch(() => null);

  const role = (userDoc?.role as Role | undefined) ?? parseRoleFromLabels(labels);

  const next = {
    userId: authUser.$id,
    displayName: (userDoc?.display_name as string | undefined) ?? authUser.name ?? "Contributor",
    email: authUser.email,
    role,
    accountStatus: (userDoc?.account_status as "pending_parental" | "active" | "suspended" | "deletion_requested") ?? "active",
    consentTier: (userDoc?.consent_tier as "coppa" | "gdpr_eu" | "gdpr_es" | "general") ?? "general",
  };

  setSessionUser(next);
  return next;
}

function readError(message: unknown): string {
  if (!(message instanceof Error)) {
    return "Unexpected request failure";
  }

  const lower = message.message.toLowerCase();

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

  if (lower.includes("network") || lower.includes("failed to fetch")) {
    return "Network request failed. Check your connection and try again.";
  }

  if (
    lower.includes("function with the requested id could not be found") ||
    lower.includes("requested id could not be found") ||
    lower.includes("function_not_found")
  ) {
    return "A required backend function was not found. Verify your VITE_FUNCTION_* IDs and deploy the matching Appwrite functions.";
  }

  if (lower.includes("not configured")) {
    return message.message;
  }

  return message.message || "Unexpected request failure";
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}

async function executeFunction<T>(functionId: string, body: unknown): Promise<T> {
  const { functionsClient } = requireFunctionsService(functionId, functionId);

  const execution = await withTimeout(
    functionsClient.createExecution(functionId, JSON.stringify(body), false),
    FUNCTION_TIMEOUT_MS,
    `Function execution timed out after ${Math.floor(FUNCTION_TIMEOUT_MS / 1000)} seconds.`,
  );

  if (execution.status !== "completed" || !execution.responseBody) {
    throw new Error(`Function execution failed with status: ${execution.status}`);
  }

  try {
    const parsed = JSON.parse(execution.responseBody) as
      | T
      | FunctionResponseEnvelope<T>
      | FunctionErrorEnvelope;

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "error" in parsed &&
      typeof parsed.error === "string"
    ) {
      throw new Error(parsed.error);
    }

    if (typeof parsed === "object" && parsed !== null && "data" in parsed) {
      return (parsed as FunctionResponseEnvelope<T>).data;
    }

    return parsed as T;
  } catch (error) {
    if (error instanceof Error && error.message !== "") {
      throw error;
    }
    throw new Error("Function returned an invalid JSON payload.");
  }
}

async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("You must be signed in to continue.");
  }

  return user;
}

export async function getHomeFeed(filters: HomeFeedFilters): Promise<HomeFeedResponse> {
  const q = (filters.q ?? "").trim().toLowerCase();
  const type = filters.type ?? "all";

  if (appwriteConfig.homeFeedFunctionId) {
    return executeFunction<HomeFeedResponse>(appwriteConfig.homeFeedFunctionId, { q, type });
  }

  const { db, databaseId } = requireDatabaseServices();

  const baseQueries = [Query.equal("status", "approved")];
  if (type !== "all") {
    baseQueries.push(Query.equal("type", type));
  }

  const [newReleaseDocs, featuredDocs] = await Promise.all([
    db.listDocuments(databaseId, "publications", [
      ...baseQueries,
      Query.orderDesc("published_at"),
      Query.limit(12),
    ]),
    db.listDocuments(databaseId, "publications", [
      ...baseQueries,
      Query.equal("is_featured", true),
      Query.orderAsc("featured_rank"),
      Query.orderDesc("published_at"),
      Query.limit(12),
    ]),
  ]);

  const toCard = (doc: AppwriteDocument): PublicationCardDTO => ({
    id: doc.$id,
    pubId: (doc.pub_id as string) || undefined,
    title: (doc.title as string) || "Untitled",
    authorDisplayName: (doc.author_display_name as string) || "Open Rockets Contributor",
    type: ((doc.type as Publication["type"]) ?? "other"),
    license: ((doc.license as Publication["license"]) ?? undefined),
  });

  const applySearch = (items: PublicationCardDTO[]) => {
    if (!q) return items;

    return items.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.authorDisplayName.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
      );
    });
  };

  return {
    newReleases: applySearch(newReleaseDocs.documents.map((doc) => toCard(doc as unknown as AppwriteDocument))),
    featuredContributions: applySearch(featuredDocs.documents.map((doc) => toCard(doc as unknown as AppwriteDocument))),
    availableTypes: ["book", "research_paper", "magazine", "poster", "other"],
  };
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
  const user = await requireCurrentUser();

  if (!payload.file) {
    throw new Error("A publication file is required.");
  }

  const storageClient = requireStorageService();
  const { functionId } = requireFunctionsService(
    appwriteConfig.submitPublicationFunctionId,
    "submit publication",
  );

  if (!appwriteConfig.pubFilesBucketId) {
    throw new Error("Publication files bucket is not configured. Set VITE_APPWRITE_BUCKET_PUB_FILES.");
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

  return executeFunction<{ publication_id: string; status: string }>(
    functionId,
    {
      title: payload.title.trim(),
      abstract: payload.abstract.trim(),
      type: payload.type,
      license: payload.license,
      file_storage_id: publicationUpload.$id,
      cover_storage_id: coverStorageId,
      tags: payload.tags,
      contributor_user_id: user.userId,
    },
  );
}

export async function registerAccount(payload: RegisterPayload): Promise<RegisterResult> {
  if (REQUIRES_GUARDIAN.has(payload.consentTier) && !payload.guardianEmail) {
    throw new Error("Guardian email is required for this consent tier.");
  }

  const { functionId } = requireFunctionsService(appwriteConfig.registerFunctionId, "register account");

  const result = await executeFunction<{
    user_id: string;
    status: "pending_parental" | "active";
    consent_token?: string;
  }>(functionId, {
    display_name: payload.displayName,
    email: payload.email,
    password: payload.password,
    consent_tier: payload.consentTier,
    guardian_email: payload.guardianEmail,
  });

  const normalized: RegisterResult = {
    userId: result.user_id,
    status: result.status,
    consentToken: typeof result.consent_token === "string" && result.consent_token ? result.consent_token : undefined,
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

  const { functionId } = requireFunctionsService(
    appwriteConfig.confirmConsentFunctionId,
    "confirm parental consent",
  );

  const result = await executeFunction<{ status: "active" }>(functionId, {
    token: payload.token,
    guardian_email: payload.guardianEmail,
  });

  await getCurrentUser(true).catch(() => undefined);
  const currentSession = getSessionUser();
  if (currentSession) {
    setSessionUser({
      ...currentSession,
      accountStatus: "active",
    });
  }

  return result;
}

export async function login(email: string, password: string): Promise<{ ok: true }> {
  requireBaseConfig();

  if (!account) {
    throw new Error("Appwrite Account service is not configured for this client.");
  }

  await withTimeout(
    account.createEmailPasswordSession(email, password),
    FUNCTION_TIMEOUT_MS,
    `Sign-in timed out after ${Math.floor(FUNCTION_TIMEOUT_MS / 1000)} seconds.`,
  );
  await hydrateCurrentUserFromRemote();

  return { ok: true };
}

export async function logout(): Promise<void> {
  if (isAppwriteConfigured && account) {
    await account.deleteSession("current").catch(() => undefined);
  }
  clearSessionUser();
}

export async function getCurrentUser(forceRefresh = false) {
  if (!forceRefresh) {
    const local = getSessionUser();
    if (local) return local;
  }

  const remote = await hydrateCurrentUserFromRemote();
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

  if (cases.total === 0) {
    throw new Error("Case not found.");
  }

  const targetCase = mapCaseSummary(cases.documents[0] as unknown as AppwriteDocument);
  if (targetCase.contributorUserId !== user.userId && user.role !== "moderator" && user.role !== "admin") {
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

  if (!body.trim()) {
    throw new Error("Message body cannot be empty.");
  }

  const { functionId } = requireFunctionsService(appwriteConfig.replyCaseFunctionId, "reply case");
  const senderRole = user.role === "admin" || user.role === "moderator" ? user.role : "contributor";

  return executeFunction<{ message_id: string; case_status: CaseStatus }>(
    functionId,
    {
      case_id: caseId,
      sender_user_id: user.userId,
      sender_role: senderRole,
      body: body.trim(),
      attachment_storage_id: "",
    },
  );
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
    recentCases: recentCases.documents.map((doc) => mapCaseSummary(doc as unknown as AppwriteDocument)),
  };
}

export async function getModerationDashboard(): Promise<ModerationDashboardData> {
  const { db, databaseId } = requireDatabaseServices();

  const [pendingPublications, openCases] = await Promise.all([
    db.listDocuments(databaseId, "publications", [
      Query.equal("status", "pending_review"),
      Query.orderDesc("submitted_at"),
      Query.limit(30),
    ]),
    db.listDocuments(databaseId, "cases", [
      Query.equal("status", ["open", "pending_contributor", "pending_moderator"]),
      Query.orderDesc("last_activity_at"),
      Query.limit(30),
    ]),
  ]);

  return {
    pendingPublications: pendingPublications.documents.map((doc) =>
      mapPublication(doc as unknown as AppwriteDocument),
    ),
    openCases: openCases.documents.map((doc) => mapCaseSummary(doc as unknown as AppwriteDocument)),
  };
}

export async function reviewPublication(
  publicationId: string,
  decision: "approved" | "rejected",
  rejectionReason = "",
) {
  const { functionId } = requireFunctionsService(
    appwriteConfig.reviewPublicationFunctionId,
    "review publication",
  );

  return executeFunction<{ status: string; pub_id?: string }>(functionId, {
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
  const { functionId } = requireFunctionsService(appwriteConfig.openCaseFunctionId, "open case");

  return executeFunction<{ case_id: string; case_number: string; status: string }>(
    functionId,
    {
      contributor_user_id: payload.contributorUserId,
      subject: payload.subject,
      opening_message: payload.openingMessage,
      priority: payload.priority ?? "normal",
      related_pub_id: payload.relatedPubId ?? "",
      labels: payload.labels ?? [],
      related_case_ids: [],
    },
  );
}

export async function resolveCase(caseId: string, resolutionNote: string) {
  const { functionId } = requireFunctionsService(appwriteConfig.resolveCaseFunctionId, "resolve case");

  return executeFunction<{ case_id: string; status: string }>(functionId, {
    case_id: caseId,
    status: "resolved",
    resolution_note: resolutionNote,
  });
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const { db, databaseId } = requireDatabaseServices();

  const [usersRes, pendingPublicationsRes, openCasesRes, topDownloadsRes, analyticsRes] = await Promise.all([
    db.listDocuments(databaseId, "users", [Query.limit(500)]),
    db.listDocuments(databaseId, "publications", [
      Query.equal("status", "pending_review"),
      Query.limit(1),
    ]),
    db.listDocuments(databaseId, "cases", [
      Query.equal("status", ["open", "pending_contributor", "pending_moderator"]),
      Query.limit(1),
    ]),
    db.listDocuments(databaseId, "publications", [
      Query.equal("status", "approved"),
      Query.orderDesc("download_count"),
      Query.limit(5),
    ]),
    db.listDocuments(databaseId, "analytics_events", [
      Query.equal("event_type", ["consent_started", "consent_completed", "consent_expired"]),
      Query.limit(500),
    ]),
  ]);

  const allUsers = usersRes.documents as unknown as AppwriteDocument[];
  const pendingParentalAccounts = allUsers
    .filter((user) => String(user.account_status) === "pending_parental")
    .slice(0, 8)
    .map((user) => ({
      userId: (user.user_id as string) || user.$id,
      displayName: (user.display_name as string) || "Contributor",
      consentTier: (user.consent_tier as "coppa" | "gdpr_eu" | "gdpr_es" | "general") || "general",
      createdAt: (user.created_at as string) || new Date().toISOString(),
    }));

  const analytics = analyticsRes.documents as unknown as AppwriteDocument[];

  const consentStarted = analytics.filter((event) => event.event_type === "consent_started").length;
  const consentCompleted = analytics.filter((event) => event.event_type === "consent_completed").length;
  const consentExpired = analytics.filter((event) => event.event_type === "consent_expired").length;

  return {
    totalUsers: allUsers.length,
    activeUsers: allUsers.filter((user) => String(user.account_status) === "active").length,
    pendingParentalUsers: allUsers.filter((user) => String(user.account_status) === "pending_parental").length,
    suspendedUsers: allUsers.filter((user) => String(user.account_status) === "suspended").length,
    openCases: openCasesRes.total,
    pendingReviewPublications: pendingPublicationsRes.total,
    consentStarted,
    consentCompleted,
    consentExpired,
    topDownloads: topDownloadsRes.documents.map((doc) =>
      toPublicationCard(mapPublication(doc as unknown as AppwriteDocument)),
    ),
    pendingParentalAccounts,
  };
}

export async function createDsarRequest(userId: string, action: "export" | "delete") {
  const { functionId } = requireFunctionsService(appwriteConfig.dsarHandlerFunctionId, "DSAR handler");

  return executeFunction<{ status: string; case_id: string }>(functionId, {
    user_id: userId,
    action,
  });
}

export async function getPublicationByPubId(pubId: string): Promise<Publication> {
  const { db, databaseId } = requireDatabaseServices();

  const results = await db.listDocuments(databaseId, "publications", [
    Query.equal("pub_id", pubId),
    Query.equal("status", "approved"),
    Query.limit(1),
  ]);

  const doc = results.documents[0];
  if (!doc) {
    throw new Error("Publication not found or not yet approved.");
  }

  return mapPublication(doc as unknown as AppwriteDocument);
}

export async function downloadPublication(pubId: string): Promise<void> {
  const { functionsClient, functionId } = requireFunctionsService(
    appwriteConfig.servePdfFunctionId,
    "serve PDF",
  );

  const execution = await withTimeout(
    functionsClient.createExecution(functionId, JSON.stringify({ pub_id: pubId }), false),
    FUNCTION_TIMEOUT_MS,
    `PDF download timed out after ${Math.floor(FUNCTION_TIMEOUT_MS / 1000)} seconds.`,
  );

  if (execution.status !== "completed" || !execution.responseBody) {
    throw new Error("PDF could not be retrieved.");
  }

  // Function returns raw PDF bytes; encode to a downloadable Blob.
  const bytes = Uint8Array.from(execution.responseBody, (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${pubId}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function toUserFacingError(error: unknown): string {
  return readError(error);
}
