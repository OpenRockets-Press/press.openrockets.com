import { z } from "zod";
import { getSessionUser } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, json, parseBody } from "../_shared/http";
import { signToken } from "../_shared/crypto";

const schema = z.object({
  file_id: z.string().min(1),
});

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await getSessionUser(context.request, context.env);
    if (!user) throw new OrpError("Unauthorized", 401);

    const body = await parseBody(context.request);
    const payload = schema.parse(body);

    const expireAt = Date.now() + 10 * 60 * 1000;
    const token = signToken(
      {
        file_id: payload.file_id,
        bucket_id: context.env.APPWRITE_BUCKET_CASE_ATTACHMENTS,
        expires_at: expireAt,
      },
      context.env.CONSENT_TOKEN_SECRET,
    );

    return json({ token, expires_at: expireAt });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
