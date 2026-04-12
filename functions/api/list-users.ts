import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import { getActorRole, requireModOrAdmin } from "../_shared/authHelpers";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json } from "../_shared/http";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await getSessionUser(context.request, context.env);
    if (!user) throw new OrpError("Unauthorized", 401);

    const client = createAdminClient(context.env);
    requireModOrAdmin(await getActorRole(user, client));

    const dbId = context.env.APPWRITE_DATABASE_ID;
    const q = client.query;

    const res = await client.db.listDocuments(dbId, "users", [
      q.limit(200),
    ]);

    const users = (res.documents as Record<string, unknown>[]).map((u) => {
      const role = String(u.role ?? "contributor");
      return {
        userId: String(u.user_id ?? u.$id),
        displayName: String(u.display_name ?? "Contributor"),
        accountStatus: String(u.account_status ?? "active"),
        consentTier: String(u.consent_tier ?? "general"),
        role: (role === "admin" || role === "moderator") ? role : "contributor",
        createdAt: String(u.created_at ?? u.$createdAt ?? new Date().toISOString()),
      };
    });

    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return json({ users });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
