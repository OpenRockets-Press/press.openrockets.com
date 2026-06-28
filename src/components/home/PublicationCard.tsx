import { memo } from "react";
import { Link } from "@tanstack/react-router";
import type { PublicationCardDTO } from "@shared/types";

interface PublicationCardProps {
  item: PublicationCardDTO;
}

function labelForType(type: PublicationCardDTO["type"]): string {
  switch (type) {
    case "research_paper":
      return "Research Paper";
    case "magazine":
      return "Magazine";
    case "poster":
      return "Poster";
    case "book":
      return "Literary";
    default:
      return "Documentation";
  }
}

function PublicationCardComponent({ item }: PublicationCardProps) {
  const meta = item.license ? `Open Access • ${item.license.replace("_", " ")}` : labelForType(item.type);

  const inner = (
    <>
      <div className="placeholder-cover">
        {item.coverUrl ? (
          <img src={item.coverUrl} alt={`Cover of ${item.title}`} className="cover-img" />
        ) : (
          <span className="cover-placeholder-text">{item.isPlaceholder ? "Coming soon" : labelForType(item.type)}</span>
        )}
      </div>
      <h3 className="card-title" title={item.title}>
        {item.title}
      </h3>
      <p className="card-author notranslate">{item.authorDisplayName}</p>
      <div className="card-meta">{meta}</div>
    </>
  );

  if (item.pubId) {
    return (
      <Link to="/p/$pubId" params={{ pubId: item.pubId }} className="book-card" data-testid="publication-card">
        {inner}
      </Link>
    );
  }

  return (
    <article className="book-card" data-testid="publication-card">
      {inner}
    </article>
  );
}

export const PublicationCard = memo(PublicationCardComponent);
