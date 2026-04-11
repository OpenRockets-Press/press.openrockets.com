import { z } from "zod";
import { trackAnalyticsEvent, trackPlausibleEvent } from "../../shared/analytics";
import { createAdminServices } from "../../shared/appwrite";
import { OrpError, toErrorResponse } from "../../shared/errors";
import { type FunctionContext } from "../../shared/functionTypes";
import { getHeader, parseBody } from "../../shared/request";

const schema = z.object({
  pub_id: z.string().min(1),
});

export default async function ({ req, res, error }: FunctionContext) {
  try {
    const queryPubId = req.query?.pub_id;
    const bodyPubId = parseBody<{ pub_id?: string }>(req).pub_id;
    const pubId = queryPubId || bodyPubId;

    if (!pubId) {
      throw new OrpError("pub_id is required", 422);
    }

    const payload = schema.parse({ pub_id: pubId });
    const { db, storage, query, env } = createAdminServices();

    const publications = await db.listDocuments(env.appwriteDatabaseId, "publications", [
      query.equal("pub_id", payload.pub_id),
      query.equal("status", "approved"),
      query.limit(1),
    ]);

    const publication = publications.documents[0];
    if (!publication) {
      throw new OrpError("Publication not found or not approved", 404);
    }

    const fileStorageId = String(publication.file_storage_id || "");
    if (!fileStorageId) {
      throw new OrpError("Publication file not available", 404);
    }

    const file = await storage.getFileDownload(env.pubFilesBucketId, fileStorageId);

    const nextDownloadCount = Number(publication.download_count ?? 0) + 1;
    await db.updateDocument(env.appwriteDatabaseId, "publications", publication.$id, {
      download_count: nextDownloadCount,
    });

    await trackAnalyticsEvent({
      db,
      databaseId: env.appwriteDatabaseId,
      eventType: "pub_download",
      pubId: payload.pub_id,
      meta: { type: String(publication.type) },
    });

    await trackPlausibleEvent({
      domain: env.plausibleDomain,
      apiKey: env.plausibleApiKey,
      name: "Document Downloaded",
      props: {
        pub_id: payload.pub_id,
        type: String(publication.type),
      },
      ip: getHeader(req, "x-real-ip"),
      userAgent: getHeader(req, "user-agent"),
    });

    return res.send(file, 200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${payload.pub_id}.pdf"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=86400",
      "Strict-Transport-Security": "max-age=31536000",
    });
  } catch (caught) {
    const formatted = toErrorResponse(caught);
    error(`[serve-pdf] ${formatted.message}`);
    return res.json({ error: formatted.message }, formatted.statusCode);
  }
}
