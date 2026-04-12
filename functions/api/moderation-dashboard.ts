import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json } from "../_shared/http";

function mapPub(doc: Record<string, unknown>) {
  return {
    id: String(doc.$id),
    pubId: doc.pub_id ? String(doc.pub_id) : undefined,
    title: String(doc.title ?? "Untitled"),
    abstract: doc.abstract ? String(doc.abstract) : undefined,
    authorDisplayName: String(doc.author_display_name ?? "Contributor"),
    authorUserId: String(doc.author_user_id ?? ""),
    type: String(doc.type ?? "other"),
    status: String(doc.status ?? "draft"),
    license: String(doc.license ?? "CC_BY"),
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    submittedAt: String(doc.submitted_at ?? new Date().toISOString()),
    reviewedAt: doc.reviewed_at ? String(doc.reviewed_at) : undefined,
    publishedAt: doc.published_at ? String(doc.published_at) : undefined,
    reviewedBy: doc.reviewed_by ? String(doc.reviewed_by) : undefined,
    rejectionReason: doc.rejection_reason ? String(doc.rejection_reason) : undefined,
    fileStorageId: doc.file_storage_id ? String(doc.file_storage_id) : undefined,
    coverStorageId: doc.cover_storage_id ? String(doc.cover_storage_id) : undefined,
    isFeatured: Boolean(doc.is_featured),
    featuredRank: typeof doc.featured_rank === "number" ? doc.featured_rank : undefined,
    viewCount: Number(doc.view_count ?? 0),
    downloadCount: Number(doc.download_count ?? 0),
  };
}

function mapCase(doc: Record<string, unknown>) {
  const status = String(doc.status ?? "open");
  const priority = String(doc.priority ?? "normal");
  return {
    id: String(doc.$id),
    caseNumber: String(doc.case_number ?? doc.$id),
    subject: String(doc.subject ?? "Moderation case"),
    status: (["open","pending_contributor","pending_moderator","resolved","closed"].includes(status)
      ? status : "open") as string,
    priority: (["low","normal","high","urgent"].includes(priority) ? priority : "normal") as string,
    contributorUserId: String(doc.contributor_user_id ?? ""),
    openedBy: String(doc.opened_by ?? ""),
    relatedPubId: doc.related_pub_id ? String(doc.related_pub_id) : undefined,
    labels: Array.isArray(doc.labels) ? doc.labels : [],
    openedAt: String(doc.opened_at ?? new Date().toISOString()),
    lastActivityAt: String(doc.last_activity_at ?? new Date().toISOString()),
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await getSessionUser(context.request, context.env);
    if (!user) throw new OrpError("Unauthorized", 401);

    const labels = Array.isArray((user as { labels?: unknown }).labels)
      ? (user as { labels: string[] }).labels
      : [];
    if (!labels.includes("moderator") && !labels.includes("admin")) {
      throw new OrpError("Forbidden", 403);
    }

    const client = createAdminClient(context.env);
    const dbId = context.env.APPWRITE_DATABASE_ID;
    const q = client.query;

    const [pendingPubsRes, openCasesRes] = await Promise.all([
      client.db.listDocuments(dbId, "publications", [
        q.equal("status", "pending_review"),
        q.orderDesc("submitted_at"),
        q.limit(30),
      ]),
      client.db.listDocuments(dbId, "cases", [
        q.equal("status", ["open", "pending_contributor", "pending_moderator"]),
        q.orderDesc("last_activity_at"),
        q.limit(30),
      ]),
    ]);

    return json({
      pendingPublications: pendingPubsRes.documents.map((d) => mapPub(d as Record<string, unknown>)),
      openCases: openCasesRes.documents.map((d) => mapCase(d as Record<string, unknown>)),
    });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
