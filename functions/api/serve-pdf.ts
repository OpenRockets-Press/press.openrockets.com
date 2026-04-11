import { createAdminClient } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, getIP } from "../_shared/http";
import { trackAnalyticsEvent, trackPlausibleEvent } from "../_shared/analytics";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const pubId = url.searchParams.get("pub_id");

    if (!pubId) throw new OrpError("pub_id is required", 422);

    const client = createAdminClient(context.env);
    const dbId = context.env.APPWRITE_DATABASE_ID;

    const publications = await client.db.listDocuments(dbId, "publications", [
      client.query.equal("pub_id", pubId),
      client.query.equal("status", "approved"),
      client.query.limit(1),
    ]);

    const pub = (publications as { documents: Record<string, unknown>[] }).documents[0];
    if (!pub) throw new OrpError("Publication not found or not approved", 404);

    const fileStorageId = String(pub.file_storage_id ?? "");
    if (!fileStorageId) throw new OrpError("Publication file not available", 404);

    const fileResponse = await client.storage.getFileDownload(
      context.env.APPWRITE_BUCKET_PUB_FILES,
      fileStorageId,
    );

    if (!fileResponse.ok) throw new OrpError("Failed to retrieve publication file", 502);

    const nextDownloadCount = Number(pub.download_count ?? 0) + 1;
    await client.db.updateDocument(dbId, "publications", String(pub.$id), {
      download_count: nextDownloadCount,
    });

    const ip = getIP(context.request);
    const ua = context.request.headers.get("User-Agent") ?? undefined;

    await trackAnalyticsEvent({
      client,
      eventType: "pub_download",
      pubId,
      meta: { type: String(pub.type) },
    });

    await trackPlausibleEvent({
      client,
      name: "Document Downloaded",
      props: { pub_id: pubId, type: String(pub.type) },
      ip,
      userAgent: ua,
    });

    return new Response(fileResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pubId}.pdf"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=86400",
        "Strict-Transport-Security": "max-age=31536000",
      },
    });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
