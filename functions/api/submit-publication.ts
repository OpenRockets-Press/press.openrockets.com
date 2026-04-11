import { z } from "zod";
import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, getIP, json, parseBody } from "../_shared/http";
import { trackAnalyticsEvent, trackPlausibleEvent } from "../_shared/analytics";

const schema = z.object({
  title: z.string().trim().min(3).max(200),
  abstract: z.string().trim().max(1000).optional().default(""),
  type: z.enum(["book", "research_paper", "magazine", "poster", "other"]),
  license: z.enum(["CC_BY", "CC0", "ORP_ND"]),
  file_storage_id: z.string().min(1),
  cover_storage_id: z.string().optional().default(""),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).optional().default([]),
});

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await getSessionUser(context.request, context.env);
    if (!user) throw new OrpError("Unauthorized", 401);

    const body = await parseBody(context.request);
    const payload = schema.parse(body);
    const client = createAdminClient(context.env);
    const dbId = context.env.APPWRITE_DATABASE_ID;
    const userId = String(user.$id);

    const author = await client.db.getDocument(dbId, "users", userId);

    const publication = await client.db.createDocument(dbId, "publications", client.id.unique(), {
      pub_id: "",
      author_user_id: userId,
      author_display_name: String(author.display_name ?? "Open Rockets Contributor"),
      title: payload.title,
      abstract: payload.abstract,
      type: payload.type,
      status: "pending_review",
      license: payload.license,
      file_storage_id: payload.file_storage_id,
      cover_storage_id: payload.cover_storage_id,
      submitted_at: new Date().toISOString(),
      reviewed_at: "",
      published_at: "",
      reviewed_by: "",
      rejection_reason: "",
      case_id: "",
      is_featured: false,
      featured_rank: 0,
      tags: payload.tags,
      view_count: 0,
      download_count: 0,
    });

    const ip = getIP(context.request);
    const ua = context.request.headers.get("User-Agent") ?? undefined;

    await trackAnalyticsEvent({
      client,
      eventType: "submission",
      pubId: String(publication.$id),
      meta: { type: payload.type, license: payload.license },
    });

    await trackPlausibleEvent({
      client,
      name: "Publication Submitted",
      props: { type: payload.type, license: payload.license },
      ip,
      userAgent: ua,
    });

    return json({ publication_id: publication.$id, status: publication.status });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
