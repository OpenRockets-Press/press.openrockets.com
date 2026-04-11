import clsx from "clsx";
import type { PublicationType } from "@shared/types";
import { CATEGORIES } from "@/lib/categories";

interface HomeCategoriesRailProps {
  active: PublicationType | "all";
  onSelect: (value: PublicationType | "all") => void;
}

export function HomeCategoriesRail({ active, onSelect }: HomeCategoriesRailProps) {
  return (
    <div className="categories-rail" data-testid="home-categories-rail" role="tablist" aria-label="Publication categories">
      {CATEGORIES.map((category) => (
        <button
          key={category.value}
          type="button"
          role="tab"
          aria-selected={active === category.value}
          onClick={() => onSelect(category.value)}
          className={clsx("category-pill", active === category.value && "active")}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
