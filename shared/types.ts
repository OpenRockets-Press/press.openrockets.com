export type Role = "contributor" | "moderator" | "admin";

export type ConsentTier = "coppa" | "gdpr_eu" | "gdpr_es" | "general";

export type AccountStatus =
  | "pending_parental"
  | "active"
  | "suspended"
  | "deletion_requested";

export type PublicationType =
  | "book"
  | "research_paper"
  | "magazine"
  | "poster"
  | "other";

export type PublicationStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "retracted";

export type PublicationLicense = "CC_BY" | "CC0" | "ORP_ND";

export type CaseStatus =
  | "open"
  | "pending_contributor"
  | "pending_moderator"
  | "resolved"
  | "closed";

export type CasePriority = "low" | "normal" | "high" | "urgent";

export interface Publication {
  id: string;
  pubId?: string;
  title: string;
  abstract?: string;
  authorDisplayName: string;
  authorUserId: string;
  type: PublicationType;
  status: PublicationStatus;
  license: PublicationLicense;
  tags: string[];
  submittedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  fileStorageId?: string;
  coverStorageId?: string;
  isFeatured: boolean;
  featuredRank?: number;
  viewCount: number;
  downloadCount: number;
}

export interface PublicationCardDTO {
  id: string;
  pubId?: string;
  title: string;
  authorDisplayName: string;
  type: PublicationType;
  license?: PublicationLicense;
  coverUrl?: string;
  isPlaceholder?: boolean;
}

export interface HomeFeedResponse {
  newReleases: PublicationCardDTO[];
  featuredContributions: PublicationCardDTO[];
  availableTypes: PublicationType[];
}

export interface RegisterPayload {
  displayName: string;
  email: string;
  password: string;
  consentTier: ConsentTier;
  guardianEmail?: string;
}

export interface RegisterResult {
  userId: string;
  status: "pending_parental" | "active";
  consentToken?: string;
}

export interface ConsentConfirmPayload {
  token: string;
  guardianEmail: string;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | "publication_approved"
    | "publication_rejected"
    | "case_opened"
    | "case_reply"
    | "case_resolved"
    | "account_active";
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export interface CaseSummary {
  id: string;
  caseNumber: string;
  subject: string;
  status: CaseStatus;
  priority: CasePriority;
  contributorUserId: string;
  openedBy: string;
  relatedPubId?: string;
  labels: string[];
  openedAt: string;
  lastActivityAt: string;
}

export interface CaseMessage {
  id: string;
  caseId: string;
  senderUserId: string;
  senderRole: Role | "system";
  body: string;
  sentAt: string;
  readBy: string[];
}

export interface ContributorDashboardData {
  publicationCount: number;
  openCaseCount: number;
  recentPublications: Publication[];
  recentCases: CaseSummary[];
}

export interface ModerationDashboardData {
  pendingPublications: Publication[];
  openCases: CaseSummary[];
}

export interface PendingParentalAccount {
  userId: string;
  displayName: string;
  consentTier: ConsentTier;
  createdAt: string;
}

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  pendingParentalUsers: number;
  suspendedUsers: number;
  openCases: number;
  pendingReviewPublications: number;
  consentStarted: number;
  consentCompleted: number;
  consentExpired: number;
  topDownloads: PublicationCardDTO[];
  pendingParentalAccounts: PendingParentalAccount[];
}
