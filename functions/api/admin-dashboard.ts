import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import { getActorRole, requireAdmin } from "../_shared/authHelpers";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json } from "../_shared/http";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await getSessionUser(context.request, context.env);
    if (!user) throw new OrpError("Unauthorized", 401);

    const client = createAdminClient(context.env);
    requireAdmin(await getActorRole(user, client));
    const dbId = context.env.APPWRITE_DATABASE_ID;
    const q = client.query;

    const [usersRes, pendingPubsRes, openCasesRes, topDownloadsRes, analyticsRes] =
      await Promise.all([
        client.db.listDocuments(dbId, "users", [q.limit(500)]),
        client.db.listDocuments(dbId, "publications", [
          q.equal("status", "pending_review"),
          q.limit(1),
        ]),
        client.db.listDocuments(dbId, "cases", [
          q.equal("status", ["open", "pending_contributor", "pending_moderator"]),
          q.limit(1),
        ]),
        client.db.listDocuments(dbId, "publications", [
          q.equal("status", "approved"),
          q.orderDesc("download_count"),
          q.limit(5),
        ]),
        client.db.listDocuments(dbId, "analytics_events", [
          q.equal("event_type", ["consent_started", "consent_completed", "consent_expired"]),
          q.limit(500),
        ]),
      ]);

    const allUsers = usersRes.documents as Record<string, unknown>[];

    const pendingParentalAccounts = allUsers
      .filter((u) => String(u.account_status) === "pending_parental")
      .slice(0, 8)
      .map((u) => ({
        userId: String(u.user_id ?? u.$id),
        displayName: String(u.display_name ?? "Contributor"),
        consentTier: String(u.consent_tier ?? "general"),
        createdAt: String(u.created_at ?? new Date().toISOString()),
      }));

    const analytics = analyticsRes.documents as Record<string, unknown>[];
    const consentStarted = analytics.filter((e) => e.event_type === "consent_started").length;
    const consentCompleted = analytics.filter((e) => e.event_type === "consent_completed").length;
    const consentExpired = analytics.filter((e) => e.event_type === "consent_expired").length;

    const topDownloads = topDownloadsRes.documents.map((doc) => {
      const d = doc as Record<string, unknown>;
      return {
        id: String(d.$id),
        pubId: d.pub_id ? String(d.pub_id) : undefined,
        title: String(d.title ?? "Untitled"),
        authorDisplayName: String(d.author_display_name ?? "Contributor"),
        type: String(d.type ?? "other"),
        license: d.license ? String(d.license) : undefined,
      };
    });

    return json({
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter((u) => String(u.account_status) === "active").length,
      pendingParentalUsers: allUsers.filter((u) => String(u.account_status) === "pending_parental").length,
      suspendedUsers: allUsers.filter((u) => String(u.account_status) === "suspended").length,
      openCases: (openCasesRes as { total: number }).total,
      pendingReviewPublications: (pendingPubsRes as { total: number }).total,
      consentStarted,
      consentCompleted,
      consentExpired,
      topDownloads,
      pendingParentalAccounts,
    });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
