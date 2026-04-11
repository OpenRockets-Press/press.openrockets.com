import { z } from "zod";
import { createAdminServices } from "../../shared/appwrite";
import { toErrorResponse } from "../../shared/errors";
import { type FunctionContext } from "../../shared/functionTypes";
import { parseBody } from "../../shared/request";

const schema = z.object({
  q: z.string().optional().default(""),
  type: z
    .enum(["all", "book", "research_paper", "magazine", "poster", "other"])
    .optional()
    .default("all"),
});

interface PublicationCard {
  id: string;
  pubId?: string;
  title: string;
  authorDisplayName: string;
  type: "book" | "research_paper" | "magazine" | "poster" | "other";
  license?: "CC_BY" | "CC0" | "ORP_ND";
  coverUrl?: string;
}

export default async function ({ req, res, error }: FunctionContext) {
  try {
    const payload = schema.parse(parseBody<unknown>(req));
    const { db, query, env } = createAdminServices();

    const base = [query.equal("status", "approved")];

    if (payload.type !== "all") {
      base.push(query.equal("type", payload.type));
    }

    const searchable = payload.q.trim().toLowerCase();

    const newReleaseDocs = await db.listDocuments(env.appwriteDatabaseId, "publications", [
      ...base,
      query.orderDesc("published_at"),
      query.limit(12),
    ]);

    const featuredDocs = await db.listDocuments(env.appwriteDatabaseId, "publications", [
      ...base,
      query.equal("is_featured", true),
      query.orderAsc("featured_rank"),
      query.orderDesc("published_at"),
      query.limit(12),
    ]);

    const toCard = (doc: Record<string, unknown>): PublicationCard => ({
      id: String(doc.$id),
      pubId: typeof doc.pub_id === "string" ? doc.pub_id : undefined,
      title: String(doc.title ?? "Untitled"),
      authorDisplayName: String(doc.author_display_name ?? "Open Rockets Contributor"),
      type: (doc.type as PublicationCard["type"]) ?? "other",
      license: (doc.license as PublicationCard["license"]) ?? undefined,
      coverUrl: typeof doc.cover_storage_id === "string" && doc.cover_storage_id
        ? `/v1/storage/buckets/${env.pubCoversBucketId}/files/${doc.cover_storage_id}/view`
        : undefined,
    });

    const filterBySearch = (cards: PublicationCard[]) => {
      if (!searchable) return cards;
      return cards.filter((card) => {
        return (
          card.title.toLowerCase().includes(searchable) ||
          card.authorDisplayName.toLowerCase().includes(searchable) ||
          card.type.toLowerCase().includes(searchable)
        );
      });
    };

    const newReleases = filterBySearch(
      (newReleaseDocs.documents as unknown as Record<string, unknown>[]).map(toCard),
    );

    const featuredContributions = filterBySearch(
      (featuredDocs.documents as unknown as Record<string, unknown>[]).map(toCard),
    );

    return res.json({
      newReleases,
      featuredContributions,
      availableTypes: ["book", "research_paper", "magazine", "poster", "other"],
    });
  } catch (caught) {
    const formatted = toErrorResponse(caught);
    error(`[get-home-feed] ${formatted.message}`);
    return res.json({ error: formatted.message }, formatted.statusCode);
  }
}
