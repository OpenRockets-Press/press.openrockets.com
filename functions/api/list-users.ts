import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json } from "../_shared/http";

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

    const res = await client.db.listDocuments(dbId, "users", [
      q.orderDesc("created_at"),
      q.limit(200),
    ]);

    const users = (res.documents as Record<string, unknown>[]).map((u) => ({
      userId: String(u.user_id ?? u.$id),
      displayName: String(u.display_name ?? "Contributor"),
      accountStatus: String(u.account_status ?? "active"),
      consentTier: String(u.consent_tier ?? "general"),
      role: Array.isArray(u.labels) && (u.labels as string[]).includes("admin")
        ? "admin"
        : Array.isArray(u.labels) && (u.labels as string[]).includes("moderator")
          ? "moderator"
          : "contributor",
      createdAt: String(u.created_at ?? new Date().toISOString()),
    }));

    return json({ users });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
