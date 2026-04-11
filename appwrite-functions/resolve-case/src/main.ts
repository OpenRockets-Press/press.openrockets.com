import { z } from "zod";
import { createAdminServices } from "../../shared/appwrite";
import { toErrorResponse } from "../../shared/errors";
import { type FunctionContext } from "../../shared/functionTypes";
import { parseBody } from "../../shared/request";

const schema = z.object({
  case_id: z.string().min(1),
  status: z.enum(["resolved", "closed"]).default("resolved"),
  resolution_note: z.string().trim().max(1000).optional().default(""),
});

export default async function ({ req, res, error }: FunctionContext) {
  try {
    const payload = schema.parse(parseBody<unknown>(req));
    const { db, id, env } = createAdminServices();

    const caseDoc = await db.getDocument(env.appwriteDatabaseId, "cases", payload.case_id);

    const updated = await db.updateDocument(env.appwriteDatabaseId, "cases", payload.case_id, {
      status: payload.status,
      resolved_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    });

    await db.createDocument(env.appwriteDatabaseId, "case_messages", id.unique(), {
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

    await db.createDocument(env.appwriteDatabaseId, "notifications", id.unique(), {
      user_id: String(caseDoc.contributor_user_id),
      type: "case_resolved",
      title: `Case ${String(caseDoc.case_number)} ${payload.status}`,
      body: payload.resolution_note || "Your moderation case has been updated.",
      link: `/cases/${payload.case_id}`,
      read: false,
      created_at: new Date().toISOString(),
    });

    return res.json({ case_id: payload.case_id, status: updated.status });
  } catch (caught) {
    const formatted = toErrorResponse(caught);
    error(`[resolve-case] ${formatted.message}`);
    return res.json({ error: formatted.message }, formatted.statusCode);
  }
}
