/**
 * TEMPORARY diagnostic endpoint — remove before shipping to production.
 * GET /api/debug-role  →  returns the resolved role and raw DB/labels data
 * for the currently authenticated user.
 */
import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { errorResponse, json } from "../_shared/http";
import { toErrorResponse } from "../_shared/errors";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await getSessionUser(context.request, context.env);
    if (!user) return errorResponse("Unauthorized", 401);

    const userId = String(user.$id);
    const client = createAdminClient(context.env);
    const dbId = context.env.APPWRITE_DATABASE_ID;

    const labels = Array.isArray((user as { labels?: unknown }).labels)
      ? (user as { labels: string[] }).labels
      : [];

    let docRole: string | null = null;
    let docExists = false;
    let docError: string | null = null;

    try {
      const doc = await client.db.getDocument(dbId, "users", userId) as Record<string, unknown>;
      docExists = true;
      docRole = String(doc.role ?? "(missing)");
    } catch (e) {
      docError = e instanceof Error ? e.message : String(e);
    }

    return json({
      userId,
      labelsFromJWT: labels,
      docExists,
      docRole,
      docError,
      dbId,
    });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
