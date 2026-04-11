import { z } from "zod";
import { trackAnalyticsEvent, trackPlausibleEvent } from "../../shared/analytics";
import { createAdminServices } from "../../shared/appwrite";
import { buildPubId, nextCounter } from "../../shared/counters";
import { OrpError, toErrorResponse } from "../../shared/errors";
import { type FunctionContext } from "../../shared/functionTypes";
import { getHeader, parseBody } from "../../shared/request";

const schema = z.object({
  publication_id: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
  rejection_reason: z.string().trim().max(1000).optional().default(""),
});

export default async function ({ req, res, error }: FunctionContext) {
  try {
    const payload = schema.parse(parseBody<unknown>(req));
    const reviewerId = getHeader(req, "x-appwrite-user-id") ?? "moderator";

    const { db, id, env } = createAdminServices();
    const publication = await db.getDocument(env.appwriteDatabaseId, "publications", payload.publication_id);

    if (String(publication.status) !== "pending_review") {
      throw new OrpError("Publication is not in pending_review state.", 409);
    }

    if (payload.decision === "approved") {
      const year = new Date().getUTCFullYear();
      const sequence = await nextCounter(db, env.appwriteDatabaseId, `pub_${year}`);
      const pubId = buildPubId(year, sequence);

      const updated = await db.updateDocument(env.appwriteDatabaseId, "publications", payload.publication_id, {
        status: "approved",
        pub_id: pubId,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
        published_at: publication.published_at || new Date().toISOString(),
        rejection_reason: "",
      });

      await db.createDocument(env.appwriteDatabaseId, "notifications", id.unique(), {
        user_id: publication.author_user_id,
        type: "publication_approved",
        title: "Publication approved",
        body: `Your publication has been approved with ID ${pubId}.`,
        link: `/p/${pubId}`,
        read: false,
        created_at: new Date().toISOString(),
      });

      await trackAnalyticsEvent({
        db,
        databaseId: env.appwriteDatabaseId,
        eventType: "approval",
        pubId,
        meta: { type: String(publication.type), license: String(publication.license) },
      });

      await trackPlausibleEvent({
        domain: env.plausibleDomain,
        apiKey: env.plausibleApiKey,
        name: "Publication Approved",
        props: {
          type: String(publication.type),
          license: String(publication.license),
        },
        ip: getHeader(req, "x-real-ip"),
        userAgent: getHeader(req, "user-agent"),
      });

      return res.json({ status: updated.status, pub_id: updated.pub_id });
    }

    const updated = await db.updateDocument(env.appwriteDatabaseId, "publications", payload.publication_id, {
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
      rejection_reason: payload.rejection_reason,
    });

    await db.createDocument(env.appwriteDatabaseId, "notifications", id.unique(), {
      user_id: publication.author_user_id,
      type: "publication_rejected",
      title: "Publication requires revision",
      body: payload.rejection_reason || "Your publication was rejected. Please review moderator guidance.",
      link: "/dashboard",
      read: false,
      created_at: new Date().toISOString(),
    });

    await trackAnalyticsEvent({
      db,
      databaseId: env.appwriteDatabaseId,
      eventType: "rejection",
      pubId: String(publication.pub_id || publication.$id),
      meta: { type: String(publication.type) },
    });

    await trackPlausibleEvent({
      domain: env.plausibleDomain,
      apiKey: env.plausibleApiKey,
      name: "Publication Rejected",
      props: { type: String(publication.type) },
      ip: getHeader(req, "x-real-ip"),
      userAgent: getHeader(req, "user-agent"),
    });

    return res.json({ status: updated.status });
  } catch (caught) {
    const formatted = toErrorResponse(caught);
    error(`[review-publication] ${formatted.message}`);
    return res.json({ error: formatted.message }, formatted.statusCode);
  }
}
