import { z } from "zod";
import { createAdminClient, getSessionUser } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { OrpError, toErrorResponse } from "../_shared/errors";
import { errorResponse, getIP, json, parseBody } from "../_shared/http";
import { trackAnalyticsEvent, trackPlausibleEvent } from "../_shared/analytics";
import { writeAuditLog } from "../_shared/writeAuditLog";
import { buildPubId, nextCounter } from "../_shared/counters";

const schema = z.object({
  publication_id: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
  rejection_reason: z.string().trim().max(1000).optional().default(""),
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
    const client = createAdminClient(context.env);
    const dbId = context.env.APPWRITE_DATABASE_ID;
    const reviewerId = String(user.$id);

    const publication = await client.db.getDocument(dbId, "publications", payload.publication_id);

    if (String(publication.status) !== "pending_review") {
      throw new OrpError("Publication is not in pending_review state.", 409);
    }

    const ip = getIP(context.request);
    const ua = context.request.headers.get("User-Agent") ?? undefined;

    if (payload.decision === "approved") {
      const year = new Date().getUTCFullYear();
      const sequence = await nextCounter(client, `pub_${year}`);
      const pubId = buildPubId(year, sequence);

      const updated = await client.db.updateDocument(dbId, "publications", payload.publication_id, {
        status: "approved",
        pub_id: pubId,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
        published_at: publication.published_at || new Date().toISOString(),
        rejection_reason: "",
      });

      await client.db.createDocument(dbId, "notifications", client.id.unique(), {
        user_id: publication.author_user_id,
        type: "publication_approved",
        title: "Publication approved",
        body: `Your publication has been approved with ID ${pubId}.`,
        link: `/p/${pubId}`,
        read: false,
        created_at: new Date().toISOString(),
      });

      await trackAnalyticsEvent({
        client,
        eventType: "approval",
        pubId,
        meta: { type: String(publication.type), license: String(publication.license) },
      });

      await trackPlausibleEvent({
        client,
        name: "Publication Approved",
        props: { type: String(publication.type), license: String(publication.license) },
        ip,
        userAgent: ua,
      });

      await writeAuditLog({
        client,
        action: "audit_pub_approved",
        actorUserId: reviewerId,
        actorDisplayName: String((user as Record<string, unknown>).name ?? ""),
        targetId: payload.publication_id,
        targetLabel: String(publication.title ?? ""),
      });

      return json({ status: updated.status, pub_id: updated.pub_id });
    }

    const updated = await client.db.updateDocument(dbId, "publications", payload.publication_id, {
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
      rejection_reason: payload.rejection_reason,
    });

    await client.db.createDocument(dbId, "notifications", client.id.unique(), {
      user_id: publication.author_user_id,
      type: "publication_rejected",
      title: "Publication requires revision",
      body:
        payload.rejection_reason ||
        "Your publication was rejected. Please review moderator guidance.",
      link: "/dashboard",
      read: false,
      created_at: new Date().toISOString(),
    });

    await trackAnalyticsEvent({
      client,
      eventType: "rejection",
      pubId: String(publication.pub_id || publication.$id),
      meta: { type: String(publication.type) },
    });

    await trackPlausibleEvent({
      client,
      name: "Publication Rejected",
      props: { type: String(publication.type) },
      ip,
      userAgent: ua,
    });

    await writeAuditLog({
      client,
      action: "audit_pub_rejected",
      actorUserId: reviewerId,
      actorDisplayName: String((user as Record<string, unknown>).name ?? ""),
      targetId: payload.publication_id,
      targetLabel: String(publication.title ?? ""),
      details: payload.rejection_reason,
    });

    return json({ status: updated.status });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
