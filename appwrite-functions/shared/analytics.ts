import type { Databases } from "node-appwrite";

interface TrackAnalyticsParams {
  db: Databases;
  databaseId: string;
  eventType:
    | "pub_view"
    | "pub_download"
    | "submission"
    | "approval"
    | "rejection"
    | "case_opened"
    | "consent_started"
    | "consent_completed"
    | "consent_expired";
  pubId?: string;
  countryCode?: string;
  deviceType?: "desktop" | "mobile" | "tablet";
  sessionId?: string;
  meta?: Record<string, unknown>;
}

export async function trackAnalyticsEvent(params: TrackAnalyticsParams): Promise<void> {
  try {
    await params.db.createDocument(params.databaseId, "analytics_events", "unique()", {
      event_type: params.eventType,
      pub_id: params.pubId ?? "",
      country_code: params.countryCode ?? "",
      device_type: params.deviceType ?? "desktop",
      occurred_at: new Date().toISOString(),
      session_id: params.sessionId ?? crypto.randomUUID(),
      meta: JSON.stringify(params.meta ?? {}),
    });
  } catch {
    // Analytics failures should never break primary workflows.
  }
}

interface PlausibleEventParams {
  name: string;
  domain?: string;
  apiKey?: string;
  props?: Record<string, string>;
  ip?: string;
  userAgent?: string;
}

export async function trackPlausibleEvent(params: PlausibleEventParams): Promise<void> {
  if (!params.domain || !params.apiKey) {
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_000);

  try {
    await fetch("https://plausible.io/api/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${params.apiKey}`,
        "User-Agent": params.userAgent ?? "OpenRocketsPress/Function",
        "X-Forwarded-For": params.ip ?? "",
      },
      body: JSON.stringify({
        domain: params.domain,
        name: params.name,
        url: "https://press.openrockets.com",
        props: params.props ?? {},
      }),
      signal: controller.signal,
    });
  } catch {
    // Network telemetry issues are non-critical.
  } finally {
    clearTimeout(timeout);
  }
}
