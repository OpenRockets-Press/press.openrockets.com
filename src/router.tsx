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
const AboutPage = lazy(() => import("@/routes/AboutPage").then((module) => ({ default: module.AboutPage })));
const PrivacyPolicyPage = lazy(() =>
  import("@/routes/PrivacyPolicyPage").then((module) => ({ default: module.PrivacyPolicyPage })),
);
const ParentalConsentFormPage = lazy(() =>
  import("@/routes/ParentalConsentFormPage").then((module) => ({ default: module.ParentalConsentFormPage })),
);
const TermsOfServicePage = lazy(() =>
  import("@/routes/TermsOfServicePage").then((module) => ({ default: module.TermsOfServicePage })),
);
const DashboardPage = lazy(() => import("@/routes/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const CasesPage = lazy(() => import("@/routes/CasesPage").then((module) => ({ default: module.CasesPage })));
const ModerationPage = lazy(() => import("@/routes/ModerationPage").then((module) => ({ default: module.ModerationPage })));
const AdminPanelPage = lazy(() => import("@/routes/AdminPanelPage").then((module) => ({ default: module.AdminPanelPage })));
const PublicationDetailPage = lazy(() =>
  import("@/routes/PublicationDetailPage").then((module) => ({ default: module.PublicationDetailPage })),
);
const SuspendedPage = lazy(() =>
  import("@/routes/SuspendedPage").then((module) => ({ default: module.SuspendedPage })),
);
const NotFoundPage = lazy(() => import("@/routes/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));

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
    if (session.accountStatus === "pending_parental") throw redirect({ to: "/consent/in-session" });
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

const parentalConsentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/legal/parental-consent-form",
  component: () => withRouteSuspense(<ParentalConsentFormPage />),
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
    if (session.accountStatus === "pending_parental") throw redirect({ to: "/consent/in-session" });
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
    if (session.accountStatus === "pending_parental") throw redirect({ to: "/consent/in-session" });
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

const publicationDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/p/$pubId",
  component: () => withRouteSuspense(<PublicationDetailPage />),
});

const suspendedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/suspended",
  component: () => withRouteSuspense(<SuspendedPage />),
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  registerRoute,
  loginRoute,
  publishRoute,
  aboutRoute,
  dashboardRoute,
  casesRoute,
  moderationRoute,
  adminRoute,
  privacyPolicyRoute,
  parentalConsentRoute,
  termsOfServiceRoute,
  publicationDetailRoute,
  suspendedRoute,
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
