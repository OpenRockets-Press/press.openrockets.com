import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json } from "../_shared/http";

const CASE_STATUSES = ["open", "pending_contributor", "pending_moderator", "resolved", "closed"] as const;
const CASE_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

function normalizeStatus(value: unknown): typeof CASE_STATUSES[number] {
  const status = String(value ?? "open");
  return CASE_STATUSES.includes(status as typeof CASE_STATUSES[number])
    ? (status as typeof CASE_STATUSES[number])
    : "open";
}

function normalizePriority(value: unknown): typeof CASE_PRIORITIES[number] {
  const priority = String(value ?? "normal");
  return CASE_PRIORITIES.includes(priority as typeof CASE_PRIORITIES[number])
    ? (priority as typeof CASE_PRIORITIES[number])
    : "normal";
}

function mapCase(doc: Record<string, unknown>) {
  return {
    id: String(doc.$id),
    caseNumber: String(doc.case_number ?? doc.$id),
    subject: String(doc.subject ?? "Moderation case"),
    status: normalizeStatus(doc.status),
    priority: normalizePriority(doc.priority),
    contributorUserId: String(doc.contributor_user_id ?? ""),
    openedBy: String(doc.opened_by ?? ""),
    relatedPubId: doc.related_pub_id ? String(doc.related_pub_id) : undefined,
    labels: Array.isArray(doc.labels) ? doc.labels : [],
    openedAt: String(doc.opened_at ?? new Date().toISOString()),
    lastActivityAt: String(doc.last_activity_at ?? new Date().toISOString()),
  };
}

function parseLimit(raw: string | null): number {
  const fallback = 30;
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  const safe = Math.trunc(n);
  if (safe < 1) return 1;
  if (safe > 100) return 100;
  return safe;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await getSessionUser(context.request, context.env);
    if (!user) throw new OrpError("Unauthorized", 401);

    const userId = String(user.$id ?? "");
    if (!userId) throw new OrpError("Unauthorized", 401);

    const limit = parseLimit(new URL(context.request.url).searchParams.get("limit"));
    const client = createAdminClient(context.env);
    const dbId = context.env.APPWRITE_DATABASE_ID;
    const q = client.query;

    const casesRes = await client.db.listDocuments(dbId, "cases", [
      q.equal("contributor_user_id", userId),
      q.orderDesc("last_activity_at"),
      q.limit(limit),
    ]);

    return json({
      cases: casesRes.documents.map((doc) => mapCase(doc as Record<string, unknown>)),
    });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
