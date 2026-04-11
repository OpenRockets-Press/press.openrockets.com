import { z } from "zod";
import { createAdminServices } from "../../shared/appwrite";
import { toErrorResponse } from "../../shared/errors";
import { type FunctionContext } from "../../shared/functionTypes";
import { parseBody } from "../../shared/request";

const schema = z.object({
  case_id: z.string().min(1),
  sender_user_id: z.string().min(1),
  sender_role: z.enum(["contributor", "moderator", "admin", "system"]),
  body: z.string().trim().min(1).max(4000),
  attachment_storage_id: z.string().optional().default(""),
});

export default async function ({ req, res, error }: FunctionContext) {
  try {
    const payload = schema.parse(parseBody<unknown>(req));
    const { db, id, env } = createAdminServices();

    const caseDoc = await db.getDocument(env.appwriteDatabaseId, "cases", payload.case_id);

    const message = await db.createDocument(env.appwriteDatabaseId, "case_messages", id.unique(), {
      case_id: payload.case_id,
      sender_user_id: payload.sender_user_id,
      sender_role: payload.sender_role,
      body: payload.body,
      attachment_storage_id: payload.attachment_storage_id,
      sent_at: new Date().toISOString(),
      read_by: [payload.sender_user_id],
    });

    const nextStatus = payload.sender_role === "contributor" ? "pending_moderator" : "pending_contributor";

    await db.updateDocument(env.appwriteDatabaseId, "cases", payload.case_id, {
      status: nextStatus,
      last_activity_at: new Date().toISOString(),
    });

    const recipientUserId =
      payload.sender_role === "contributor"
        ? String(caseDoc.opened_by)
        : String(caseDoc.contributor_user_id);

    await db.createDocument(env.appwriteDatabaseId, "notifications", id.unique(), {
      user_id: recipientUserId,
      type: "case_reply",
      title: `New reply in ${String(caseDoc.case_number)}`,
      body: payload.body.slice(0, 180),
      link: `/cases/${payload.case_id}`,
      read: false,
      created_at: new Date().toISOString(),
    });

    return res.json({ message_id: message.$id, case_status: nextStatus });
  } catch (caught) {
    const formatted = toErrorResponse(caught);
    error(`[reply-case] ${formatted.message}`);
    return res.json({ error: formatted.message }, formatted.statusCode);
  }
}
