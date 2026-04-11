import { z } from "zod";
import { trackAnalyticsEvent } from "../../shared/analytics";
import { createAdminServices } from "../../shared/appwrite";
import { encryptText, signToken } from "../../shared/crypto";
import { OrpError, toErrorResponse } from "../../shared/errors";
import { type FunctionContext } from "../../shared/functionTypes";
import { REQUIRES_GUARDIAN } from "../../shared/consent";
import { parseBody } from "../../shared/request";

const schema = z.object({
  display_name: z.string().trim().min(3).max(100),
  email: z.email(),
  password: z.string().min(10).max(128),
  consent_tier: z.enum(["coppa", "gdpr_eu", "gdpr_es", "general"]),
  guardian_email: z.email().optional(),
});

export default async function ({ req, res, error }: FunctionContext) {
  try {
    const payload = schema.parse(parseBody<unknown>(req));
    const { db, users, id, env } = createAdminServices();

    if (REQUIRES_GUARDIAN.has(payload.consent_tier) && !payload.guardian_email) {
      throw new OrpError("Guardian email required for this consent tier.", 422);
    }

    const user = await users.create(
      id.unique(),
      payload.email,
      undefined,
      payload.password,
      payload.display_name,
    );

    await users.updateLabels(user.$id, ["contributor"]);

    const accountStatus = REQUIRES_GUARDIAN.has(payload.consent_tier) ? "pending_parental" : "active";

    await db.createDocument(env.appwriteDatabaseId, "users", user.$id, {
      user_id: user.$id,
      display_name: payload.display_name,
      role: "contributor",
      consent_tier: payload.consent_tier,
      account_status: accountStatus,
      guardian_email_enc: payload.guardian_email
        ? encryptText(payload.guardian_email, env.guardianEmailSecret)
        : "",
      country_code: "",
      created_at: new Date().toISOString(),
    });

    await db.createDocument(env.appwriteDatabaseId, "consent_records", id.unique(), {
      user_id: user.$id,
      consent_type: "account_creation",
      consent_text_version: "privacy-v1.0",
      consented_at: new Date().toISOString(),
      ip_hash: "",
      guardian_id: "",
      method: "in_session",
    });

    if (accountStatus === "active") {
      await db.createDocument(env.appwriteDatabaseId, "notifications", id.unique(), {
        user_id: user.$id,
        type: "account_active",
        title: "Account active",
        body: "Your account is now active and ready for publication submissions.",
        link: "/dashboard",
        read: false,
        created_at: new Date().toISOString(),
      });
    }

    await trackAnalyticsEvent({
      db,
      databaseId: env.appwriteDatabaseId,
      eventType: "consent_started",
      meta: { tier: payload.consent_tier },
    });

    const consentToken =
      accountStatus === "pending_parental"
        ? signToken(
            {
              user_id: user.$id,
              purpose: "parental_consent",
              expires_at: Date.now() + 24 * 60 * 60 * 1000,
            },
            env.consentTokenSecret,
          )
        : undefined;

    return res.json({ user_id: user.$id, status: accountStatus, consent_token: consentToken });
  } catch (caught) {
    const formatted = toErrorResponse(caught);
    error(`[register] ${formatted.message}`);
    return res.json({ error: formatted.message }, formatted.statusCode);
  }
}
