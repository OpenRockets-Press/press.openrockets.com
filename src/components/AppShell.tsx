import { useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, logout } from "@/lib/api";
import { getSessionUser } from "@/lib/authStore";
import { queryKeys } from "@/lib/queryKeys";


interface AppShellProps {
  children: ReactNode;
}

interface SidebarLinkItem {
  to: string;
  label: string;
  subtitle: string;
}

interface SidebarSection {
  title: string;
  tone: "workspace" | "moderator" | "admin";
  links: SidebarLinkItem[];
}

interface ShellMeta {
  kicker: string;
  title: string;
  searchPlaceholder: string;
}

function getShellMeta(pathname: string): ShellMeta {
  if (pathname.startsWith("/admin")) {
    return {
      kicker: "Administration",
      title: "Control Center",
      searchPlaceholder: "Filter users, actions, or audit terms",
    };
  }
  if (pathname.startsWith("/moderation")) {
    return {
      kicker: "Moderator Workspace",
      title: "Review Queue",
      searchPlaceholder: "Search publications, cases, or contributor IDs",
    };
  }
  if (pathname.startsWith("/cases")) {
    return {
      kicker: "Support Cases",
      title: "Cases Inbox",
      searchPlaceholder: "Search case number, subject, or status",
    };
  }
  if (pathname.startsWith("/publish")) {
    return {
      kicker: "Submissions",
      title: "New Publication",
      searchPlaceholder: "Search templates, tags, or previous drafts",
    };
  }
  return {
    kicker: "Workspace",
    title: "Dashboard",
    searchPlaceholder: "Search your workspace",
  };
}

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { location } = useRouterState();
  const currentPath = location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

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
  const shellMeta = getShellMeta(currentPath);

  const sidebarSections: SidebarSection[] = [
    {
      title: "WORKSPACE",
      tone: "workspace",
      links: [
        { to: "/dashboard", label: "Overview", subtitle: "Contributor metrics" },
        { to: "/cases", label: "Cases Inbox", subtitle: "Open your active threads" },
        { to: "/publish", label: "New Submission", subtitle: "Upload and submit" },
      ],
    },
  ];

  if (isMod) {
    sidebarSections.push({
      title: "MODERATOR",
      tone: "moderator",
      links: [
        { to: "/moderation", label: "Queue and Cases", subtitle: "Review publications" },
      ],
    });
  }

  if (isAdmin) {
    sidebarSections.push({
      title: "ADMIN",
      tone: "admin",
      links: [
        { to: "/admin", label: "Control Center", subtitle: "Governance and DSAR" },
      ],
    });
  }

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
        {sidebarSections.map((section) => (
          <section key={section.title} className={`sidebar-section sidebar-section-${section.tone}`}>
            <p className="sidebar-section-title">{section.title}</p>
            <div className="sidebar-section-links">
              {section.links.map((link) => (
                <SidebarNavLink
                  key={link.to}
                  to={link.to}
                  current={currentPath}
                  subtitle={link.subtitle}
                  onNavigate={() => setSidebarOpen(false)}
                >
                  {link.label}
                </SidebarNavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>

    </aside>
  );


  return (
    <>
      <div className="app-shell">
        {/* Mobile top bar */}
        <div className="sidebar-mobile-bar">
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

        <div className="app-main">
          <header className="app-topbar">
            <div className="app-topbar-meta">
              <p className="app-topbar-kicker">{shellMeta.kicker}</p>
              <div className="app-topbar-title-row">
                <h1 className="app-topbar-title">{shellMeta.title}</h1>
                {user ? <span className={`app-topbar-role role-${user.role}`}>{user.role}</span> : null}
              </div>
            </div>

            <div className="app-topbar-search-container" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label className="app-topbar-search" aria-label="Workspace search" style={{ margin: 0 }}>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={shellMeta.searchPlaceholder}
                />
              </label>
              <button type="button" className="app-topbar-action" aria-label="Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>

            <div className="app-topbar-actions">
              <a
                href="https://press.openrockets.com/docs/get-started"
                className="app-topbar-action"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
              >
                Get started
              </a>
              <button
                type="button"
                className="app-topbar-action app-topbar-action-primary"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </header>

          <div className="app-content">
            {children}
          </div>
        </div>
      </div>

    </>
  );
}

function SidebarNavLink({
  to,
  current,
  subtitle,
  onNavigate,
  children,
}: {
  to: string;
  current: string;
  subtitle?: string;
  onNavigate: () => void;
  children: ReactNode;
}) {
  const active = current === to || current.startsWith(`${to}/`);
  return (
    <Link
      to={to}
      className={`sidebar-nav-link${active ? " active" : ""}`}
      onClick={onNavigate}
    >
      <span className="sidebar-nav-link-label">{children}</span>
      {subtitle ? <span className="sidebar-nav-link-subtitle">{subtitle}</span> : null}
    </Link>
  );
}
