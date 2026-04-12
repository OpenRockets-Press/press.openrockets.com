export const id = "010_ensure_query_indexes";
export const description =
  "Ensure all indexes required for filtered + sorted queries are present. " +
  "All ensureIndex calls are idempotent (409 = already exists is swallowed). " +
  "Also adds publications_download_count_idx which was missing from 003.";

export async function up(client) {
  // ── publications ────────────────────────────────────────────────────────────
  // Re-ensure single-attribute indexes (no-op if created by migration 003)
  await client.ensureIndex("publications", {
    key: "publications_status_idx",
    type: "key",
    attributes: ["status"],
  });
  await client.ensureIndex("publications", {
    key: "publications_submitted_idx",
    type: "key",
    attributes: ["submitted_at"],
    orders: ["DESC"],
  });
  await client.ensureIndex("publications", {
    key: "publications_author_idx",
    type: "key",
    attributes: ["author_user_id"],
  });
  await client.ensureIndex("publications", {
    key: "publications_pub_id_unique",
    type: "unique",
    attributes: ["pub_id"],
  });

  // download_count — used by admin-dashboard top-downloads query (missing from 003)
  await client.ensureIndex("publications", {
    key: "publications_download_count_idx",
    type: "key",
    attributes: ["download_count"],
    orders: ["DESC"],
  });

  // Compound indexes for filter + sort combinations used in moderation-dashboard
  // and admin-dashboard.  Appwrite requires a compound index when both an
  // equality filter AND an orderDesc appear on different attributes.
  await client.ensureIndex("publications", {
    key: "publications_status_submitted_idx",
    type: "key",
    attributes: ["status", "submitted_at"],
    orders: ["ASC", "DESC"],
  });
  await client.ensureIndex("publications", {
    key: "publications_status_downloads_idx",
    type: "key",
    attributes: ["status", "download_count"],
    orders: ["ASC", "DESC"],
  });

  // ── cases ────────────────────────────────────────────────────────────────────
  await client.ensureIndex("cases", {
    key: "cases_status_idx",
    type: "key",
    attributes: ["status"],
  });
  await client.ensureIndex("cases", {
    key: "cases_last_activity_idx",
    type: "key",
    attributes: ["last_activity_at"],
    orders: ["DESC"],
  });
  await client.ensureIndex("cases", {
    key: "cases_contributor_idx",
    type: "key",
    attributes: ["contributor_user_id"],
  });

  // Compound: equality on status + sort on last_activity_at
  await client.ensureIndex("cases", {
    key: "cases_status_activity_idx",
    type: "key",
    attributes: ["status", "last_activity_at"],
    orders: ["ASC", "DESC"],
  });

  // ── analytics_events ─────────────────────────────────────────────────────────
  await client.ensureIndex("analytics_events", {
    key: "analytics_event_type_idx",
    type: "key",
    attributes: ["event_type"],
  });
  await client.ensureIndex("analytics_events", {
    key: "analytics_occurred_at_idx",
    type: "key",
    attributes: ["occurred_at"],
    orders: ["DESC"],
  });

  // ── case_messages ────────────────────────────────────────────────────────────
  await client.ensureIndex("case_messages", {
    key: "case_messages_case_idx",
    type: "key",
    attributes: ["case_id"],
  });
  await client.ensureIndex("case_messages", {
    key: "case_messages_sent_idx",
    type: "key",
    attributes: ["sent_at"],
    orders: ["ASC"],
  });
}
