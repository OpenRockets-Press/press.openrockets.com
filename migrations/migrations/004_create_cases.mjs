export const id = "004_create_cases";
export const description = "Create cases collection";

export async function up(client) {
  await client.ensureCollection({ id: "cases", name: "Cases" });

  await client.ensureAttribute("cases", { type: "string", payload: { key: "case_number", size: 40, required: true } });
  await client.ensureAttribute("cases", { type: "string", payload: { key: "subject", size: 200, required: true } });
  await client.ensureAttribute("cases", { type: "string", payload: { key: "status", size: 30, required: true } });
  await client.ensureAttribute("cases", { type: "string", payload: { key: "priority", size: 20, required: true } });
  await client.ensureAttribute("cases", { type: "string", payload: { key: "opened_by", size: 64, required: true } });
  await client.ensureAttribute("cases", { type: "string", payload: { key: "contributor_user_id", size: 64, required: true } });
  await client.ensureAttribute("cases", { type: "string", payload: { key: "related_pub_id", size: 64, required: false } });
  await client.ensureAttribute("cases", { type: "string", payload: { key: "labels", size: 30, required: false, array: true } });
  await client.ensureAttribute("cases", { type: "string", payload: { key: "related_case_ids", size: 64, required: false, array: true } });
  await client.ensureAttribute("cases", { type: "datetime", payload: { key: "opened_at", required: true } });
  await client.ensureAttribute("cases", { type: "datetime", payload: { key: "resolved_at", required: false } });
  await client.ensureAttribute("cases", { type: "datetime", payload: { key: "last_activity_at", required: true } });

  await client.ensureIndex("cases", { key: "cases_number_unique", type: "unique", attributes: ["case_number"] });
  await client.ensureIndex("cases", { key: "cases_contributor_idx", type: "key", attributes: ["contributor_user_id"] });
  await client.ensureIndex("cases", { key: "cases_status_idx", type: "key", attributes: ["status"] });
  await client.ensureIndex("cases", { key: "cases_last_activity_idx", type: "key", attributes: ["last_activity_at"], orders: ["DESC"] });
}
