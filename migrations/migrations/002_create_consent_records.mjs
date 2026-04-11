export const id = "002_create_consent_records";
export const description = "Create consent_records collection";

export async function up(client) {
  await client.ensureCollection({ id: "consent_records", name: "Consent Records" });

  await client.ensureAttribute("consent_records", { type: "string", payload: { key: "user_id", size: 64, required: true } });
  await client.ensureAttribute("consent_records", { type: "string", payload: { key: "consent_type", size: 40, required: true } });
  await client.ensureAttribute("consent_records", { type: "string", payload: { key: "consent_text_version", size: 50, required: true } });
  await client.ensureAttribute("consent_records", { type: "datetime", payload: { key: "consented_at", required: true } });
  await client.ensureAttribute("consent_records", { type: "string", payload: { key: "ip_hash", size: 64, required: false } });
  await client.ensureAttribute("consent_records", { type: "string", payload: { key: "guardian_id", size: 64, required: false } });
  await client.ensureAttribute("consent_records", { type: "string", payload: { key: "method", size: 30, required: true } });

  await client.ensureIndex("consent_records", { key: "consent_user_idx", type: "key", attributes: ["user_id"] });
  await client.ensureIndex("consent_records", { key: "consent_at_idx", type: "key", attributes: ["consented_at"], orders: ["ASC"] });
}
