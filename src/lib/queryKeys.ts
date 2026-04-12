import type { PublicationType } from "@shared/types";

export interface HomeFeedFilters {
  q?: string;
  type?: PublicationType | "all";
}

export const queryKeys = {
  home: {
    feed: (filters: HomeFeedFilters) => ["home", "feed", filters] as const,
  },
  auth: {
    currentUser: () => ["auth", "current-user"] as const,
  },
  contributor: {
    dashboard: () => ["contributor", "dashboard"] as const,
    publications: () => ["contributor", "publications"] as const,
    cases: () => ["contributor", "cases"] as const,
    caseMessages: (caseId: string) => ["contributor", "case-messages", caseId] as const,
  },
  moderation: {
    dashboard: () => ["moderation", "dashboard"] as const,
    users: () => ["moderation", "users"] as const,
  },
  admin: {
    dashboard: () => ["admin", "dashboard"] as const,
  },
};
