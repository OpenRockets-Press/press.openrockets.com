import { z } from "zod";
import { AppwriteError } from "../_shared/appwrite";
import { createAdminClient } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, getIP, json, parseBody } from "../_shared/http";
import { encryptText, signToken } from "../_shared/crypto";
import { trackAnalyticsEvent } from "../_shared/analytics";
import { enforceRateLimit } from "../_shared/rateLimit";

const REQUIRES_GUARDIAN = new Set(["coppa", "gdpr_eu"]);

const schema = z.object({
  display_name: z.string().trim().min(3).max(100),
  email: z.email(),
  password: z.string().min(10).max(128),
  consent_tier: z.enum(["coppa", "gdpr_eu", "gdpr_es", "general"]),
  guardian_email: z.email().optional(),
});

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await parseBody(context.request);
    const payload = schema.parse(body);
    const client = createAdminClient(context.env);

    await enforceRateLimit(client, "register", getIP(context.request));

    if (REQUIRES_GUARDIAN.has(payload.consent_tier) && !payload.guardian_email) {
      throw new OrpError("Guardian email required for this consent tier.", 422);
    }

    const user = await client.users.create(
      client.id.unique(),
      payload.email,
      payload.password,
      payload.display_name,
    );

    try {
      await client.users.updateLabels(String(user.$id), ["contributor"]);
    } catch (err) {
      // Some Appwrite deployments do not expose the labels endpoint.
      if (!(err instanceof AppwriteError && err.status === 404)) {
        throw err;
      }
    }

    const accountStatus = REQUIRES_GUARDIAN.has(payload.consent_tier)
      ? "pending_parental"
      : "active";

    const dbId = context.env.APPWRITE_DATABASE_ID;

    await client.db.createDocument(dbId, "users", String(user.$id), {
      user_id: user.$id,
      display_name: payload.display_name,
      role: "contributor",
      consent_tier: payload.consent_tier,
      account_status: accountStatus,
      guardian_email_enc: payload.guardian_email
        ? encryptText(payload.guardian_email, context.env.GUARDIAN_EMAIL_SECRET)
        : "",
      country_code: "",
      created_at: new Date().toISOString(),
    });

    await client.db.createDocument(dbId, "consent_records", client.id.unique(), {
      user_id: user.$id,
      consent_type: "account_creation",
      consent_text_version: "privacy-v1.0",
      consented_at: new Date().toISOString(),
      ip_hash: "",
      guardian_id: "",
      method: "in_session",
    });

    if (accountStatus === "active") {
      await client.db.createDocument(dbId, "notifications", client.id.unique(), {
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
      client,
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
            context.env.CONSENT_TOKEN_SECRET,
          )
        : undefined;

    return json({ user_id: user.$id, status: accountStatus, consent_token: consentToken });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
