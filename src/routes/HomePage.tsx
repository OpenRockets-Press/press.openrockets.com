import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOutletContext } from "@tanstack/react-router";
import type { PublicationType } from "@shared/types";
import { HomeBanner } from "@/components/home/HomeBanner";
import { HomeCategoriesRail } from "@/components/home/HomeCategoriesRail";
import { HomeShelf } from "@/components/home/HomeShelf";
import { getHomeFeed } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

export function HomePage() {
  const { search } = useOutletContext<{ search: string }>();
  const [activeType, setActiveType] = useState<PublicationType | "all">("all");
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data } = useQuery({
    queryKey: queryKeys.home.feed({ q: debouncedSearch, type: activeType }),
    queryFn: () => getHomeFeed({ q: debouncedSearch, type: activeType }),
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });

  return (
    <div className="home-page">
      <main className="home-shell main-content">
        <HomeBanner />

        <HomeCategoriesRail active={activeType} onSelect={setActiveType} />

        <HomeShelf
          testId="home-shelf-new-releases"
          title="New Releases"
          items={data?.newReleases ?? []}
        />

        <hr className="section-divider" />

        <HomeShelf
          testId="home-shelf-featured"
          title="Featured Contributions"
          items={data?.featuredContributions ?? []}
        />
      </main>
    </div>
  );
}
