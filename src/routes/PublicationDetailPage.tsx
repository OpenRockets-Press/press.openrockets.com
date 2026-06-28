import { useState } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPublicationByPubId, downloadPublication, toUserFacingError } from "@/lib/api";

const LICENSE_LABELS: Record<string, string> = {
  CC_BY: "CC BY",
  CC0: "CC0",
  ORP_ND: "ORP ND",
};

const TYPE_LABELS: Record<string, string> = {
  book: "Book",
  research_paper: "Research Paper",
  magazine: "Magazine",
  poster: "Poster",
  other: "Other",
};

export function PublicationDetailPage() {
  const { pubId } = useParams({ strict: false }) as { pubId?: string };
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { data: publication, isLoading, error } = useQuery({
    queryKey: ["publication", "detail", pubId],
    queryFn: () => getPublicationByPubId(pubId!),
    enabled: Boolean(pubId),
    staleTime: 1000 * 60 * 5,
  });

  async function handleDownload() {
    if (!pubId) return;
    setDownloadError(null);
    setDownloading(true);
    try {
      await downloadPublication(pubId);
    } catch (err) {
      setDownloadError(toUserFacingError(err));
    } finally {
      setDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <main className="page-wrap">
        <section className="panel">
          <p className="muted">Loading publication…</p>
        </section>
      </main>
    );
  }

  if (error || !publication) {
    return (
      <main className="page-wrap">
        <section className="panel">
          <h1>Publication not found</h1>
          <p className="muted">
            {error ? toUserFacingError(error) : "This publication does not exist or has not been approved yet."}
          </p>
          <div className="button-row">
            <Link to="/" className="solid-button">
              Back to home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-wrap">
      <section className="panel">
        <p className="eyebrow">{publication.pubId}</p>

        <h1>{publication.title}</h1>

        <div className="meta-row">
          <span className="badge badge-type">{TYPE_LABELS[publication.type] ?? publication.type}</span>
          <span className="badge badge-license">{LICENSE_LABELS[publication.license] ?? publication.license}</span>
        </div>

        <p className="meta-author">
          By <strong className="notranslate">{publication.authorDisplayName}</strong>
        </p>

        {publication.abstract ? (
          <p className="body-text">{publication.abstract}</p>
        ) : null}

        {publication.tags.length > 0 ? (
          <div className="tag-list" aria-label="Tags">
            {publication.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="pub-stats">
          <span>{publication.viewCount.toLocaleString()} views</span>
          <span>{publication.downloadCount.toLocaleString()} downloads</span>
          {publication.publishedAt ? (
            <span>
              Published{" "}
              {new Date(publication.publishedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          ) : null}
        </div>

        {downloadError ? <p className="error-text">{downloadError}</p> : null}

        <div className="button-row">
          <button
            type="button"
            className="solid-button"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? "Preparing download…" : `Download ${publication.pubId}.pdf`}
          </button>
          <Link to="/" className="ghost-button">
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
