import { z } from "zod";
import { createAdminServices } from "../../shared/appwrite";
import { signToken } from "../../shared/crypto";
import { toErrorResponse } from "../../shared/errors";
import { type FunctionContext } from "../../shared/functionTypes";
import { parseBody } from "../../shared/request";

const schema = z.object({
  file_id: z.string().min(1),
});

export default async function ({ req, res, error }: FunctionContext) {
  try {
    const payload = schema.parse(parseBody<unknown>(req));
    const { env } = createAdminServices();

    const expireAt = Date.now() + 10 * 60 * 1000;
    const token = signToken(
      {
        file_id: payload.file_id,
        bucket_id: env.caseAttachmentsBucketId,
        expires_at: expireAt,
      },
      env.consentTokenSecret,
    );

    return res.json({ token, expires_at: expireAt });
  } catch (caught) {
    const formatted = toErrorResponse(caught);
    error(`[get-case-upload-token] ${formatted.message}`);
    return res.json({ error: formatted.message }, formatted.statusCode);
  }
}
