/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy, type ReactNode } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { getSessionUser, fetchSessionUser } from "@/lib/authStore";
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
import { Spinner } from "./components/ui/Spinner";


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
const SubmissionsPage = lazy(() => import("@/routes/SubmissionsPage").then((module) => ({ default: module.SubmissionsPage })));
const ProfilePage = lazy(() => import("@/routes/ProfilePage").then((module) => ({ default: module.ProfilePage })));
const ModerationPage = lazy(() => import("@/routes/ModerationPage").then((module) => ({ default: module.ModerationPage })));
const AdminPanelPage = lazy(() => import("@/routes/AdminPanelPage").then((module) => ({ default: module.AdminPanelPage })));
const ArtifactShortlinkPage = lazy(() => import("@/routes/ArtifactShortlinkPage").then((module) => ({ default: module.ArtifactShortlinkPage })));
const PublicationDetailPage = lazy(() =>
  import("@/routes/PublicationDetailPage").then((module) => ({ default: module.PublicationDetailPage })),
);
const SuspendedPage = lazy(() =>
  import("@/routes/SuspendedPage").then((module) => ({ default: module.SuspendedPage })),
);
const NotFoundPage = lazy(() => import("@/routes/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const ArtifactViewPage = lazy(() => import("@/routes/ArtifactViewPage").then((module) => ({ default: module.ArtifactViewPage })));

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
  beforeLoad: async () => { await fetchSessionUser(); },
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
    window.location.href = "https://accounts.openrockets.com/login?redirect_uri=" + encodeURIComponent(window.location.origin + "/api/auth/sso-callback?returnTo=/dashboard") + "&app=OpenRockets+Press";
  },
  component: () => null,
});

const publishRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/publish",
  beforeLoad: async () => {
    const session = await fetchSessionUser();
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

const artifactViewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/artifacts/$titleSlug",
  component: () => withRouteSuspense(<ArtifactViewPage />),
});

const shortLinkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$shortId",
  component: () => withRouteSuspense(<ArtifactShortlinkPage />),
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
  beforeLoad: async () => {
    const session = await fetchSessionUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.accountStatus === "suspended") throw redirect({ to: "/suspended" });
    
    throw redirect({ to: "/publish" });
  },
});

const submissionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/submissions",
  beforeLoad: async () => {
    const session = await fetchSessionUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.accountStatus === "pending_parental") throw redirect({ to: "/publish" });
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
  component: () => withRouteSuspense(<SubmissionsPage />),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  beforeLoad: async () => {
    const session = await fetchSessionUser();
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
  component: () => withRouteSuspense(<ProfilePage />),
});

const moderationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/moderation",
  beforeLoad: async () => {
    const session = await fetchSessionUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.role !== "moderator" && session.role !== "admin") {
      throw redirect({ to: "/dashboard", search: { token: undefined } });
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
  beforeLoad: async () => {
    const session = await fetchSessionUser();
    if (!session) throw redirect({ to: "/login" });
    if (session.role !== "admin") throw redirect({ to: "/dashboard", search: { token: undefined } });
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
  beforeLoad: async () => {
    const session = await fetchSessionUser();
    if (!session) throw redirect({ to: "/login" });
  },
  component: () => withRouteSuspense(<PublicationDetailPage />),
});

const suspendedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/suspended",
  component: () => withRouteSuspense(<SuspendedPage />),
});

const HashtagPage = lazy(() => import("@/routes/HashtagPage").then((module) => ({ default: module.HashtagPage })));
const hashtagRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hashtag/$hashtagId",
  component: () => withRouteSuspense(<HashtagPage />),
});

const Template1Page = lazy(() => import("@/templates/template1/Template1Page").then((module) => ({ default: module.Template1Page })));
const template1Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/templates/1",
  beforeLoad: async () => {
    const session = await fetchSessionUser();
    if (!session) throw redirect({ to: "/login" });
  },
  component: () => withRouteSuspense(<Template1Page />),
});


const FullScreenSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
    <Spinner color="#1a73e8" />
  </div>
);

const ssoCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/api/auth/sso-callback",
  validateSearch: (search: Record<string, unknown>) => ({
    token: search.token as string | undefined,
    returnTo: search.returnTo as string | undefined,
  }),
  pendingComponent: FullScreenSpinner,
  beforeLoad: async ({ search }) => {
    const searchParams = search as { token?: string; returnTo?: string };
    if (searchParams.token) {
      try {
        const payloadBase64 = searchParams.token.split('.')[1];
        if (payloadBase64) {
          const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
          const pad = base64.length % 4;
          const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
          const payload = JSON.parse(atob(padded));
          
          window.localStorage.setItem("orp.session.token", searchParams.token);
          
          let user: any = {
            userId: String(payload.sub || payload.id || "mock-user-id"),
            email: payload.email || "user@example.com",
            displayName: payload.name || "Contributor",
            role: "contributor",
            accountStatus: "active",
            consentTier: "general",
            avatarUrl: payload.avatar_url || payload.profile?.avatar_url || null,
            dateOfBirth: payload.profile?.date_of_birth || null,
          };
          window.localStorage.setItem("orp.session.v1", JSON.stringify(user));

          // Try to fetch real profile data (proxied via Vite in local dev to avoid CORS)
          try {
            const response = await fetch("/proxy/auth/me", {
              headers: {
                Authorization: `Bearer ${searchParams.token}`,
                Accept: "application/json",
              },
            });
            if (response.ok) {
              const userData = await response.json();
              user = {
                ...user,
                userId: String(userData.id),
                email: userData.email,
                displayName: userData.name || user.displayName,
                avatarUrl: userData.profile?.avatar_url || user.avatarUrl,
                dateOfBirth: userData.profile?.date_of_birth || user.dateOfBirth,
              };
              window.localStorage.setItem("orp.session.v1", JSON.stringify(user));
            }
          } catch (fetchErr) {
            console.warn("Could not fetch real user data (likely CORS in local dev). Using JWT fallback.");
          }
        }
      } catch (e) {
        console.error("Failed to parse SSO token locally", e);
      }
      throw redirect({
        to: searchParams.returnTo || "/dashboard",
      });
    }
    throw redirect({ to: "/login" });
  },
  component: () => null,
});

const logoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/api/auth/logout",
  beforeLoad: () => {
    window.localStorage.removeItem("orp.session.v1");
    window.localStorage.removeItem("orp.session.token");
    throw redirect({ to: "/" });
  },
  component: () => null,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  hashtagRoute,
  registerRoute,
  loginRoute,
  publishRoute,
  aboutRoute,
  dashboardRoute,
  submissionsRoute,
  profileRoute,
  moderationRoute,
  adminRoute,
  privacyPolicyRoute,
  parentalConsentRoute,
  termsOfServiceRoute,
  publicationDetailRoute,
  suspendedRoute,
  ssoCallbackRoute,
  logoutRoute,
  template1Route,
  artifactViewRoute,
  shortLinkRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: false,
  defaultPreloadDelay: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
