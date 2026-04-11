export const id = "009_create_rate_limits";
export const description = "Create rate_limits collection for per-IP request throttling on public functions";

export async function up(client) {
  await client.ensureCollection({ id: "rate_limits", name: "Rate Limits" });

  await client.ensureAttribute("rate_limits", { type: "string",   payload: { key: "ip_hash",      size: 64,  required: true  } });
  await client.ensureAttribute("rate_limits", { type: "string",   payload: { key: "function_id",  size: 64,  required: true  } });
  await client.ensureAttribute("rate_limits", { type: "integer",  payload: { key: "count",                   required: true, min: 0, max: 10000 } });
  await client.ensureAttribute("rate_limits", { type: "datetime", payload: { key: "window_start",             required: true  } });

  await client.ensureIndex("rate_limits", {
    key: "rate_limits_ip_fn_window",
    type: "key",
    attributes: ["ip_hash", "function_id", "window_start"],
  });
  await client.ensureIndex("rate_limits", {
    key: "rate_limits_window_start",
    type: "key",
    attributes: ["window_start"],
    orders: ["ASC"],
  });
}
