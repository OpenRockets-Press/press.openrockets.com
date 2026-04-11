export const id = "005_create_case_messages";
export const description = "Create case_messages collection";

export async function up(client) {
  await client.ensureCollection({ id: "case_messages", name: "Case Messages" });

  await client.ensureAttribute("case_messages", { type: "string", payload: { key: "case_id", size: 64, required: true } });
  await client.ensureAttribute("case_messages", { type: "string", payload: { key: "sender_user_id", size: 64, required: true } });
  await client.ensureAttribute("case_messages", { type: "string", payload: { key: "sender_role", size: 20, required: true } });
  await client.ensureAttribute("case_messages", { type: "string", payload: { key: "body", size: 4000, required: true } });
  await client.ensureAttribute("case_messages", { type: "string", payload: { key: "attachment_storage_id", size: 64, required: false } });
  await client.ensureAttribute("case_messages", { type: "datetime", payload: { key: "sent_at", required: true } });
  await client.ensureAttribute("case_messages", { type: "string", payload: { key: "read_by", size: 64, required: false, array: true } });

  await client.ensureIndex("case_messages", { key: "case_messages_case_idx", type: "key", attributes: ["case_id"] });
  await client.ensureIndex("case_messages", { key: "case_messages_sent_idx", type: "key", attributes: ["sent_at"], orders: ["ASC"] });
}
