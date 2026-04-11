import { z } from "zod";
import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json, parseBody } from "../_shared/http";

const schema = z.object({
  case_id: z.string().min(1),
  status: z.enum(["resolved", "closed"]).default("resolved"),
  resolution_note: z.string().trim().max(1000).optional().default(""),
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

    const caseDoc = await client.db.getDocument(dbId, "cases", payload.case_id);

    const updated = await client.db.updateDocument(dbId, "cases", payload.case_id, {
      status: payload.status,
      resolved_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    });

    await client.db.createDocument(dbId, "case_messages", client.id.unique(), {
      case_id: payload.case_id,
      sender_user_id: "system",
      sender_role: "system",
      body:
        payload.resolution_note ||
        `Case marked as ${payload.status} by moderator action.`,
      attachment_storage_id: "",
      sent_at: new Date().toISOString(),
      read_by: ["system"],
    });

    await client.db.createDocument(dbId, "notifications", client.id.unique(), {
      user_id: String(caseDoc.contributor_user_id),
      type: "case_resolved",
      title: `Case ${String(caseDoc.case_number)} ${payload.status}`,
      body: payload.resolution_note || "Your moderation case has been updated.",
      link: `/cases/${payload.case_id}`,
      read: false,
      created_at: new Date().toISOString(),
    });

    return json({ case_id: payload.case_id, status: updated.status });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
