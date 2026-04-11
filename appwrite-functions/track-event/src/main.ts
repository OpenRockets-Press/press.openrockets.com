import { z } from "zod";
import { trackAnalyticsEvent, trackPlausibleEvent } from "../../shared/analytics";
import { createAdminServices } from "../../shared/appwrite";
import { toErrorResponse } from "../../shared/errors";
import { type FunctionContext } from "../../shared/functionTypes";
import { getHeader, parseBody } from "../../shared/request";

const schema = z.object({
  event_type: z.enum([
    "pub_view",
    "pub_download",
    "submission",
    "approval",
    "rejection",
    "case_opened",
    "consent_started",
    "consent_completed",
    "consent_expired",
  ]),
  pub_id: z.string().optional(),
  country_code: z.string().optional(),
  device_type: z.enum(["desktop", "mobile", "tablet"]).optional(),
  session_id: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

const plausibleNames: Record<string, string> = {
  pub_view: "Document Viewed",
  pub_download: "Document Downloaded",
  submission: "Publication Submitted",
  approval: "Publication Approved",
  rejection: "Publication Rejected",
  case_opened: "Case Opened",
  consent_started: "Consent Started",
  consent_completed: "Consent Completed",
  consent_expired: "Consent Expired",
};

export default async function ({ req, res, error }: FunctionContext) {
  try {
    const payload = schema.parse(parseBody<unknown>(req));
    const { db, env } = createAdminServices();

    await trackAnalyticsEvent({
      db,
      databaseId: env.appwriteDatabaseId,
      eventType: payload.event_type,
      pubId: payload.pub_id,
      countryCode: payload.country_code,
      deviceType: payload.device_type,
      sessionId: payload.session_id,
      meta: payload.meta,
    });

    await trackPlausibleEvent({
      domain: env.plausibleDomain,
      apiKey: env.plausibleApiKey,
      name: plausibleNames[payload.event_type],
      props: payload.meta
        ? Object.fromEntries(Object.entries(payload.meta).map(([key, value]) => [key, String(value)]))
        : undefined,
      ip: getHeader(req, "x-real-ip"),
      userAgent: getHeader(req, "user-agent"),
    });

    return res.json({ success: true });
  } catch (caught) {
    const formatted = toErrorResponse(caught);
    error(`[track-event] ${formatted.message}`);
    return res.json({ error: formatted.message }, formatted.statusCode);
  }
}
