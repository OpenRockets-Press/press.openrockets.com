import { useEffect, useState, createContext } from "react";
import { Outlet, useRouterState, useLocation } from "@tanstack/react-router";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeInfoModalContent, type HomeInfoModalKind } from "@/components/home/HomeInfoModal";

import { Modal } from "@/components/ui/Modal";
import { useTranslationContext } from "@/lib/TranslationContext";
import { useAutoTranslate } from "@/lib/useAutoTranslate";
import { LanguageSuccessModal } from "@/components/ui/LanguageSuccessModal";

export const SearchContext = createContext<{
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: string | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
  selectedHashtags: string[];
  setSelectedHashtags: React.Dispatch<React.SetStateAction<string[]>>;
}>({
  search: "",
  setSearch: () => {},
  selectedCategory: null,
  setSelectedCategory: () => {},
  selectedHashtags: [],
  setSelectedHashtags: () => {},
});

export const SidebarContext = createContext<{
  isSidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  isSidebarOpen: false,
  setSidebarOpen: () => {},
});

export function RootLayout() {
  useAutoTranslate();
  const { isTranslating, isContentLoading } = useTranslationContext();

  const location = useLocation();
  const pathname = location.pathname;
  
  // Robust check for template routes in case of Hash routing or nested paths
  const knownPaths = ["/publish", "/profile", "/dashboard", "/submissions", "/cases", "/admin", "/about", "/books", "/login", "/register", "/moderation", "/hashtag"];
  const isTemplateRoute = pathname.toLowerCase().includes("/template") || 
                          pathname.toLowerCase().includes("/artifacts/") || 
                          (typeof window !== 'undefined' && (window.location.href.toLowerCase().includes("/template") || window.location.href.toLowerCase().includes("/artifacts/"))) || 
                          (/^\/[a-zA-Z0-9]{7,12}$/.test(pathname) && !knownPaths.includes(pathname.toLowerCase()));
  const isPending = useRouterState({
    select: (state) => state.status === "pending",
  });
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [infoModal, setInfoModal] = useState<HomeInfoModalKind | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

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

    if (routeTitleMap[pathname]) {
      document.title = routeTitleMap[pathname];
    }
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
      {(isPending || isTranslating || isContentLoading) && (
        <div className="ms-loader-container" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
          <div className="anim-dot dot1" />
          <div className="anim-dot dot2" />
          <div className="anim-dot dot3" />
          <div className="anim-dot dot4" />
          <div className="anim-dot dot5" />
        </div>
      )}
      <SidebarContext.Provider value={{ isSidebarOpen, setSidebarOpen }}>
        <SearchContext.Provider value={{ search, setSearch, selectedCategory, setSelectedCategory, selectedHashtags, setSelectedHashtags }}>
          {!isTemplateRoute && <HomeHeader onOpenInfo={setInfoModal} />}
          <div id="translate-root">
            <Outlet />
          </div>
          {!isTemplateRoute && <HomeFooter onOpenInfo={setInfoModal} />}

          <Modal
            open={infoModal !== null}
            title={modalTitle}
            onClose={() => setInfoModal(null)}
            width="md"
          >
            {infoModal ? <HomeInfoModalContent kind={infoModal} /> : null}
          </Modal>

          <LanguageSuccessModal />
        </SearchContext.Provider>
      </SidebarContext.Provider>
    </>
  );
}
