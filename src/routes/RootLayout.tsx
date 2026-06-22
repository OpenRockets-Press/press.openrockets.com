import { useEffect, useState } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeInfoModalContent, type HomeInfoModalKind } from "@/components/home/HomeInfoModal";
import { MaintenanceBanner } from "@/components/maintenance/MaintenanceBanner";
import { Modal } from "@/components/ui/Modal";

export function RootLayout() {
  const pathname = useRouterState({
    select: (state: { location: { pathname: string } }) => state.location.pathname,
  });
  const [search, setSearch] = useState("");
  const [infoModal, setInfoModal] = useState<HomeInfoModalKind | null>(null);

  useEffect(() => {
    const routeTitleMap: Record<string, string> = {
      "/": "OpenRockets Press",
      "/login": "Sign In · OpenRockets Press",
      "/register": "Register · OpenRockets Press",
      "/publish": "Publish · OpenRockets Press",
      "/dashboard": "Dashboard · OpenRockets Press",
      "/cases": "Cases · OpenRockets Press",
      "/moderation": "Moderation · OpenRockets Press",
      "/admin": "Admin Panel · OpenRockets Press",
      "/about": "About · OpenRockets Press",
      "/legal/terms": "Terms of Service · OpenRockets Press",
      "/legal/privacy-policy": "Privacy Policy · OpenRockets Press",
      "/legal/parental-consent-form": "Parental Consent · OpenRockets Press",
    };

    document.title = routeTitleMap[pathname] ?? "OpenRockets Press";
  }, [pathname]);

  const modalTitleMap: Record<HomeInfoModalKind, string> = {
    about: "About Open Rockets Press",
    publish: "Publishing At Open Rockets Press",
    privacy: "Privacy Summary",
    parental: "Parental Consent Summary",
  };
  const modalTitle =
    infoModal && typeof infoModal === "string" && infoModal in modalTitleMap
      ? modalTitleMap[infoModal as keyof typeof modalTitleMap]
      : "Information";

  return (
    <>
      <HomeHeader search={search} onSearchChange={setSearch} onOpenInfo={setInfoModal} />
      <Outlet context={{ search }} />
      <HomeFooter onOpenInfo={setInfoModal} />

      <Modal
        open={infoModal !== null}
        title={modalTitle}
        onClose={() => setInfoModal(null)}
        width="md"
      >
        {infoModal ? <HomeInfoModalContent kind={infoModal} /> : null}
      </Modal>
    </>
  );
}
