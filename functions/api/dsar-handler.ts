import { z } from "zod";
import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json, parseBody } from "../_shared/http";
import { buildCaseNumber, nextCounter } from "../_shared/counters";

const schema = z.object({
  user_id: z.string().min(1),
  action: z.enum(["export", "delete"]),
});

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const sessionUser = await getSessionUser(context.request, context.env);
    if (!sessionUser) throw new OrpError("Unauthorized", 401);

    const body = await parseBody(context.request);
    const payload = schema.parse(body);

    // Users can only DSAR themselves; admins can DSAR anyone
    const labels = Array.isArray((sessionUser as { labels?: unknown }).labels)
      ? ((sessionUser as { labels: string[] }).labels)
      : [];
    const isAdmin = labels.includes("admin");
    if (!isAdmin && String(sessionUser.$id) !== payload.user_id) {
      throw new OrpError("Forbidden", 403);
    }

    const client = createAdminClient(context.env);
    const dbId = context.env.APPWRITE_DATABASE_ID;

    const user = await client.db.getDocument(dbId, "users", payload.user_id);

    const year = new Date().getUTCFullYear();
    const caseSeq = await nextCounter(client, `case_${year}`);
    const caseNumber = buildCaseNumber(year, caseSeq);

    const caseDoc = await client.db.createDocument(dbId, "cases", client.id.unique(), {
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

    await client.db.createDocument(dbId, "case_messages", client.id.unique(), {
      case_id: caseDoc.$id,
      sender_user_id: "system",
      sender_role: "system",
      body: `DSAR request received. Action: ${payload.action}.`,
      attachment_storage_id: "",
      sent_at: new Date().toISOString(),
      read_by: ["system"],
    });

    if (payload.action === "delete") {
      await client.db.updateDocument(dbId, "users", payload.user_id, {
        account_status: "deletion_requested",
        deletion_requested_at: new Date().toISOString(),
      });
    }

    if (payload.action === "export") {
      const publications = await client.db.listDocuments(dbId, "publications", [
        client.query.equal("author_user_id", payload.user_id),
      ]);

      return json({
        status: "accepted",
        case_id: caseDoc.$id,
        export_preview: {
          user,
          publications_count: (publications as { total: number }).total,
        },
      });
    }

    return json({ status: "accepted", case_id: caseDoc.$id });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
