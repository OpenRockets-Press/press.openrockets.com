export const id = "011_fix_query_indexes";
export const description =
  "Fix general_query_invalid (422) errors across all API endpoints. " +
  "Covers: (1) $createdAt index on users required for orderDesc without a filter; " +
  "(2) compound [event_type, occurred_at] on analytics_events for get-audit-log filter+sort; " +
  "(3) $createdAt indexes on publications and cases so future queries have them available.";

export async function up(client) {
  // ── users ─────────────────────────────────────────────────────────────────
  // list-users queries: orderDesc("$createdAt") + limit(200)
  // $createdAt is a system attribute but Appwrite still requires an explicit
  // index to accept it in orderDesc/orderAsc (general_query_invalid otherwise).
  await client.ensureIndex("users", {
    key: "users_sys_created_at_idx",
    type: "key",
    attributes: ["$createdAt"],
    orders: ["DESC"],
  });

  // ── analytics_events ──────────────────────────────────────────────────────
  // get-audit-log queries: equal("event_type", [...]) + orderDesc("occurred_at")
  // Appwrite requires a compound index when filtering and sorting on different
  // attributes in the same query; separate single-attribute indexes are not enough.
  await client.ensureIndex("analytics_events", {
    key: "analytics_type_occurred_idx",
    type: "key",
    attributes: ["event_type", "occurred_at"],
    orders: ["ASC", "DESC"],
  });

  // admin-dashboard queries: equal("event_type", [...]) + limit(500)
  // Re-ensure the single-attribute index in case it was not created by 006.
  await client.ensureIndex("analytics_events", {
    key: "analytics_event_type_idx",
    type: "key",
    attributes: ["event_type"],
  });

  // ── publications ──────────────────────────────────────────────────────────
  // Re-ensure $createdAt index for any future queries that might use it.
  await client.ensureIndex("publications", {
    key: "publications_sys_created_at_idx",
    type: "key",
    attributes: ["$createdAt"],
    orders: ["DESC"],
  });

  // ── cases ─────────────────────────────────────────────────────────────────
  await client.ensureIndex("cases", {
    key: "cases_sys_created_at_idx",
    type: "key",
    attributes: ["$createdAt"],
    orders: ["DESC"],
  });
}
