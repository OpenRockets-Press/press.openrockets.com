import { useEffect, useState, createContext } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { Footer } from "@/components/layout/Footer";
import { HomeInfoModalContent, type HomeInfoModalKind } from "@/components/home/HomeInfoModal";
import { ToastProvider } from "@/lib/toast";

import { Modal } from "@/components/ui/Modal";

import { PublicNav } from "@/components/layout/PublicNav";

export const SearchContext = createContext({ search: "" });

export function RootLayout() {
  const pathname = useRouterState({
    select: (state: { location: { pathname: string } }) => state.location.pathname,
  });
  const isPending = useRouterState({
    select: (state) => state.status === "pending",
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
    };

    document.title = routeTitleMap[pathname] ?? "OpenRockets Press";
  }, [pathname]);

  const modalTitleMap: Record<HomeInfoModalKind, string> = {
    about: "About Open Rockets Press",
    publish: "Publishing At Open Rockets Press",
    privacy: "Privacy Policy",
  };
  const modalTitle =
    infoModal && typeof infoModal === "string" && infoModal in modalTitleMap
      ? modalTitleMap[infoModal as keyof typeof modalTitleMap]
      : "Information";

  return (
    <ToastProvider>
      {isPending && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', backgroundColor: '#0D8A50', zIndex: 9999, animation: 'loading-ribbon 1s infinite alternate' }} />}
      <PublicNav />
      <SearchContext.Provider value={{ search }}>
        <Outlet />
      </SearchContext.Provider>
      <Footer />

      <Modal
        open={infoModal !== null}
        title={modalTitle}
        onClose={() => setInfoModal(null)}
        width="md"
      >
        {infoModal ? <HomeInfoModalContent kind={infoModal} /> : null}
      </Modal>
    </ToastProvider>
  );
}
