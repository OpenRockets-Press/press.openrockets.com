import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json } from "../_shared/http";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const authUser = await getSessionUser(context.request, context.env);
    if (!authUser) throw new OrpError("Unauthorized", 401);

    const client = createAdminClient(context.env);
    const userId = String(authUser.$id);
    const labels = Array.isArray((authUser as { labels?: unknown }).labels)
      ? (authUser as { labels: string[] }).labels
      : [];

    let userDoc: Record<string, unknown> | null = null;
    try {
      userDoc = await client.db.getDocument(
        context.env.APPWRITE_DATABASE_ID,
        "users",
        userId,
      );
    } catch {
      userDoc = null;
    }

    // Role priority: database document > Appwrite labels > fallback
    let role = "contributor";
    const docRole = userDoc?.role ? String(userDoc.role) : null;
    if (docRole === "admin" || docRole === "moderator") {
      role = docRole;
    } else if (labels.includes("admin")) {
      role = "admin";
    } else if (labels.includes("moderator")) {
      role = "moderator";
    }

    return json({
      userId,
      displayName: String(userDoc?.display_name ?? (authUser as { name?: unknown }).name ?? "Contributor"),
      email: String((authUser as { email?: unknown }).email ?? ""),
      role,
      accountStatus: String(userDoc?.account_status ?? "active"),
      consentTier: String(userDoc?.consent_tier ?? "general"),
    });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
