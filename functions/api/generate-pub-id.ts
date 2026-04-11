import { z } from "zod";
import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json, parseBody } from "../_shared/http";
import { buildPubId, nextCounter } from "../_shared/counters";

const schema = z.object({
  year: z.number().int().min(2020).max(2100).optional(),
});

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await getSessionUser(context.request, context.env);
    if (!user) throw new OrpError("Unauthorized", 401);

    const labels = Array.isArray((user as { labels?: unknown }).labels)
      ? ((user as { labels: string[] }).labels)
      : [];
    if (!labels.includes("moderator") && !labels.includes("admin")) {
      throw new OrpError("Forbidden", 403);
    }

    const body = await parseBody(context.request);
    const payload = schema.parse(body);
    const year = payload.year ?? new Date().getUTCFullYear();

    const client = createAdminClient(context.env);
    const sequence = await nextCounter(client, `pub_${year}`);

    return json({ pub_id: buildPubId(year, sequence), year, sequence });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
