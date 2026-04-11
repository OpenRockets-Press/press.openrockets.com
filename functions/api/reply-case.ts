import { z } from "zod";
import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json, parseBody } from "../_shared/http";

const schema = z.object({
  case_id: z.string().min(1),
  sender_user_id: z.string().min(1),
  sender_role: z.enum(["contributor", "moderator", "admin", "system"]),
  body: z.string().trim().min(1).max(4000),
  attachment_storage_id: z.string().optional().default(""),
});

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await getSessionUser(context.request, context.env);
    if (!user) throw new OrpError("Unauthorized", 401);

    const body = await parseBody(context.request);
    const payload = schema.parse(body);
    const client = createAdminClient(context.env);
    const dbId = context.env.APPWRITE_DATABASE_ID;

    const caseDoc = await client.db.getDocument(dbId, "cases", payload.case_id);

    const message = await client.db.createDocument(dbId, "case_messages", client.id.unique(), {
      case_id: payload.case_id,
      sender_user_id: payload.sender_user_id,
      sender_role: payload.sender_role,
      body: payload.body,
      attachment_storage_id: payload.attachment_storage_id,
      sent_at: new Date().toISOString(),
      read_by: [payload.sender_user_id],
    });

    const nextStatus =
      payload.sender_role === "contributor" ? "pending_moderator" : "pending_contributor";

    await client.db.updateDocument(dbId, "cases", payload.case_id, {
      status: nextStatus,
      last_activity_at: new Date().toISOString(),
    });

    const recipientUserId =
      payload.sender_role === "contributor"
        ? String(caseDoc.opened_by)
        : String(caseDoc.contributor_user_id);

    await client.db.createDocument(dbId, "notifications", client.id.unique(), {
      user_id: recipientUserId,
      type: "case_reply",
      title: `New reply in ${String(caseDoc.case_number)}`,
      body: payload.body.slice(0, 180),
      link: `/cases/${payload.case_id}`,
      read: false,
      created_at: new Date().toISOString(),
    });

    return json({ message_id: message.$id, case_status: nextStatus });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
