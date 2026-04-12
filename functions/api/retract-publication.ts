import { z } from "zod";
import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import { getActorRole, requireAdmin } from "../_shared/authHelpers";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json, parseBody } from "../_shared/http";
import { writeAuditLog } from "../_shared/writeAuditLog";

const schema = z.object({
  publication_id: z.string().min(1),
  reason: z.string().trim().max(500).optional().default(""),
});

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await getSessionUser(context.request, context.env);
    if (!user) throw new OrpError("Unauthorized", 401);

    const client = createAdminClient(context.env);
    requireAdmin(await getActorRole(user, client));

    const body = await parseBody(context.request);
    const payload = schema.parse(body);
    const dbId = context.env.APPWRITE_DATABASE_ID;

    const pub = await client.db.getDocument(dbId, "publications", payload.publication_id);

    if (!["approved", "pending_review"].includes(String(pub.status))) {
      throw new OrpError("Only approved or pending publications can be retracted.", 409);
    }

    await client.db.updateDocument(dbId, "publications", payload.publication_id, {
      status: "retracted",
      reviewed_by: String(user.$id),
      reviewed_at: new Date().toISOString(),
    });

    await client.db.createDocument(dbId, "notifications", client.id.unique(), {
      user_id: String(pub.author_user_id),
      type: "publication_rejected",
      title: "Publication retracted",
      body: payload.reason || "Your publication has been retracted by an administrator.",
      link: "/dashboard",
      read: false,
      created_at: new Date().toISOString(),
    });

    await writeAuditLog({
      client,
      action: "audit_pub_retracted",
      actorUserId: String(user.$id),
      actorDisplayName: String((user as Record<string, unknown>).name ?? ""),
      targetId: payload.publication_id,
      targetLabel: String(pub.title ?? ""),
      details: payload.reason,
    });

    return json({ status: "retracted", publication_id: payload.publication_id });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
