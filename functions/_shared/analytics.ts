import type { AdminClient } from "./appwrite";

type EventType =
  | "pub_view"
  | "pub_download"
  | "submission"
  | "approval"
  | "rejection"
  | "case_opened"
  | "consent_started"
  | "consent_completed"
  | "consent_expired"
  // Audit trail — actor info stored in meta JSON
  | "audit_pub_approved"
  | "audit_pub_rejected"
  | "audit_pub_retracted"
  | "audit_user_suspended"
  | "audit_user_activated"
  | "audit_user_promoted"
  | "audit_user_demoted"
  | "audit_case_opened"
  | "audit_case_resolved";

interface TrackParams {
  client: AdminClient;
  eventType: EventType;
  pubId?: string;
  countryCode?: string;
  deviceType?: "desktop" | "mobile" | "tablet";
  sessionId?: string;
  meta?: Record<string, unknown>;
}

export async function trackAnalyticsEvent(params: TrackParams): Promise<void> {
  try {
    await params.client.db.createDocument(
      params.client.env.APPWRITE_DATABASE_ID,
      "analytics_events",
      params.client.id.unique(),
      {
        event_type: params.eventType,
        pub_id: params.pubId ?? "",
        country_code: params.countryCode ?? "",
        device_type: params.deviceType ?? "desktop",
        occurred_at: new Date().toISOString(),
        session_id: params.sessionId ?? crypto.randomUUID(),
        meta: JSON.stringify(params.meta ?? {}),
      },
    );
  } catch {
    // Analytics failures must never break primary workflows.
  }
}

interface PlausibleParams {
  client: AdminClient;
  name: string;
  props?: Record<string, string>;
  ip?: string;
  userAgent?: string;
}

export async function trackPlausibleEvent(params: PlausibleParams): Promise<void> {
  const domain = params.client.env.PLAUSIBLE_DOMAIN;
  const apiKey = params.client.env.PLAUSIBLE_API_KEY;

  if (!domain || !apiKey) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_000);

  try {
    await fetch("https://plausible.io/api/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": params.userAgent ?? "OpenRocketsPress/CF",
        "X-Forwarded-For": params.ip ?? "",
      },
      body: JSON.stringify({
        domain,
        name: params.name,
        url: "https://press.openrockets.com",
        props: params.props ?? {},
      }),
      signal: controller.signal,
    });
  } catch {
    // Non-critical telemetry.
  } finally {
    clearTimeout(timeout);
  }
}
