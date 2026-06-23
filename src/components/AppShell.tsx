import { ReactNode, useState } from "react";
import { useRouterState, useNavigate, useLocation } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, logout } from "@/lib/api";
import { getSessionUser } from "@/lib/authStore";
import { queryKeys } from "@/lib/queryKeys";
import { WorkspaceSidebar } from "@/components/layout/WorkspaceSidebar";
import { motion, AnimatePresence } from "framer-motion";

interface AppShellProps {
  children: ReactNode;
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

  const shellMeta = getShellMeta(currentPath);

  return (
    <div className="min-h-screen bg-surface-1 flex">
      {/* Sidebar - handles its own desktop fixed positioning and mobile bottom bar */}
      <WorkspaceSidebar 
        user={user} 
        onLogout={() => logoutMutation.mutate()} 
      />

      {/* Main Content Wrapper - push content to right on desktop, pad bottom on mobile */}
      <div className="flex-1 md:ml-72 pb-16 md:pb-0 flex flex-col min-h-screen">
        
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-surface-0 border-b border-cream-border px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex flex-col">
            <span className="t-eyebrow text-gold">{shellMeta.kicker}</span>
            <div className="flex items-center gap-3">
              <h1 className="t-section-heading text-ink">{shellMeta.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative max-w-sm w-full">
              <input 
                type="search" 
                placeholder={shellMeta.searchPlaceholder}
                className="w-full bg-surface-1 border border-cream-border text-ink rounded-md pl-4 pr-10 py-2 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors t-body-sm"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-gold transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>
            
            <a 
              href="https://press.openrockets.com/docs/get-started" 
              className="hidden sm:block t-label text-ink hover:text-gold transition-colors"
            >
              Docs
            </a>
          </div>

        </header>

        {/* Main Content Area with Page Transitions */}
      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-grow flex flex-col pt-16 min-h-screen"
        >
          {children || <Outlet />}
        </motion.main>
      </AnimatePresence>

      </div>
    </div>
  );
}
