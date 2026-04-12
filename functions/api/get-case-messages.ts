import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import { getActorRole } from "../_shared/authHelpers";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json } from "../_shared/http";

const CASE_STATUSES = ["open", "pending_contributor", "pending_moderator", "resolved", "closed"] as const;
const CASE_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
const MESSAGE_ROLES = ["contributor", "moderator", "admin", "system"] as const;

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

function normalizeSenderRole(value: unknown): typeof MESSAGE_ROLES[number] {
  const role = String(value ?? "system");
  return MESSAGE_ROLES.includes(role as typeof MESSAGE_ROLES[number])
    ? (role as typeof MESSAGE_ROLES[number])
    : "system";
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

function mapMessage(doc: Record<string, unknown>) {
  return {
    id: String(doc.$id),
    caseId: String(doc.case_id ?? ""),
    senderUserId: String(doc.sender_user_id ?? ""),
    senderRole: normalizeSenderRole(doc.sender_role),
    body: String(doc.body ?? ""),
    sentAt: String(doc.sent_at ?? new Date().toISOString()),
    readBy: Array.isArray(doc.read_by) ? doc.read_by : [],
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await getSessionUser(context.request, context.env);
    if (!user) throw new OrpError("Unauthorized", 401);

    const caseId = new URL(context.request.url).searchParams.get("case_id") ?? "";
    if (!caseId.trim()) throw new OrpError("Case id is required.", 400);

    const actorUserId = String(user.$id ?? "");
    if (!actorUserId) throw new OrpError("Unauthorized", 401);

    const client = createAdminClient(context.env);
    const role = await getActorRole(user, client);
    const dbId = context.env.APPWRITE_DATABASE_ID;

    const caseDoc = await client.db.getDocument(dbId, "cases", caseId);
    const mappedCase = mapCase(caseDoc as Record<string, unknown>);

    const canReadCase =
      role === "admin" ||
      role === "moderator" ||
      mappedCase.contributorUserId === actorUserId;

    if (!canReadCase) {
      throw new OrpError("Forbidden", 403);
    }

    const q = client.query;
    const messagesRes = await client.db.listDocuments(dbId, "case_messages", [
      q.equal("case_id", caseId),
      q.orderAsc("sent_at"),
      q.limit(200),
    ]);

    return json({
      case: mappedCase,
      messages: messagesRes.documents.map((doc) => mapMessage(doc as Record<string, unknown>)),
    });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
