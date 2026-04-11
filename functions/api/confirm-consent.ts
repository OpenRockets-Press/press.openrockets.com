import { z } from "zod";
import { createAdminClient } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json, parseBody } from "../_shared/http";
import { encryptText, verifyToken } from "../_shared/crypto";
import { trackAnalyticsEvent } from "../_shared/analytics";

const schema = z.object({
  token: z.string().min(1),
  guardian_email: z.email(),
});

function resolveUserIdFromToken(token: string, secret: string): string {
  const decoded = verifyToken(token, secret);
  const userId = decoded.user_id;

  if (typeof userId !== "string" || !userId) {
    throw new OrpError("Consent token is invalid.", 422);
  }

  if (decoded.purpose !== "parental_consent") {
    throw new OrpError("Consent token purpose is invalid.", 422);
  }

  if (typeof decoded.expires_at === "number" && Date.now() > decoded.expires_at) {
    throw new OrpError("Consent token has expired.", 410);
  }

  return userId;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await parseBody(context.request);
    const payload = schema.parse(body);
    const client = createAdminClient(context.env);

    const userId = resolveUserIdFromToken(payload.token, context.env.CONSENT_TOKEN_SECRET);
    const dbId = context.env.APPWRITE_DATABASE_ID;

    await client.db.updateDocument(dbId, "users", userId, {
      account_status: "active",
      guardian_consent_at: new Date().toISOString(),
      guardian_email_enc: encryptText(payload.guardian_email, context.env.GUARDIAN_EMAIL_SECRET),
    });

    await client.db.createDocument(dbId, "consent_records", client.id.unique(), {
      user_id: userId,
      consent_type: "parental_confirm",
      consent_text_version: "privacy-v1.0",
      consented_at: new Date().toISOString(),
      ip_hash: "",
      guardian_id: "",
      method: "in_session",
    });

    await client.db.createDocument(dbId, "notifications", client.id.unique(), {
      user_id: userId,
      type: "account_active",
      title: "Account activated",
      body: "Guardian confirmation completed. You can now publish on Open Rockets Press.",
      link: "/dashboard",
      read: false,
      created_at: new Date().toISOString(),
    });

    await trackAnalyticsEvent({
      client,
      eventType: "consent_completed",
      meta: { tier: "unknown" },
    });

    return json({ status: "active" });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
