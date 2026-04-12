import type { AdminClient } from "./appwrite";
import { trackAnalyticsEvent } from "./analytics";

export type AuditAction =
  | "audit_pub_approved"
  | "audit_pub_rejected"
  | "audit_pub_retracted"
  | "audit_user_suspended"
  | "audit_user_activated"
  | "audit_user_promoted"
  | "audit_user_demoted"
  | "audit_case_opened"
  | "audit_case_resolved";

interface AuditParams {
  client: AdminClient;
  action: AuditAction;
  actorUserId: string;
  actorDisplayName?: string;
  targetId: string;
  targetLabel?: string;
  details?: string;
}

export async function writeAuditLog(params: AuditParams): Promise<void> {
  await trackAnalyticsEvent({
    client: params.client,
    eventType: params.action,
    sessionId: params.actorUserId,
    meta: {
      actor_user_id: params.actorUserId,
      actor_display_name: params.actorDisplayName ?? "",
      target_id: params.targetId,
      target_label: params.targetLabel ?? "",
      details: params.details ?? "",
    },
  });
}
