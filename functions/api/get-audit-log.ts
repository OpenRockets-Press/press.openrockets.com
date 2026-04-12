import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import { getActorRole, requireModOrAdmin } from "../_shared/authHelpers";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json } from "../_shared/http";

const AUDIT_TYPES = [
  "audit_pub_approved",
  "audit_pub_rejected",
  "audit_pub_retracted",
  "audit_user_suspended",
  "audit_user_activated",
  "audit_user_promoted",
  "audit_user_demoted",
  "audit_case_opened",
  "audit_case_resolved",
];

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await getSessionUser(context.request, context.env);
    if (!user) throw new OrpError("Unauthorized", 401);

    const client = createAdminClient(context.env);
    requireModOrAdmin(await getActorRole(user, client));

    const dbId = context.env.APPWRITE_DATABASE_ID;
    const q = client.query;

    const res = await client.db.listDocuments(dbId, "analytics_events", [
      q.equal("event_type", AUDIT_TYPES),
      q.orderDesc("$createdAt"),
      q.limit(100),
    ]);

    const entries = (res.documents as Record<string, unknown>[]).map((doc) => {
      let meta: Record<string, unknown> = {};
      try {
        meta = JSON.parse(String(doc.meta ?? "{}"));
      } catch { /* non-critical */ }

      return {
        id: String(doc.$id),
        action: String(doc.event_type),
        actorUserId: String(meta.actor_user_id ?? doc.session_id ?? ""),
        actorDisplayName: String(meta.actor_display_name ?? ""),
        targetId: String(meta.target_id ?? doc.pub_id ?? ""),
        targetLabel: String(meta.target_label ?? ""),
        details: String(meta.details ?? ""),
        occurredAt: String(doc.occurred_at ?? ""),
      };
    });

    return json({ entries });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
