# Open Rockets Press — Complete Implementation Plan

> **Stack:** Appwrite · TanStack Router/Query · Plausible · TypeScript  
> **Version:** 3.1 — April 2026  
> **Audience:** GitHub Copilot as primary implementation assistant

---

## Table of contents

1. [Architecture & Stack](#1-architecture--stack)
2. [Appwrite Data Model](#2-appwrite-data-model)
3. [Authentication & Age-Gate](#3-authentication--age-gate)
4. [Publication Workflow](#4-publication-workflow)
5. [Cases System](#5-cases-system)
6. [Real-time Analytics (Full)](#6-real-time-analytics-full)
7. [Email — Appwrite built-in SMTP](#7-email--appwrite-built-in-smtp)
8. [Migration System](#8-migration-system)
9. [Technical Best Practices](#9-technical-best-practices)
10. [UX & UI Rules](#10-ux--ui-rules)
11. [Tests & Verifications](#11-tests--verifications)
12. [Sprint Plan](#12-sprint-plan)
13. [Privacy Policy](#13-privacy-policy)
14. [Parental Consent Form](#14-parental-consent-form)
15. [Home Screen Blueprint (Template-Locked)](#15-home-screen-blueprint-template-locked)

---

## 1. Architecture & Stack

### 1.1 Decision table

| Decision | Choice | Rationale |
|---|---|---|
| Cases triggering | **Manual only** — moderator opens every case | Simpler state machine, clearer audit trail, no accidental emails |
| Analytics depth | **Full** — real-time + onboarding funnel + consent rates | Required for COPPA/GDPR compliance reporting |
| Email provider | **Appwrite built-in SMTP** | No external account needed today; migration path in §7 |
| Email templates | **Plain-text only** (built-in SMTP constraint) | Appwrite built-in SMTP does NOT support custom HTML templates |
| Frontend | React 19 + TanStack Router + TanStack Query | Type-safe, composable, excellent Appwrite SDK integration |
| Hosting | Appwrite Sites | Same platform, CDN, preview deploys on every PR |
| Analytics | Plausible Cloud (cookie-free) | GDPR-native, no consent banner, no PII, real-time |

### 1.2 Full stack

| Layer | Technology |
|---|---|
| UI framework | React 19 + TypeScript |
| Routing | TanStack Router v1 (file-based, type-safe params) |
| Server state | TanStack Query v5 |
| Styling | Tailwind CSS v4 |
| Build tool | Vite 6 |
| Frontend hosting | Appwrite Sites |
| Auth | Appwrite Auth (email/password + labels for roles) |
| Database | Appwrite Database |
| File storage | Appwrite Storage (3 buckets) |
| Server logic | Appwrite Functions — Node.js 21, TypeScript |
| Real-time | Appwrite Realtime (WebSocket) |
| Email | Appwrite built-in SMTP → Resend migration (§7) |
| Analytics | Plausible Analytics Cloud |
| Custom events | `analytics_events` collection + Plausible Events API |

### 1.3 Repository structure

```
orp/
├── src/                            # TanStack Router frontend
│   ├── routes/                     # File-based routes
│   ├── components/
│   │   ├── ui/                     # Primitives (Button, Input, Badge…)
│   │   ├── layout/                 # Shell, Sidebar, Header
│   │   └── domain/                 # PublicationCard, CaseThread…
│   ├── lib/
│   │   ├── appwrite.ts             # Singleton client
│   │   ├── queries.ts              # All TanStack Query definitions
│   │   └── utils.ts
│   └── hooks/
├── public/
├── e2e/
├── vite.config.ts
├── functions/
│   ├── register/
│   ├── confirm-consent/
│   ├── submit-publication/
│   ├── review-publication/
│   ├── open-case/
│   ├── reply-case/
│   ├── serve-pdf/
│   ├── track-event/
│   ├── deletion-cron/
│   └── dsar-handler/
├── migrations/
│   ├── migrate.mjs                 # Runner (§8)
│   ├── setup.mjs                   # One-command bootstrap (§8.4)
│   └── migrations/
│       ├── 001_create_users.mjs
│       ├── 002_create_consent_records.mjs
│       └── …
├── shared/
│   └── types.ts                    # Types shared by frontend + functions
└── appwrite.json                   # Appwrite CLI config
```

### 1.4 Environment variables

```bash
# Appwrite
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=<project_id>
APPWRITE_API_KEY=<server_key>           # Functions + migrations only — never client
APPWRITE_DATABASE_ID=orp_db

# App
APP_BASE_URL=https://press.openrockets.com
CONSENT_TOKEN_SECRET=<32-byte-hex>      # HMAC signing for consent links

# Analytics
PLAUSIBLE_DOMAIN=press.openrockets.com
PLAUSIBLE_API_KEY=<api_key>             # Stats API, read-only

# Migration bootstrap (only needed for setup.mjs — see §8.4)
# Once setup runs, these are auto-generated into .env.local
```

> **Rule:** The client (browser) only ever receives `APPWRITE_ENDPOINT` and `APPWRITE_PROJECT_ID` via `import.meta.env`. Every other variable lives exclusively in Functions/server context.

---

## 2. Appwrite Data Model

> **Database ID:** `orp_db`  
> All collections use Appwrite auto-generated `$id` unless a custom ID is noted.  
> Attributes follow `snake_case`.

> ⚠️ Never expose `users` or `consent_records` to the client directly. All sensitive reads/writes go through Appwrite Functions using the server API key.

---

### 2.1 Collection: `users`

Shadow record mirroring Appwrite Auth. Created by Function on `auth.users.*.create` event.

| Attribute | Type | Required | Notes |
|---|---|---|---|
| `user_id` | string | yes | Equals Appwrite Auth `user.$id` |
| `display_name` | string | yes | Public pseudonym. Never the real name. |
| `role` | enum | yes | `contributor \| moderator \| admin` |
| `consent_tier` | enum | yes | `coppa \| gdpr_eu \| gdpr_es \| general` |
| `account_status` | enum | yes | `pending_parental \| active \| suspended \| deletion_requested` |
| `guardian_email_enc` | string | no | AES-256-GCM encrypted. Only for `coppa`/`gdpr_eu`. |
| `guardian_consent_at` | datetime | no | Set when guardian confirms. |
| `deletion_requested_at` | datetime | no | Triggers deletion cron. |
| `country_code` | string | no | ISO 3166-1 alpha-2. Derived from IP at registration. |
| `created_at` | datetime | yes | Auto-set by Function. |

**Permissions:** `role:user` reads/writes own document. `label:moderator` and `label:admin` read all.

**Indexes:**
- `user_id` → unique
- `account_status` → key (for cron queries)
- `consent_tier` → key (for analytics breakdown)

---

### 2.2 Collection: `consent_records`

Append-only legal audit trail. Never updated — only inserted by Functions.

| Attribute | Type | Notes |
|---|---|---|
| `user_id` | string | FK → `users.user_id` |
| `consent_type` | enum | `account_creation \| publish \| data_processing \| parental_confirm \| terms_update \| withdrawal` |
| `consent_text_version` | string | e.g. `"privacy-v1.0"` |
| `consented_at` | datetime | UTC ISO timestamp |
| `ip_hash` | string | `SHA-256(IP + daily_salt)`. No raw IP stored. |
| `guardian_id` | string | Appwrite Auth `$id` of guardian. Only for `parental_confirm`. |
| `method` | string | `email_link \| in_session \| re_consent` |

**Permissions:** Write by Functions (server key) only. Read by `label:admin` only.

---

### 2.3 Collection: `publications`

| Attribute | Type | Notes |
|---|---|---|
| `pub_id` | string | `ORP-YYYY-NNNN`. Null until approved. |
| `author_user_id` | string | FK → `users.user_id` |
| `author_display_name` | string | Denormalised for public display. |
| `title` | string | Max 200 chars. |
| `abstract` | string | Max 1000 chars. Optional. |
| `type` | enum | `book \| research_paper \| magazine \| poster \| other` |
| `status` | enum | `draft \| pending_review \| approved \| rejected \| retracted` |
| `license` | enum | `CC_BY \| CC0 \| ORP_ND` |
| `file_storage_id` | string | Bucket: `pub_files`. |
| `cover_storage_id` | string | Optional. Bucket: `pub_covers`. |
| `submitted_at` | datetime | |
| `reviewed_at` | datetime | When moderator acted. |
| `published_at` | datetime | Set once, at first approval. Used for public chronology and New Releases ordering. |
| `reviewed_by` | string | Moderator `user_id`. |
| `rejection_reason` | string | Only when `status = rejected`. NOT public. |
| `case_id` | string | FK → `cases.$id`. Set when moderator manually opens a related case. |
| `is_featured` | boolean | Curated by moderators/admins for homepage "Featured Contributions". Default `false`. |
| `featured_rank` | integer | Optional manual ordering for featured items (lower appears first). |
| `tags` | string[] | Up to 10. |
| `view_count` | integer | Incremented by `track-event`. Never by client. |
| `download_count` | integer | Incremented by `serve-pdf`. Never by client. |

**Permissions:** `status = approved` → publicly readable. Others → author + moderators/admins only. Status transitions via Functions only.

**Indexes:**
- `pub_id` → unique
- `status` → key
- `author_user_id` → key
- `submitted_at` → key DESC
- `published_at` → key DESC
- `featured_rank` → key ASC

---

### 2.4 Collection: `cases`

> ⚠️ **Rule:** Cases are opened **manually** by a moderator or admin only. There is NO automatic case creation anywhere in the codebase. Contributors cannot create cases.

| Attribute | Type | Notes |
|---|---|---|
| `case_number` | string | `CASE-YYYY-NNNN` |
| `subject` | string | Set by moderator. |
| `status` | enum | `open \| pending_contributor \| pending_moderator \| resolved \| closed` |
| `priority` | enum | `low \| normal \| high \| urgent` |
| `opened_by` | string | `user_id` of moderator/admin. |
| `contributor_user_id` | string | The contributor this case is about. |
| `related_pub_id` | string | Optional FK → `publications.pub_id`. |
| `labels` | string[] | `rejection \| copyright \| content_policy \| identity \| gdpr_request \| compliment \| other` |
| `related_case_ids` | string[] | FKs → other `cases.$id`. Set manually. |
| `opened_at` | datetime | |
| `resolved_at` | datetime | |
| `last_activity_at` | datetime | Updated on every message. |

**Permissions:** Read/write by `contributor_user_id` + `label:moderator` + `label:admin`. Not public.

---

### 2.5 Collection: `case_messages`

| Attribute | Type | Notes |
|---|---|---|
| `case_id` | string | FK → `cases.$id` |
| `sender_user_id` | string | FK → `users.user_id` |
| `sender_role` | enum | `contributor \| moderator \| admin \| system` |
| `body` | string | Max 4000 chars. |
| `attachment_storage_id` | string | Optional. Bucket: `case_attachments`. |
| `sent_at` | datetime | |
| `read_by` | string[] | `user_id`s who have read this message. |

**Realtime:** Subscribe to `databases.orp_db.collections.case_messages.documents`, filter by `case_id` client-side.

---

### 2.6 Collection: `analytics_events`

> ⚠️ `user_id` is **never** stored here. All events are anonymous by design.

| Attribute | Type | Notes |
|---|---|---|
| `event_type` | enum | `pub_view \| pub_download \| submission \| approval \| rejection \| case_opened \| consent_started \| consent_completed \| consent_expired` |
| `pub_id` | string | Optional. |
| `country_code` | string | 2-letter ISO from request headers. |
| `device_type` | enum | `desktop \| mobile \| tablet` |
| `occurred_at` | datetime | |
| `session_id` | string | Random UUID per browser session. Not linked to user account. |
| `meta` | string | JSON string for extra props. e.g. `{"type":"research_paper"}` |

---

### 2.7 Collection: `counters`

| Document ID | Attribute | Usage |
|---|---|---|
| `pub_2025` | `value: integer` | Last used pub sequence for year 2025 |
| `case_2025` | `value: integer` | Last used case sequence for year 2025 |

**Permissions:** Read/write by Functions (server key) only.

---

### 2.8 Collection: `notifications`

| Attribute | Type | Notes |
|---|---|---|
| `user_id` | string | Recipient |
| `type` | enum | `publication_approved \| publication_rejected \| case_opened \| case_reply \| case_resolved \| account_active` |
| `title` | string | Short notification title |
| `body` | string | Full text |
| `link` | string | Route to navigate to, e.g. `/cases/CASE-2025-0001` |
| `read` | boolean | Default: `false` |
| `created_at` | datetime | |

---

### 2.9 Storage buckets

| Bucket ID | Purpose | Max size | Allowed MIME | Public |
|---|---|---|---|---|
| `pub_files` | Publication PDFs | 50 MB | `application/pdf` | No — only via `serve-pdf` Function |
| `pub_covers` | Cover images | 5 MB | `image/jpeg, image/png, image/webp` | Yes (approved only) |
| `case_attachments` | Case message files | 20 MB | `application/pdf, image/*, text/plain` | No — case participants only |

---

## 3. Authentication & Age-Gate

### 3.1 Consent tier calculation (client-side, TypeScript)

The date of birth is entered in the registration form but is **never sent to the server**. Only the derived `consent_tier` is transmitted.

```typescript
import { differenceInYears } from "date-fns";

export type ConsentTier = "coppa" | "gdpr_eu" | "gdpr_es" | "general";

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE",
  "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT",
  "RO", "SK", "SI", "ES", "SE",
]);

export function getConsentTier(dob: Date, countryCode: string): ConsentTier {
  const age = differenceInYears(new Date(), dob);
  const isUS = countryCode === "US";
  const isSpain = countryCode === "ES";
  const isEU = EU_COUNTRIES.has(countryCode);

  // US: COPPA parental consent threshold is under 13.
  if (isUS && age < 13) return "coppa";

  // Spain: under 14 requires guardian consent, 14-17 can self-consent.
  if (isSpain && age < 14) return "gdpr_eu";
  if (isSpain && age < 18) return "gdpr_es";

  // EU (excluding Spain branch above): default digital consent threshold under 16.
  if (isEU && age < 16) return "gdpr_eu";

  return "general";
}

// Tiers that require guardian confirmation before activation
export const REQUIRES_GUARDIAN = new Set<ConsentTier>(["coppa", "gdpr_eu"]);
```

**Policy matrix (canonical):**

| Country | Age band | Tier | Guardian required |
|---|---|---|---|
| US | `< 13` | `coppa` | Yes |
| US | `13-17` | `general` | No |
| Spain | `< 14` | `gdpr_eu` | Yes |
| Spain | `14-17` | `gdpr_es` | No |
| Other EU | `< 16` | `gdpr_eu` | Yes |
| Non-EU, non-US | `< 18` | `general` | No |
| Any | `18+` | `general` | No |

### 3.2 Registration flow

**Client sends to `register` Function:**
```typescript
{
  display_name: string,
  email: string,
  password: string,       // Never logged
  consent_tier: ConsentTier,
  guardian_email?: string // Required when REQUIRES_GUARDIAN.has(consent_tier)
}
```

**`register` Function (server-side):**
1. Creates Appwrite Auth account via `account.create()`.
2. Assigns `label: contributor` via `users.updateLabels()`.
3. Creates `users` document: `account_status = pending_parental` if tier in `REQUIRES_GUARDIAN`, else `active`.
4. Creates `consent_record` (`type: account_creation`, `method: in_session`).
5. If `pending_parental`: redirects to in-session guardian consent flow.
6. If `active`: creates `notifications` entry (`type: account_active`).
7. Returns `{ user_id, status: "pending_parental" | "active" }`.

> ⚠️ The Function must NOT create a session when `account_status = pending_parental`. The contributor cannot log in until activated.

### 3.3 In-session guardian consent flow (Option A — current)

```
Contributor fills form
  ↓
register Function → account_status: pending_parental
  ↓
Redirect to /consent/in-session?token=[hmac_token]
  ↓
Guardian takes device, fills consent form (Part 14)
  ↓
confirm-consent Function → account_status: active
  ↓
Session created → redirect to /dashboard
```

**HMAC token payload:**
```typescript
{
  user_id: string,
  guardian_email: string,
  expires_at: number,   // Unix timestamp: now() + 72 hours
  version: "v1"
}
// Signed with CONSENT_TOKEN_SECRET using HMAC-SHA256
```

> If token expires: Function deletes Appwrite Auth account and `users` document. Required by COPPA — no partial accounts may persist.

### 3.4 Roles and labels

| Label | Assigned by | Access |
|---|---|---|
| `contributor` | `register` Function | Submit publications, read own cases, reply to own cases. |
| `moderator` | Admin via admin panel (Function) | Review publications, open cases, reply to any case. |
| `admin` | Directly in Appwrite Console | Full access + consent_records + deletion triggers. |

### 3.5 Route guards

```typescript
// In TanStack Router — beforeLoad on every protected route
export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context }) => {
    const user = await context.appwrite.account.get().catch(() => null);
    if (!user) throw redirect({ to: '/login' });

    const userDoc = await getUserDoc(user.$id);
    if (userDoc.account_status === 'pending_parental') {
      throw redirect({ to: '/consent/pending' });
    }
    if (userDoc.account_status === 'suspended') {
      throw redirect({ to: '/suspended' });
    }
  },
});
```

---

## 4. Publication Workflow

### 4.1 Status state machine

| From | To | Actor | Side effects |
|---|---|---|---|
| — | `draft` | Contributor saves | None |
| `draft` | `pending_review` | Contributor submits | `track-event: submission`. In-app notification to moderators. |
| `pending_review` | `approved` | Moderator approves | `generate-pub-id`. Set `published_at = now()` when first approved. `track-event: approval`. In-app notification to contributor. |
| `pending_review` | `rejected` | Moderator rejects + writes reason | `track-event: rejection`. In-app notification to contributor. Moderator may then manually open a case (separate, intentional action). |
| `approved` | `retracted` | Admin | Publication unlisted. In-app notification. |
| `rejected` | `draft` | Contributor edits | Status resets to draft. If related case exists: `status = pending_moderator`. |

> ℹ️ There is **no automatic case creation** on rejection. If the moderator wants to communicate about a rejection, they open a case manually. This is intentional.

> Home feed rule: "New Releases" always orders by `published_at DESC` (never `submitted_at`).

### 4.2 `pub_id` generation

```typescript
// Function: generate-pub-id
async function generatePubId(db: Databases, year: number): Promise<string> {
  const counterId = `pub_${year}`;
  let doc;
  try {
    doc = await db.getDocument(ORP_DB, "counters", counterId);
  } catch {
    await db.createDocument(ORP_DB, "counters", counterId, { value: 0 });
    doc = { value: 0 };
  }
  const next = doc.value + 1;
  await db.updateDocument(ORP_DB, "counters", counterId, { value: next });
  return `ORP-${year}-${String(next).padStart(4, "0")}`;
}
// → ORP-2025-0001
```

### 4.3 Secure PDF serving

`GET /functions/serve-pdf?pub_id=ORP-2025-0001`

1. Verify publication exists and `status === "approved"`.
2. Read file from `pub_files` bucket using server API key.
3. Increment `download_count` on publication document.
4. Call `track-event` with `event_type: pub_download`.
5. Return file with:

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="ORP-2025-0001.pdf"
X-Content-Type-Options: nosniff
Cache-Control: public, max-age=86400
Strict-Transport-Security: max-age=31536000
```

> The Storage bucket URL is never exposed. No `X-Appwrite-*` headers forwarded.

---

## 5. Cases System

### 5.1 Core rules (non-negotiable)

- **Rule 1:** Contributors **cannot** initiate a case. Only moderators/admins open cases.
- **Rule 2:** A contributor can only see cases where they are `contributor_user_id`.
- **Rule 3:** Contributors cannot contact other contributors. Every case target is an ORP staff member.

### 5.2 Opening a case

The moderator fills a form in the moderation panel:

| Field | Required | Notes |
|---|---|---|
| Contributor | yes | User picker showing active contributors |
| Subject | yes | Short description |
| Priority | yes | `low / normal / high / urgent` |
| Labels | no | Multi-select |
| Related publication | no | Links a publication card to the thread |
| Related cases | no | Links other existing cases |
| Opening message | yes | First message in thread, written by moderator |

**`open-case` Function:**
1. Validates caller has `label:moderator` or `label:admin`.
2. Generates `case_number` (`CASE-YYYY-NNNN`) via `counters`.
3. Creates `cases` document (`status: open`).
4. Creates first `case_messages` document (`sender_role: moderator`).
5. Creates `notifications` entry for the contributor (`type: case_opened`).
6. Calls `track-event` (`event_type: case_opened`).

### 5.3 Status transitions

| Status | Meaning | Transition trigger |
|---|---|---|
| `open` | Newly created, no contributor reply | Created by `open-case` |
| `pending_contributor` | Staff replied, waiting for contributor | `reply-case` with `sender_role: moderator/admin` |
| `pending_moderator` | Contributor replied, waiting for staff | `reply-case` with `sender_role: contributor` |
| `resolved` | Resolved by staff; contributor can reopen within 7 days | `resolve-case` Function |
| `closed` | Permanently closed | Admin only |

### 5.4 Real-time thread

```typescript
// In the case thread React component
const queryClient = useQueryClient();

useEffect(() => {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

  const unsub = client.subscribe(
    `databases.${ORP_DB}.collections.case_messages.documents`,
    (response) => {
      if (
        response.events.includes("databases.*.collections.*.documents.*.create") &&
        response.payload.case_id === caseId
      ) {
        queryClient.invalidateQueries({ queryKey: ["case-messages", caseId] });
      }
    }
  );

  return () => unsub();
}, [caseId, queryClient]);
```

### 5.5 Attachments (two-step upload)

1. Client calls `POST /functions/get-case-upload-token` → short-lived Appwrite Storage upload token.
2. Client uploads file directly to `case_attachments` bucket.
3. Client includes `attachment_storage_id` in the `reply-case` call.

Only case participants can download from `case_attachments` (enforced by bucket permissions).

---

## 6. Real-time Analytics (Full)

### 6.1 Two-layer strategy

| Layer | Tool | What it tracks | Where viewed |
|---|---|---|---|
| Pageviews & navigation | Plausible script (client) | Pages, referrers, countries, devices, bounce rate | Plausible dashboard embed |
| Business events | Plausible Events API (server-side from Functions) | Submissions, approvals, rejections, downloads | Plausible Goals dashboard |
| Compliance metrics | `analytics_events` Appwrite collection | Consent funnel, account status breakdown, DSARs | Custom admin dashboard |

> ⚠️ Do **not** add Google Analytics, Meta Pixel, or any third-party tracker. Any tracker processing data from minors requires explicit parental consent per third party under COPPA 2025 and GDPR Art. 8. Plausible requires no consent banner.

### 6.2 Plausible setup

```html
<!-- index.html -->
<script defer
  data-domain="press.openrockets.com"
  src="https://plausible.io/js/script.outbound-links.js">
</script>
```

Create Goals in Plausible dashboard for each event in §6.3.

### 6.3 Custom events (server-side)

```typescript
// Helper used inside all Functions
async function trackPlausibleEvent(
  req: AppwriteFunctionRequest,
  name: string,
  props?: Record<string, string>
) {
  await fetch("https://plausible.io/api/event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": req.headers["user-agent"] ?? "Appwrite/Function",
      "X-Forwarded-For": req.headers["x-real-ip"] ?? "",
    },
    body: JSON.stringify({
      domain: process.env.PLAUSIBLE_DOMAIN,
      name,
      url: `https://press.openrockets.com`,
      props: props ?? {},
    }),
  });
}
```

| Plausible Goal | Sent by Function | Props |
|---|---|---|
| `Publication Submitted` | `submit-publication` | `type, license` |
| `Publication Approved` | `review-publication` | `type, license` |
| `Publication Rejected` | `review-publication` | `type` only (no reason) |
| `Document Downloaded` | `serve-pdf` | `pub_id, type` |
| `Case Opened` | `open-case` | _(none)_ |
| `Consent Started` | `register` | `tier` |
| `Consent Completed` | `confirm-consent` | `tier` |
| `Consent Expired` | `deletion-cron` | `tier` |

### 6.4 Admin dashboard metrics

All metrics refetch every 30s via `refetchInterval` in TanStack Query.

**Real-time section**
- Live visitors right now → `GET https://plausible.io/api/v1/stats/realtime/visitors`
- Top pages last 30 min → Plausible Real-time dashboard iframe embed

**Publication funnel (last 30 days)**
- Total submissions, approval rate, rejection rate → Plausible Goals API
- Top document types → `analytics_events` grouped by `meta.type` where `event_type = approval`
- Top 10 downloads → `publications` sorted by `download_count` DESC, `status = approved`

**Onboarding & consent funnel (GDPR/COPPA compliance reporting)**

| Metric | Source | Notes |
|---|---|---|
| Registrations started | `analytics_events: consent_started` | |
| Awaiting guardian confirmation | `users: account_status = pending_parental` | High number = email delivery problem |
| Guardian confirmations completed | `analytics_events: consent_completed` | |
| Consent completion rate | `completed / started × 100` | Target > 70% |
| Tokens expired | `analytics_events: consent_expired` | Each = one deleted account |
| Tier breakdown | `users` grouped by `consent_tier` | Pie: coppa / gdpr_eu / gdpr_es / general |
| Active accounts | `users: account_status = active` | |
| Pending deletion | `users: account_status = deletion_requested` | Monitor → should trend 0 after cron |

**Cases section**
- Open cases by priority → `cases` grouped by `priority` where `status = open`
- Avg resolution time → `avg(resolved_at - opened_at)` last 30 days
- Cases opened this week

**Geography & devices (Plausible Stats API)**
- Top 10 countries → `GET /api/v1/stats/breakdown?property=visit:country&limit=10`
- Devices → `GET /api/v1/stats/breakdown?property=visit:device&limit=5`

---

## 7. Email — Appwrite built-in SMTP

### 7.1 Critical limitation

> ⚠️ Appwrite Cloud's built-in SMTP **cannot** send custom HTML emails or template-based transactional emails. It only sends fixed system emails: email verification, password recovery, magic URL, team invitations. There is no API to send arbitrary emails using built-in SMTP.

| Email type | Built-in SMTP? | Solution |
|---|---|---|
| Email address verification | ✅ YES | `account.createVerification(url)` |
| Password reset | ✅ YES | `account.createRecovery(email, url)` |
| Guardian consent request | ❌ NO | In-session flow (§3.3) |
| Welcome / account active | ❌ NO | In-app `notifications` collection |
| Publication approved/rejected | ❌ NO | In-app `notifications` collection |
| Case opened / reply | ❌ NO | Appwrite Realtime + in-app notifications |

### 7.2 In-app notification system (day one)

All events write to the `notifications` collection. The header bell uses Appwrite Realtime for a live unread count. Clicking navigates to the linked route and marks as read.

### 7.3 Migration to Resend (when ready)

When ORP needs proper transactional email (recommended before > ~100 users):

1. Create Resend account. Free tier: 3,000 emails/month, 100/day.
2. Verify `openrockets.com` in Resend (SPF, DKIM, DMARC DNS records).
3. Add `RESEND_API_KEY` to Appwrite environment variables.
4. Create Appwrite Function: `email-dispatch` (TypeScript).
5. Add `RESEND_API_KEY` to `setup.mjs` bootstrap (§8.4) so it's included in generated `.env.local`.

```typescript
// email-dispatch/src/main.ts
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function({ req, res }) {
  const { template, to, data } = JSON.parse(req.body);

  const templates = {
    guardian_consent_request: (d: any) => ({
      subject: "[Action required] Please confirm your child's Open Rockets account",
      html: guardianConsentTemplate(d),
    }),
    // … other templates
  };

  const { subject, html } = templates[template](data);
  await resend.emails.send({ from: "noreply@openrockets.com", to, subject, html });
  return res.json({ sent: true });
}
```

No data model changes are required. `consent_records.method` already supports `"email_link"`.

---

## 8. Migration System

The migration system creates the entire Appwrite database schema from scratch by running ordered migration files. It tracks which migrations have been applied in a `migrations` collection in Appwrite itself.

### 8.1 How it works

- Each migration is a `.mjs` file in `migrations/migrations/`.
- Files are sorted alphabetically → use numeric prefixes (`001_`, `002_`…).
- Each file exports `id`, optionally `description`, and an `up(client)` function.
- The runner (`migrate.mjs`) maintains a `migrations` collection in Appwrite and skips already-applied migrations.
- Running the runner twice is safe — idempotent by design.

### 8.2 Migration runner (`migrations/migrate.mjs`)

The full runner is reproduced below. It is self-contained and requires no dependencies beyond Node.js built-ins.

```javascript
// migrations/migrate.mjs
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const MIGRATIONS_COLLECTION_ID = "migrations";
const MIGRATION_ID_PATTERN = /^[a-zA-Z0-9._-]{1,36}$/;

function readConfig() {
  const endpoint = (process.env.APPWRITE_ENDPOINT || "").replace(/\/+$/, "");
  const projectId = process.env.APPWRITE_PROJECT_ID || "";
  const apiKey = process.env.APPWRITE_API_KEY || "";
  const databaseId = process.env.APPWRITE_DATABASE_ID || "";
  return { endpoint, projectId, apiKey, databaseId };
}

function getMissingConfig(config) {
  const missing = [];
  if (!config.endpoint) missing.push("APPWRITE_ENDPOINT");
  if (!config.projectId) missing.push("APPWRITE_PROJECT_ID");
  if (!config.apiKey) missing.push("APPWRITE_API_KEY");
  if (!config.databaseId) missing.push("APPWRITE_DATABASE_ID");
  return missing;
}

function createClient(config) {
  const headers = {
    "Content-Type": "application/json",
    "X-Appwrite-Project": config.projectId,
    "X-Appwrite-Key": config.apiKey,
  };

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function request(method, resourcePath, body, options = {}) {
    const response = await fetch(`${config.endpoint}${resourcePath}`, {
      method, headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    let data = null;
    if (text) { try { data = JSON.parse(text); } catch { data = text; } }
    const allowStatuses = options.allowStatuses || [];
    if (allowStatuses.includes(response.status)) return { status: response.status, data };
    if (!response.ok) throw new Error(`${method} ${resourcePath} failed (${response.status}): ${JSON.stringify(data)}`);
    return { status: response.status, data };
  }

  async function waitForAttributeAvailable(collectionId, attributeKey) {
    const timeout = 60_000, poll = 700, start = Date.now();
    while (Date.now() - start < timeout) {
      const result = await request("GET",
        `/databases/${config.databaseId}/collections/${collectionId}/attributes/${attributeKey}`,
        undefined, { allowStatuses: [404] }
      );
      if (result.status === 404) { await sleep(poll); continue; }
      const status = result.data?.status ?? "";
      if (status === "available") return;
      if (status === "failed") throw new Error(`Attribute ${collectionId}.${attributeKey} failed`);
      await sleep(poll);
    }
    throw new Error(`Timed out waiting for ${collectionId}.${attributeKey}`);
  }

  async function ensureCollection(collection) {
    const result = await request("POST",
      `/databases/${config.databaseId}/collections`,
      { collectionId: collection.id, name: collection.name, permissions: [], documentSecurity: false, enabled: true },
      { allowStatuses: [409] }
    );
    console.log(result.status === 409
      ? `[migrate] Collection ${collection.id} already exists`
      : `[migrate] Created collection ${collection.id}`);
  }

  async function ensureAttribute(collectionId, attribute) {
    const result = await request("POST",
      `/databases/${config.databaseId}/collections/${collectionId}/attributes/${attribute.type}`,
      attribute.payload,
      { allowStatuses: [409] }
    );
    console.log(result.status === 409
      ? `[migrate] Attribute ${collectionId}.${attribute.payload.key} already exists`
      : `[migrate] Created attribute ${collectionId}.${attribute.payload.key}`);
    await waitForAttributeAvailable(collectionId, attribute.payload.key);
  }

  async function ensureIndex(collectionId, index) {
    const result = await request("POST",
      `/databases/${config.databaseId}/collections/${collectionId}/indexes`,
      index, { allowStatuses: [409] }
    );
    console.log(result.status === 409
      ? `[migrate] Index ${collectionId}.${index.key} already exists`
      : `[migrate] Created index ${collectionId}.${index.key}`);
  }

  async function getDocument(collectionId, documentId) {
    const result = await request("GET",
      `/databases/${config.databaseId}/collections/${collectionId}/documents/${documentId}`,
      undefined, { allowStatuses: [404] }
    );
    return result.status === 404 ? null : result.data;
  }

  async function createDocument(collectionId, documentId, data) {
    return request("POST",
      `/databases/${config.databaseId}/collections/${collectionId}/documents`,
      { documentId, data, permissions: [] }, { allowStatuses: [409] }
    );
  }

  return { ensureCollection, ensureAttribute, ensureIndex, getDocument, createDocument };
}

async function ensureMigrationsCollection(client) {
  await client.ensureCollection({ id: MIGRATIONS_COLLECTION_ID, name: "Migrations" });
  await client.ensureAttribute(MIGRATIONS_COLLECTION_ID, { type: "string", payload: { key: "name", size: 255, required: true } });
  await client.ensureAttribute(MIGRATIONS_COLLECTION_ID, { type: "string", payload: { key: "description", size: 1000, required: false } });
  await client.ensureAttribute(MIGRATIONS_COLLECTION_ID, { type: "datetime", payload: { key: "appliedAt", required: true } });
  await client.ensureIndex(MIGRATIONS_COLLECTION_ID, { key: "migrations_name_unique", type: "unique", attributes: ["name"] });
  await client.ensureIndex(MIGRATIONS_COLLECTION_ID, { key: "migrations_applied_at", type: "key", attributes: ["appliedAt"], orders: ["ASC"] });
}

async function loadMigrationFiles() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const migrationsDir = path.join(currentDir, "migrations");
  if (!fs.existsSync(migrationsDir)) return [];

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".mjs")).sort();
  const migrations = [];

  for (const filename of files) {
    const mod = await import(pathToFileURL(path.join(migrationsDir, filename)).href);
    if (!mod.id || typeof mod.up !== "function")
      throw new Error(`Invalid migration module ${filename}. Expected exports: id, up(ctx).`);
    if (!MIGRATION_ID_PATTERN.test(mod.id))
      throw new Error(`Invalid migration id "${mod.id}" in ${filename}.`);
    migrations.push({ id: mod.id, description: mod.description || "", up: mod.up });
  }
  return migrations;
}

export async function runMigrations(options = {}) {
  const strict = options.strict === true || process.argv.includes("--strict") || process.env.APPWRITE_MIGRATIONS_STRICT === "true";
  const config = readConfig();
  const missing = getMissingConfig(config);

  if (missing.length > 0) {
    const message = `[migrate] Missing env vars: ${missing.join(", ")}`;
    if (strict) throw new Error(`${message}. Strict mode enabled.`);
    console.log(`${message}. Skipping.`);
    return { skipped: true };
  }

  const client = createClient(config);
  await ensureMigrationsCollection(client);
  const migrations = await loadMigrationFiles();

  for (const migration of migrations) {
    const already = await client.getDocument(MIGRATIONS_COLLECTION_ID, migration.id);
    if (already) { console.log(`[migrate] Skipping ${migration.id}`); continue; }
    console.log(`[migrate] Applying ${migration.id}`);
    await migration.up(client);
    const r = await client.createDocument(MIGRATIONS_COLLECTION_ID, migration.id, {
      name: migration.id, description: migration.description, appliedAt: new Date().toISOString(),
    });
    console.log(r.status === 409 ? `[migrate] Already recorded ${migration.id}` : `[migrate] Applied ${migration.id}`);
  }

  console.log("[migrate] Migration process completed");
  return { skipped: false };
}

const isDirectExecution = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectExecution) {
  runMigrations().catch(e => { console.error(e); process.exit(1); });
}
```

### 8.3 Migration file format

```javascript
// migrations/migrations/001_create_users.mjs
export const id = "001_create_users";
export const description = "Create users collection with all attributes and indexes";

export async function up(client) {
  await client.ensureCollection({ id: "users", name: "Users" });

  // Attributes — order matters: ensureAttribute awaits availability before continuing
  await client.ensureAttribute("users", { type: "string",   payload: { key: "user_id",            size: 36,   required: true  } });
  await client.ensureAttribute("users", { type: "string",   payload: { key: "display_name",       size: 100,  required: true  } });
  await client.ensureAttribute("users", { type: "string",   payload: { key: "role",               size: 20,   required: true  } });
  await client.ensureAttribute("users", { type: "string",   payload: { key: "consent_tier",       size: 20,   required: true  } });
  await client.ensureAttribute("users", { type: "string",   payload: { key: "account_status",     size: 30,   required: true  } });
  await client.ensureAttribute("users", { type: "string",   payload: { key: "guardian_email_enc", size: 500,  required: false } });
  await client.ensureAttribute("users", { type: "datetime", payload: { key: "guardian_consent_at",             required: false } });
  await client.ensureAttribute("users", { type: "datetime", payload: { key: "deletion_requested_at",           required: false } });
  await client.ensureAttribute("users", { type: "string",   payload: { key: "country_code",       size: 2,    required: false } });
  await client.ensureAttribute("users", { type: "datetime", payload: { key: "created_at",                      required: true  } });

  // Indexes
  await client.ensureIndex("users", { key: "users_user_id_unique",   type: "unique", attributes: ["user_id"] });
  await client.ensureIndex("users", { key: "users_account_status",   type: "key",    attributes: ["account_status"] });
  await client.ensureIndex("users", { key: "users_consent_tier",     type: "key",    attributes: ["consent_tier"] });
}
```

```javascript
// migrations/migrations/002_create_consent_records.mjs
export const id = "002_create_consent_records";
export const description = "Create consent_records append-only audit collection";

export async function up(client) {
  await client.ensureCollection({ id: "consent_records", name: "Consent Records" });
  await client.ensureAttribute("consent_records", { type: "string",   payload: { key: "user_id",              size: 36,   required: true  } });
  await client.ensureAttribute("consent_records", { type: "string",   payload: { key: "consent_type",         size: 40,   required: true  } });
  await client.ensureAttribute("consent_records", { type: "string",   payload: { key: "consent_text_version", size: 50,   required: true  } });
  await client.ensureAttribute("consent_records", { type: "datetime", payload: { key: "consented_at",                      required: true  } });
  await client.ensureAttribute("consent_records", { type: "string",   payload: { key: "ip_hash",              size: 64,   required: false } });
  await client.ensureAttribute("consent_records", { type: "string",   payload: { key: "guardian_id",          size: 36,   required: false } });
  await client.ensureAttribute("consent_records", { type: "string",   payload: { key: "method",               size: 20,   required: true  } });
  await client.ensureIndex("consent_records", { key: "consent_by_user", type: "key", attributes: ["user_id"] });
  await client.ensureIndex("consent_records", { key: "consent_at",      type: "key", attributes: ["consented_at"], orders: ["ASC"] });
}
```

### 8.4 One-command bootstrap (`setup.mjs`)

This is the key addition to the migration system: given only an API key and endpoint, `setup.mjs` creates the Appwrite project database, generates a new API key scoped to the project, creates all collections by running migrations, and writes a `.env.local` with everything pre-filled.

```javascript
// migrations/setup.mjs
// Usage: node setup.mjs --endpoint https://cloud.appwrite.io/v1 --api-key <key>
// What it does:
//   1. Reads --endpoint and --api-key from CLI args (or APPWRITE_ENDPOINT / APPWRITE_API_KEY env vars)
//   2. Creates the orp_db database if it doesn't exist
//   3. Generates a scoped API key for the project (so the master key is not needed after setup)
//   4. Runs all migrations (creates all collections + attributes + indexes)
//   5. Writes .env.local with all required variables pre-filled
//   6. Prints a summary

import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runMigrations } from "./migrate.mjs";

const DATABASE_ID = "orp_db";
const DATABASE_NAME = "Open Rockets Press";

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : null;
  };
  return {
    endpoint: get("--endpoint") || process.env.APPWRITE_ENDPOINT || "",
    apiKey:   get("--api-key")  || process.env.APPWRITE_API_KEY  || "",
    projectId: get("--project") || process.env.APPWRITE_PROJECT_ID || "",
  };
}

async function appwriteRequest(endpoint, apiKey, projectId, method, path, body) {
  const res = await fetch(`${endpoint}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Key": apiKey,
      ...(projectId ? { "X-Appwrite-Project": projectId } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

async function ensureDatabase(endpoint, apiKey, projectId) {
  // Try to get it first
  const get = await appwriteRequest(endpoint, apiKey, projectId, "GET", `/databases/${DATABASE_ID}`);
  if (get.ok) {
    console.log(`[setup] Database ${DATABASE_ID} already exists`);
    return;
  }
  const create = await appwriteRequest(endpoint, apiKey, projectId, "POST", "/databases", {
    databaseId: DATABASE_ID,
    name: DATABASE_NAME,
  });
  if (!create.ok) throw new Error(`Failed to create database: ${JSON.stringify(create.data)}`);
  console.log(`[setup] Created database ${DATABASE_ID}`);
}

async function getOrCreateScopedApiKey(endpoint, apiKey, projectId) {
  // Create a scoped API key for day-to-day use (less privileged than master key)
  const res = await appwriteRequest(endpoint, apiKey, projectId, "POST", "/projects/" + projectId + "/keys", {
    name: "ORP Server Key",
    scopes: [
      "databases.read", "databases.write",
      "collections.read", "collections.write",
      "documents.read", "documents.write",
      "files.read", "files.write",
      "functions.read", "functions.write",
      "users.read", "users.write",
      "teams.read", "teams.write",
    ],
  });
  if (!res.ok) {
    console.warn(`[setup] Could not create scoped API key (may need console access). Using provided key.`);
    return apiKey;
  }
  console.log(`[setup] Created scoped API key: ${res.data.name}`);
  return res.data.secret;
}

async function generateConsentSecret() {
  // 32 random bytes as hex
  const { randomBytes } = await import("node:crypto");
  return randomBytes(32).toString("hex");
}

function writeEnvFile(vars) {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(currentDir, "..");
  const envPath = path.join(rootDir, ".env.local");

  const lines = [
    "# Auto-generated by migrations/setup.mjs",
    "# Do not commit this file to version control",
    "",
    ...Object.entries(vars).map(([k, v]) => `${k}=${v}`),
    "",
  ];

  fs.writeFileSync(envPath, lines.join("\n"), "utf8");
  console.log(`[setup] Written ${envPath}`);
}

async function main() {
  const { endpoint, apiKey, projectId } = parseArgs();

  if (!endpoint || !apiKey || !projectId) {
    console.error(`
Usage: node setup.mjs --endpoint <url> --api-key <key> --project <project_id>

Or set environment variables:
  APPWRITE_ENDPOINT, APPWRITE_API_KEY, APPWRITE_PROJECT_ID

Example:
  node setup.mjs \\
    --endpoint https://cloud.appwrite.io/v1 \\
    --api-key eyJhbGciOi... \\
    --project 6612abc123
`);
    process.exit(1);
  }

  const cleanEndpoint = endpoint.replace(/\/+$/, "");
  console.log(`[setup] Starting ORP bootstrap for project ${projectId}`);

  // Step 1: Ensure database
  await ensureDatabase(cleanEndpoint, apiKey, projectId);

  // Step 2: Generate scoped API key for day-to-day use
  const scopedKey = await getOrCreateScopedApiKey(cleanEndpoint, apiKey, projectId);

  // Step 3: Set env and run migrations
  process.env.APPWRITE_ENDPOINT = cleanEndpoint;
  process.env.APPWRITE_PROJECT_ID = projectId;
  process.env.APPWRITE_API_KEY = scopedKey;
  process.env.APPWRITE_DATABASE_ID = DATABASE_ID;

  await runMigrations({ strict: true });

  // Step 4: Generate consent secret
  const consentSecret = await generateConsentSecret();

  // Step 5: Write .env.local
  writeEnvFile({
    APPWRITE_ENDPOINT: cleanEndpoint,
    APPWRITE_PROJECT_ID: projectId,
    APPWRITE_API_KEY: scopedKey,
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APP_BASE_URL: "https://press.openrockets.com",
    CONSENT_TOKEN_SECRET: consentSecret,
    PLAUSIBLE_DOMAIN: "press.openrockets.com",
    "PLAUSIBLE_API_KEY": "# TODO: add your Plausible API key",
    "# RESEND_API_KEY": "# TODO: add when ready for custom emails (see Part 7)",
  });

  console.log(`
[setup] ✓ Bootstrap complete.

Next steps:
  1. Review .env.local and fill in TODO values
  2. Copy .env.local values to Appwrite Sites + Functions environment variables
  3. Do NOT commit .env.local to version control
  4. Start development: bun run dev
`);
}

main().catch(e => { console.error(e); process.exit(1); });
```

### 8.5 Running migrations

```bash
# First-time setup (only needs endpoint + master API key + project ID):
node migrations/setup.mjs \
  --endpoint https://cloud.appwrite.io/v1 \
  --api-key eyJhbGciOi... \
  --project 6612abc123

# After setup, .env.local is generated. Subsequent runs:
node migrations/migrate.mjs

# With strict mode (CI/CD — fails if env vars are missing):
APPWRITE_MIGRATIONS_STRICT=true node migrations/migrate.mjs

# In CI/CD pipeline (GitHub Actions):
# Load .env.local or secrets, then:
node migrations/migrate.mjs --strict
```

### 8.6 Rules for writing migration files

1. **Never modify an existing migration file** that has been applied to any environment. Add a new migration instead.
2. **Always use `ensureCollection` / `ensureAttribute` / `ensureIndex`** — never raw Appwrite API calls in migration files. These are idempotent.
3. **One logical change per migration.** Adding a collection = one file. Adding an index to an existing collection = another file.
4. **IDs are permanent.** Once a collection ID or attribute key is in a migration, treat it as immutable.
5. **Test locally before pushing.** Run the migration against a local Appwrite instance or a staging project first.
6. **Enum values belong in `shared/types.ts`**, not hardcoded in migration files. Import them.

---

## 9. Technical Best Practices

### 9.1 TypeScript

```typescript
// ✅ Always define return types on Functions
async function getPublication(pubId: string): Promise<Publication> { … }

// ✅ Use discriminated unions for status types — exhaustive checks
type PublicationStatus = "draft" | "pending_review" | "approved" | "rejected" | "retracted";

function renderStatusBadge(status: PublicationStatus): string {
  switch (status) {
    case "draft": return "gray";
    case "pending_review": return "amber";
    case "approved": return "green";
    case "rejected": return "red";
    case "retracted": return "gray";
    // TypeScript will error if a case is missing — this is the point
  }
}

// ✅ Never use `any` — use `unknown` and narrow
function handleFunctionResponse(data: unknown) {
  if (typeof data === "object" && data !== null && "pub_id" in data) {
    return (data as { pub_id: string }).pub_id;
  }
  throw new Error("Unexpected response shape");
}

// ✅ Import types from shared/types.ts in both frontend and Functions
import type { Publication, ConsentTier, CaseStatus } from "./shared/types";
```

### 9.2 Appwrite Functions

```typescript
// ✅ Always validate the caller's identity at the top of every Function
export default async function({ req, res, log, error }) {
  // Parse JWT from header
  const jwt = req.headers["x-appwrite-user-jwt"];
  if (!jwt) return res.json({ error: "Unauthorized" }, 401);

  // Verify with Appwrite — this gives you the real user object
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setJWT(jwt);
  const account = new Account(client);
  const user = await account.get();

  // ✅ Check labels/roles before any data operation
  if (!user.labels.includes("moderator") && !user.labels.includes("admin")) {
    return res.json({ error: "Forbidden" }, 403);
  }
  // … proceed
}
```

```typescript
// ✅ Always catch and return structured errors
try {
  const result = await doWork();
  return res.json({ success: true, data: result });
} catch (e) {
  error(`[function-name] ${e.message}`);
  return res.json({ error: "Internal error", message: e.message }, 500);
}
```

### 9.3 TanStack Query patterns

```typescript
// ✅ Define all query keys in one place — queryKeys.ts
export const queryKeys = {
  publications: {
    all: ["publications"] as const,
    list: (filters: PublicationFilters) => ["publications", "list", filters] as const,
    detail: (pubId: string) => ["publications", "detail", pubId] as const,
  },
  home: {
    feed: (params: { q?: string; type?: string }) => ["home", "feed", params] as const,
  },
  cases: {
    all: ["cases"] as const,
    mine: () => ["cases", "mine"] as const,
    detail: (caseId: string) => ["cases", "detail", caseId] as const,
    messages: (caseId: string) => ["cases", "messages", caseId] as const,
  },
} as const;

// ✅ Use queryOptions for reusable definitions
export const publicationDetailQueryOptions = (pubId: string) => queryOptions({
  queryKey: queryKeys.publications.detail(pubId),
  queryFn: () => appwrite.getPublication(pubId),
  staleTime: 1000 * 60 * 5, // 5 minutes
});

export const homeFeedQueryOptions = (params: { q?: string; type?: string }) => queryOptions({
  queryKey: queryKeys.home.feed(params),
  queryFn: () => appwrite.getHomeFeed(params),
  staleTime: 1000 * 30,
});
```

### 9.4 Security

- **Never store DOB** beyond the registration session. Derive `consent_tier`, discard DOB.
- **Never log emails, names, or IDs** in Function `log()` calls. Log event types and success/failure only.
- **Rotate `CONSENT_TOKEN_SECRET`** if it is ever exposed. Existing pending tokens become invalid — affected users must re-register.
- **Rate limit all public Functions.** Maintain per-IP counters in a `rate_limits` Appwrite collection. Reject if > 10 calls/minute from the same IP.
- **Validate file types server-side** in `submit-publication`. Do not trust the client's `Content-Type`. Use `file-type` npm package to check the actual magic bytes.
- **Content-Security-Policy** in Appwrite Sites config:
  ```
  default-src 'self'; script-src 'self' plausible.io; connect-src 'self' cloud.appwrite.io plausible.io; img-src 'self' data:; style-src 'self' 'unsafe-inline';
  ```
- **Never use `documentSecurity: false`** on collections containing PII. Only the `analytics_events` and `publications` (approved only) collections should have public-ish access.

### 9.5 Error handling

```typescript
// ✅ Define a shared error type
export class ORPError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "ORPError";
  }
}

// Usage in Functions:
throw new ORPError("Publication not found", "PUB_NOT_FOUND", 404);
throw new ORPError("Guardian email required for this tier", "GUARDIAN_REQUIRED", 422);

// ✅ In React — use TanStack Query's error boundary integration
const { data, error } = useQuery(publicationDetailQueryOptions(pubId));
if (error instanceof ORPError && error.statusCode === 404) {
  return <NotFound />;
}
```

### 9.6 Performance

- **Prefetch on hover** for navigation links using TanStack Router's `preload` prop.
- **Paginate all lists.** Default page size: 20 items. Appwrite supports cursor-based pagination — use `Query.cursorAfter(lastDocumentId)`, never offset pagination.
- **Optimistic updates** for case message sending — show the message immediately, revert on error.
- **Memoize expensive computations** in the analytics dashboard with `useMemo`. Plausible API calls are slow.
- **Lazy load** the moderator panel and admin dashboard routes. They are large and not needed by contributors.

### 9.7 Appwrite-specific patterns

```typescript
// ✅ Use Query helpers — never build query strings manually
import { Query } from "appwrite";

const approvedPubs = await databases.listDocuments(ORP_DB, "publications", [
  Query.equal("status", "approved"),
  Query.orderDesc("published_at"),
  Query.limit(20),
  Query.cursorAfter(lastId), // cursor pagination
]);

// ✅ Use server-side Functions for writes that have business logic
// ❌ Never write directly to sensitive collections from the client
// Even if Appwrite permissions would allow it — route through Functions

// ✅ Batch related reads using Promise.all
const [publication, author, relatedCases] = await Promise.all([
  db.getDocument(ORP_DB, "publications", pubId),
  db.getDocument(ORP_DB, "users", authorId),
  db.listDocuments(ORP_DB, "cases", [Query.equal("related_pub_id", pubId)]),
]);
```

---

## 10. UX & UI Rules

> UX is the most important part of ORP. The primary users are young people — students and minors. Every interaction must feel safe, clear, and encouraging. A confusing UX at the registration step is not just bad design — it is a legal risk.

### 10.1 Core UX principles

1. **One task per screen.** Registration is split into clear steps. The consent form is its own screen, not a modal. The submission form is not the same screen as the submission confirmation.
2. **Progress is always visible.** Multi-step flows (registration, submission) show a progress indicator at the top. Users know how many steps remain.
3. **Errors are specific and actionable.** Never show "An error occurred." Show "Your display name must be between 3 and 100 characters." Place the error message adjacent to the field that caused it.
4. **Destructive actions require confirmation.** Deleting a draft, withdrawing a publication, closing a case — always require a second confirmation with a description of consequences.
5. **Loading states are always shown.** Every async action shows a spinner or skeleton. Users should never wonder if their click registered.
6. **Empty states are helpful.** An empty case inbox says "No open cases — if you need help, your moderator can open a case for you." Not just "No results."

### 10.2 Spacing and layout system

Use a consistent 4px base unit throughout. All spacing values are multiples of 4.

```
4px   — xs: internal icon padding
8px   — sm: gap between label and input
12px  — md: gap between form fields
16px  — lg: section padding, card padding
24px  — xl: gap between cards, section dividers
32px  — 2xl: major section gaps
48px  — 3xl: page top padding on desktop
64px  — 4xl: hero/landing section padding
```

**Specific Tailwind classes to use:**
```
App container:    max-w-4xl mx-auto px-4 sm:px-6 lg:px-8
Home container:   max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
Card:             rounded-xl border border-gray-200 p-6 shadow-sm
Form:             space-y-6 (between field groups), space-y-2 (label + input)
Section gap:      space-y-8 or space-y-12
Button group:     flex gap-3 mt-6
```

### 10.3 Typography hierarchy

```
Page title (h1):      text-2xl font-semibold tracking-tight text-gray-900
Section heading (h2): text-lg font-medium text-gray-900
Card title:           text-base font-medium text-gray-900
Body text:            text-sm text-gray-700 leading-relaxed
Helper text:          text-xs text-gray-500
Error text:           text-xs text-red-600
Label:                text-sm font-medium text-gray-700
```

**Rule:** Never use more than 3 font sizes on a single screen.

### 10.4 Form UX rules

- **Labels always above inputs**, never placeholder-only.
- **Helper text below inputs** (not tooltips) for fields that need explanation. e.g. below the display name field: "This is the name readers will see on your published work. You can use a pseudonym."
- **Inline validation** — validate on `blur`, not on every keystroke.
- **Required fields** — mark with `*` and include a legend: "Fields marked * are required."
- **Date of birth field** — use three separate dropdowns (Day / Month / Year) not a date input. Date inputs have inconsistent mobile UX.
- **Guardian email field** — only appears when `REQUIRES_GUARDIAN.has(consent_tier)` is true. Animate its appearance with a smooth height transition, not a jarring pop-in. Include a helper: "We will ask your parent or guardian to confirm your account before you can publish."
- **Submit button state** — disabled until all required fields are valid. Show a tooltip explaining why it's disabled if the user tries to click it.
- **Password field** — always include a show/hide toggle.

### 10.5 Consent form UX (critical)

The in-session consent form (Part 14) is legally and ethically the most important screen in the app.

- **Full white background, centred layout**, no distracting navigation. The guardian should feel they are reading a clear document, not filling a web form.
- **All three checkboxes must be individually ticked.** They are never pre-ticked. This is both a legal requirement and a UX signal of intentionality.
- **The Confirm button is visually disabled and unreachable** until all three checkboxes are ticked. Use `pointer-events-none opacity-50` + `aria-disabled`.
- **Include a clear header:** "Your child wants to publish on Open Rockets Press. Please read the following carefully."
- **Font size for the consent text:** minimum `text-base` (16px). Never smaller for legal text.
- **"Hand device to parent/guardian" instruction:** show this as a prominent card before the form appears, with the contributor's display name visible: "Please hand this device to [display name]'s parent or guardian."

### 10.6 Status badges

Use consistent colour coding throughout:

| Status | Colour class |
|---|---|
| `draft` | `bg-gray-100 text-gray-700` |
| `pending_review` | `bg-amber-100 text-amber-800` |
| `approved` | `bg-green-100 text-green-800` |
| `rejected` | `bg-red-100 text-red-800` |
| `retracted` | `bg-gray-200 text-gray-600` |
| `open` (case) | `bg-blue-100 text-blue-800` |
| `resolved` (case) | `bg-green-100 text-green-800` |
| `closed` (case) | `bg-gray-100 text-gray-600` |
| `pending_contributor` | `bg-amber-100 text-amber-800` |
| `pending_parental` (account) | `bg-orange-100 text-orange-800` |

### 10.7 Contributor experience — tone

- **Never use bureaucratic language.** "Your submission is pending review" not "Document awaiting moderation queue processing."
- **Celebrate approvals.** When a publication is approved, show a congratulations screen with the pub_id and a share button — not just a status update.
- **Rejections are kind.** The rejection notification shows the reason (written by the moderator) and a clear call to action: "Edit your submission" button.
- **Empty states have illustrations.** Not just text. A simple SVG illustration on the empty dashboard ("Ready to publish your first work?") makes the space feel welcoming.

### 10.8 Accessibility

- All form inputs have associated `<label>` elements (not just placeholders).
- Colour is never the only indicator of status — always pair with text or an icon.
- Focus states are visible — never `outline: none` without a replacement.
- Interactive elements have minimum 44×44px touch target.
- `aria-live="polite"` on notification count badge for screen readers.
- Test with keyboard navigation — every action must be reachable without a mouse.

### 10.9 Mobile-first

The majority of young contributors will use phones. Design mobile-first:
- Single column layout on all screens up to `md` breakpoint.
- The submission form PDF upload is a large tap target, not a small "choose file" link.
- The case thread uses `fixed bottom-0` input area on mobile so the text field doesn't jump behind the keyboard.
- Navigation is a bottom tab bar on mobile (Publications / Cases / Account), top sidebar on desktop.

### 10.10 Public home route constraints

- The public home route (`/`) must follow the exact structural rhythm of the current template in `index.html`: sticky header, horizontal categories rail, New Releases grid, central banner, Featured Contributions grid, compact legal footer.
- Home page styling remains intentionally clean and editorial: white base, neutral grays, subtle borders, minimal motion (`translateY` hover only on cards).
- Home cards always use a vertical `2:3` cover area and concise metadata rows (title, contributor, type/license).
- Use real publication data first; placeholders are allowed only when a section has fewer than 6 approved items.

---

## 11. Tests & Verifications

### 11.1 What must always be tested before a PR merges

Every pull request must pass:

- [x] TypeScript compilation with `--noEmit` (zero type errors)
- [x] All unit tests (`vitest run`)
- [ ] All integration tests that touch Appwrite (against a staging project)
- [x] End-to-end smoke tests for the current sprint's critical paths (Playwright)

### 11.2 Unit tests (Vitest)

```typescript
// src/lib/__tests__/consent.test.ts
import { describe, it, expect } from "vitest";
import { getConsentTier, REQUIRES_GUARDIAN } from "../consent";

describe("getConsentTier", () => {
  it("returns coppa for a 12-year-old US user", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 12);
    expect(getConsentTier(dob, "US")).toBe("coppa");
  });

  it("returns general for a 17-year-old US user", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 17);
    expect(getConsentTier(dob, "US")).toBe("general");
  });

  it("returns general for an 18-year-old US user", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 18);
    expect(getConsentTier(dob, "US")).toBe("general");
  });

  it("returns gdpr_eu for a 13-year-old Spanish user", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 13);
    expect(getConsentTier(dob, "ES")).toBe("gdpr_eu");
  });

  it("returns gdpr_es for a 15-year-old Spanish user", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 15);
    expect(getConsentTier(dob, "ES")).toBe("gdpr_es");
  });

  it("returns gdpr_eu for a 15-year-old French user", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 15);
    expect(getConsentTier(dob, "FR")).toBe("gdpr_eu");
  });

  it("returns general for a 15-year-old Brazilian user", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 15);
    expect(getConsentTier(dob, "BR")).toBe("general");
  });

  it("returns general for an adult Spanish user", () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 25);
    expect(getConsentTier(dob, "ES")).toBe("general");
  });

  it("REQUIRES_GUARDIAN contains coppa and gdpr_eu", () => {
    expect(REQUIRES_GUARDIAN.has("coppa")).toBe(true);
    expect(REQUIRES_GUARDIAN.has("gdpr_eu")).toBe(true);
    expect(REQUIRES_GUARDIAN.has("general")).toBe(false);
  });
});
```

### 11.3 Integration tests (Functions)

Test each Function by calling it with a real Appwrite staging project and verifying the DB state after. Use a separate `test_` database in the staging project.

```typescript
// functions/__tests__/register.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { callFunction } from "../test-helpers";
import { cleanupTestUser } from "../test-helpers";

describe("register Function", () => {
  const testEmail = `test-${Date.now()}@example.com`;

  afterEach(() => cleanupTestUser(testEmail));

  it("creates an active account for an adult user", async () => {
    const result = await callFunction("register", {
      display_name: "TestUser",
      email: testEmail,
      password: "TestPass123!",
      consent_tier: "general",
    });
    expect(result.status).toBe("active");
    // Verify users collection
    const userDoc = await getTestUserDoc(result.user_id);
    expect(userDoc.account_status).toBe("active");
    expect(userDoc.consent_tier).toBe("general");
  });

  it("creates a pending_parental account for a COPPA user", async () => {
    const result = await callFunction("register", {
      display_name: "YoungUser",
      email: testEmail,
      password: "TestPass123!",
      consent_tier: "coppa",
      guardian_email: "guardian@example.com",
    });
    expect(result.status).toBe("pending_parental");
    const userDoc = await getTestUserDoc(result.user_id);
    expect(userDoc.account_status).toBe("pending_parental");
  });

  it("rejects registration without guardian_email for coppa tier", async () => {
    const result = await callFunction("register", {
      display_name: "YoungUser",
      email: testEmail,
      password: "TestPass123!",
      consent_tier: "coppa",
      // guardian_email missing
    });
    expect(result.statusCode).toBe(422);
  });
});
```

### 11.4 End-to-end tests (Playwright)

```typescript
// e2e/registration.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Registration flow — adult user", () => {
  test("completes registration and reaches dashboard", async ({ page }) => {
    await page.goto("/register");
    await page.fill('[data-testid="display-name"]', "TestAuthor");
    await page.fill('[data-testid="email"]', `e2e-${Date.now()}@test.com`);
    await page.fill('[data-testid="password"]', "TestPass123!");
    // Set DOB to 20 years ago
    await page.selectOption('[data-testid="dob-day"]', "15");
    await page.selectOption('[data-testid="dob-month"]', "6");
    await page.selectOption('[data-testid="dob-year"]', String(new Date().getFullYear() - 20));
    await page.selectOption('[data-testid="country"]', "US");
    await page.click('[data-testid="register-submit"]');
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText("TestAuthor")).toBeVisible();
  });
});

test.describe("In-session guardian consent flow", () => {
  test("guardian completes consent and account becomes active", async ({ page }) => {
    // Register a minor (12-year-old, US)
    const { userId, token } = await registerMinorViaAPI();
    await page.goto(`/consent/in-session?token=${token}`);
    await expect(page.getByText("Please hand this device")).toBeVisible();
    await page.fill('[data-testid="guardian-email"]', "guardian@test.com");
    await page.check('[data-testid="consent-check-1"]');
    await page.check('[data-testid="consent-check-2"]');
    await page.check('[data-testid="consent-check-3"]');
    await expect(page.getByTestId("consent-submit")).toBeEnabled();
    await page.click('[data-testid="consent-submit"]');
    // Verify account is now active
    const userDoc = await getTestUserDoc(userId);
    expect(userDoc.account_status).toBe("active");
  });
});
```

```typescript
// e2e/home-template.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Public home template parity", () => {
  test("renders mandatory sections and navigation", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("textbox", { name: /search/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Publish" })).toBeVisible();
    await expect(page.getByRole("link", { name: "About" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();

    await expect(page.getByRole("heading", { name: "New Releases" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Featured Contributions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Empowering Youth Voices" })).toBeVisible();

    await expect(page.getByText("A legally recognized nonprofit ecosystem protecting minors' intellectual property.")).toBeVisible();
  });
});
```

### 11.5 Required verifications before every deploy

**Database integrity:**
- [ ] Run `node migrations/migrate.mjs` — must report "Migration process completed" with no errors.
- [ ] Verify all collections exist in Appwrite Console.
- [ ] Verify all indexes are in `available` state (not `processing` or `failed`).

**Appwrite permissions audit (run before every production deploy):**
- [ ] `users` collection — no public read. Verify in console.
- [ ] `consent_records` — no user read, write, or list. Server key only.
- [ ] `pub_files` bucket — no public access. No signed URLs exposed.
- [ ] `analytics_events` — no public read. Admin label only.

**Legal compliance checks:**
- [ ] Consent form page renders with all three checkboxes unchecked.
- [ ] Submit button is disabled until all three are checked.
- [ ] A `consent_record` document is created in the DB on consent completion.
- [ ] `guardian_email_enc` is encrypted (not plaintext) in the DB.
- [ ] Registration with `consent_tier: coppa` and no `guardian_email` returns 422.
- [ ] Registration with `consent_tier: gdpr_eu` and no `guardian_email` returns 422.
- [ ] Expired consent token results in account + auth user deletion (not just an error message).

**Homepage template parity checks:**
- [ ] Header remains sticky and includes both logo assets (`public/brand/271742354.png` and `public/brand/9283527.png`).
- [ ] Search input is visible at desktop widths and remains keyboard-accessible.
- [ ] Categories rail is horizontally scrollable on small screens.
- [ ] Exactly two publication shelves are visible: `New Releases` and `Featured Contributions`.
- [ ] Banner copy (`Empowering Youth Voices`) appears between the two shelves.
- [ ] Footer includes the nonprofit/legal commitment line.
- [ ] Card covers keep `aspect-[2/3]` on all breakpoints.

**Email (built-in SMTP):**
- [ ] Appwrite Auth email verification is sent on registration.
- [ ] Password reset email is sent.
- [ ] In-app `notifications` are created for all key events.

**Analytics:**
- [ ] Plausible is receiving pageviews (check Plausible real-time dashboard).
- [ ] Custom events appear in Plausible Goals (submit a test publication and verify "Publication Submitted" fires).
- [ ] `analytics_events` collection receives events (check Appwrite console).

**Security:**
- [ ] `CONSENT_TOKEN_SECRET` is set in all environments and not the default placeholder.
- [ ] `APPWRITE_API_KEY` is not present in any client-side bundle (check with `grep -r "APPWRITE_API_KEY" dist`).
- [ ] CSP headers are set on all pages.

### 11.6 Migration-specific tests

```javascript
// migrations/__tests__/migrate.test.mjs
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { runMigrations } from "../migrate.mjs";

describe("Migration runner", () => {
  it("skips gracefully when env vars are missing", async () => {
    // Clear env
    delete process.env.APPWRITE_API_KEY;
    const result = await runMigrations();
    assert.equal(result.skipped, true);
  });

  it("throws in strict mode when env vars are missing", async () => {
    delete process.env.APPWRITE_API_KEY;
    await assert.rejects(
      () => runMigrations({ strict: true }),
      /Missing env vars/
    );
  });

  it("is idempotent — running twice produces no errors", async () => {
    // Requires test Appwrite project
    // First run
    await runMigrations();
    // Second run — must not throw
    await runMigrations();
  });
});
```

---

## 12. Sprint Plan

### Sprint 0 — Pre-development (Week 0)
- Register `openrockets.com`. Configure DNS.
- Create Appwrite Cloud project.
- Create Plausible account. Add domain.
- Create GitHub repo. Connect to Appwrite Sites.
- Run `node migrations/setup.mjs` to bootstrap DB and generate `.env.local`.
- Review Privacy Policy (§13) and Parental Consent Form (§14) — legal review recommended.
- Finalise consent text version: `privacy-v1.0`.

### Sprint 1 — Auth & Age Gate (Weeks 1–2)
- Scaffold: Vite + React 19 + TanStack Router + TanStack Query + Tailwind.
- Public home route parity pass (exact template structure from `index.html` with static seeded data).
- Registration form with age gate (`getConsentTier`, country picker, guardian email field).
- Function: `register`.
- In-session guardian consent page (`/consent/in-session`).
- Function: `confirm-consent`.
- Login/logout. Route guards.
- In-app notification bell (Realtime).
- **Tests:** Unit tests for `getConsentTier`. E2E for adult registration. E2E for in-session consent. E2E for home template parity.

### Sprint 2 — Publications (Weeks 3–4)
- Contributor dashboard.
- Submission form (PDF upload, metadata, license).
- Function: `submit-publication`.
- Function: `generate-pub-id`.
- Moderator review panel.
- Function: `review-publication`.
- Function: `serve-pdf`.
- Public publication page (`/p/[pub_id]`).
- Public catalogue + home feed data wiring (`published_at`, `is_featured`, search by title/author/type).
- **Tests:** E2E submission → approval → public page. serve-pdf security test (unapproved pub returns 403). E2E featured/new releases ordering tests.

### Sprint 3 — Cases (Weeks 5–6)
- Moderator case creation panel.
- Function: `open-case`.
- Contributor case inbox.
- Case thread (Realtime).
- Function: `reply-case`.
- Moderator case management panel.
- Case detail (labels, related pub, related cases, resolve/close).
- Function: `resolve-case`.
- **Tests:** E2E moderator opens case → contributor replies → resolves. Verify contributor cannot create case.

### Sprint 4 — Analytics & Compliance (Weeks 7–8)
- Plausible script in `index.html`.
- Function: `track-event`.
- Admin analytics dashboard (all §6.4 metrics).
- Admin user management.
- DSAR request form (`/legal/data-request`).
- Function: `dsar-handler`.
- Function: `deletion-cron` (scheduled, 24h).
- Static pages: `/legal/privacy-policy`, `/legal/parental-consent-form`.
- **Tests:** Consent funnel metrics update correctly. Deletion cron removes all PII.

### Sprint 5 — Hardening (Weeks 9–10)
- Appwrite permissions audit (checklist §11.5).
- CSP headers.
- Rate limiting on all public Functions.
- Full E2E regression suite.
- Home page visual regression snapshots (desktop + mobile).
- Accessibility review (WCAG 2.1 AA).
- Mobile responsiveness review.
- Run all legal compliance checks (§11.5).
- Launch.

---

## 13. Privacy Policy

> Publish at: `https://press.openrockets.com/legal/privacy-policy`  
> Version: 1.0 — April 2025  
> Version every change. Notify users via in-app notification before material changes.

---

### PRIVACY POLICY
**Open Rockets Press — press.openrockets.com**  
*Last updated: April 2025 — Version 1.0*

#### Who we are

Open Rockets Press ("ORP", "we", "our") is a non-commercial document hosting and publication platform. It allows young creators — including students and minors — to publish books, research papers, magazines, and posters, and to protect their intellectual property with a permanent identifier and a licence of their choosing.

We are the data controller for all personal information processed through this platform.

Contact for privacy matters: **privacy@openrockets.com**

#### What this policy covers

This Privacy Policy explains what personal data we collect, why we collect it, how we protect it, how long we keep it, and what rights you and your parent or guardian have over it. It applies to everyone who uses press.openrockets.com.

#### Who we collect data from

We collect data from contributors (people who register and submit work), parents or legal guardians (who provide consent for younger contributors), and visitors to our public catalogue (anonymously — no personal data collected from public browsing).

We do not collect personal data from children under 13 without verifiable parental or guardian consent. If you are a parent and believe your child under 13 has created an account without your knowledge, contact privacy@openrockets.com immediately.

#### What data we collect and why

**Account data**
- Email address — to send service notifications.
- Display name — a pseudonym of your choosing, shown publicly on your published work. We do not collect or require your real name.
- Password — stored as a one-way cryptographic hash. We never see your actual password.
- Age range — derived from your date of birth at registration. Your date of birth is not stored after registration.
- Country — derived from your IP address at registration. Not stored beyond this calculation.

**Guardian data**
- Guardian email address — collected when parental consent is required. Used only to send service notifications. Stored in encrypted form. Never publicly visible and never shared with third parties.

**Published content**
- Files you submit (PDFs, images), title, abstract, tags, submission and publication dates — published under the licence you choose.

**Support communications**
- Messages with ORP moderation staff via the Cases system. Visible only to you and ORP staff.

**Anonymous analytics**
- Anonymised aggregate data (page views, country, device type) via Plausible Analytics. Plausible collects no cookies, no personal identifiers, and no cross-site tracking. No consent banner required.

#### What we do NOT collect

Real names, home addresses, phone numbers, photos or videos of users, social media profiles, biometric data, behavioural profiles, geolocation, or anything beyond what is listed above.

#### Legal basis for processing

- Contract performance (GDPR Art. 6(1)(b)): to provide the ORP service.
- Legal obligation (GDPR Art. 6(1)(c)): to comply with COPPA and to maintain consent records.
- Legitimate interests (GDPR Art. 6(1)(f)): to prevent fraud, maintain security, and produce anonymous statistics.

For contributors under 16 (under 14 in Spain), processing is based on verifiable parental consent (GDPR Art. 6(1)(a) and Art. 8).

#### Data retention

| Data | Retention | Reason |
|---|---|---|
| Account data | Until deletion | Required for service |
| Approved publications | Indefinitely, or until retraction | Core platform purpose |
| Rejected submission files | Deleted 30 days after rejection | Not needed |
| Rejection metadata | 12 months | Moderation audit |
| Consent records | Account lifetime + 3 years | Legal compliance |
| Guardian email | Until linked account deleted | Service notifications |
| Case messages | Account lifetime + 12 months | Moderation audit |
| Activity logs | 90 days, then anonymised | Security |

#### Who we share data with

We do not sell, rent, or share personal data with advertisers or data brokers. We share only with:

| Sub-processor | Purpose | Location |
|---|---|---|
| Appwrite Cloud (DigitalOcean) | Database, storage, authentication | EU (Frankfurt) |
| Plausible Analytics | Anonymous aggregate analytics | EU |

#### No advertising, ever

ORP does not display advertisements. We do not use your data or your child's data for advertising, profiling, or behavioural tracking. This is a core commitment.

#### Your rights

Under GDPR you have the right to: access your data; correct inaccurate data; delete your account and data; receive data in portable format; object to processing; withdraw consent at any time.

To exercise rights: **privacy@openrockets.com** — we respond within 30 days.

EU residents may also lodge a complaint with their national supervisory authority. In Spain: AEPD (aepd.es).

#### Children's privacy (COPPA — United States)

For US users under 13, we comply with COPPA. We do not collect data from children under 13 without verifiable parental consent. Parents may review, correct, or delete their child's data at any time.

#### Changes

We notify registered users via in-app notification before material changes. The version above reflects the current version.

---

## 14. Parental Consent Form

> Displayed at: `https://press.openrockets.com/consent/in-session`  
> Version: 1.0 — April 2025 (must match `consent_text_version` in `consent_records`)

---

### PARENTAL / GUARDIAN CONSENT FORM
**Open Rockets Press — press.openrockets.com**  
*Version 1.0 — April 2025*

#### What is Open Rockets Press?

Open Rockets Press (ORP) is a safe, non-commercial platform where young creators publish their work — books, research papers, magazines, and posters. We protect their intellectual property with a permanent identifier and a licence they choose.

We are not a social network. Contributors can only communicate with ORP moderation staff. They cannot contact other users.

#### Why are you seeing this form?

The person using this device has registered an account on Open Rockets Press. Because they are under the minimum age for independent digital consent, your authorisation as their parent or legal guardian is required before the account can be used.

#### What data we collect from your child

We collect only what is strictly necessary:

- Display name — a pseudonym they chose (not their real name).
- Email address — for service notifications only.
- Documents they submit for publication.
- Messages with ORP moderation staff, if a support case is opened.

We do NOT collect: real name, home address, phone number, date of birth, photos, videos, social media profiles, location data, or any behavioural data.

#### How we use this data

- To create and manage the account.
- To publish submitted documents.
- To send you and your child notifications about publications and moderation.
- We never use this data for advertising. We never share it with third parties for commercial purposes.

#### Your rights

- Request a copy of all data held about your child: privacy@openrockets.com
- Request correction or deletion at any time.
- Withdraw consent at any time → account suspended within 24 hours.
- Published works anonymised or removed upon request.
- Full Privacy Policy: https://press.openrockets.com/legal/privacy-policy

#### If you do not give consent

The registration will be cancelled immediately and all data deleted. Nothing is retained.

---

### Declaration *(rendered as interactive form — implementation note below)*

```
[ ] I confirm that I am the parent or legal guardian of the person
    registering on this device.

[ ] I have read and understood this consent form and the Privacy Policy.

[ ] I give my consent for Open Rockets Press to create and operate
    an account for my child, and to process the data described above
    solely to provide the service.

Guardian's email address: _________________________________

[ CONFIRM AND ACTIVATE ACCOUNT ]
```

> **Implementation rules for Copilot:**
> - The three checkboxes are **never** pre-ticked. Use `defaultChecked={false}`.
> - The Confirm button is disabled (`aria-disabled`, `pointer-events-none`, `opacity-50`) until all three boxes are checked AND `guardian_email` is non-empty and valid.
> - On submit: call `confirm-consent` Function with `{ token, guardian_email }`.
> - The Function stores: `{ user_id, consent_type: "parental_confirm", method: "in_session", consent_text_version: "privacy-v1.0", consented_at: now(), guardian_email_enc: encrypt(guardianEmail), ip_hash: sha256(ip + dailySalt) }`.
> - Show the contributor's display name prominently at the top: *"[Display Name] wants to publish on Open Rockets Press."*
> - Show a "Hand device to parent/guardian" instruction card before the form content, with the contributor's display name visible.

---

## 15. Home Screen Blueprint (Template-Locked)

> Canonical visual reference: `index.html`. This file is the baseline contract for the first production home route.

### 15.1 Non-negotiable structure

The route `/` must preserve this order exactly:

1. Sticky header (logo lockup, search, primary nav).
2. Horizontal categories rail.
3. New Releases shelf.
4. Divider.
5. Banner block (Empowering Youth Voices).
6. Featured Contributions shelf.
7. Legal/nonprofit footer.

Do not insert extra hero carousels, modal popups, or promotional banners before launch. Keep the editorial catalog look identical in rhythm to the template.

### 15.2 Component map (React implementation)

```text
src/routes/index.tsx
src/components/home/HomeHeader.tsx
src/components/home/HomeCategoriesRail.tsx
src/components/home/HomeShelf.tsx
src/components/home/PublicationCard.tsx
src/components/home/HomeBanner.tsx
src/components/home/HomeFooter.tsx
```

Component responsibilities:

- `HomeHeader`: dual-logo brand mark, search input, desktop nav links.
- `HomeCategoriesRail`: type/category shortcuts with horizontal overflow.
- `HomeShelf`: reusable shelf wrapper (`title`, `items`, `seeMoreHref`).
- `PublicationCard`: cover (2:3), clamped title, author line, meta line.
- `HomeBanner`: mission statement block.
- `HomeFooter`: legal and nonprofit copy.

### 15.3 Data contract and query rules

Use one home feed endpoint/function (`get-home-feed`) that returns:

```ts
type HomeFeedResponse = {
  newReleases: PublicationCardDTO[];
  featuredContributions: PublicationCardDTO[];
  availableTypes: string[];
};
```

Query definitions:

- New Releases:
  - `status = approved`
  - ordered by `published_at DESC`
  - limit 12
- Featured Contributions:
  - `status = approved`
  - `is_featured = true`
  - ordered by `featured_rank ASC`, then `published_at DESC`
  - limit 12

Search behavior:

- 300ms debounce.
- Case-insensitive partial match against `title`, `author_display_name`, and `tags`.
- If search is non-empty, both shelves reflect filtered results while preserving their ordering rules.

### 15.4 Visual and interaction rules

- Keep background white (`bg-white`) with gray text hierarchy (`text-gray-*`) as in template.
- Keep card hover subtle (`translateY(-4px)` equivalent).
- Preserve card density: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6`.
- Covers always use `aspect-[2/3]`.
- Show skeleton cards while loading; keep shelf height stable to prevent layout jump.
- If fewer than 6 items exist in a shelf, render placeholders with explicit "Coming soon" style copy.

### 15.5 Accessibility and responsive behavior

- Search input has an explicit label (screen-reader only label is acceptable).
- Header nav collapses at `< md`; replace with an accessible menu trigger.
- Categories rail remains keyboard-navigable and horizontally scrollable on touch devices.
- Card titles use line clamping but full title is exposed via `title` attribute.
- Footer text contrast must pass WCAG AA.

### 15.6 Required test IDs

Add stable selectors for QA and Playwright:

- `home-header`
- `home-search-input`
- `home-categories-rail`
- `home-shelf-new-releases`
- `home-shelf-featured`
- `home-banner`
- `home-footer`
- `publication-card`

### 15.7 Definition of done (home route)

- [ ] Route `/` matches template structure and copy blocks.
- [ ] Two shelves render live Appwrite-backed data.
- [ ] Search and category filtering work on desktop and mobile.
- [ ] Logos render with correct sizing and alt text.
- [ ] Lighthouse Performance >= 90 on home route (mobile profile).
- [ ] Lighthouse Accessibility >= 95 on home route.
- [x] Playwright parity test passes locally (CI parity-ready).
- [ ] Visual regression snapshots approved for desktop and mobile.

*End of document — Open Rockets Press Implementation Plan v3.0*