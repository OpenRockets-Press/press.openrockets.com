export const id = "007_create_counters";
export const description = "Create counters collection";

export async function up(client) {
  await client.ensureCollection({ id: "counters", name: "Counters" });

  await client.ensureAttribute("counters", { type: "integer", payload: { key: "value", required: false, min: 0, max: 2147483647, default: 0 } });
  await client.ensureIndex("counters", { key: "counters_value_idx", type: "key", attributes: ["value"] });
}
