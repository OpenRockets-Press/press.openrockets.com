import { useState } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeInfoModalContent, type HomeInfoModalKind } from "@/components/home/HomeInfoModal";
import { Modal } from "@/components/ui/Modal";

export function RootLayout() {
  const pathname = useRouterState({
    select: (state: { location: { pathname: string } }) => state.location.pathname,
  });
  const [search, setSearch] = useState("");
  const [infoModal, setInfoModal] = useState<HomeInfoModalKind | null>(null);

  const appShellRoots = ["/dashboard", "/cases", "/moderation", "/admin"];
  const showGlobalChrome = pathname !== "/"
    && !appShellRoots.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

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

  if (!showGlobalChrome) {
    return <Outlet />;
  }

  return (
    <>
      <HomeHeader search={search} onSearchChange={setSearch} onOpenInfo={setInfoModal} />
      <Outlet />
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
