/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy, type ReactNode } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { getSessionUser } from "@/lib/authStore";
import { queryClient } from "@/lib/queryClient";
import { queryKeys } from "@/lib/queryKeys";
import {
  getCurrentUser,
  getContributorDashboard,
  getModerationDashboard,
  getAdminDashboard,
} from "@/lib/api";
// Critical path routes — imported eagerly so there's no chunk-fetch delay on first load
import { RootLayout } from "@/routes/RootLayout";
import { HomePage } from "@/routes/HomePage";


const PublishPage = lazy(() => import("@/routes/PublishPage").then((module) => ({ default: module.PublishPage })));
const BrowsePage = lazy(() => import("@/routes/BrowsePage").then((module) => ({ default: module.BrowsePage })));
const SearchPage = lazy(() => import("@/routes/SearchPage").then((module) => ({ default: module.SearchPage })));
const CategoryPage = lazy(() => import("@/routes/CategoryPage").then((module) => ({ default: module.CategoryPage })));
const CreatorProfilePage = lazy(() => import("@/routes/CreatorProfilePage").then((module) => ({ default: module.CreatorProfilePage })));
const LicensePage = lazy(() => import("@/routes/LicensePage").then((module) => ({ default: module.LicensePage })));
const AboutPage = lazy(() => import("@/routes/AboutPage").then((module) => ({ default: module.AboutPage })));
const GetStartedPage = lazy(() => import("@/routes/GetStartedPage").then((module) => ({ default: module.GetStartedPage })));
const PrivacyPolicyPage = lazy(() =>
  import("@/routes/PrivacyPolicyPage").then((module) => ({ default: module.PrivacyPolicyPage })),
);

const TermsOfServicePage = lazy(() =>
  import("@/routes/TermsOfServicePage").then((module) => ({ default: module.TermsOfServicePage })),
);
const DashboardPage = lazy(() => import("@/routes/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const CasesPage = lazy(() => import("@/routes/CasesPage").then((module) => ({ default: module.CasesPage })));
const ArtifactsPage = lazy(() => import("@/routes/ArtifactsPage").then((module) => ({ default: module.ArtifactsPage })));
const SettingsPage = lazy(() => import("@/routes/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const AdminQueuePage = lazy(() => import("@/routes/AdminQueuePage").then((module) => ({ default: module.AdminQueuePage })));
const AdminReviewPage = lazy(() => import("@/routes/AdminReviewPage").then((module) => ({ default: module.AdminReviewPage })));
const AdminUsersPage = lazy(() => import("@/routes/AdminUsersPage").then((module) => ({ default: module.AdminUsersPage })));
const EmbedPage = lazy(() => import("@/routes/EmbedPage").then((module) => ({ default: module.EmbedPage })));
const ModerationPage = lazy(() => import("@/routes/ModerationPage").then((module) => ({ default: module.ModerationPage })));
const AdminPanelPage = lazy(() => import("@/routes/AdminPanelPage").then((module) => ({ default: module.AdminPanelPage })));
const PublicationDetailPage = lazy(() =>
  import("@/routes/PublicationDetailPage").then((module) => ({ default: module.PublicationDetailPage })),
);
const SuspendedPage = lazy(() =>
  import("@/routes/SuspendedPage").then((module) => ({ default: module.SuspendedPage })),
);
const NotFoundPage = lazy(() => import("@/routes/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const ArtifactShowcase = lazy(() => import("@/routes/ArtifactShowcase").then((module) => ({ default: module.ArtifactShowcase })));

// ── Skeleton components ──────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <main className="page-skeleton" aria-hidden="true">
      <div className="skeleton-bar skeleton-bar-title" />
      <div className="skeleton-bar skeleton-bar-md" />
      <div className="skeleton-bar skeleton-bar-sm" />
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <div className="app-shell" aria-hidden="true">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="skeleton-bar" style={{ height: "14px", width: "40px" }} />
        </div>
        <div className="sidebar-user" style={{ gap: "0.75rem", alignItems: "center" }}>
          <div className="skeleton-bar" style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton-bar" style={{ height: "10px", width: "80%" }} />
            <div className="skeleton-bar" style={{ height: "8px", width: "50%", marginTop: "0.35rem" }} />
          </div>
        </div>
        <div className="sidebar-nav">
          {[70, 55, 65, 45].map((w, i) => (
            <div key={i} className="skeleton-bar" style={{ height: "32px", width: `${w}%`, borderRadius: "7px" }} />
          ))}
        </div>
      </aside>
      <div className="app-content">
        <div className="dash-page">
          <div className="skeleton-bar" style={{ height: "10px", width: "140px", marginBottom: "0.5rem" }} />
          <div className="skeleton-bar skeleton-bar-title" />
          <div className="skeleton-bar skeleton-bar-sm" style={{ marginTop: "0.4rem" }} />
          <div className="stats-grid" style={{ marginTop: "1.5rem" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="stat-card skeleton-stat-card">
                <div className="skeleton-bar" style={{ height: "10px", width: "60%" }} />
                <div className="skeleton-bar" style={{ height: "28px", width: "40%", marginTop: "0.5rem" }} />
              </div>
            ))}
          </div>
          <div className="skeleton-table-block" style={{ marginTop: "1.75rem" }}>
            <div className="skeleton-bar" style={{ height: "10px", width: "30%", marginBottom: "0.75rem" }} />
            {[1, 2, 3].map((i) => <div key={i} className="skeleton-row-line" />)}
          </div>
          <div className="skeleton-table-block" style={{ marginTop: "1.5rem" }}>
            <div className="skeleton-bar" style={{ height: "10px", width: "20%", marginBottom: "0.75rem" }} />
            {[1, 2].map((i) => <div key={i} className="skeleton-row-line" />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelPageSkeleton() {
  return (
    <div className="app-shell" aria-hidden="true">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="skeleton-bar" style={{ height: "14px", width: "40px" }} />
        </div>
        <div className="sidebar-user" style={{ gap: "0.75rem", alignItems: "center" }}>
          <div className="skeleton-bar" style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton-bar" style={{ height: "10px", width: "80%" }} />
          </div>
        </div>
        <div className="sidebar-nav">
          {[70, 55, 65].map((w, i) => (
            <div key={i} className="skeleton-bar" style={{ height: "32px", width: `${w}%`, borderRadius: "7px" }} />
          ))}
        </div>
      </aside>
      <div className="app-content">
        <div className="dash-page">
          <div className="skeleton-bar" style={{ height: "10px", width: "100px", marginBottom: "0.5rem" }} />
          <div className="skeleton-bar skeleton-bar-title" />
          <div className="skeleton-bar skeleton-bar-sm" style={{ marginTop: "0.4rem" }} />
          <div className="skeleton-table-block" style={{ marginTop: "1.75rem" }}>
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton-row-line" />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Route helpers ────────────────────────────────────────────────────────────

function withRouteSuspense(element: ReactNode): ReactNode {
  return <Suspense fallback={<PageSkeleton />}>{element}</Suspense>;
}

// ── Routes ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => withRouteSuspense(<RootLayout />),
  notFoundComponent: () => withRouteSuspense(<NotFoundPage />),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => withRouteSuspense(<HomePage />),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  loader: () => {
    window.location.href = "https://accounts.openrockets.com/register?redirect_uri=" + encodeURIComponent(window.location.origin + "/api/auth/sso-callback?returnTo=/dashboard");
  },
  component: () => null,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/browse",
  validateSearch: (search: Record<string, unknown>) => ({
    division: (search.division as string) || "all",
    license: (search.license as string) || "all",
    sort: (search.sort as string) || "newest",
    view: (search.view as string) || "grid",
    page: Number(search.page) || 1,
  }),
  component: () => withRouteSuspense(<BrowsePage />),
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
  }),
  component: () => withRouteSuspense(<SearchPage />),
});

const categoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/category/$divisionId",
  component: () => withRouteSuspense(<CategoryPage />),
});

const creatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/creator/$username",
  component: () => withRouteSuspense(<CreatorProfilePage />),
});

const licenseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/license/$licenseId",
  component: () => withRouteSuspense(<LicensePage />),
});

const getStartedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/get-started",
  component: () => withRouteSuspense(<GetStartedPage />),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  loader: () => {
    window.location.href = "https://accounts.openrockets.com/login?redirect_uri=" + encodeURIComponent(window.location.origin + "/api/auth/sso-callback?returnTo=/dashboard");
  },
  component: () => null,
});

const publishRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/publish",
  beforeLoad: () => {
    const session = getSessionUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.accountStatus === "suspended") throw redirect({ to: "/" });
  },
  component: () => withRouteSuspense(<PublishPage />),
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: () => withRouteSuspense(<AboutPage />),
});

const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/legal/privacy-policy",
  component: () => withRouteSuspense(<PrivacyPolicyPage />),
});


const termsOfServiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/legal/terms",
  component: () => withRouteSuspense(<TermsOfServicePage />),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: () => {
    const session = getSessionUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.accountStatus === "suspended") throw redirect({ to: "/suspended" });
  },
  loader: async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.auth.currentUser(),
        queryFn: () => getCurrentUser(),
        staleTime: 60_000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.contributor.dashboard(),
        queryFn: getContributorDashboard,
        staleTime: 60_000,
      }),
    ]);
  },
  pendingComponent: DashboardSkeleton,
  pendingMs: 150,
  pendingMinMs: 250,
  component: () => withRouteSuspense(<DashboardPage />),
});

const casesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases",
  beforeLoad: () => {
    const session = getSessionUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.accountStatus === "suspended") throw redirect({ to: "/suspended" });
  },
  loader: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.auth.currentUser(),
      queryFn: () => getCurrentUser(),
      staleTime: 60_000,
    });
  },
  pendingComponent: PanelPageSkeleton,
  pendingMs: 150,
  pendingMinMs: 250,
  component: () => withRouteSuspense(<CasesPage />),
});

const artifactsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/artifacts",
  beforeLoad: () => {
    const session = getSessionUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.accountStatus === "suspended") throw redirect({ to: "/suspended" });
  },
  loader: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.auth.currentUser(),
      queryFn: () => getCurrentUser(),
      staleTime: 60_000,
    });
  },
  pendingComponent: PanelPageSkeleton,
  pendingMs: 150,
  pendingMinMs: 250,
  component: () => withRouteSuspense(<ArtifactsPage />),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  beforeLoad: () => {
    const session = getSessionUser();
    if (!session) throw redirect({ to: "/login" });
  },
  loader: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.auth.currentUser(),
      queryFn: () => getCurrentUser(),
      staleTime: 60_000,
    });
  },
  pendingComponent: PanelPageSkeleton,
  pendingMs: 150,
  pendingMinMs: 250,
  component: () => withRouteSuspense(<SettingsPage />),
});

const moderationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/moderation",
  beforeLoad: () => {
    const session = getSessionUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.role !== "moderator" && session.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.moderation.dashboard(),
      queryFn: getModerationDashboard,
      staleTime: 30_000,
    });
  },
  pendingComponent: PanelPageSkeleton,
  pendingMs: 150,
  pendingMinMs: 250,
  component: () => withRouteSuspense(<ModerationPage />),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: () => {
    const session = getSessionUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.role !== "admin") throw redirect({ to: "/dashboard" });
  },
  loader: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.admin.dashboard(),
      queryFn: getAdminDashboard,
      staleTime: 30_000,
    });
  },
  pendingComponent: PanelPageSkeleton,
  pendingMs: 150,
  pendingMinMs: 250,
  component: () => withRouteSuspense(<AdminPanelPage />),
});

const adminQueueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/queue",
  beforeLoad: () => {
    const session = getSessionUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.role !== "admin" && session.role !== "moderator") {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.moderation.dashboard(),
      queryFn: getModerationDashboard,
      staleTime: 30_000,
    });
  },
  pendingComponent: PanelPageSkeleton,
  pendingMs: 150,
  pendingMinMs: 250,
  component: () => withRouteSuspense(<AdminQueuePage />),
});

const adminReviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/review/$pubId",
  beforeLoad: () => {
    const session = getSessionUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.role !== "admin" && session.role !== "moderator") {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.moderation.dashboard(),
      queryFn: getModerationDashboard,
      staleTime: 30_000,
    });
  },
  pendingComponent: PanelPageSkeleton,
  pendingMs: 150,
  pendingMinMs: 250,
  component: () => withRouteSuspense(<AdminReviewPage />),
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/users",
  beforeLoad: () => {
    const session = getSessionUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.moderation.users(),
      queryFn: listUsers,
      staleTime: 60_000,
    });
  },
  pendingComponent: PanelPageSkeleton,
  pendingMs: 150,
  pendingMinMs: 250,
  component: () => withRouteSuspense(<AdminUsersPage />),
});

const embedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/embed/artifact/$pubId",
  component: () => withRouteSuspense(<EmbedPage />),
});

const publicationDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/p/$pubId",
  component: () => withRouteSuspense(<PublicationDetailPage />),
});

const suspendedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/suspended",
  component: () => (
    <Suspense fallback={<PageSkeleton />}>
      <SuspendedPage />
    </Suspense>
  ),
});

const showcaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/showcase",
  component: () => (
    <Suspense fallback={<PageSkeleton />}>
      <ArtifactShowcase />
    </Suspense>
  ),
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  registerRoute,
  loginRoute,
  publishRoute,
  aboutRoute,
  dashboardRoute,
  casesRoute,
  artifactsRoute,
  settingsRoute,
  moderationRoute,
  adminQueueRoute,
  adminReviewRoute,
  adminUsersRoute,
  embedRoute,
  aboutRoute,
  browseRoute,
  searchRoute,
  categoryRoute,
  creatorRoute,
  licenseRoute,
  getStartedRoute,
  privacyPolicyRoute,

  termsOfServiceRoute,
  publicationDetailRoute,
  suspendedRoute,
  showcaseRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadDelay: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
