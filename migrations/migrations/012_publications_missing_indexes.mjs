export const id = "012_publications_missing_indexes";
export const description =
  "Add indexes missing from migration 003: is_featured (home-feed filter) " +
  "and download_count (admin-dashboard top-downloads sort). " +
  "Re-ensure cases status index in case migration 004 was not applied.";

export async function up(client) {
  // home-feed: equal("is_featured", true) — not indexed in 003
  await client.ensureIndex("publications", {
    key: "publications_is_featured_idx",
    type: "key",
    attributes: ["is_featured"],
  });

  // admin-dashboard: orderDesc("download_count") — not indexed in 003
  await client.ensureIndex("publications", {
    key: "publications_download_count_idx",
    type: "key",
    attributes: ["download_count"],
    orders: ["DESC"],
  });

  // re-ensure in case 004 was not applied
  await client.ensureIndex("cases", {
    key: "cases_status_idx",
    type: "key",
    attributes: ["status"],
  });
}
