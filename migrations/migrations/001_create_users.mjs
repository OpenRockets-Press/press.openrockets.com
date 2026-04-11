export const id = "001_create_users";
export const description = "Create users collection";

export async function up(client) {
  await client.ensureCollection({ id: "users", name: "Users" });

  await client.ensureAttribute("users", { type: "string", payload: { key: "user_id", size: 64, required: true } });
  await client.ensureAttribute("users", { type: "string", payload: { key: "display_name", size: 100, required: true } });
  await client.ensureAttribute("users", { type: "string", payload: { key: "role", size: 20, required: true } });
  await client.ensureAttribute("users", { type: "string", payload: { key: "consent_tier", size: 20, required: true } });
  await client.ensureAttribute("users", { type: "string", payload: { key: "account_status", size: 30, required: true } });
  await client.ensureAttribute("users", { type: "string", payload: { key: "guardian_email_enc", size: 500, required: false } });
  await client.ensureAttribute("users", { type: "datetime", payload: { key: "guardian_consent_at", required: false } });
  await client.ensureAttribute("users", { type: "datetime", payload: { key: "deletion_requested_at", required: false } });
  await client.ensureAttribute("users", { type: "string", payload: { key: "country_code", size: 2, required: false } });
  await client.ensureAttribute("users", { type: "datetime", payload: { key: "created_at", required: true } });

  await client.ensureIndex("users", { key: "users_user_id_unique", type: "unique", attributes: ["user_id"] });
  await client.ensureIndex("users", { key: "users_account_status", type: "key", attributes: ["account_status"] });
  await client.ensureIndex("users", { key: "users_consent_tier", type: "key", attributes: ["consent_tier"] });
}
