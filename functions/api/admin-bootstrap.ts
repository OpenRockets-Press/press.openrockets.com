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

    // Upsert the users DB document so the role field is always in sync.
    // getDocument throws 404 if it doesn't exist; in that case create it.
    try {
      await client.db.updateDocument(dbId, "users", userId, { role: "admin" });
    } catch {
      try {
        await client.db.createDocument(dbId, "users", userId, {
          user_id: userId,
          display_name: String((authUser as Record<string, unknown>).name ?? "Admin"),
          role: "admin",
          consent_tier: "general",
          account_status: "active",
          guardian_email_enc: "",
          country_code: "",
          created_at: new Date().toISOString(),
        });
      } catch {
        // Best-effort — labels remain the fallback
      }
    }

    return json({ ok: true, role: "admin" });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
