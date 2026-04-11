import { memo } from "react";
import { Link } from "@tanstack/react-router";
import type { PublicationCardDTO } from "@shared/types";
import { PublicationCard } from "@/components/home/PublicationCard";

interface HomeShelfProps {
  testId: string;
  title: string;
  items: PublicationCardDTO[];
  seeMoreHref?: string;
  onSeeMore?: () => void;
}

function HomeShelfComponent({ testId, title, items, seeMoreHref, onSeeMore }: HomeShelfProps) {
  return (
    <section data-testid={testId}>
      <div className="shelf-head">
        <h2>{title}</h2>
        {onSeeMore ? (
          <button type="button" className="see-more-link" onClick={onSeeMore}>
            See more &gt;
          </button>
        ) : seeMoreHref ? (
          <Link to={seeMoreHref} className="see-more-link">
            See more &gt;
          </Link>
        ) : null}
      </div>
      <div className="shelf-grid">
        {items.map((item) => (
          <PublicationCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export const HomeShelf = memo(HomeShelfComponent);
