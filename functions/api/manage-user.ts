import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import { getActorRole, requireModOrAdmin } from "../_shared/authHelpers";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json } from "../_shared/http";
import { writeAuditLog } from "../_shared/writeAuditLog";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await getSessionUser(context.request, context.env);
    if (!user) throw new OrpError("Unauthorized", 401);

    const client = createAdminClient(context.env);
    requireModOrAdmin(await getActorRole(user, client));

    const body = await context.request.json() as Record<string, unknown>;
    const targetUserId = typeof body.user_id === "string" ? body.user_id.trim() : "";
    const action = typeof body.action === "string" ? body.action : "";

    if (!targetUserId) throw new OrpError("user_id is required", 400);
    if (action !== "suspend" && action !== "activate") {
      throw new OrpError("action must be 'suspend' or 'activate'", 400);
    }

    const dbId = context.env.APPWRITE_DATABASE_ID;
    const q = client.query;

    const res = await client.db.listDocuments(dbId, "users", [
      q.equal("user_id", targetUserId),
      q.limit(1),
    ]);

    const doc = (res.documents as Record<string, unknown>[])[0];
    if (!doc) throw new OrpError("User not found", 404);

    const docId = String(doc.$id);
    const newStatus = action === "suspend" ? "suspended" : "active";

    await client.db.updateDocument(dbId, "users", docId, {
      account_status: newStatus,
    });

    await writeAuditLog({
      client,
      action: action === "suspend" ? "audit_user_suspended" : "audit_user_activated",
      actorUserId: String(user.$id),
      actorDisplayName: String((user as Record<string, unknown>).name ?? ""),
      targetId: targetUserId,
      targetLabel: String(doc.display_name ?? ""),
    });

    return json({ status: newStatus, user_id: targetUserId });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
