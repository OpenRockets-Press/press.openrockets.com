import { z } from "zod";
import { createAdminServices } from "../../shared/appwrite";
import { buildPubId, nextCounter } from "../../shared/counters";
import { toErrorResponse } from "../../shared/errors";
import { type FunctionContext } from "../../shared/functionTypes";
import { parseBody } from "../../shared/request";

const schema = z.object({
  year: z.number().int().min(2020).max(2100).optional(),
});

export default async function ({ req, res, error }: FunctionContext) {
  try {
    const payload = schema.parse(parseBody<unknown>(req));
    const year = payload.year ?? new Date().getUTCFullYear();

    const { db, env } = createAdminServices();
    const sequence = await nextCounter(db, env.appwriteDatabaseId, `pub_${year}`);

    return res.json({ pub_id: buildPubId(year, sequence), year, sequence });
  } catch (caught) {
    const formatted = toErrorResponse(caught);
    error(`[generate-pub-id] ${formatted.message}`);
    return res.json({ error: formatted.message }, formatted.statusCode);
  }
}
