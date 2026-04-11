export const id = "006_create_analytics_events";
export const description = "Create analytics_events collection";

export async function up(client) {
  await client.ensureCollection({ id: "analytics_events", name: "Analytics Events" });

  await client.ensureAttribute("analytics_events", { type: "string", payload: { key: "event_type", size: 40, required: true } });
  await client.ensureAttribute("analytics_events", { type: "string", payload: { key: "pub_id", size: 64, required: false } });
  await client.ensureAttribute("analytics_events", { type: "string", payload: { key: "country_code", size: 2, required: false } });
  await client.ensureAttribute("analytics_events", { type: "string", payload: { key: "device_type", size: 16, required: true } });
  await client.ensureAttribute("analytics_events", { type: "datetime", payload: { key: "occurred_at", required: true } });
  await client.ensureAttribute("analytics_events", { type: "string", payload: { key: "session_id", size: 64, required: true } });
  await client.ensureAttribute("analytics_events", { type: "string", payload: { key: "meta", size: 5000, required: false } });

  await client.ensureIndex("analytics_events", { key: "analytics_event_type_idx", type: "key", attributes: ["event_type"] });
  await client.ensureIndex("analytics_events", { key: "analytics_occurred_at_idx", type: "key", attributes: ["occurred_at"], orders: ["DESC"] });
}
