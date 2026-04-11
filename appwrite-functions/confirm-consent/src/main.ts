import { z } from "zod";
import { trackAnalyticsEvent } from "../../shared/analytics";
import { createAdminServices } from "../../shared/appwrite";
import { encryptText, verifyToken } from "../../shared/crypto";
import { OrpError, toErrorResponse } from "../../shared/errors";
import { type FunctionContext } from "../../shared/functionTypes";
import { parseBody } from "../../shared/request";

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

  const purpose = decoded.purpose;
  if (purpose !== "parental_consent") {
    throw new OrpError("Consent token purpose is invalid.", 422);
  }

  const expiresAt = decoded.expires_at;
  if (typeof expiresAt === "number" && Date.now() > expiresAt) {
    throw new OrpError("Consent token has expired.", 410);
  }

  return userId;
}

export default async function ({ req, res, error }: FunctionContext) {
  try {
    const payload = schema.parse(parseBody<unknown>(req));
    const { db, id, env } = createAdminServices();

    const userId = resolveUserIdFromToken(payload.token, env.consentTokenSecret);

    await db.updateDocument(env.appwriteDatabaseId, "users", userId, {
      account_status: "active",
      guardian_consent_at: new Date().toISOString(),
      guardian_email_enc: encryptText(payload.guardian_email, env.guardianEmailSecret),
    });

    await db.createDocument(env.appwriteDatabaseId, "consent_records", id.unique(), {
      user_id: userId,
      consent_type: "parental_confirm",
      consent_text_version: "privacy-v1.0",
      consented_at: new Date().toISOString(),
      ip_hash: "",
      guardian_id: "",
      method: "in_session",
    });

    await db.createDocument(env.appwriteDatabaseId, "notifications", id.unique(), {
      user_id: userId,
      type: "account_active",
      title: "Account activated",
      body: "Guardian confirmation completed. You can now publish on Open Rockets Press.",
      link: "/dashboard",
      read: false,
      created_at: new Date().toISOString(),
    });

    await trackAnalyticsEvent({
      db,
      databaseId: env.appwriteDatabaseId,
      eventType: "consent_completed",
      meta: { tier: "unknown" },
    });

    return res.json({ status: "active" });
  } catch (caught) {
    const formatted = toErrorResponse(caught);
    error(`[confirm-consent] ${formatted.message}`);
    return res.json({ error: formatted.message }, formatted.statusCode);
  }
}
