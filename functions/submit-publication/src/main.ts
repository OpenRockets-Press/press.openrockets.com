import { z } from "zod";
import { trackAnalyticsEvent, trackPlausibleEvent } from "../../shared/analytics";
import { createAdminServices } from "../../shared/appwrite";
import { OrpError, toErrorResponse } from "../../shared/errors";
import { type FunctionContext } from "../../shared/functionTypes";
import { getHeader, parseBody } from "../../shared/request";

const schema = z.object({
  title: z.string().trim().min(3).max(200),
  abstract: z.string().trim().max(1000).optional().default(""),
  type: z.enum(["book", "research_paper", "magazine", "poster", "other"]),
  license: z.enum(["CC_BY", "CC0", "ORP_ND"]),
  file_storage_id: z.string().min(1),
  cover_storage_id: z.string().optional().default(""),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).optional().default([]),
});

export default async function ({ req, res, error }: FunctionContext) {
  try {
    const payload = schema.parse(parseBody<unknown>(req));
    const { db, id, env } = createAdminServices();

    const userId = getHeader(req, "x-appwrite-user-id");
    if (!userId) {
      throw new OrpError("Unauthorized", 401);
    }

    const author = await db.getDocument(env.appwriteDatabaseId, "users", userId);

    const publication = await db.createDocument(env.appwriteDatabaseId, "publications", id.unique(), {
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

    await trackAnalyticsEvent({
      db,
      databaseId: env.appwriteDatabaseId,
      eventType: "submission",
      pubId: String(publication.$id),
      meta: { type: payload.type, license: payload.license },
    });

    await trackPlausibleEvent({
      domain: env.plausibleDomain,
      apiKey: env.plausibleApiKey,
      name: "Publication Submitted",
      props: { type: payload.type, license: payload.license },
      ip: getHeader(req, "x-real-ip"),
      userAgent: getHeader(req, "user-agent"),
    });

    return res.json({ publication_id: publication.$id, status: publication.status });
  } catch (caught) {
    const formatted = toErrorResponse(caught);
    error(`[submit-publication] ${formatted.message}`);
    return res.json({ error: formatted.message }, formatted.statusCode);
  }
}
