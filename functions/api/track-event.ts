import { z } from "zod";
import { createAdminClient } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { toErrorResponse } from "../_shared/errors";
import { errorResponse, getIP, json, parseBody } from "../_shared/http";
import { trackAnalyticsEvent, trackPlausibleEvent } from "../_shared/analytics";

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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await parseBody(context.request);
    const payload = schema.parse(body);
    const client = createAdminClient(context.env);

    const ip = getIP(context.request);
    const ua = context.request.headers.get("User-Agent") ?? undefined;

    await trackAnalyticsEvent({
      client,
      eventType: payload.event_type,
      pubId: payload.pub_id,
      countryCode: payload.country_code,
      deviceType: payload.device_type,
      sessionId: payload.session_id,
      meta: payload.meta,
    });

    await trackPlausibleEvent({
      client,
      name: plausibleNames[payload.event_type] ?? payload.event_type,
      props: payload.meta
        ? Object.fromEntries(
            Object.entries(payload.meta).map(([k, v]) => [k, String(v)]),
          )
        : undefined,
      ip,
      userAgent: ua,
    });

    return json({ success: true });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
