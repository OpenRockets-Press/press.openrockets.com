import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PublicationType } from "@shared/types";
import { HomeBanner } from "@/components/home/HomeBanner";
import { HomeCategoriesRail } from "@/components/home/HomeCategoriesRail";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeInfoModalContent, type HomeInfoModalKind } from "@/components/home/HomeInfoModal";
import { HomeShelf } from "@/components/home/HomeShelf";
import { Modal } from "@/components/ui/Modal";
import { getHomeFeed } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

export function HomePage() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<PublicationType | "all">("all");
  const [infoModal, setInfoModal] = useState<HomeInfoModalKind | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data } = useQuery({
    queryKey: queryKeys.home.feed({ q: debouncedSearch, type: activeType }),
    queryFn: () => getHomeFeed({ q: debouncedSearch, type: activeType }),
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });

  const modalTitleMap: Record<HomeInfoModalKind, string> = {
    about: "About Open Rockets Press",
    publish: "Publishing At Open Rockets Press",
    privacy: "Privacy Summary",
    parental: "Parental Consent Summary",
  };

  return (
    <div className="home-page">
      <HomeHeader search={search} onSearchChange={setSearch} onOpenInfo={setInfoModal} />

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

      <HomeFooter onOpenInfo={setInfoModal} />

      <Modal
        open={infoModal !== null}
        title={infoModal ? modalTitleMap[infoModal] : "Information"}
        onClose={() => setInfoModal(null)}
        width="md"
      >
        {infoModal ? <HomeInfoModalContent kind={infoModal} /> : null}
      </Modal>
    </div>
  );
}
