export const id = "003_create_publications";
export const description = "Create publications collection";

export async function up(client) {
  await client.ensureCollection({ id: "publications", name: "Publications" });

  await client.ensureAttribute("publications", { type: "string", payload: { key: "pub_id", size: 40, required: false } });
  await client.ensureAttribute("publications", { type: "string", payload: { key: "author_user_id", size: 64, required: true } });
  await client.ensureAttribute("publications", { type: "string", payload: { key: "author_display_name", size: 120, required: true } });
  await client.ensureAttribute("publications", { type: "string", payload: { key: "title", size: 200, required: true } });
  await client.ensureAttribute("publications", { type: "string", payload: { key: "abstract", size: 1000, required: false } });
  await client.ensureAttribute("publications", { type: "string", payload: { key: "type", size: 30, required: true } });
  await client.ensureAttribute("publications", { type: "string", payload: { key: "status", size: 30, required: true } });
  await client.ensureAttribute("publications", { type: "string", payload: { key: "license", size: 20, required: true } });
  await client.ensureAttribute("publications", { type: "string", payload: { key: "file_storage_id", size: 64, required: true } });
  await client.ensureAttribute("publications", { type: "string", payload: { key: "cover_storage_id", size: 64, required: false } });
  await client.ensureAttribute("publications", { type: "datetime", payload: { key: "submitted_at", required: true } });
  await client.ensureAttribute("publications", { type: "datetime", payload: { key: "reviewed_at", required: false } });
  await client.ensureAttribute("publications", { type: "datetime", payload: { key: "published_at", required: false } });
  await client.ensureAttribute("publications", { type: "string", payload: { key: "reviewed_by", size: 64, required: false } });
  await client.ensureAttribute("publications", { type: "string", payload: { key: "rejection_reason", size: 1000, required: false } });
  await client.ensureAttribute("publications", { type: "string", payload: { key: "case_id", size: 64, required: false } });
  await client.ensureAttribute("publications", { type: "boolean", payload: { key: "is_featured", required: false, default: false } });
  await client.ensureAttribute("publications", { type: "integer", payload: { key: "featured_rank", required: false, min: 0, max: 9999 } });
  await client.ensureAttribute("publications", { type: "string", payload: { key: "tags", size: 30, required: false, array: true } });
  await client.ensureAttribute("publications", { type: "integer", payload: { key: "view_count", required: false, min: 0, max: 999999999, default: 0 } });
  await client.ensureAttribute("publications", { type: "integer", payload: { key: "download_count", required: false, min: 0, max: 999999999, default: 0 } });

  await client.ensureIndex("publications", { key: "publications_pub_id_unique", type: "unique", attributes: ["pub_id"] });
  await client.ensureIndex("publications", { key: "publications_status_idx", type: "key", attributes: ["status"] });
  await client.ensureIndex("publications", { key: "publications_author_idx", type: "key", attributes: ["author_user_id"] });
  await client.ensureIndex("publications", { key: "publications_submitted_idx", type: "key", attributes: ["submitted_at"], orders: ["DESC"] });
  await client.ensureIndex("publications", { key: "publications_published_idx", type: "key", attributes: ["published_at"], orders: ["DESC"] });
  await client.ensureIndex("publications", { key: "publications_featured_rank_idx", type: "key", attributes: ["featured_rank"], orders: ["ASC"] });
}
