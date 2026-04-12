import { z } from "zod";
import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json, parseBody } from "../_shared/http";
import { writeAuditLog } from "../_shared/writeAuditLog";

const schema = z.object({
  user_id: z.string().min(1),
  action: z.enum(["promote", "demote"]),
});

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const actor = await getSessionUser(context.request, context.env);
    if (!actor) throw new OrpError("Unauthorized", 401);

    const actorLabels = Array.isArray((actor as { labels?: unknown }).labels)
      ? (actor as { labels: string[] }).labels
      : [];
    if (!actorLabels.includes("admin")) throw new OrpError("Forbidden", 403);

    const body = await parseBody(context.request);
    const payload = schema.parse(body);
    const client = createAdminClient(context.env);
    const dbId = context.env.APPWRITE_DATABASE_ID;
    const q = client.query;

    const targetAccount = await client.users.get(payload.user_id);
    const currentLabels: string[] = Array.isArray(
      (targetAccount as { labels?: unknown }).labels,
    )
      ? (targetAccount as { labels: string[] }).labels
      : ["contributor"];

    if (currentLabels.includes("admin")) {
      throw new OrpError("Cannot change labels for admin users.", 403);
    }

    const newLabels =
      payload.action === "promote"
        ? [...new Set([...currentLabels, "moderator"])]
        : currentLabels.filter((l) => l !== "moderator");

    await client.users.updateLabels(payload.user_id, newLabels);

    // Sync role field in the users DB document
    const res = await client.db.listDocuments(dbId, "users", [
      q.equal("user_id", payload.user_id),
      q.limit(1),
    ]);
    const doc = (res.documents as Record<string, unknown>[])[0];
    if (doc) {
      await client.db.updateDocument(dbId, "users", String(doc.$id), {
        role: payload.action === "promote" ? "moderator" : "contributor",
      });
    }

    const newRole = payload.action === "promote" ? "moderator" : "contributor";

    await writeAuditLog({
      client,
      action: payload.action === "promote" ? "audit_user_promoted" : "audit_user_demoted",
      actorUserId: String(actor.$id),
      actorDisplayName: String((actor as Record<string, unknown>).name ?? ""),
      targetId: payload.user_id,
      targetLabel: String((targetAccount as Record<string, unknown>).name ?? ""),
      details: `Role changed to ${newRole}`,
    });

    return json({ user_id: payload.user_id, role: newRole });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
