export const id = "008_create_notifications";
export const description = "Create notifications collection";

export async function up(client) {
  await client.ensureCollection({ id: "notifications", name: "Notifications" });

  await client.ensureAttribute("notifications", { type: "string", payload: { key: "user_id", size: 64, required: true } });
  await client.ensureAttribute("notifications", { type: "string", payload: { key: "type", size: 40, required: true } });
  await client.ensureAttribute("notifications", { type: "string", payload: { key: "title", size: 200, required: true } });
  await client.ensureAttribute("notifications", { type: "string", payload: { key: "body", size: 1000, required: true } });
  await client.ensureAttribute("notifications", { type: "string", payload: { key: "link", size: 200, required: true } });
  await client.ensureAttribute("notifications", { type: "boolean", payload: { key: "read", required: false, default: false } });
  await client.ensureAttribute("notifications", { type: "datetime", payload: { key: "created_at", required: true } });

  await client.ensureIndex("notifications", { key: "notifications_user_idx", type: "key", attributes: ["user_id"] });
  await client.ensureIndex("notifications", { key: "notifications_created_at_idx", type: "key", attributes: ["created_at"], orders: ["DESC"] });
}
