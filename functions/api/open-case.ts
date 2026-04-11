import { z } from "zod";
import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json, parseBody } from "../_shared/http";
import { trackAnalyticsEvent } from "../_shared/analytics";
import { buildCaseNumber, nextCounter } from "../_shared/counters";

const schema = z.object({
  contributor_user_id: z.string().min(1),
  subject: z.string().trim().min(3).max(200),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  labels: z
    .array(
      z.enum([
        "rejection",
        "copyright",
        "content_policy",
        "identity",
        "gdpr_request",
        "compliment",
        "other",
      ]),
    )
    .optional()
    .default([]),
  related_pub_id: z.string().optional().default(""),
  related_case_ids: z.array(z.string()).optional().default([]),
  opening_message: z.string().trim().min(1).max(4000),
});

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await getSessionUser(context.request, context.env);
    if (!user) throw new OrpError("Unauthorized", 401);

    const labels = Array.isArray((user as { labels?: unknown }).labels)
      ? ((user as { labels: string[] }).labels)
      : [];
    if (!labels.includes("moderator") && !labels.includes("admin")) {
      throw new OrpError("Forbidden", 403);
    }

    const body = await parseBody(context.request);
    const payload = schema.parse(body);
    const client = createAdminClient(context.env);
    const dbId = context.env.APPWRITE_DATABASE_ID;
    const openedBy = String(user.$id);

    const year = new Date().getUTCFullYear();
    const sequence = await nextCounter(client, `case_${year}`);
    const caseNumber = buildCaseNumber(year, sequence);

    const caseDoc = await client.db.createDocument(dbId, "cases", client.id.unique(), {
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

    await client.db.createDocument(dbId, "case_messages", client.id.unique(), {
      case_id: caseDoc.$id,
      sender_user_id: openedBy,
      sender_role: "moderator",
      body: payload.opening_message,
      attachment_storage_id: "",
      sent_at: new Date().toISOString(),
      read_by: [openedBy],
    });

    await client.db.createDocument(dbId, "notifications", client.id.unique(), {
      user_id: payload.contributor_user_id,
      type: "case_opened",
      title: `New moderation case ${caseNumber}`,
      body: payload.subject,
      link: `/cases/${caseDoc.$id}`,
      read: false,
      created_at: new Date().toISOString(),
    });

    await trackAnalyticsEvent({ client, eventType: "case_opened" });

    return json({ case_id: caseDoc.$id, case_number: caseNumber, status: "open" });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
