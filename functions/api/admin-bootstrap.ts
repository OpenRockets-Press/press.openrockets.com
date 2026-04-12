import { z } from "zod";
import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json, parseBody } from "../_shared/http";

const schema = z.object({
  secret: z.string().min(1),
});

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // Endpoint disabled if no secret is configured
    if (!context.env.ADMIN_BOOTSTRAP_SECRET) {
      throw new OrpError("Not found.", 404);
    }

    const authUser = await getSessionUser(context.request, context.env);
    if (!authUser) throw new OrpError("Unauthorized", 401);

    const body = await parseBody(context.request);
    const payload = schema.parse(body);

    if (payload.secret !== context.env.ADMIN_BOOTSTRAP_SECRET) {
      throw new OrpError("Invalid secret.", 403);
    }

    const client = createAdminClient(context.env);
    const userId = String(authUser.$id);
    const dbId = context.env.APPWRITE_DATABASE_ID;

    // Add admin label to the Appwrite Auth user
    const currentLabels = Array.isArray((authUser as { labels?: unknown }).labels)
      ? (authUser as { labels: string[] }).labels
      : [];
    const newLabels = currentLabels.includes("admin")
      ? currentLabels
      : [...currentLabels, "admin"];
    await client.users.updateLabels(userId, newLabels);

    // Update the users database document if it exists
    try {
      await client.db.updateDocument(dbId, "users", userId, { role: "admin" });
    } catch {
      // Document may not exist yet — that is fine, labels are the source of truth
    }

    return json({ ok: true, role: "admin" });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
