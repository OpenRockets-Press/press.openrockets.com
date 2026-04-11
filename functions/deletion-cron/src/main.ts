import { subHours } from "date-fns";
import { trackAnalyticsEvent } from "../../shared/analytics";
import { createAdminServices } from "../../shared/appwrite";
import { toErrorResponse } from "../../shared/errors";
import { type FunctionContext } from "../../shared/functionTypes";

export default async function ({ res, error }: FunctionContext) {
  try {
    const { db, users, query, env } = createAdminServices();

    const now = new Date();
    const pendingCutoff = subHours(now, 72).toISOString();
    const deletionCutoff = subHours(now, 24).toISOString();

    const stalePending = await db.listDocuments(env.appwriteDatabaseId, "users", [
      query.equal("account_status", "pending_parental"),
      query.lessThan("created_at", pendingCutoff),
      query.limit(100),
    ]);

    const pendingDeletion = await db.listDocuments(env.appwriteDatabaseId, "users", [
      query.equal("account_status", "deletion_requested"),
      query.lessThan("deletion_requested_at", deletionCutoff),
      query.limit(100),
    ]);

    let deletedUsers = 0;

    for (const userDoc of [...stalePending.documents, ...pendingDeletion.documents]) {
      const userId = String(userDoc.user_id || userDoc.$id);

      try {
        await users.delete(userId);
      } catch {
        // If auth user is already missing, continue deleting app data.
      }

      await db.deleteDocument(env.appwriteDatabaseId, "users", String(userDoc.$id));
      deletedUsers += 1;

      if (String(userDoc.account_status) === "pending_parental") {
        await trackAnalyticsEvent({
          db,
          databaseId: env.appwriteDatabaseId,
          eventType: "consent_expired",
          meta: { tier: String(userDoc.consent_tier ?? "unknown") },
        });
      }
    }

    return res.json({
      deleted_users: deletedUsers,
      stale_pending_accounts: stalePending.total,
      deletion_requested_accounts: pendingDeletion.total,
    });
  } catch (caught) {
    const formatted = toErrorResponse(caught);
    error(`[deletion-cron] ${formatted.message}`);
    return res.json({ error: formatted.message }, formatted.statusCode);
  }
}
