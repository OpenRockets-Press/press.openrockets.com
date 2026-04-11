/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy, type ReactNode } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { getSessionUser } from "@/lib/authStore";

const RootLayout = lazy(() => import("@/routes/RootLayout").then((module) => ({ default: module.RootLayout })));
const HomePage = lazy(() => import("@/routes/HomePage").then((module) => ({ default: module.HomePage })));
const RegisterPage = lazy(() => import("@/routes/RegisterPage").then((module) => ({ default: module.RegisterPage })));
const ConsentInSessionPage = lazy(() =>
  import("@/routes/ConsentInSessionPage").then((module) => ({ default: module.ConsentInSessionPage })),
);
const LoginPage = lazy(() => import("@/routes/LoginPage").then((module) => ({ default: module.LoginPage })));
const PublishPage = lazy(() => import("@/routes/PublishPage").then((module) => ({ default: module.PublishPage })));
const AboutPage = lazy(() => import("@/routes/AboutPage").then((module) => ({ default: module.AboutPage })));
const PrivacyPolicyPage = lazy(() =>
  import("@/routes/PrivacyPolicyPage").then((module) => ({ default: module.PrivacyPolicyPage })),
);
const ParentalConsentFormPage = lazy(() =>
  import("@/routes/ParentalConsentFormPage").then((module) => ({ default: module.ParentalConsentFormPage })),
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

function withRouteSuspense(element: ReactNode): ReactNode {
  return <Suspense fallback={<main className="page-wrap"><p>Loading...</p></main>}>{element}</Suspense>;
}

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
  component: () => withRouteSuspense(<RegisterPage />),
});

const consentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/consent/in-session",
  component: () => withRouteSuspense(<ConsentInSessionPage />),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => withRouteSuspense(<LoginPage />),
});

const publishRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/publish",
  beforeLoad: () => {
    const session = getSessionUser();
    if (!session) {
      throw redirect({ to: "/login" });
    }

    if (session.accountStatus === "pending_parental") {
      throw redirect({ to: "/consent/in-session" });
    }

    if (session.accountStatus === "suspended") {
      throw redirect({ to: "/" });
    }
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

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: () => {
    const session = getSessionUser();
    if (!session) {
      throw redirect({ to: "/login" });
    }

    if (session.accountStatus === "pending_parental") {
      throw redirect({ to: "/consent/in-session" });
    }

    if (session.accountStatus === "suspended") {
      throw redirect({ to: "/suspended" });
    }
  },
  component: () => withRouteSuspense(<DashboardPage />),
});

const casesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cases",
  beforeLoad: () => {
    const session = getSessionUser();
    if (!session) {
      throw redirect({ to: "/login" });
    }

    if (session.accountStatus === "pending_parental") {
      throw redirect({ to: "/consent/in-session" });
    }

    if (session.accountStatus === "suspended") {
      throw redirect({ to: "/suspended" });
    }
  },
  component: () => withRouteSuspense(<CasesPage />),
});

const moderationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/moderation",
  beforeLoad: () => {
    const session = getSessionUser();
    if (!session) {
      throw redirect({ to: "/login" });
    }

    if (session.role !== "moderator" && session.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: () => withRouteSuspense(<ModerationPage />),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: () => {
    const session = getSessionUser();
    if (!session) {
      throw redirect({ to: "/login" });
    }

    if (session.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
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
  consentRoute,
  loginRoute,
  publishRoute,
  aboutRoute,
  dashboardRoute,
  casesRoute,
  moderationRoute,
  adminRoute,
  privacyPolicyRoute,
  parentalConsentRoute,
  publicationDetailRoute,
  suspendedRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
