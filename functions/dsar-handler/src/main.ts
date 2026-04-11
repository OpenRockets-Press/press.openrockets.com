import { z } from "zod";
import { createAdminServices } from "../../shared/appwrite";
import { buildCaseNumber, nextCounter } from "../../shared/counters";
import { OrpError, toErrorResponse } from "../../shared/errors";
import { type FunctionContext } from "../../shared/functionTypes";
import { parseBody } from "../../shared/request";

const schema = z.object({
  user_id: z.string().min(1),
  action: z.enum(["export", "delete"]),
});

export default async function ({ req, res, error }: FunctionContext) {
  try {
    const payload = schema.parse(parseBody<unknown>(req));
    const { db, id, env, query } = createAdminServices();

    const user = await db.getDocument(env.appwriteDatabaseId, "users", payload.user_id);
    if (!user) {
      throw new OrpError("User not found", 404);
    }

    const year = new Date().getUTCFullYear();
    const caseSeq = await nextCounter(db, env.appwriteDatabaseId, `case_${year}`);
    const caseNumber = buildCaseNumber(year, caseSeq);

    const caseDoc = await db.createDocument(env.appwriteDatabaseId, "cases", id.unique(), {
      case_number: caseNumber,
      subject: `DSAR ${payload.action.toUpperCase()} request`,
      status: "open",
      priority: "normal",
      opened_by: "system",
      contributor_user_id: payload.user_id,
      related_pub_id: "",
      labels: ["gdpr_request"],
      related_case_ids: [],
      opened_at: new Date().toISOString(),
      resolved_at: "",
      last_activity_at: new Date().toISOString(),
    });

    await db.createDocument(env.appwriteDatabaseId, "case_messages", id.unique(), {
      case_id: caseDoc.$id,
      sender_user_id: "system",
      sender_role: "system",
      body: `DSAR request received. Action: ${payload.action}.`,
      attachment_storage_id: "",
      sent_at: new Date().toISOString(),
      read_by: ["system"],
    });

    if (payload.action === "delete") {
      await db.updateDocument(env.appwriteDatabaseId, "users", payload.user_id, {
        account_status: "deletion_requested",
        deletion_requested_at: new Date().toISOString(),
      });
    }

    if (payload.action === "export") {
      const publications = await db.listDocuments(env.appwriteDatabaseId, "publications", [
        query.equal("author_user_id", payload.user_id),
      ]);

      return res.json({
        status: "accepted",
        case_id: caseDoc.$id,
        export_preview: {
          user,
          publications_count: publications.total,
        },
      });
    }

    return res.json({ status: "accepted", case_id: caseDoc.$id });
  } catch (caught) {
    const formatted = toErrorResponse(caught);
    error(`[dsar-handler] ${formatted.message}`);
    return res.json({ error: formatted.message }, formatted.statusCode);
  }
}
