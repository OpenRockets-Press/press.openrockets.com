import { useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, logout } from "@/lib/api";
import { getSessionUser } from "@/lib/authStore";
import { queryKeys } from "@/lib/queryKeys";
import { HomeHeader } from "@/components/home/HomeHeader";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeInfoModalContent, type HomeInfoModalKind } from "@/components/home/HomeInfoModal";
import { Modal } from "@/components/ui/Modal";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { location } = useRouterState();
  const currentPath = location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [infoModal, setInfoModal] = useState<HomeInfoModalKind | null>(null);

  const { data: user } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => getCurrentUser(),
    initialData: () => getSessionUser() ?? undefined,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.clear();
      await navigate({ to: "/" });
    },
  });

  const isMod = user?.role === "moderator" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const sidebar = (
    <aside className={`app-sidebar${sidebarOpen ? " sidebar-open" : ""}`} aria-label="Dashboard navigation">
      <div className="sidebar-brand">
        <Link to="/" className="sidebar-brand-link" onClick={() => setSidebarOpen(false)}>
          <img className="sidebar-brand-main" src="/brand/271742354.png" alt="Open Rockets" />
          <img className="sidebar-brand-mark" src="/brand/9283527.png" alt="Open Rockets mark" />
          <span className="sidebar-brand-press">PRESS</span>
        </Link>
      </div>

      {user && (
        <div className="sidebar-user">
          <div className="sidebar-avatar" aria-hidden="true">
            {initials}
          </div>
          <div className="sidebar-user-info">
            <strong className="sidebar-user-name">{user.displayName}</strong>
            <span className={`sidebar-role-pill role-${user.role}`}>{user.role}</span>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        <SidebarNavLink to="/dashboard" current={currentPath} onNavigate={() => setSidebarOpen(false)}>
          Overview
        </SidebarNavLink>
        <SidebarNavLink to="/cases" current={currentPath} onNavigate={() => setSidebarOpen(false)}>
          Cases Inbox
        </SidebarNavLink>
        <SidebarNavLink to="/publish" current={currentPath} onNavigate={() => setSidebarOpen(false)}>
          New Submission
        </SidebarNavLink>
        {isMod && (
          <SidebarNavLink to="/moderation" current={currentPath} onNavigate={() => setSidebarOpen(false)}>
            Moderation
          </SidebarNavLink>
        )}
        {isAdmin && (
          <SidebarNavLink to="/admin" current={currentPath} onNavigate={() => setSidebarOpen(false)}>
            Admin Panel
          </SidebarNavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <Link to="/" className="sidebar-footer-link">
          ← Open Rockets Press
        </Link>
        <button
          type="button"
          className="sidebar-signout"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );

  const modalTitleMap: Record<HomeInfoModalKind, string> = {
    about: "About Open Rockets Press",
    publish: "Publishing At Open Rockets Press",
    privacy: "Privacy Summary",
    parental: "Parental Consent Summary",
  };

  return (
    <>
      <HomeHeader search={search} onSearchChange={setSearch} onOpenInfo={setInfoModal} />

      <div className="app-shell">
      {/* Mobile top bar */}
      <div className="sidebar-mobile-bar">
        <Link to="/" className="sidebar-mobile-brand">
          <img className="sidebar-brand-main" src="/brand/271742354.png" alt="Open Rockets" />
          <img className="sidebar-brand-mark" src="/brand/9283527.png" alt="Open Rockets mark" />
          <span className="sidebar-brand-press">PRESS</span>
        </Link>
        <button
          type="button"
          className="sidebar-mobile-toggle"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          onClick={() => setSidebarOpen((v) => !v)}
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {sidebar}

      <div className="app-content">
        {children}
      </div>
      </div>

      <HomeFooter onOpenInfo={setInfoModal} />

      <Modal
        open={infoModal !== null}
        title={infoModal ? modalTitleMap[infoModal] : "Information"}
        onClose={() => setInfoModal(null)}
        width="md"
      >
        {infoModal ? <HomeInfoModalContent kind={infoModal} /> : null}
      </Modal>
    </>
  );
}

function SidebarNavLink({
  to,
  current,
  onNavigate,
  children,
}: {
  to: string;
  current: string;
  onNavigate: () => void;
  children: ReactNode;
}) {
  const active = current === to;
  return (
    <Link
      to={to}
      className={`sidebar-nav-link${active ? " active" : ""}`}
      onClick={onNavigate}
    >
      {children}
    </Link>
  );
}
