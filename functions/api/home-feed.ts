import { createAdminClient } from "../_shared/appwrite";
import type { Env } from "../_shared/env";
import { toErrorResponse } from "../_shared/errors";
import { errorResponse, json } from "../_shared/http";

interface PublicationCard {
  id: string;
  pubId?: string;
  title: string;
  authorDisplayName: string;
  type: "book" | "research_paper" | "magazine" | "poster" | "other";
  license?: "CC_BY" | "CC0" | "ORP_ND";
  coverUrl?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const type = url.searchParams.get("type") ?? "all";

    const client = createAdminClient(context.env);
    const dbId = context.env.APPWRITE_DATABASE_ID;

    const validTypes = ["book", "research_paper", "magazine", "poster", "other"];
    const base = [client.query.equal("status", "approved")];
    if (type !== "all" && validTypes.includes(type)) {
      base.push(client.query.equal("type", type));
    }

    // Fetch approved publications then sort/filter in JS to avoid compound-index
    // requirements on is_featured and featured_rank that may not exist yet.
    const [newReleaseDocs, featuredDocs] = await Promise.all([
      client.db.listDocuments(dbId, "publications", [
        ...base,
        client.query.limit(50),
      ]),
      client.db.listDocuments(dbId, "publications", [
        ...base,
        client.query.equal("is_featured", true),
        client.query.limit(50),
      ]),
    ]);

    const toCard = (doc: Record<string, unknown>): PublicationCard => ({
      id: String(doc.$id),
      pubId: typeof doc.pub_id === "string" && doc.pub_id ? doc.pub_id : undefined,
      title: String(doc.title ?? "Untitled"),
      authorDisplayName: String(doc.author_display_name ?? "Open Rockets Contributor"),
      type: (doc.type as PublicationCard["type"]) ?? "other",
      license: (doc.license as PublicationCard["license"]) ?? undefined,
      coverUrl:
        typeof doc.cover_storage_id === "string" && doc.cover_storage_id
          ? `${context.env.APPWRITE_ENDPOINT}/storage/buckets/${context.env.APPWRITE_BUCKET_PUB_COVERS}/files/${doc.cover_storage_id}/view?project=${context.env.APPWRITE_PROJECT_ID}`
          : undefined,
    });

    const filterBySearch = (cards: PublicationCard[]) => {
      if (!q) return cards;
      return cards.filter(
        (card) =>
          card.title.toLowerCase().includes(q) ||
          card.authorDisplayName.toLowerCase().includes(q) ||
          card.type.toLowerCase().includes(q),
      );
    };

    const newReleases = (newReleaseDocs as { documents: Record<string, unknown>[] }).documents
      .sort((a, b) => new Date(String(b.published_at ?? 0)).getTime() - new Date(String(a.published_at ?? 0)).getTime())
      .slice(0, 12)
      .map(toCard);

    const featuredContributions = (featuredDocs as { documents: Record<string, unknown>[] }).documents
      .sort((a, b) => {
        const rankDiff = Number(a.featured_rank ?? 9999) - Number(b.featured_rank ?? 9999);
        if (rankDiff !== 0) return rankDiff;
        return new Date(String(b.published_at ?? 0)).getTime() - new Date(String(a.published_at ?? 0)).getTime();
      })
      .slice(0, 12)
      .map(toCard);

    return json({
      newReleases: filterBySearch(newReleases),
      featuredContributions: filterBySearch(featuredContributions),
      availableTypes: validTypes,
    });
  } catch (err) {
    const { statusCode, message } = toErrorResponse(err);
    return errorResponse(message, statusCode);
  }
};
