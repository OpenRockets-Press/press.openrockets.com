import { z } from "zod";
import { trackAnalyticsEvent } from "../../shared/analytics";
import { createAdminServices } from "../../shared/appwrite";
import { buildCaseNumber, nextCounter } from "../../shared/counters";
import { toErrorResponse } from "../../shared/errors";
import { type FunctionContext } from "../../shared/functionTypes";
import { getHeader, parseBody } from "../../shared/request";

const schema = z.object({
  contributor_user_id: z.string().min(1),
  subject: z.string().trim().min(3).max(200),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  labels: z
    .array(z.enum(["rejection", "copyright", "content_policy", "identity", "gdpr_request", "compliment", "other"]))
    .optional()
    .default([]),
  related_pub_id: z.string().optional().default(""),
  related_case_ids: z.array(z.string()).optional().default([]),
  opening_message: z.string().trim().min(1).max(4000),
});

export default async function ({ req, res, error }: FunctionContext) {
  try {
    const payload = schema.parse(parseBody<unknown>(req));
    const openedBy = getHeader(req, "x-appwrite-user-id") ?? "moderator";

    const { db, id, env } = createAdminServices();
    const year = new Date().getUTCFullYear();
    const sequence = await nextCounter(db, env.appwriteDatabaseId, `case_${year}`);
    const caseNumber = buildCaseNumber(year, sequence);

    const caseDoc = await db.createDocument(env.appwriteDatabaseId, "cases", id.unique(), {
      case_number: caseNumber,
      subject: payload.subject,
      status: "open",
      priority: payload.priority,
      opened_by: openedBy,
      contributor_user_id: payload.contributor_user_id,
      related_pub_id: payload.related_pub_id,
      labels: payload.labels,
      related_case_ids: payload.related_case_ids,
      opened_at: new Date().toISOString(),
      resolved_at: "",
      last_activity_at: new Date().toISOString(),
    });

    await db.createDocument(env.appwriteDatabaseId, "case_messages", id.unique(), {
      case_id: caseDoc.$id,
      sender_user_id: openedBy,
      sender_role: "moderator",
      body: payload.opening_message,
      attachment_storage_id: "",
      sent_at: new Date().toISOString(),
      read_by: [openedBy],
    });

    await db.createDocument(env.appwriteDatabaseId, "notifications", id.unique(), {
      user_id: payload.contributor_user_id,
      type: "case_opened",
      title: `New moderation case ${caseNumber}`,
      body: payload.subject,
      link: `/cases/${caseDoc.$id}`,
      read: false,
      created_at: new Date().toISOString(),
    });

    await trackAnalyticsEvent({
      db,
      databaseId: env.appwriteDatabaseId,
      eventType: "case_opened",
    });

    return res.json({ case_id: caseDoc.$id, case_number: caseNumber, status: "open" });
  } catch (caught) {
    const formatted = toErrorResponse(caught);
    error(`[open-case] ${formatted.message}`);
    return res.json({ error: formatted.message }, formatted.statusCode);
  }
}
