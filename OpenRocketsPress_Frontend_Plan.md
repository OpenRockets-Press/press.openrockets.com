# Open Rockets Press — Complete Frontend UI & UX Implementation Plan
### Next.js / React · Production-Grade · 45 Development Phases

---

> **How to use this document:** Every section is a specification. Hand each phase to your developer (or AI assistant) as a self-contained unit. Each phase builds on the previous one. Nothing is vague — every element, spacing value, color token, interaction, and copy string is defined. Read the entire document once before beginning Phase 1.

---

## TABLE OF CONTENTS

1. [Product Vision & Design Philosophy](#1-product-vision--design-philosophy)
2. [Global Design System](#2-global-design-system)
   - 2.1 Color Tokens
   - 2.2 Typography System
   - 2.3 Spacing Scale
   - 2.4 Border Radius, Shadows, Motion
   - 2.5 Icon System
   - 2.6 Division Identity System
3. [Open Rockets Licenses — Visual Identity](#3-open-rockets-licenses--visual-identity)
4. [Site Architecture & Routing](#4-site-architecture--routing)
5. [Component Library — Global Elements](#5-component-library--global-elements)
   - 5.1 Navigation Bar (Public)
   - 5.2 Contributor Workspace Sidebar
   - 5.3 Footer
   - 5.4 Artifact Card (All Three Types)
   - 5.5 License Badge
   - 5.6 Star Rating Widget
   - 5.7 Search Bar
   - 5.8 Skeleton Loaders
   - 5.9 Toast / Notification System
   - 5.10 Modal System
6. [Public Pages](#6-public-pages)
   - 6.1 Homepage
   - 6.2 Browse / Catalog Page
   - 6.3 Category Pages
   - 6.4 Artifact Detail Page — Standard (Division 1)
   - 6.5 Artifact Detail Page — 3D (Division 2)
   - 6.6 Artifact Detail Page — Code & Digital (Division 3)
   - 6.7 Search Results Page
   - 6.8 Contributor Profile / Author Page
   - 6.9 License Information Pages (×4)
   - 6.10 About Page
7. [Contributor Workspace](#7-contributor-workspace)
   - 7.1 Dashboard Overview
   - 7.2 New Submission — Multi-Step Flow
   - 7.3 Cases Inbox
   - 7.4 Case Detail Thread
   - 7.5 Your Artifacts
   - 7.6 Profile & Settings
8. [Admin / Moderation Portal](#8-admin--moderation-portal)
   - 8.1 Moderation Queue
   - 8.2 Artifact Review Panel
   - 8.3 User Management
9. [Special Interactions & Features](#9-special-interactions--features)
   - 9.1 3D Photogrammetry Upload Flow
   - 9.2 Code Syntax Viewer
   - 9.3 3D Object Viewer (Three.js)
   - 9.4 Social Share & Distribution
   - 9.5 SEO & Schema Markup Layer
   - 9.6 Open Graph / Link Preview
10. [Animation & Motion System](#10-animation--motion-system)
11. [Responsive Design Breakpoints](#11-responsive-design-breakpoints)
12. [Onboarding Flow](#12-onboarding-flow)
13. [Error & Empty States](#13-error--empty-states)
14. [Development Phases — 45 Phases in Sequence](#14-development-phases--45-phases-in-sequence)

---

## 1. Product Vision & Design Philosophy

### What Open Rockets Press Is, in One Sentence for Designers

It is the authenticated intellectual property archive of minors — a place where a 12-year-old's pencil sketch of an airplane engine, a 15-year-old's Blender model of a city, and a 17-year-old's Python machine learning algorithm all receive the same institutional respect that a university press gives a peer-reviewed paper.

### The Design Emotion We Are Creating

When a teenager lands on Open Rockets Press, they must feel two things simultaneously:

1. **Legitimacy** — "This feels as serious as arXiv or the Library of Congress. My work belongs here."
2. **Ownership pride** — "I made this. This is published. This is real."

When a visitor (educator, investor, parent, journalist) lands on Open Rockets Press, they must feel:

1. **Surprise** — "These were made by teenagers?"
2. **Trust** — "This is curated. This is real. These are authenticated."

### The Aesthetic Direction

The existing UI is a starting point — editorial serif fonts, a warm cream background, scholarly restraint. We are keeping those bones because they work. But we are making four decisive changes:

1. **Color depth**: The current palette is too monochrome. We introduce three division accent colors and one brand gold that give the product its own identity.
2. **Hierarchy density**: The current pages are too sparse. We need Amazon Books-level information density — cards, tags, ratings, recommendation rows.
3. **Mechanical precision**: The layout should feel like a precision instrument. Grid-locked. Every element justified. Nothing floats without a reason.
4. **Three-division visual identity**: Every artifact communicates immediately which division it belongs to (Artifact, 3D, Code) through color coding, iconography, and badge language.

### Not-To-Do List

The following design patterns are forbidden for this project:

- No glassmorphism, no blurred cards, no frosted panels
- No neon on dark backgrounds
- No bouncy, playful animations — every motion is deliberate and minimal
- No cartoonish illustration style — icons are sharp silhouettes, not characters
- No infinite scroll on the main browse page — pagination is required for SEO
- No full-bleed video backgrounds on inner pages
- No auto-playing audio of any kind
- No cookie consent banners (handle at infrastructure level)

---

## 2. Global Design System

### 2.1 Color Tokens

Define these as CSS custom properties in `globals.css` and mirror in `tailwind.config.js`.

```css
:root {
  /* ── Brand Core ─────────────────────────────── */
  --color-ink:        #0D1B2A;   /* Primary text, logo, headings */
  --color-ink-light:  #2C3E50;   /* Secondary text, labels */
  --color-cream:      #F4F0E6;   /* Main page background */
  --color-cream-dark: #EAE4D4;   /* Card backgrounds, subtle sections */
  --color-cream-border: #D9D1BC; /* Dividers, input borders */
  --color-gold:       #C8952A;   /* Brand accent, CTAs, highlights */
  --color-gold-light: #F5C842;   /* Hover state on gold, tags */
  --color-gold-muted: #F2E3B8;   /* Gold tint backgrounds */

  /* ── Division 1: Artifacts (Physical) ───────── */
  --color-d1-primary:  #2D6A4F;  /* Forest green */
  --color-d1-light:    #B7E4C7;  /* Light green chip background */
  --color-d1-muted:    #D8F3DC;  /* Very light green for tint areas */

  /* ── Division 2: 3D Artifacts ────────────────── */
  --color-d2-primary:  #1A6B96;  /* Cerulean blue */
  --color-d2-light:    #ADE8F4;  /* Light blue chip */
  --color-d2-muted:    #CDEEF9;  /* Blue tint */

  /* ── Division 3: Software & Digital ─────────── */
  --color-d3-primary:  #5B3A8C;  /* Deep violet */
  --color-d3-light:    #D4B8F0;  /* Light violet chip */
  --color-d3-muted:    #EDE0FF;  /* Violet tint */

  /* ── State Colors ───────────────────────────── */
  --color-success:    #1B7F4F;
  --color-warning:    #C8721A;
  --color-error:      #B72B2B;
  --color-info:       #1A5C8A;

  /* ── Surface Layers ─────────────────────────── */
  --surface-0:  #FFFFFF;         /* Modals, dropdowns (pure white) */
  --surface-1:  #F4F0E6;         /* Page background */
  --surface-2:  #EAE4D4;         /* Card backgrounds */
  --surface-3:  #DDD5C0;         /* Hover on cards, tables */

  /* ── Typographic Colors ─────────────────────── */
  --text-primary:   #0D1B2A;
  --text-secondary: #4A5568;
  --text-tertiary:  #718096;
  --text-disabled:  #A0AEC0;
  --text-inverse:   #F4F0E6;
}
```

**Tailwind extension in `tailwind.config.js`:**

```js
extend: {
  colors: {
    ink:        'var(--color-ink)',
    cream:      'var(--color-cream)',
    gold:       'var(--color-gold)',
    d1:         'var(--color-d1-primary)',
    d2:         'var(--color-d2-primary)',
    d3:         'var(--color-d3-primary)',
  }
}
```

---

### 2.2 Typography System

**Font Stack:**

Install via `next/font` (Google Fonts import):

```js
// fonts.js
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google'

export const display = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-display',
})

export const body = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
})

export const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})
```

**Type Scale (in `globals.css`):**

```css
:root {
  --font-display: var(--font-display), Georgia, serif;
  --font-body:    var(--font-body), system-ui, sans-serif;
  --font-mono:    var(--font-mono), 'Courier New', monospace;

  /* Scale */
  --text-xs:    0.75rem;    /* 12px — labels, captions, tags */
  --text-sm:    0.875rem;   /* 14px — secondary body, metadata */
  --text-base:  1rem;       /* 16px — primary body */
  --text-lg:    1.125rem;   /* 18px — lead text */
  --text-xl:    1.25rem;    /* 20px — card titles */
  --text-2xl:   1.5rem;     /* 24px — section headings */
  --text-3xl:   1.875rem;   /* 30px — page headings */
  --text-4xl:   2.25rem;    /* 36px — major headings */
  --text-5xl:   3rem;       /* 48px — hero text */
  --text-6xl:   3.75rem;    /* 60px — hero display */
  --text-7xl:   4.5rem;     /* 72px — hero big numbers */

  /* Line heights */
  --leading-tight:   1.2;
  --leading-snug:    1.35;
  --leading-normal:  1.5;
  --leading-relaxed: 1.7;

  /* Letter spacing */
  --tracking-tight:  -0.025em;
  --tracking-normal:  0;
  --tracking-wide:    0.05em;
  --tracking-wider:   0.1em;
  --tracking-widest:  0.2em;  /* for all-caps labels */
}
```

**Named text styles used throughout:**

| Class name | Font | Size | Weight | Use |
|---|---|---|---|---|
| `.t-hero` | Display | 6xl | 900 | Homepage main headline |
| `.t-page-title` | Display | 4xl | 700 | Page h1 titles |
| `.t-section-heading` | Display | 2xl | 600 | Section labels |
| `.t-card-title` | Display | xl | 600 | Artifact card names |
| `.t-body-lead` | Body | lg | 400 | Intro paragraphs |
| `.t-body` | Body | base | 400 | Default body text |
| `.t-body-sm` | Body | sm | 400 | Metadata, descriptions |
| `.t-label` | Body | xs | 600 | All-caps labels, tags |
| `.t-eyebrow` | Body | xs | 600 | Uppercase section eyes (tracking-widest) |
| `.t-mono` | Mono | sm | 400 | Code snippets, IDs |

---

### 2.3 Spacing Scale

Use Tailwind's default 4px base. The following are the main spacing tokens used:

| Token | Value | Use |
|---|---|---|
| `space-1` | 4px | Icon gaps, micro-spacing |
| `space-2` | 8px | Tag padding, list items |
| `space-3` | 12px | Badge padding |
| `space-4` | 16px | Card internal padding |
| `space-5` | 20px | Button padding vertical |
| `space-6` | 24px | Form field gaps |
| `space-8` | 32px | Card gaps in grid |
| `space-10` | 40px | Section separators |
| `space-12` | 48px | Large section padding |
| `space-16` | 64px | Hero vertical padding |
| `space-24` | 96px | Between major sections |

---

### 2.4 Border Radius, Shadows, Motion

**Border Radius:**

```css
:root {
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-pill: 999px;  /* tags, badges */
  --radius-card: 10px;   /* artifact cards */
}
```

**Box Shadows:**

```css
:root {
  --shadow-xs:   0 1px 2px rgba(13,27,42,0.06);
  --shadow-sm:   0 2px 6px rgba(13,27,42,0.08);
  --shadow-md:   0 4px 16px rgba(13,27,42,0.10);
  --shadow-lg:   0 8px 32px rgba(13,27,42,0.12);
  --shadow-xl:   0 16px 48px rgba(13,27,42,0.16);
  --shadow-card: 0 2px 8px rgba(13,27,42,0.08), 0 1px 2px rgba(13,27,42,0.04);
  --shadow-card-hover: 0 8px 24px rgba(13,27,42,0.14), 0 2px 6px rgba(13,27,42,0.06);
}
```

**Motion / Transition Defaults:**

```css
:root {
  --duration-fast:   120ms;
  --duration-base:   200ms;
  --duration-slow:   350ms;
  --duration-slower: 500ms;
  --easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --easing-decel:    cubic-bezier(0, 0, 0.2, 1);
  --easing-accel:    cubic-bezier(0.4, 0, 1, 1);
}
```

All hover state transitions use `var(--duration-base) var(--easing-standard)`.

---

### 2.5 Icon System

**Source:** Use [Lucide Icons](https://lucide.dev) as the base icon set (already supported in React). Supplement with 6 custom SVG icons specific to Open Rockets Press.

**Custom icons to be designed as SVGs (sharp silhouette style, not cartoonish):**

1. **ORPress-Logo** — The existing statue silhouette, refined. Clean vector. Export at 24×24 and 48×48.
2. **Division-Artifact** — A physical artifact icon: a clean folded document with a corner curl. Represents papers, essays, artworks.
3. **Division-3D** — A wireframe cube with clean edges. Represents 3D artifacts.
4. **Division-Code** — An opening `{` bracket with a subtle dot. Represents code and digital assets.
5. **License-Eagle** — Soaring eagle silhouette in profile, wings spread. Clean, sharp.
6. **License-Beaver** — Beaver in profile, clean geometric simplification.
7. **License-Fox** — Fox head in profile, clean pointed ears.
8. **License-Finch** — Small bird on a branch, simplified to essential lines.

**Icon usage rules:**
- All icons used at 16px, 20px, or 24px only
- Never scale above 24px without using the large SVG variant
- Always include `aria-hidden="true"` on decorative icons
- Always include `aria-label` on standalone icon buttons

---

### 2.6 Division Identity System

Every artifact on the platform belongs to one of three divisions. The following is the complete visual language for differentiating them:

**Division 1 — Artifacts**
- Badge text: `ARTIFACT`
- Badge color: `--color-d1-primary` background, white text
- Card left border: 3px solid `--color-d1-primary`
- Icon: Division-Artifact (custom SVG)
- Category page accent: Green

**Division 2 — 3D Artifacts**
- Badge text: `3D ARTIFACT`
- Badge color: `--color-d2-primary` background, white text
- Card left border: 3px solid `--color-d2-primary`
- Icon: Division-3D (custom SVG)
- Category page accent: Blue

**Division 3 — Software & Digital**
- Badge text: `CODE / DIGITAL`
- Badge color: `--color-d3-primary` background, white text
- Card left border: 3px solid `--color-d3-primary`
- Icon: Division-Code (custom SVG)
- Category page accent: Violet

---

## 3. Open Rockets Licenses — Visual Identity

Open Rockets Press uses four proprietary semi-open-source licenses. These are a major branding and marketing element. Each license has a name, mascot icon, color association, and set of permissions.

### License 1: Open Rockets Eagle

**Philosophy:** Maximum protection. The creator's work is viewable and citable but cannot be reproduced, copied, modified, or built upon in any form without direct permission from the creator.

**Color:** Slate blue `#334E68`
**Mascot:** Eagle silhouette (soaring, wings spread, facing right)
**Short name for badge:** `OR-Eagle`
**Badge appearance:** Dark slate blue background, white eagle icon, white text "OR·EAGLE"

**Permissions table:**
| Permission | Allowed |
|---|---|
| View the work | ✅ |
| Reference/cite the work | ✅ |
| Share links | ✅ |
| Download a personal copy | ❌ |
| Reproduce in any form | ❌ |
| Modify or adapt | ❌ |
| Use in another work | ❌ |
| Commercial use | ❌ |

**Who should choose this:** A creator who wants their work documented and visible but fully protected. Best for artworks, unique inventions, highly original research.

---

### License 2: Open Rockets Beaver

**Philosophy:** Builder's license. Others can reference, study, and build upon the work, but must differentiate meaningfully (add significant changes) and must credit the original creator.

**Color:** Warm amber `#8B5A00`
**Mascot:** Beaver silhouette (side profile, looking at a log)
**Short name for badge:** `OR-Beaver`
**Badge appearance:** Warm amber background, white beaver icon, white text "OR·BEAVER"

**Permissions table:**
| Permission | Allowed |
|---|---|
| View and share | ✅ |
| Reference/cite | ✅ |
| Study the work | ✅ |
| Build upon (must differentiate) | ✅ |
| Credit required | ✅ Required |
| Copy verbatim | ❌ |
| Commercial use | ❌ |

**Who should choose this:** Engineers, coders, designers who want others to learn from and extend their work while keeping the original protected. Best for software, prototypes, designs.

---

### License 3: Open Rockets Fox

**Philosophy:** Share-alike with attribution. Others can use and remix, but must release their derivative under the same OR-Fox license, and credit is always required.

**Color:** Rust orange `#9B3A10`
**Mascot:** Fox head silhouette (alert, ears pointed upward)
**Short name for badge:** `OR-Fox`
**Badge appearance:** Rust orange background, white fox icon, white text "OR·FOX"

**Permissions table:**
| Permission | Allowed |
|---|---|
| View and share | ✅ |
| Build upon and remix | ✅ |
| Credit required | ✅ Required |
| Derivative must use OR-Fox | ✅ Required |
| Commercial use of derivative | ❌ |

**Who should choose this:** Open-source spirit creators who want their work to contribute to a chain of attributed, protected derivatives. Best for essays, research preprints, collaborative works.

---

### License 4: Open Rockets Finch

**Philosophy:** Most permissive. Others can view, download, study, and reference freely. No derivatives or commercial use allowed. Pure knowledge sharing.

**Color:** Sage green `#3D6B4F`
**Mascot:** Finch on a branch (small, wings folded, clean silhouette)
**Short name for badge:** `OR-Finch`
**Badge appearance:** Sage green background, white finch icon, white text "OR·FINCH"

**Permissions table:**
| Permission | Allowed |
|---|---|
| View and download | ✅ |
| Share links | ✅ |
| Reference/cite | ✅ |
| Personal study copy | ✅ |
| Reproduce in any form | ❌ |
| Derivatives | ❌ |
| Commercial use | ❌ |

**Who should choose this:** Creators who want maximum reach and visibility for their work while preventing derivatives. Best for club posters, diaries, personal artworks.

---

### License Badge Component Specification

```tsx
// components/LicenseBadge.tsx
interface LicenseBadgeProps {
  license: 'eagle' | 'beaver' | 'fox' | 'finch';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  linkToPage?: boolean;
}
```

**Sizes:**
- `sm`: 20px height, 10px font, used in card footers
- `md`: 28px height, 12px font, used in artifact detail sidebar
- `lg`: 40px height, 14px font, used in license info pages

Badge is always a pill (border-radius: 999px), always contains mascot icon on the left and text on the right.

---

## 4. Site Architecture & Routing

### 4.1 Next.js App Router Structure

```
app/
├── layout.tsx                    # Root layout (fonts, providers)
├── page.tsx                      # Homepage (/)
├── not-found.tsx                 # 404 page
├── error.tsx                     # Error boundary
│
├── (public)/                     # Public-facing browsing
│   ├── browse/
│   │   └── page.tsx              # /browse — full catalog
│   ├── category/
│   │   ├── artifacts/
│   │   │   └── page.tsx          # /category/artifacts
│   │   ├── 3d/
│   │   │   └── page.tsx          # /category/3d
│   │   └── code/
│   │       └── page.tsx          # /category/code
│   ├── artifact/
│   │   └── [slug]/
│   │       ├── page.tsx          # /artifact/[slug] — detail page
│   │       └── loading.tsx       # Skeleton loader
│   ├── search/
│   │   └── page.tsx              # /search?q=...
│   ├── creator/
│   │   └── [username]/
│   │       └── page.tsx          # /creator/[username] — profile
│   ├── license/
│   │   ├── eagle/
│   │   │   └── page.tsx          # /license/eagle
│   │   ├── beaver/
│   │   │   └── page.tsx          # /license/beaver
│   │   ├── fox/
│   │   │   └── page.tsx          # /license/fox
│   │   └── finch/
│   │       └── page.tsx          # /license/finch
│   └── about/
│       └── page.tsx              # /about
│
├── (workspace)/                  # Authenticated contributor workspace
│   ├── layout.tsx                # Workspace layout (sidebar)
│   └── workspace/
│       ├── page.tsx              # /workspace — dashboard
│       ├── submit/
│       │   └── page.tsx          # /workspace/submit — new submission
│       ├── cases/
│       │   ├── page.tsx          # /workspace/cases — inbox list
│       │   └── [caseId]/
│       │       └── page.tsx      # /workspace/cases/[caseId] — thread
│       ├── artifacts/
│       │   └── page.tsx          # /workspace/artifacts — my artifacts
│       └── profile/
│           └── page.tsx          # /workspace/profile — settings
│
├── (admin)/                      # Admin / moderation portal
│   ├── layout.tsx                # Admin layout
│   └── admin/
│       ├── page.tsx              # /admin — dashboard
│       ├── queue/
│       │   └── page.tsx          # /admin/queue — moderation queue
│       ├── review/
│       │   └── [submissionId]/
│       │       └── page.tsx      # /admin/review/[id]
│       └── users/
│           └── page.tsx          # /admin/users
│
└── api/                          # Next.js API routes (if using)
    └── og/
        └── route.tsx             # /api/og — dynamic OG image generation
```

### 4.2 URL Slug Structure

Artifact slugs follow this pattern:
```
/artifact/[year]-[creator-username]-[title-kebab-case]-[4-char-id]
```

Example:
```
/artifact/2024-neksha-desilva7-propulsion-design-poster-a4f2
```

This slug is SEO-rich (contains year, creator, title), unique (random 4-char suffix), and human-readable.

---

## 5. Component Library — Global Elements

### 5.1 Navigation Bar (Public)

**File:** `components/layout/PublicNav.tsx`

**Layout:** Sticky top. Full width. White background with a 1px bottom border (`--color-cream-border`). Height: 64px.

**Structure left to right:**

```
[Logo + PRESS wordmark] [————quote carousel————] [🔍] [Get started] [Publish] [Avatar/ND circle]
```

**Logo area (leftmost, 200px wide):**
- The OR statue icon (24px) + "PRESS" wordmark in Playfair Display Bold 20px
- Clicking logo navigates to `/`

**Quote carousel (center, flexible width, min 300px):**
- Shows one rotating famous intellectual quote at a time
- Quotes change every 8 seconds with a smooth crossfade (opacity 0→1, 300ms)
- Quote text: 13px Inter Regular, italic, `--text-tertiary` color
- Source attribution: same size, non-italic, after em dash
- This is an existing feature — keep it exactly as implemented
- The input field feel: styled like an input (border, border-radius: 6px, background: `--surface-2`) but is display-only

**Search icon:** 20px magnifier icon, clickable, expands into a search overlay or navigates to `/search`

**"Get started" link:** 14px Inter Medium, `--text-ink`, underline on hover

**"Publish" button-link:** 14px Inter Medium, with publish/pen icon, `--color-gold` text on hover

**Avatar circle:** 36px circle with user initials, `--color-d1-primary` background, white text 14px Bold. Clicking opens dropdown menu.

**Dropdown menu (when avatar clicked):**

```
┌─────────────────────────────┐
│  Neksha DeSilva7            │
│  neksha@example.com         │
├─────────────────────────────┤
│  Dashboard                  │
│  Your Profile               │
│  Your Artifacts             │
├─────────────────────────────┤
│  About                      │
│  Helpful Links              │
├─────────────────────────────┤
│  Sign Out  (red text)       │
└─────────────────────────────┘
```

Menu: white background, 1px border, 8px radius, `--shadow-lg`. Width: 220px. Appears below and right-aligned with avatar. Each item: 14px Inter, 40px height, 16px horizontal padding. Separator: 1px `--color-cream-border`. "Sign Out" text is `--color-error`.

**Mobile nav (below 768px):**
- Hamburger menu replaces all nav items
- Slide-in drawer from left, full height, width 280px
- Drawer contains: logo, avatar + name, all nav links, sign out

---

### 5.2 Contributor Workspace Sidebar

**File:** `components/layout/WorkspaceSidebar.tsx`

**Layout:** Fixed left sidebar, 240px wide, full height, `--surface-2` background, 1px right border (`--color-cream-border`).

**Top section — User Identity:**
```
┌────────────────────────────┐
│  [ND]  Neksha DeSilva7     │
│        CONTRIBUTOR         │
└────────────────────────────┘
```
Avatar: 40px circle. Username: 14px Inter Semibold `--text-primary`. Role badge: 10px Inter Bold, uppercase, letter-spacing wider, `--color-d1-primary` text.

**Navigation section header label:**
```
WORKSPACE  (10px, uppercase, letter-spacing 0.2em, --text-tertiary)
```

**Navigation items:**

Each item: 40px height, 16px left padding, 12px right padding, full width.
Selected state: `--color-gold-muted` background, `--color-gold` left border (3px), `--text-primary` text Bold.
Default state: transparent background, `--text-secondary` text.
Hover state: `--surface-3` background.

| Icon | Label | Sub-label | Route |
|---|---|---|---|
| LayoutDashboard (Lucide) | Overview | Contributor metrics | /workspace |
| Inbox (Lucide) | Cases Inbox | Open your active threads | /workspace/cases |
| Upload (Lucide) | New Submission | Upload and submit | /workspace/submit |
| FolderOpen (Lucide) | Your Artifacts | View published work | /workspace/artifacts |
| User (Lucide) | Profile | Settings and identity | /workspace/profile |

**Each item structure:**
```tsx
<NavItem>
  <Icon size={16} />
  <div>
    <span className="label">{label}</span>
    <span className="sublabel">{sublabel}</span>
  </div>
</NavItem>
```

The sub-label is 11px Inter Regular `--text-tertiary`, displayed below the label.

---

### 5.3 Footer

**File:** `components/layout/Footer.tsx`

**Layout:** Full-width, `--color-ink` background (dark), cream text. Desktop: 4-column grid. Mobile: stacked.

**Column 1 — Brand:**
- OR logo (white version) + "PRESS" wordmark
- Tagline: "Protecting the intellectual property of the next generation."
- Tagline: 13px Inter, `--text-tertiary` (lighter on dark)
- Copyright: "© 2024 Open Rockets. All rights reserved."
- Social icons row: X/Twitter, Bluesky, Mastodon (each 20px, `--text-tertiary`, hover white)

**Column 2 — Browse:**
- Section header: "Browse" (12px uppercase, gold, letter-spacing wide)
- Links: Research Papers, Journals, Magazines, Literary Writing, Club Posters, 3D Artifacts, Code & Software
- Each link: 13px Inter, cream-ish (#C8C0AF), hover white

**Column 3 — Licenses:**
- Section header: "Our Licenses" (12px uppercase, gold)
- Links with colored dot indicators:
  - 🦅 OR-Eagle License
  - 🦫 OR-Beaver License  
  - 🦊 OR-Fox License
  - 🐦 OR-Finch License
- "Read the white paper" — gold text link

**Column 4 — Platform:**
- Section header: "Platform" (12px uppercase, gold)
- Links: About Open Rockets, Get Started, Publish Your Work, Admin Portal (only visible to admins), Helpful Links, Contact

**Bottom bar (below 4 columns, full width, separator above):**
```
Separator: 1px rgba(255,255,255,0.1)
Left: "Open Rockets Press is a product of Open Rockets Inc."
Right: "Privacy Policy · Terms of Service · License White Paper"
Font: 12px Inter, color #8A8070
```

---

### 5.4 Artifact Card (All Three Types)

**File:** `components/cards/ArtifactCard.tsx`

This is the most important component. It appears in browse pages, search results, and recommendation rows. There are three visual variants based on division.

**Base Card Structure:**

```
┌──────────────────────────────────────────┐
│  [Thumbnail / Preview]                   │  ← 180px height image area
│                                          │
│  [DIVISION BADGE]  [LICENSE BADGE]       │  ← 12px from top of content area
├──────────────────────────────────────────┤  ← left border: 3px division color
│  Artifact Title Here (2 lines max)       │  ← Playfair Display 16px Bold
│  By Creator Name · 2024                  │  ← 13px Inter, --text-tertiary
│                                          │
│  Short description or abstract (3 lines) │  ← 13px Inter, --text-secondary
│                                          │
│  [★★★★☆ 4.2]  [💬 12 reviews]           │  ← 13px row
│  [tag1] [tag2] [tag3]                    │  ← pill tags
└──────────────────────────────────────────┘
```

**Card dimensions:** Width fluid (fits grid column). Height: auto. `--radius-card` border-radius. `--shadow-card` shadow. Background: `--surface-0` (white). Left border: 3px solid division color.

**Thumbnail area:**
- Background: `--surface-2` if no image
- For images: object-fit cover, 180px height
- For 3D artifacts: shows first uploaded photo with a "3D" overlay badge in top-right corner
- For code artifacts: shows a stylized code preview — dark background with syntax-highlighted first 6 lines of code, monospace font 10px
- For physical artifacts with no uploaded image: shows division icon centered, large (40px), division color

**Hover state on card:**
- `--shadow-card-hover` shadow (lifts)
- Transform: `translateY(-2px)` (subtle lift)
- Left border slightly thickens to 4px
- Title color shifts from ink to division primary color
- Transition: 200ms standard easing

**Tags row:**
- Tag pill: `--radius-pill`, `--surface-2` background, `--text-secondary` text, 11px, 4px vertical padding, 8px horizontal
- Maximum 3 tags shown, "+N more" text if more exist

**Variants by Division:**
- Division 1 cards: green left border, green badge
- Division 2 cards: blue left border, blue badge, "3D" rotate icon in thumbnail
- Division 3 cards: violet left border, violet badge, code preview thumbnail

**Sizes:**
- `default`: full card as described
- `compact`: no description text, no tags, 120px thumbnail — for recommendation carousels
- `list-row`: horizontal layout — thumbnail on left 100px wide, content on right — for search results

---

### 5.5 License Badge

**File:** `components/badges/LicenseBadge.tsx`

Pill-shaped badge with mascot icon + short name text.

```
[🦅 OR·EAGLE]   — slate blue
[🦫 OR·BEAVER]  — amber
[🦊 OR·FOX]     — rust orange
[🐦 OR·FINCH]   — sage green
```

Each badge links to its corresponding `/license/[name]` page. Has a tooltip on hover showing the license's one-sentence description.

---

### 5.6 Star Rating Widget

**File:** `components/reviews/StarRating.tsx`

**Display mode (read-only):**
- 5 stars, filled/half/empty states
- Gold fill: `--color-gold`
- Empty fill: `--color-cream-border`
- Rating number in 13px Inter Bold next to stars
- Review count in 13px Inter Regular `--text-tertiary`: "(23 reviews)"

**Interactive mode (for submitting a rating):**
- Stars highlight on hover (left-to-right fill effect)
- Click to select rating
- Animation: star fills with a small scale-up pulse (1.0→1.2→1.0, 150ms)

---

### 5.7 Search Bar

**File:** `components/search/SearchBar.tsx`

**Expanded search overlay (appears when search icon clicked):**
- Full-width overlay below the nav bar
- White background, `--shadow-xl`
- Input field: 48px tall, 20px font, Playfair Display
- Placeholder: "Search artifacts, creators, tags..."
- Close button (×) on right
- Keyboard: Esc closes, Enter submits

**Search suggestions dropdown (as user types):**
```
┌──────────────────────────────────────────┐
│ RECENT SEARCHES                          │
│   • propulsion diagram                   │
│   • clay pottery                         │
├──────────────────────────────────────────┤
│ SUGGESTIONS                              │
│   📄 Artifact: "Aero Propulsion Sketch"  │
│   👤 Creator: "neksha_desilva7"          │
│   🏷 Tag: "engineering"                  │
└──────────────────────────────────────────┘
```

---

### 5.8 Skeleton Loaders

**File:** `components/ui/Skeleton.tsx`

All skeleton loaders use a shimmer animation (CSS `@keyframes shimmer` with gradient sweep from left to right). Background: linear-gradient(90deg, `--surface-2`, `--surface-3`, `--surface-2`) moving at 1.5s infinite.

**ArtifactCardSkeleton:** Same structure as ArtifactCard but all content replaced with skeleton bars.

**ArtifactDetailSkeleton:** Matches the artifact detail page layout.

**ProfileSkeleton:** Matches the profile page layout.

---

### 5.9 Toast / Notification System

**File:** `components/ui/Toast.tsx` + `lib/toast.ts`

Position: bottom-right corner, 16px margin from edges.
Stack up to 3 toasts simultaneously. Each auto-dismisses after 4 seconds.

Types:
- **Success:** `--color-success` left border, checkmark icon
- **Error:** `--color-error` left border, X icon
- **Info:** `--color-info` left border, info icon
- **Warning:** `--color-warning` left border, alert icon

Each toast: white background, `--shadow-lg`, 12px radius, 16px padding, 320px wide.
```
[✓] Submission sent for review.        [×]
    Your artifact will appear in 2–3 business days.
```

---

### 5.10 Modal System

**File:** `components/ui/Modal.tsx`

Uses `createPortal` to render at body root. Backdrop: `rgba(13,27,42,0.5)` with backdrop-filter blur(2px). Modal card: white, 24px radius, `--shadow-xl`, max-width 560px, centered.

Header: title in Playfair Display 20px + close button.
Body: scrollable if needed.
Footer: action buttons right-aligned.

---

## 6. Public Pages

### 6.1 Homepage

**File:** `app/(public)/page.tsx`

The homepage is the platform's face to the world. It must immediately communicate: "This is where young creators' work lives. This is serious. This is exciting."

---

**SECTION A — Hero Banner (Existing slideshow, redesigned)**

The existing animated banner is kept but refined.

**Dimensions:** Full width, 480px height on desktop, 320px on mobile.

**Slide content:** Three slides (matching current implementation):
1. Upload 3D Artifacts (blue/wireframe feel)
2. Submit Physical Artifacts (warm, paper/studio feel)
3. Code & Digital Assets (dark code editor feel)

**Redesign of existing banner:**
- Add a subtle dark gradient overlay on left side of each slide (left 40% of width) so text on left is always readable
- The text overlay should be crisper: Playfair Display Bold 48px for the main words, tracking-tight
- Add a subtle "Paused" / "Playing" pill in bottom-right (keep existing)
- Add slide indicator dots in bottom-center (3 dots, current one gold, others cream/translucent)

---

**SECTION B — Category Navigation Strip**

Immediately below the hero banner. White background, 56px height. Full width.

```
Categories  |  Research Papers  |  Journals  |  Magazines  |  Literary Writing  |  Club Posters  |  3D Artifacts  |  Code & Software
```

"Categories" is the section label (Playfair Display, bold). The rest are links (14px Inter Medium). Selected/active category is underlined with `--color-gold`. Hover: `--color-gold` text.

On mobile: this becomes a horizontally scrollable strip.

This strip is sticky when user scrolls down past it (sticks below the main nav).

---

**SECTION C — Platform Stats Bar**

Thin bar below the category strip. `--surface-2` background. 48px height. Shows three live stats:

```
[Artifact icon]  1,243 Artifacts Published    |    [Star icon]  4.8 avg. rating    |    [Creator icon]  382 Contributors
```

Each stat: 14px Inter. Number in Bold. Description in Regular `--text-tertiary`. Separated by subtle vertical dividers.

This pulls from a real-time API endpoint.

---

**SECTION D — New Releases**

Full-width section. `--surface-1` background. 80px top padding.

**Section header:**
```
NEW RELEASES  ←  (12px, gold, uppercase, letter-spacing: 0.2em)
Recent Additions to the Archive  ← (32px Playfair Display Bold)
```
Right side: "View all →" link

**Card grid:** 4 columns on desktop, 2 on tablet, 1 on mobile. 24px gap. Shows 8 most recently accepted artifacts. Uses the default ArtifactCard component.

---

**SECTION E — Featured Contributions**

`--surface-2` background. 80px vertical padding.

**Section header:**
```
FEATURED  ←  (12px, gold, uppercase)
Curated by Our Editors  ← (32px Playfair Display Bold)
```

**Layout:** NOT a grid — this is a curated editorial row.

Three large "feature cards" horizontally:
- Left card: spans 50% width, tall (400px thumbnail)
- Right: Two stacked cards, each 50% width, 190px thumbnail each

This mimics a magazine front page. The featured cards have a larger thumbnail, a quote from the creator, and the editor's note in italics.

**Featured card extras (beyond standard card):**
- Creator quote in italic Playfair Display 16px, `--text-secondary`
- Editor's note label: `EDITOR'S PICK` in 10px uppercase gold
- Creator avatar (32px circle) next to creator name

---

**SECTION F — Browse by Division**

Three side-by-side division panels. `--surface-1` background. 80px vertical padding.

Each panel is a large card (dark background, cream text) representing one division:

**Panel 1 — Artifacts:**
- Background: `--color-d1-primary` dark green
- Icon: Division-Artifact SVG (white, 48px)
- Title: "Physical & Traditional Artifacts" (Playfair Display 24px Bold, white)
- Description: "Essays, research papers, artworks, posters, sketches, and every physical creation." (14px Inter, rgba(white, 0.8))
- Count: "843 artifacts" (36px Playfair Bold, white)
- CTA: "Explore Artifacts →" (white, underlined on hover)

**Panel 2 — 3D Artifacts:**
- Background: `--color-d2-primary` cerulean blue
- Same layout, adapted content
- Count: "127 3D artifacts"
- CTA: "Explore 3D →"

**Panel 3 — Code & Digital:**
- Background: `--color-d3-primary` violet
- Same layout, adapted content
- Count: "273 digital assets"
- CTA: "Explore Code →"

---

**SECTION G — Trending This Week**

`--surface-2` background. Horizontal scrollable carousel.

**Section header:**
```
TRENDING  ←  (12px, gold, uppercase)
Most Viewed This Week  ← (28px Playfair Display Bold)
```

Horizontal scroll row of compact ArtifactCards. 220px wide each, 16px gap. Navigation arrows (left/right) appear on desktop. Touch scroll on mobile.

---

**SECTION H — License Information Callout**

Cream background, centered, 80px padding. This is an editorial-style info section.

**Headline:** "Your Work, Your License." (Playfair Display 40px Bold, centered)
**Subtext:** "Every artifact on Open Rockets Press is protected by one of our four proprietary semi-open-source licenses, designed specifically for the intellectual property of young creators." (16px Inter, centered, max-width 640px)

Below: Four license cards in a row.

**Each license card:**
- 200px wide × auto height
- White background, border: 1px `--color-cream-border`
- 12px radius
- Top color band: 8px tall, full width, license color
- Mascot icon: 40px centered, license color
- License name: "OR-Eagle" (Playfair Display 18px Bold)
- One-line description (13px Inter `--text-secondary`)
- "Learn more →" link (license color, 13px)

---

**SECTION I — Contributor Call-to-Action**

Dark section. `--color-ink` background, cream text.

**Full-width, 160px height, centered:**
```
Have something worth publishing?
[Get Started — It's Free]  [Learn How It Works]
```

Headline: Playfair Display 36px Bold, cream.
Primary CTA button: Solid gold (`--color-gold`), ink text, 48px height, 24px horizontal padding.
Secondary CTA: Outlined (cream border, cream text).

---

### 6.2 Browse / Catalog Page

**File:** `app/(public)/browse/page.tsx`

This is the Amazon Books-equivalent browsing experience. The most important page for discovery.

**URL:** `/browse`

**Page layout: Three-column grid**

```
[Filters Sidebar — 260px] | [Main Results — flex] | [Active Filters + Sort — 200px]
```

On tablet: sidebar collapses to a "Filters" drawer button.
On mobile: both sidebars become drawer buttons.

---

**Left Sidebar — Filters:**

Sticky on scroll. `--surface-2` background. 260px wide. 24px padding.

```
FILTERS  (label, gold, uppercase small)
[Clear all filters] (link, right-aligned)

─────────────────────────────
Division
☐  Artifacts (843)
☐  3D Artifacts (127)
☐  Code & Digital (273)

─────────────────────────────
License
☐  OR-Eagle (320)
☐  OR-Beaver (215)
☐  OR-Fox (412)
☐  OR-Finch (296)

─────────────────────────────
Category
☐  Research Papers (234)
☐  Essays (189)
☐  Artworks (301)
☐  Club Posters (89)
☐  Book Covers (112)
☐  Code (273)
☐  3D Models (127)
☐  Diaries (44)
☐  Inventions (78)
  [+ Show more categories]

─────────────────────────────
Year Submitted
[2019] [2020] [2021] [2022] [2023] [2024]
(pill-shaped year buttons, gold on selected)

─────────────────────────────
Rating
☐  ★★★★★ 5 stars only
☐  ★★★★☆ 4+ stars
☐  ★★★☆☆ 3+ stars

─────────────────────────────
File Type
☐  PDF
☐  Image
☐  Code file
☐  3D Model (.obj)
☐  Word Document
☐  ZIP Archive
```

Each checkbox: standard 16px box, `--color-gold` check fill. Label: 14px Inter. Count: 13px `--text-tertiary` right-aligned.

---

**Main Results Area:**

**Results header bar:**
```
[Showing 1,243 artifacts]  ←  (14px, --text-secondary)    Sort by: [Newest ▾]  [Grid ⊞] [List ≡]
```

Sort options dropdown: "Newest", "Most Viewed", "Highest Rated", "Most Commented", "Alphabetical A-Z"

View toggle: Grid icon (default) or List icon.

**Grid view:** 3 columns on wide desktop, 2 on narrow desktop. Default ArtifactCard component.

**List view:** Full-width rows, using list-row variant of ArtifactCard. Shows more detail: full description, all tags.

**Pagination:**
Bottom of results. Not infinite scroll.
```
← Previous   [1] [2] [3] ... [24] [25]   Next →
Showing 24 of 1,243 artifacts
```

Pagination: 24 items per page. Page numbers: 40px × 40px squares. Current page: gold background, ink text. Others: transparent, hover: `--surface-2`.

---

### 6.3 Category Pages

**Three pages:** `/category/artifacts`, `/category/3d`, `/category/code`

Each has the same structure but themed with its division color.

**Hero section:**
- Full-width, 200px height
- Division-colored background (gradient from dark to medium shade)
- Division icon (48px, white) + Category name (Playfair Display 40px, white) + description (16px, rgba(white,0.8))
- Count pill in top-right: "843 Artifacts" on white pill

**Sub-categories (for Division 1 — Artifacts):**

```
Research Papers  |  Essays  |  Artworks  |  Club Posters  |  Book Covers  |  Inventions  |  Diaries
```

Horizontal tabs. Selected tab: division color underline. Content below filters and shows grid.

**For Division 2 — 3D Artifacts:**
Sub-categories: `3D Models | Printed Objects | Physical 360° Objects | Architectural Models`

**For Division 3 — Code & Digital:**
Sub-categories: `Python | JavaScript | C/C++ | Rust | ZIP Projects | Digital Artwork`

---

### 6.4 Artifact Detail Page — Standard (Division 1)

**File:** `app/(public)/artifact/[slug]/page.tsx`
**URL:** `/artifact/[slug]`

This page is the most information-rich page in the entire platform. It is what gets shared, linked, indexed, cited.

---

**Page layout:**

```
[Breadcrumb nav]
[Title + metadata block — full width top]
─────────────────────────────────────────────────
[Main content — 65%]   |   [Right sidebar — 35%]
─────────────────────────────────────────────────
[Recommendations row — full width bottom]
```

---

**Breadcrumb:**
```
Home › Artifacts › Research Papers › Aero Propulsion Design Study
```
14px Inter, `--text-tertiary`. Each crumb links to its page.

---

**Title block:**

```
[ARTIFACT]  [OR·EAGLE]          ← division badge + license badge
Aero Propulsion Design Study    ← Playfair Display 40px Bold, --text-primary
A detailed diagrammatic study of turbojet propulsion flow paths.
By Neksha DeSilva7  ·  Submitted March 12, 2024  ·  Artifact #0421
[★★★★☆  4.2]  (23 reviews)  ·  1,204 views  ·  87 bookmarks
```

---

**Main content (left 65%):**

**Tab navigation:**
```
[Overview]  [File Preview]  [Reviews]  [Comments]
```

**Tab 1 — Overview:**
- Full description of the artifact (rendered Markdown)
- Tags row: all submitted tags as pill chips
- Creator's note (if provided): italic blockquote style, `--surface-2` background, `--color-d1-primary` left border 3px

**Tab 2 — File Preview:**
- If PDF: embedded PDF viewer (use `react-pdf` or iframe to Oracle Cloud storage URL)
- If image: full-size image viewer with zoom capability (use `react-image-lightbox` or similar)
- If Word doc: extracted text preview + download link
- Download button: always visible. "Download Original File" — gold, 48px height button.

**Tab 3 — Reviews:**

Section header: "Community Reviews" (Playfair Display 24px)
Rating summary widget:
```
     4.2 / 5.0
★★★★☆   (23 reviews)

5★ ████████░░  14
4★ ████░░░░░░  6
3★ ██░░░░░░░░  2
2★ ░░░░░░░░░░  1
1★ ░░░░░░░░░░  0
```

Write a review button: gold, 40px.

Review cards list below:
```
┌─────────────────────────────────────────────┐
│ [JD] Jane Doe  ·  ★★★★★  ·  Feb 14, 2024  │
│ "An incredibly detailed piece of work for   │
│  someone in 9th grade. The flow path        │
│  diagrams are accurate and well-labelled."  │
│                                             │
│ [👍 12 helpful]  [Report]                   │
└─────────────────────────────────────────────┘
```

**Tab 4 — Comments:**
Threaded comments. Each comment shows avatar, username, timestamp, content, reply button, like count.
"Add a comment" text input at top (always visible when logged in).

---

**Right sidebar (35%):**

```
┌───────────────────────────────────┐
│  CREATOR                          │
│  [ND]  Neksha DeSilva7           │
│        Colombo, Sri Lanka         │
│        Joined 2023 · 12 artifacts │
│  [View Profile]                   │
├───────────────────────────────────┤
│  ARTIFACT DETAILS                 │
│  Division:    Artifacts           │
│  Type:        Research Paper      │
│  Submitted:   March 12, 2024      │
│  License:     [OR·EAGLE]         │
│  File Type:   PDF (2.4 MB)        │
│  Artifact ID: #0421               │
├───────────────────────────────────┤
│  TAGS                             │
│  [engineering] [propulsion]       │
│  [diagrams] [aerospace]           │
├───────────────────────────────────┤
│  ACTIONS                          │
│  [↓ Download File]         Gold  │
│  [♡ Save to Library]             │
│  [↗ Share]                        │
│  [⚐ Report an Issue]             │
├───────────────────────────────────┤
│  LICENSE DETAILS                  │
│  [🦅 OR·EAGLE]                   │
│  This work is protected under     │
│  the OR-Eagle license. View only. │
│  No reproduction permitted.       │
│  [Read Full License →]            │
└───────────────────────────────────┘
```

Share button expands to show copy-link, Twitter/X, WhatsApp, Bluesky, Mastodon options.

---

**Recommendations row (full width, below main content):**

```
MORE FROM THIS CREATOR
[compact card] [compact card] [compact card] [compact card]

YOU MIGHT ALSO LIKE
[compact card] [compact card] [compact card] [compact card]

RELATED TAGS: [engineering]
[compact card] [compact card] [compact card] [compact card]
```

Each row is a horizontally scrollable carousel. Compact ArtifactCard variant.

---

**Schema.org markup (hidden, in `<head>`):**

```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Aero Propulsion Design Study",
  "author": {
    "@type": "Person",
    "name": "Neksha DeSilva7"
  },
  "datePublished": "2024-03-12",
  "license": "https://openrockets.com/license/eagle",
  "publisher": {
    "@type": "Organization",
    "name": "Open Rockets Press"
  },
  "description": "A detailed diagrammatic study of turbojet propulsion flow paths.",
  "identifier": "ORP-0421",
  "keywords": "engineering, propulsion, diagrams, aerospace"
}
```

---

**Open Graph meta (in `<head>`):**

```html
<meta property="og:title" content="Aero Propulsion Design Study — Open Rockets Press" />
<meta property="og:description" content="A detailed diagrammatic study of turbojet propulsion flow paths. Published by Neksha DeSilva7 on Open Rockets Press." />
<meta property="og:image" content="/api/og?slug=2024-neksha-aero-propulsion-a4f2" />
<meta property="og:url" content="https://press.openrockets.com/artifact/2024-neksha-aero-propulsion-a4f2" />
<meta property="og:type" content="article" />
<meta name="twitter:card" content="summary_large_image" />
```

The `/api/og` route generates a dynamic OG image showing: artifact title, creator name, division badge, star rating, all on an `--color-ink` dark background with `--color-gold` accents.

---

### 6.5 Artifact Detail Page — 3D (Division 2)

Identical to the standard artifact page with the following differences:

**Tab 2 becomes "3D View" instead of "File Preview"**

The 3D viewer takes center stage. Full implementation spec:

**3D Viewer Component (`components/viewers/ThreeDViewer.tsx`):**

```tsx
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
```

**Viewer container:** Full width, 500px height, `--surface-2` background, 12px radius.

**Controls overlay (bottom of viewer):**
```
[↔ Rotate]  [↕ Pan]  [⊕ Zoom In]  [⊖ Zoom Out]  [⟲ Reset]  [⛶ Fullscreen]
```
Controls row: dark semi-transparent background, white icons, 40px height.

**Loading state:** Spinner centered + "Loading 3D model..." text.

**Error state:** "Could not load 3D model. Try downloading the .obj file." with download link.

**For physical objects (photogrammetry / 360° from photos):**

When the artifact type is "Physical 360° Object" (Division 2 sub-type), the viewer uses a panoramic image viewer instead of a Three.js OBJ loader:

- Uses `pannellum` or a custom Three.js sphere with equirectangular texture
- Shows the morphed 360° photograph set
- User can drag to rotate around object
- Instruction overlay on first load: "Drag to rotate · Scroll to zoom" fades out after 3 seconds

**Upload flow for physical 360° objects (in submission form):**
- User uploads 4–6 photos
- System uses a server-side Cloudflare Worker / Node.js function to stitch them into a 360° panoramic map
- This uses the `hugin` photogrammetry tool or a Node.js equivalent
- The stitched result is stored in Oracle Cloud alongside originals
- If stitching fails, the viewer falls back to a swipeable photo gallery

---

### 6.6 Artifact Detail Page — Code & Digital (Division 3)

Identical to standard page with the following differences:

**Tab 2 becomes "View Code" instead of "File Preview"**

**Code Viewer Component (`components/viewers/CodeViewer.tsx`):**

Uses `react-syntax-highlighter` with the `atomDark` theme (dark background, colored syntax).

**Viewer layout:**
```
┌──────────────────────────────────────────────────────┐
│  Python  ·  127 lines  ·  main.py               [⬇] │  ← header bar
├──────────────────────────────────────────────────────┤
│   1  │  import numpy as np                            │
│   2  │  import matplotlib.pyplot as plt              │
│   3  │                                               │
│   4  │  def calculate_trajectory(v0, angle):        │
│   5  │      ...                                      │
│ ...  │  ...                                         │
└──────────────────────────────────────────────────────┘
```

- Line numbers: `--text-tertiary`, right-aligned in a fixed 40px column
- Code: monospace 14px, with full syntax highlighting
- Scrollable vertically within viewer (max 500px height, then scroll)
- "Expand" button shows all lines
- Header bar: filename, language detection, line count, download button

**For ZIP file submissions:**
File tree sidebar on the left of the code viewer:
```
📁 project/
  ├── 📄 main.py
  ├── 📄 utils.py
  ├── 📁 data/
  │   └── 📄 input.csv
  └── 📄 README.md
```

Clicking a file in the tree shows that file's code in the main viewer.

**README auto-display:**
If a `README.md` exists in the upload, it is automatically rendered as Markdown above the code viewer.

---

### 6.7 Search Results Page

**File:** `app/(public)/search/page.tsx`
**URL:** `/search?q=propulsion+design`

**Page header:**
```
Search results for "propulsion design"
Showing 47 results across all divisions
```
Playfair Display 32px + 16px sub.

**Layout:** Same as browse page but without the left filter sidebar being persistent — filters are in a top bar instead.

**Top filter bar:**
```
Division: [All] [Artifacts] [3D] [Code]   |   Sort: [Relevance ▾]   |   Filters ▾
```

**Results:** List-row view by default (more information density for search). 10 results per page.

**Each result row:**
```
[thumbnail 80px] | [DIVISION badge] [type]
                 | Title in Playfair Display 18px Bold
                 | By Creator · Date · Rating
                 | Description excerpt with search term highlighted in gold
                 | [tag1] [tag2]
```

**No results state:**
```
[Large magnifier icon, 64px, gold]
No results found for "xyzabc"
Try different keywords, or browse by category.
[Browse Artifacts] [Browse 3D] [Browse Code]
```

---

### 6.8 Contributor Profile / Author Page

**File:** `app/(public)/creator/[username]/page.tsx`

**Hero section:**
- Full-width banner: 200px height, `--color-ink` background
- On top of the banner, centered: large avatar circle (80px), creator name (Playfair Display 32px, white), role tag "CONTRIBUTOR" (gold pill), location (14px, rgba(white,0.7))
- Stats row below name: "12 Artifacts · 4.7 avg. rating · 1,204 views · Member since 2023"

**Bio section (below hero):**
- White background card, 600px max width, centered
- Creator bio text (markdown rendered, max 300 words)
- Contact/social links if provided

**Artifacts grid:**
```
Neksha's Published Work
[All] [Artifacts] [3D] [Code]   →  sort dropdown

[card] [card] [card] [card]
[card] [card] [card] [card]
```

Standard ArtifactCard grid. 24px gap.

**Footer of profile:** "All works published here are protected under Open Rockets licenses. Contact Open Rockets Press to request permissions."

---

### 6.9 License Information Pages (×4)

**Files:** `app/(public)/license/eagle/page.tsx` etc.

**URL:** `/license/eagle`, `/license/beaver`, `/license/fox`, `/license/finch`

These pages are quasi-legal documents rendered with editorial design. They must feel like something you'd frame on a wall, not a boring terms page.

**Page layout:**

**Hero panel:**
- Full width, 360px height
- License color as background
- Centered: mascot SVG icon (80px, white) + license name (Playfair Display 56px Bold, white) + one-sentence description (20px, rgba(white,0.9))

**Permissions table:**
Centered, max-width 700px. Clean table.

```
PERMISSIONS & CONDITIONS

Action                         Permitted
──────────────────────────────────────────────────
View the work                     ✅
Share links to the work           ✅
Reference and cite the work       ✅
Download a personal copy          ❌
Reproduce in any medium           ❌
Modify or create derivatives      ❌
Use commercially                  ❌
──────────────────────────────────────────────────
```

Table: 14px Inter. ✅ in license color. ❌ in `--color-error`.

**Narrative explanation:**
Below table. Three paragraphs explaining the philosophy of this license in plain language. No legal jargon. Written as if explaining to a 16-year-old.

**Use this license section:**
"Should you choose OR-Eagle for your work? You should choose this license if..." followed by 3 bullet points.

**When to use comparison table:**

```
                OR-Eagle   OR-Beaver   OR-Fox   OR-Finch
View                 ✅         ✅        ✅        ✅
Download             ❌         ❌        ✅        ✅
Build upon           ❌         ✅        ✅        ❌
Credit required      —          ✅        ✅        —
Share-alike          —          —         ✅        —
Commercial           ❌         ❌        ❌        ❌
```

This comparison table appears on ALL four license pages.

**How to cite this license:**
Code block showing how to reference the license in a document or README.

---

### 6.10 About Page

**File:** `app/(public)/about/page.tsx`

Structured like a long-form editorial article. Playfair Display headings throughout.

**Sections:**

1. **Mission Statement** — hero panel with pullquote in large italic Playfair
2. **What Open Rockets Press Is** — narrative explanation (not a list)
3. **Three Divisions** — visual infographic showing the three divisions with icons and counts
4. **Our Licenses** — four license cards in a row
5. **Moderation Standards** — explains quality bar without being intimidating
6. **For Educators** — specific callout to school use
7. **For Investors / Press** — callout with "Media Kit" link
8. **Team** — placeholder cards for team members
9. **CTA** — "Start publishing your work"

---

## 7. Contributor Workspace

The contributor workspace is accessed via `/workspace/*`. It requires authentication (already implemented). The workspace layout (`app/(workspace)/layout.tsx`) wraps all workspace pages with the sidebar.

### 7.1 Dashboard Overview

**File:** `app/(workspace)/workspace/page.tsx`

**Page title:** "Hi, [First Name]" — Playfair Display 36px

**Three stat cards (top row):**

| Card | Metric | Icon |
|---|---|---|
| Publications | N submitted | FileText |
| Cases | N open | MessageSquare |
| Consent Tier | `general` | Shield |

Each card: white background, 1px `--color-cream-border` border, 12px radius, left orange border (3px `--color-gold`), 24px padding. Metric number: Playfair Display 48px Bold. Label: 13px Inter `--text-tertiary`.

**Recent Submissions table:**

Columns: TITLE | STATUS | TYPE | SUBMITTED

Status badges:
- `PENDING REVIEW` — amber pill
- `UNDER REVIEW` — blue pill
- `ACCEPTED` — green pill
- `DECLINED` — red pill
- `NEEDS REVISION` — orange pill

Each status badge: 12px font, 6px vertical padding, 12px horizontal, pill shape, corresponding color background (light tint) and text.

Empty state: The current "No submissions yet" message is fine — style it with a large Upload icon (48px, `--text-disabled`), centered, italic message, and a gold "Make Your First Submission" button.

**Recent Cases table:**

Columns: CASE | PRIORITY | STATUS | LAST ACTIVITY

Priority badges:
- `HIGH` — red
- `NORMAL` — blue
- `LOW` — gray

**Quick action buttons (right side of page):**
```
[+ New Submission]     Gold button
[View All Artifacts]   Outlined button
[Open Cases Inbox]     Text link
```

---

### 7.2 New Submission — Multi-Step Flow

**File:** `app/(workspace)/workspace/submit/page.tsx`

The submission process is now a clearly marked multi-step wizard. This is a major UX upgrade from the current single-scroll form.

**Step indicator (top of page, below workspace label):**

```
① Basic Info   →   ② Division & Type   →   ③ License   →   ④ Files   →   ⑤ Tags & Metadata   →   ⑥ Review & Submit
```

Visual: Six circles connected by lines. Completed steps: gold filled circle, checkmark. Current step: ink filled circle, white number. Future steps: cream circle, `--text-disabled` number.

---

**STEP 1 — Basic Info**

Fields:
- **Title** — text input, required. Placeholder: e.g. "Human-Centered Propulsion Design"
- **Abstract / Description** — textarea (resizable), required. Min 50 chars. Placeholder: "Summarize your submission for editors and moderators." Character counter shown: "127/500"

---

**STEP 2 — Division & Type**

First, choose division:

```
Three large selection cards side by side:

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  📄           │  │  🧊           │  │  </> ²       │
│  Artifacts   │  │  3D Artifact │  │  Code/Digital│
│              │  │              │  │              │
│  Essays,     │  │  3D models,  │  │  Code files, │
│  artworks,   │  │  printed     │  │  digital art,│
│  research    │  │  objects,    │  │  software    │
│              │  │  360° photos │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

Selected card: left border 3px division color, `--color-gold-muted` background. Hover: `--surface-3` background.

Then, based on division, show a sub-type dropdown:

**Division 1 sub-types:**
Essay | Research Paper / Preprint | Artwork (sketch, painting, etc.) | Club Poster | Book Cover / Banner | Advertising Banner | Graphic Design | Inventory Label / Product Design | Clay/Sculpture (photo) | Diary / Journal | Invention (photo) | Other Physical Creation

**Division 2 sub-types:**
3D Model (.obj) | 3D Printed File | Physical Object (360° Photos) | Architectural Model

**Division 3 sub-types:**
Python Script | JavaScript / TypeScript | C / C++ | Rust | Other Language | ZIP Project (Full Codebase) | Digital Artwork | Digital Design | Other Digital

---

**STEP 3 — License Selection**

Four large license selection cards:

```
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│  🦅  OR-EAGLE                    │  │  🦫  OR-BEAVER                   │
│  ──────────────────────────────  │  │  ──────────────────────────────  │
│  Maximum Protection              │  │  Builder's License               │
│  View only. No copies, no        │  │  Others can build upon your work │
│  derivatives, no download.       │  │  with credit required.           │
│                                  │  │                                  │
│  ✅ View  ❌ Download  ❌ Modify  │  │  ✅ View  ❌ Download  ✅ Build  │
│                                  │  │  (must credit + differentiate)   │
│  [Select OR-Eagle]               │  │  [Select OR-Beaver]              │
└──────────────────────────────────┘  └──────────────────────────────────┘

┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│  🦊  OR-FOX                      │  │  🐦  OR-FINCH                    │
│  ──────────────────────────────  │  │  ──────────────────────────────  │
│  Share-Alike                     │  │  View & Learn                    │
│  Remix freely but derivatives    │  │  Free to view and download for   │
│  must also use OR-Fox.           │  │  personal study. No derivatives. │
│                                  │  │                                  │
│  ✅ View  ✅ Build  ✅ Remix      │  │  ✅ View  ✅ Download  ❌ Modify │
│  (derivative must use OR-Fox)    │  │                                  │
│  [Select OR-Fox]                 │  │  [Select OR-Finch]               │
└──────────────────────────────────┘  └──────────────────────────────────┘
```

Below: "Not sure which to choose?" link → opens a comparison modal.

---

**STEP 4 — Files**

This is the most complex step. The UI changes based on division + type.

**For Division 1 (Standard Artifacts):**
```
PUBLICATION FILE *
[Choose file]   No file chosen
Accepted: PDF, JPEG, PNG, GIF, TIFF, BMP, DOC, DOCX, any image
Max file size: 100 MB

COVER IMAGE (Optional)
[Choose file]   No file chosen
Accepted: JPEG, PNG, WebP. Min 400×300px. This is shown as the card thumbnail.
```

**For Division 2 — 3D Model (.obj):**
```
3D MODEL FILE *
[Choose file]   No file chosen
Accepted: .obj, .fbx, .gltf, .glb, .stl, .ply
Max file size: 500 MB

COVER IMAGE *
[Choose file]   No file chosen
(Required for 3D artifacts — this shows in cards)
```

**For Division 2 — Physical Object (360° Photos):**
```
PHYSICAL OBJECT PHOTOS *
Upload 4 to 6 photographs of your object.
Required angles: Front, Back, Left Side, Right Side
Optional: Top (aerial), Bottom

[Photo upload area — drag & drop zone, dashed border]
Upload up to 6 photos

Already uploaded:
[ Front ×]  [ Back ×]  [ Left ×]  [ Right ×]

Angle labels: Assign each photo its angle using the dropdown below each:
Photo 1: [Front ▾]   Photo 2: [Back ▾]   Photo 3: [Left Side ▾] ...

[⚙ Generate 360° View]   ← triggers photogrammetry pipeline
Status: Processing... / Ready ✓ / Failed (retry)
```

**For Division 3 — Code file:**
```
CODE FILE *
Upload a single code file or a ZIP folder containing your project.
[Choose file]   No file chosen
Accepted: .py, .js, .ts, .cpp, .c, .rs, .html, .css, .zip
Max file size: 50 MB per file, 200 MB for ZIP

THUMBNAIL IMAGE (Optional)
Upload a screenshot or diagram related to your code.
[Choose file]
```

**File upload UX:**
- Drag-and-drop zone (dashed border, 120px height, `--surface-2` background)
- Progress bar appears during upload (gold fill)
- File appears as a chip after upload: `[filename.pdf ×]` with a remove button
- Chunked upload for large files using Oracle Cloud storage multipart API

---

**STEP 5 — Tags & Metadata**

```
TAGS
[Input field]   Add tags and press Enter
Comma-separated. Up to 12 tags.
e.g. orbital mechanics, classroom, engines
[engineering ×]  [aerospace ×]  [diagrams ×]

YEAR CREATED (Optional)
[Year ▾]   (dropdown 2010–current year)

SCHOOL / INSTITUTION (Optional)
[Text input]  e.g. Colombo National School

CREATOR'S NOTE (Optional)
[Textarea]
Tell viewers about the context, your age when you made this, the story behind it.
Max 500 characters.
```

---

**STEP 6 — Review & Submit**

Full read-only summary of all submitted data.

```
REVIEW YOUR SUBMISSION
────────────────────────────────────────────────────────
Title:        Aero Propulsion Design Study
Description:  A detailed study of...
Division:     Artifacts [green badge]
Type:         Research Paper
License:      [🦅 OR-EAGLE]
File:         propulsion_study.pdf (2.4 MB)   [Preview]
Cover Image:  cover.jpg   [Preview]
Tags:         engineering, aerospace, diagrams
Year Created: 2022
School:       Colombo National School
────────────────────────────────────────────────────────

☐ I confirm this is my original work.
☐ I understand it will be reviewed by moderators before publishing.
☐ I agree to the Open Rockets Press Terms of Submission.

[← Back]   [Submit for Review →]   Gold button, 48px
```

After submit: Redirect to `/workspace` dashboard with a success toast: "Submission received. Your artifact will appear in 2–3 business days after moderation review."

---

### 7.3 Cases Inbox

**File:** `app/(workspace)/workspace/cases/page.tsx`

**Page title:** "Cases Inbox" (Playfair Display 32px) + "CONTRIBUTOR SUPPORT" eyebrow in gold.
**Subtitle:** "Track moderator conversations and send updates for each case thread."

**Cases table:**

Columns: CASE | PRIORITY | STATUS | LAST ACTIVITY | ACTIONS

Each row: 56px height. Zebra striping: odd rows `--surface-1`, even rows `--surface-2`.

CASE column: case number in Bold + subject line in regular below.
PRIORITY: badge (HIGH/NORMAL/LOW).
STATUS: badge (OPEN / AWAITING CREATOR / RESOLVED / CLOSED).
LAST ACTIVITY: "3 hours ago" relative time, tooltip with full date on hover.
ACTIONS: "View Thread →" link.

Empty state (for new users): Centered message with an Inbox icon (48px, `--text-disabled`) + "No active cases. Cases are created when moderators reach out about a submission." + "Submit Your First Work" button.

---

### 7.4 Case Detail Thread

**File:** `app/(workspace)/workspace/cases/[caseId]/page.tsx`

**Layout:** Like an email thread. Two columns: 60% main thread, 40% case sidebar.

**Main thread (left 60%):**

```
← Back to Cases Inbox

Case #C-0042 — Regarding: "Aero Propulsion Design Study"
Opened March 15, 2024  ·  Priority: NORMAL  ·  Status: AWAITING CREATOR

────────────────────────────────────────────────────────

[MOD avatar]  Moderator Team · March 15, 2024 at 2:34 PM
──────────────────────────────────────────────
"Thank you for your submission. We had a quick
question about the diagram on page 3..."
────────────────────────────────────────────────────────

[ND avatar]   Neksha DeSilva7 · March 15, 2024 at 4:12 PM
──────────────────────────────────────────────
"Thanks for the review! The diagram on page 3..."
────────────────────────────────────────────────────────

[Reply box]
┌──────────────────────────────────────────────┐
│ Type your reply...                            │
│                                              │
│                                         [↑] │
└──────────────────────────────────────────────┘
[Attach file]  [Send Reply →]
```

Messages are styled as chat-like bubbles with avatar, but more formal (like GitHub PR comments).

**Case sidebar (right 40%):**
```
CASE DETAILS
Case Number:  #C-0042
Status:       AWAITING CREATOR
Priority:     NORMAL
Created:      March 15, 2024
Last Update:  2 hours ago

RELATED ARTIFACT
[thumbnail] Aero Propulsion Study
            [View Artifact →]

CASE ACTIONS
[Mark as Resolved]   ← user can suggest resolution
[Download This Thread]
```

---

### 7.5 Your Artifacts

**File:** `app/(workspace)/workspace/artifacts/page.tsx`

**Page title:** "Your Artifacts"
**Subtitle:** "All submissions across all statuses."

**Tabs at top:**
```
[All (12)] [Published (8)] [Under Review (2)] [Declined (1)] [Draft (1)]
```

**Table view (not grid, for management):**

Columns: THUMBNAIL | TITLE + TYPE | STATUS | DIVISION | DATE | VIEWS | RATING | ACTIONS

Status badges same as dashboard.
Actions per row: "View →" | "Edit metadata" | "Archive"

Published artifacts show a small Views count and Rating in the table.

Empty tabs: "No published artifacts yet." etc.

---

### 7.6 Profile & Settings

**File:** `app/(workspace)/workspace/profile/page.tsx`

**Sections:**

**1. Profile Information:**
- Display Name (read-only, managed by Open Rockets main account)
- Bio (textarea, editable, max 300 chars)
- Location (text input)
- Social links: Website URL, GitHub, YouTube
- Profile photo: uses Open Rockets account photo

**2. Submission Defaults:**
- Default license for new submissions (dropdown)
- Default division (dropdown)
- School/Institution name (shown on all artifacts)

**3. Notification Preferences:**
- [☑] Email me when a case is updated
- [☑] Email me when my artifact is accepted
- [☑] Email me when my artifact is declined
- [☑] Email me when someone reviews my artifact
- [☐] Email me weekly digest

**4. Privacy:**
- [☑] Show my full name on artifacts
- [☑] Show my location on profile

All sections: white card, 24px padding, 12px radius, 1px border.

---

## 8. Admin / Moderation Portal

**Note:** The admin portal (`/admin/*`) is accessed via `admin.openrockets.com` (subdomain), not the main Press URL. The following describes its UI within Next.js (separate deployment or route group). The account system authentication routes are already implemented.

### 8.1 Moderation Queue

**File:** `app/(admin)/admin/queue/page.tsx`

**Layout:** Full-screen dashboard. Wider sidebar (260px). Dark header bar (ink) instead of the contributor workspace header.

**Admin sidebar items:**
- Queue (submissions awaiting review)
- All Artifacts
- Users
- Cases
- Settings
- Analytics

**Queue page:**

**Stat strip (top):**
```
[24 Pending Review]   [3 Flagged]   [8 Accepted Today]   [2 Declined Today]
```

**Queue table:**

Sortable columns: SUBMISSION ID | CREATOR | TITLE | DIVISION | TYPE | SUBMITTED | WAIT TIME | ACTIONS

Wait time: "2 days" in color-coded badge — green (under 3 days), amber (3–5 days), red (over 5 days).

Actions per row: "Review →" button.

Batch actions: Select multiple + "Bulk Decline" or "Bulk Accept" buttons.

Filters: Division, Type, Wait Time, Creator.

---

### 8.2 Artifact Review Panel

**File:** `app/(admin)/admin/review/[submissionId]/page.tsx`

**Layout:** Two-panel, full-screen.

**Left panel (55%) — Submission Content:**
- Title, creator, division, type, license (read-only)
- Full description
- File preview (same as public viewer — PDF, image, 3D, code)
- Tags
- Creator's note

**Right panel (45%) — Moderation Controls:**

```
REVIEW ACTIONS
────────────────────────────────
Creator:    Neksha DeSilva7
Submitted:  March 12, 2024
Division:   Artifacts
Type:       Research Paper
License:    OR-Eagle
────────────────────────────────

QUALITY ASSESSMENT
Content Quality:     [★☆☆☆☆] [★★☆☆☆] [★★★☆☆] [★★★★☆] [★★★★★]
Originality:         [★☆☆☆☆] ... [★★★★★]
Presentation:        [★☆☆☆☆] ... [★★★★★]
Age-Appropriateness: [PASS ✓] / [FAIL ✗]
────────────────────────────────

MODERATOR NOTE TO CREATOR
[textarea — appears in case thread if sent]

────────────────────────────────
DECISION

[✓ Accept & Publish]    Green, 48px
[⚠ Request Revision]   Amber, 48px
[✗ Decline]            Red, 48px

[← Previous]   [Next →]
```

Accept action: triggers Cloudflare Worker pipeline for distribution + sets artifact live.
Decline action: opens modal to write reason → creates case thread.
Request Revision: opens modal to write specific request → creates case thread, status becomes "Needs Revision".

---

### 8.3 User Management

**File:** `app/(admin)/admin/users/page.tsx`

Table of all contributors.
Columns: AVATAR | USERNAME | EMAIL | CONSENT TIER | SUBMISSIONS | PUBLISHED | JOINED | ACTIONS

Actions: View profile, Change consent tier, Suspend, Delete.

Search bar at top: search by username or email.

---

## 9. Special Interactions & Features

### 9.1 3D Photogrammetry Upload Flow

**Component:** `components/upload/PhotogrammetryUpload.tsx`

This is the most technically novel feature. Specification:

**User Flow:**

1. User selects "Physical Object (360° Photos)" as Division 2 sub-type in Step 2 of submission.
2. Step 4 (Files) shows the photo upload interface.
3. User uploads 4–6 photos.
4. User assigns an angle label to each photo (Front, Back, Left Side, Right Side, Top/Aerial, Bottom).
5. User clicks "Generate 360° View".
6. A POST request is sent to a backend API endpoint (e.g. `/api/photogrammetry/stitch`).
7. The server processes the images using a Node.js photogrammetry library.
8. Progress is shown via Server-Sent Events or polling.
9. When complete, the 360° viewer preview appears inline.
10. User can confirm and proceed to Step 5.

**Technical approach for stitching (backend):**
- Use `node-hugin` or a similar JS binding for Hugin panorama stitcher
- Alternatively: use a Python microservice with `OpenCV` + `cv2.Stitcher_create()`
- Store original photos AND stitched result in Oracle Cloud
- The stitched result is a single equirectangular JPEG (4096×2048px)

**If stitching fails:**
- Fallback: display as a swipeable photo gallery (4–6 images, swipe left/right)
- User is informed: "We couldn't generate a 360° view automatically. Your photos will be displayed as a gallery instead."

---

### 9.2 Code Syntax Viewer

**Component:** `components/viewers/CodeViewer.tsx`

Uses `react-syntax-highlighter` with `oneDark` theme.

**Language detection:** Based on file extension (automatic). If unknown extension, default to plaintext.

**Features:**
- Line numbers (always on)
- Copy-to-clipboard button (top-right of viewer)
- Line highlighting: specific lines can be highlighted (for featured code snippets)
- "View Raw" button: opens raw file in new tab
- "Download" button: triggers file download
- Word-wrap toggle
- Font size toggle: S / M / L (14px / 16px / 18px)

**ZIP file handling:**
- ZIP is extracted server-side on upload
- File tree JSON is stored in database alongside artifact
- Frontend renders the file tree in a sidebar
- Clicking any file loads that file's content into the viewer via API call

**Code statistics (shown in sidebar of artifact page):**
```
CODE STATISTICS
Language:      Python
Lines of code: 312
Files:         1
File size:     14.2 KB
```

---

### 9.3 3D Object Viewer (Three.js)

**Component:** `components/viewers/ThreeDViewer.tsx`

**Technical stack:** `three`, `@react-three/fiber`, `@react-three/drei`

**Viewer features:**
- OrbitControls (drag to rotate, scroll to zoom, right-click to pan)
- Auto-rotation on first load (pauses when user interacts)
- Grid floor (subtle, `--surface-2` color)
- Ambient light + directional light (positioned to highlight object form)
- Background: `--color-ink` dark (makes objects pop)
- Wireframe toggle button
- Reset camera button

**Supported formats:** `.obj`, `.fbx`, `.gltf`, `.glb`, `.stl`

For formats not natively supported by three.js loaders, provide a download link instead of the viewer.

**Performance:**
- Model is loaded from Oracle Cloud URL directly
- Loading state: spinner + "Loading 3D model..." centered in viewer
- If model exceeds 50MB, show a warning: "This model is large and may load slowly."

---

### 9.4 Social Share & Distribution

**Component:** `components/social/SharePanel.tsx`

**Share button** on every artifact page opens a panel:

```
Share This Artifact

[Copy Link]   → copies full URL to clipboard, shows "Copied!" for 2s

Share on:
[X / Twitter]   [WhatsApp]   [Bluesky]   [Mastodon]   [LinkedIn]   [Discord]

[Embed this artifact]   → shows embeddable iframe code
```

**Embed code:**
```html
<iframe 
  src="https://press.openrockets.com/embed/artifact/[slug]" 
  width="400" height="300" frameborder="0">
</iframe>
```

The `/embed/artifact/[slug]` route renders a minimal, non-navigable version of the artifact card.

**Post-moderation automated distribution (backend, triggered by Cloudflare Worker):**

When admin accepts an artifact, the Worker fires and posts to:
- X/Twitter (Open Rockets Press account) via Twitter API v2
- Bluesky (via AT Protocol API)
- Mastodon (via Mastodon API — free, no payment)
- Any other platforms with free write APIs

Post format:
```
🚀 New on Open Rockets Press:

"[Artifact Title]" — [type] by [creator name]

[Division badge emoji] [License badge]

Explore → [URL]

#OpenRocketsPress #YouthCreators #[relevant tag]
```

---

### 9.5 SEO & Schema Markup Layer

**Implementation:** In `app/(public)/artifact/[slug]/page.tsx` using Next.js `generateMetadata()`.

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const artifact = await getArtifact(params.slug);
  return {
    title: `${artifact.title} — Open Rockets Press`,
    description: artifact.abstract,
    openGraph: {
      title: artifact.title,
      description: artifact.abstract,
      url: `https://press.openrockets.com/artifact/${params.slug}`,
      images: [{
        url: `/api/og?slug=${params.slug}`,
        width: 1200,
        height: 630,
      }],
      type: 'article',
      publishedTime: artifact.acceptedAt,
      authors: [artifact.creatorUsername],
    },
    twitter: {
      card: 'summary_large_image',
      title: artifact.title,
      description: artifact.abstract,
      images: `/api/og?slug=${params.slug}`,
    },
  };
}
```

**Schema.org JSON-LD injection:**

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{
  __html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": artifact.title,
    "description": artifact.abstract,
    "author": { "@type": "Person", "name": artifact.creatorName },
    "datePublished": artifact.acceptedAt,
    "license": `https://press.openrockets.com/license/${artifact.license}`,
    "publisher": { "@type": "Organization", "name": "Open Rockets Press", "url": "https://press.openrockets.com" },
    "keywords": artifact.tags.join(', '),
    "identifier": `ORP-${artifact.id}`,
    "url": `https://press.openrockets.com/artifact/${params.slug}`,
  })
}} />
```

**Pinging on publish (Cloudflare Worker):**

On artifact acceptance, the worker pings:
- `https://pingomatic.com/ping/` — Ping-O-Matic
- `https://www.google.com/ping?sitemap=[sitemap-url]` — Google sitemap ping
- `https://www.bing.com/webmaster/ping.aspx?siteMap=[sitemap-url]` — Bing ping

**Sitemap:** `/sitemap.xml` is dynamically generated by Next.js:
```tsx
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const artifacts = await getAllPublishedArtifacts();
  return artifacts.map(a => ({
    url: `https://press.openrockets.com/artifact/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));
}
```

**Robots.txt:** `/robots.txt`
```
User-agent: *
Allow: /
Disallow: /workspace/
Disallow: /admin/
Sitemap: https://press.openrockets.com/sitemap.xml
```

---

### 9.6 Dynamic OG Image Generation

**Route:** `app/api/og/route.tsx`

Uses `@vercel/og` (Satori) to generate 1200×630 OG images dynamically.

**Design of OG image:**
- Background: `--color-ink` dark blue
- Top-left: OR logo + "PRESS" wordmark (white)
- Center: Artifact title in Playfair Display Bold white, up to 3 lines
- Below title: Creator name in smaller Inter (gold color)
- Bottom-left: Division badge + License badge
- Bottom-right: Star rating (gold stars) + "press.openrockets.com"
- Right side (if thumbnail available): artifact thumbnail image, 40% of width

---

## 10. Animation & Motion System

### Guiding Principle

Motion in Open Rockets Press is always purposeful. It communicates state changes, hierarchy, and transitions. It is never decorative. Every animation has a reason.

### Global Transitions

**Page transitions (between routes):**
Next.js App Router page transitions: use `framer-motion` with `AnimatePresence`.

```tsx
// Standard page enter animation:
initial:   { opacity: 0, y: 12 }
animate:   { opacity: 1, y: 0 }
exit:      { opacity: 0, y: -8 }
transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
```

**Card hover:**
- Transform: `translateY(-2px)` — 200ms standard easing
- Shadow: `--shadow-card` → `--shadow-card-hover` — 200ms

**Button interactions:**
- Default: `--color-gold` background
- Hover: `brightness(1.08)` filter — 150ms
- Active/pressed: `scale(0.97)` + `brightness(0.96)` — 100ms

**Skeleton shimmer:**
```css
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.skeleton {
  background: linear-gradient(90deg, #EAE4D4 25%, #DDD5C0 50%, #EAE4D4 75%);
  background-size: 800px 100%;
  animation: shimmer 1.5s infinite;
}
```

**Star rating interaction:**
Stars fill left-to-right as cursor moves over them. Each star scales up slightly on hover (`scale(1.2)`).

**Toast enter/exit:**
```
enter: slide up from bottom + fade in (300ms)
exit:  fade out + slide down (250ms)
```

**Modal:**
```
backdrop: fade in 200ms
modal card: scale(0.95) + opacity 0 → scale(1) + opacity 1, 250ms decel easing
```

**3D viewer auto-rotate:**
On page load, object slowly rotates (1 full rotation per 8 seconds). Stops immediately on first user interaction. Does not restart.

**Hero banner slide transition:**
Crossfade (opacity transition), 500ms. Slide indicator dot expands slightly when active.

### Reduced Motion

All animations respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Responsive Design Breakpoints

```
xs:   0 – 480px      (small mobile)
sm:   481 – 640px    (large mobile)
md:   641 – 768px    (small tablet)
lg:   769 – 1024px   (tablet landscape)
xl:   1025 – 1280px  (small desktop)
2xl:  1281px+        (large desktop)
```

**Breakpoint-specific behaviors:**

| Element | Desktop (xl+) | Tablet (md–lg) | Mobile (xs–sm) |
|---|---|---|---|
| Artifact grid | 4 columns | 2 columns | 1 column |
| Browse page | 3 columns (filter+results+sort) | filter drawer + results | filter drawer + results |
| Workspace sidebar | Visible (240px) | Collapsible (0px, hamburger) | Bottom nav bar |
| Hero banner | 480px height | 360px height | 240px height |
| Footer | 4 columns | 2 columns | 1 column, stacked |
| Nav bar | Full layout | Logo + search + avatar | Logo + hamburger |
| License cards | 4 in a row | 2×2 grid | 1 column |
| Browse filter sidebar | Always visible | Drawer | Drawer |
| 3D viewer | 600px height | 400px height | 280px height |
| Submission form | 600px centered | Full width | Full width |

**Mobile workspace navigation:**
On mobile, the left sidebar becomes a bottom navigation bar (iOS/Android style):
```
[Dashboard]  [Submit]  [Cases]  [Artifacts]  [Profile]
     🏠          ⬆         📬       📁          👤
```
Each item: icon + label, 48px height, `--surface-2` background, 1px top border.

---

## 12. Onboarding Flow

**File:** `app/(public)/get-started/page.tsx`
**URL:** `/get-started`

This is the page linked from "Get Started" in the nav. It is an interactive guided explanation of the platform.

**Layout:** Stepped cards, one at a time, with forward/back navigation. Each step is a single focused screen.

**Step 1 — Welcome:**
Big header: "Welcome to Open Rockets Press."
Subtext: "The archive for the next generation of creators."
CTA: "Get Started →"

**Step 2 — What is this?**
Illustration: Three division icons in a row, large.
Text: "Open Rockets Press is a moderated publishing platform where young creators can protect and share their original work — physical, digital, or 3D."

**Step 3 — Choose Your Division:**
Interactive selection: three panels as described in Step 2 of submission form.
"Which of these best describes what you want to publish?"

**Step 4 — Understand Licensing:**
License comparison table (same as license pages).
"Every artifact is protected by one of our four licenses."

**Step 5 — How Moderation Works:**
Timeline graphic:
```
[Submit] → [Under Review (2–3 days)] → [Accepted → Published!]
                                     ↘ [Declined with feedback]
```

**Step 6 — Create Your Account / Sign In:**
Since accounts are already implemented, this step links to the Open Rockets sign-up/sign-in flow.
If already signed in: "You're ready! Go to your workspace →"

---

## 13. Error & Empty States

Every empty or error state follows this rule: **tell the person what happened, and tell them one thing they can do about it.**

### 404 Page

**File:** `app/not-found.tsx`

Layout: full-screen, centered vertically.
Artwork: The OR statue silhouette tilted at 15°, ink color, 120px.
Headline: "This page doesn't exist." (Playfair Display 40px)
Subtext: "The artifact or page you're looking for has moved or never existed."
CTA: "[Browse the Archive →]" (gold button) + "Search →" (text link)

### 500 Error Page

**File:** `app/error.tsx`

"Something went wrong on our end."
Subtext: "We've been notified. Try refreshing, or come back in a few minutes."
CTA: "[Refresh Page]" + "[Go Home →]"

### Empty States (per section)

| Page / Section | Empty state message | Icon |
|---|---|---|
| Browse page (no results) | "Nothing here yet. Be the first to publish in this category." | Grid icon |
| Search (no results) | "No results for [query]. Try different keywords." | Search icon |
| Dashboard (no submissions) | "No submissions yet. Start by sending your first publication for review." | Upload icon |
| Cases Inbox (no cases) | "No active cases. Cases are opened by moderators when they need to reach you." | Inbox icon |
| Your Artifacts (empty) | "You haven't published anything yet. Change that." | File icon |
| Creator profile (no artifacts) | "[Name] hasn't published any artifacts yet." | FileX icon |
| Recommendations (none) | Section simply does not render | N/A |

---

## 14. Development Phases — 45 Phases in Sequence

This section defines the exact order of development. Each phase must be completed and tested before the next begins. Phases build on each other.

---

### PHASE 1 — Project Scaffolding & Configuration

**Deliverable:** A working Next.js 14+ App Router project with all dependencies installed.

Tasks:
- Initialize Next.js project: `npx create-next-app@latest openrockets-press --typescript --tailwind --app --src-dir`
- Install dependencies:
  ```
  npm install framer-motion lucide-react react-syntax-highlighter @types/react-syntax-highlighter three @react-three/fiber @react-three/drei @vercel/og pannellum react-pdf
  ```
- Set up `next.config.js`: enable image optimization, define allowed image hostnames (Oracle Cloud storage URL)
- Set up path aliases in `tsconfig.json`: `@/` → `./src/`
- Create `src/lib/`, `src/components/`, `src/types/`, `src/hooks/`, `src/utils/` directories
- Verify: `npm run dev` shows default Next.js page without errors

---

### PHASE 2 — Design Token System

**Deliverable:** All CSS custom properties defined and verified.

Tasks:
- Create `src/styles/globals.css` with complete color tokens, typography tokens, spacing, shadows, motion variables (all from Section 2 of this document)
- Import `globals.css` in `src/app/layout.tsx`
- Extend `tailwind.config.js` to reference CSS variables
- Create `src/styles/typography.css` with named text style classes
- Verify: open browser dev tools, confirm all `--color-*` variables are present on `:root`

---

### PHASE 3 — Font System

**Deliverable:** Playfair Display, Inter, and JetBrains Mono loaded and applied.

Tasks:
- Create `src/lib/fonts.ts` with `next/font` configuration for all three fonts
- Apply font variables in `src/app/layout.tsx` on `<html>` element
- Set `font-family` defaults in `globals.css` using the CSS variables
- Test: render a page with h1 (Playfair), p (Inter), and code (JetBrains Mono) to verify rendering

---

### PHASE 4 — Custom SVG Icon System

**Deliverable:** All 8 custom SVG icons created and wrapped as React components.

Tasks:
- Design or commission the following as clean SVGs (24×24 viewBox):
  - `ORPressLogo` — the statue silhouette (refine existing)
  - `DivisionArtifact` — document with corner curl
  - `Division3D` — wireframe cube
  - `DivisionCode` — bracket `{` with dot
  - `LicenseEagle` — eagle in flight, side profile
  - `LicenseBeaver` — beaver side profile
  - `LicenseFox` — fox head silhouette
  - `LicenseFinch` — small bird on branch
- Create `src/components/icons/` directory
- Wrap each SVG as a React component accepting `size`, `color`, `className` props
- Export all from `src/components/icons/index.ts`

---

### PHASE 5 — Navigation Bar Component

**Deliverable:** Fully functional public navigation bar.

Tasks:
- Create `src/components/layout/PublicNav.tsx`
- Implement logo + wordmark area
- Implement rotating quote carousel (8-second auto-rotation, crossfade, 5+ quotes hard-coded)
- Implement search icon (click navigates to `/search`)
- Implement "Get started" and "Publish" links
- Implement avatar circle with initials (read from auth context, which is already implemented)
- Implement dropdown menu (Dashboard, Your Profile, Your Artifacts, About, Sign Out)
- Implement mobile hamburger + slide-in drawer
- Import and use in `src/app/layout.tsx`
- Test at 1440px, 1024px, 768px, 375px widths

---

### PHASE 6 — Footer Component

**Deliverable:** Full footer with 4 columns.

Tasks:
- Create `src/components/layout/Footer.tsx`
- Implement 4-column grid (Brand, Browse, Licenses, Platform)
- Implement social icons row (X, Bluesky, Mastodon)
- Implement bottom copyright bar
- Test mobile stacked layout
- Import in `src/app/layout.tsx` below main content

---

### PHASE 7 — Workspace Sidebar Component

**Deliverable:** The contributor workspace sidebar.

Tasks:
- Create `src/components/layout/WorkspaceSidebar.tsx`
- Implement user identity block (avatar, name, role badge)
- Implement navigation items with icons, labels, sub-labels
- Implement active state detection using `usePathname()` from Next.js
- Create `src/app/(workspace)/layout.tsx` wrapping the sidebar
- Test sidebar at all breakpoints; implement mobile bottom nav for mobile

---

### PHASE 8 — Artifact Card Component

**Deliverable:** The ArtifactCard component in all three variants.

Tasks:
- Create `src/components/cards/ArtifactCard.tsx`
- Implement thumbnail area (image, 3D overlay, code preview)
- Implement division badge + license badge row
- Implement title, creator, date, description
- Implement star rating display
- Implement tags row (max 3 + overflow indicator)
- Implement hover animation (translateY, shadow change)
- Create `compact` and `list-row` size variants
- Build a Storybook story or standalone test page showing all variants

---

### PHASE 9 — License Badge Component

**Deliverable:** LicenseBadge component with all 4 licenses.

Tasks:
- Create `src/components/badges/LicenseBadge.tsx`
- Implement 4 license types with correct colors and mascot icons
- Implement 3 sizes (sm, md, lg)
- Implement tooltip on hover showing license one-liner
- Implement link to `/license/[name]`
- Test all 4 × 3 = 12 badge variants

---

### PHASE 10 — Star Rating Component

**Deliverable:** StarRating component in display and interactive modes.

Tasks:
- Create `src/components/reviews/StarRating.tsx`
- Implement display mode (read-only, supports half-stars)
- Implement interactive mode (hover fill left-to-right, click to select)
- Implement animation on star selection (scale pulse)
- Accept `onRate` callback prop for submission

---

### PHASE 11 — Toast / Notification System

**Deliverable:** Toast notification system working globally.

Tasks:
- Create `src/components/ui/Toast.tsx` and `src/lib/toast.ts`
- Implement context-based toast queue (`ToastProvider`)
- Implement enter/exit animations
- Implement 4 types (success, error, info, warning)
- Implement auto-dismiss (4 seconds)
- Wrap `src/app/layout.tsx` with `ToastProvider`
- Test all 4 types; test stacking behavior (up to 3)

---

### PHASE 12 — Skeleton Loader System

**Deliverable:** Shimmer skeleton components.

Tasks:
- Create `src/components/ui/Skeleton.tsx` with base shimmer component
- Create `ArtifactCardSkeleton`, `ArtifactDetailSkeleton`, `ProfileSkeleton`, `DashboardSkeleton`
- Use in all relevant loading states

---

### PHASE 13 — Modal System

**Deliverable:** Generic modal component.

Tasks:
- Create `src/components/ui/Modal.tsx` using `createPortal`
- Implement backdrop (blur, semi-transparent)
- Implement enter/exit animation
- Implement header, body, footer slots
- Implement `useModal()` hook for opening/closing from anywhere
- Test modal overflow (scrollable body when content is long)

---

### PHASE 14 — Homepage Layout & Sections

**Deliverable:** The homepage at `/` fully built.

Tasks (implement each section in order):
1. **Hero banner** — Three-slide animated banner (refine existing)
2. **Category strip** — Horizontal navigation tabs
3. **Stats bar** — Three live stats (mock data initially)
4. **New Releases section** — 4-column grid (mock ArtifactCards)
5. **Featured Contributions** — Editorial 50/50 layout
6. **Browse by Division** — Three division panels
7. **Trending row** — Horizontal scroll carousel
8. **License callout** — Four license cards
9. **Contributor CTA** — Dark full-width section

Test at all breakpoints. Connect to real data once Oracle Cloud integration is done.

---

### PHASE 15 — Browse / Catalog Page

**Deliverable:** Full browse page at `/browse`.

Tasks:
- Implement three-column layout (filter sidebar, results, sort bar)
- Implement filter sidebar with all filter groups
- Implement results header (count, sort, view toggle)
- Implement grid view and list view
- Implement pagination (24 per page)
- Implement "Clear all filters" functionality
- Implement URL-based filter state (filters reflected in URL query params)

---

### PHASE 16 — Search System

**Deliverable:** Search overlay + search results page.

Tasks:
- Create search overlay component (expands from nav search icon)
- Create `src/app/(public)/search/page.tsx`
- Implement top filter bar for search results
- Implement list-row result cards
- Implement no-results empty state
- Implement search term highlighting in descriptions

---

### PHASE 17 — Category Pages (×3)

**Deliverable:** `/category/artifacts`, `/category/3d`, `/category/code`

Tasks:
- Create colored hero section for each
- Implement sub-category tabs
- Implement filtered artifact grid below
- Apply correct division color theming

---

### PHASE 18 — Standard Artifact Detail Page

**Deliverable:** `/artifact/[slug]` fully functional for Division 1 artifacts.

Tasks:
- Breadcrumb navigation
- Title + metadata block (division badge, license badge, stats)
- Tab navigation (Overview, File Preview, Reviews, Comments)
- **Overview tab:** Description renderer + tags + creator note
- **File Preview tab:** PDF iframe viewer + image lightbox + download button
- Right sidebar: creator info, artifact details, tags, action buttons, license panel
- Recommendations rows (3 rows × 4 compact cards)
- Schema.org JSON-LD injection
- generateMetadata() function
- Test sharing on WhatsApp/Discord to verify link preview

---

### PHASE 19 — 3D Artifact Detail Page

**Deliverable:** 3D viewer working on artifact detail page.

Tasks:
- Install `three`, `@react-three/fiber`, `@react-three/drei`
- Create `ThreeDViewer.tsx` component
- Implement OBJ loading from Oracle Cloud URL
- Implement OrbitControls (drag/scroll/pan)
- Implement auto-rotation that pauses on interaction
- Implement wireframe toggle
- Implement fullscreen mode
- Add "3D" overlay badge on card thumbnails for Division 2 items
- Test with sample .obj file

---

### PHASE 20 — Code Artifact Detail Page

**Deliverable:** Code viewer working on artifact detail page.

Tasks:
- Install `react-syntax-highlighter`
- Create `CodeViewer.tsx` component
- Implement language detection from file extension
- Implement line numbers, copy button, download button
- Implement ZIP file tree sidebar (for ZIP uploads)
- Implement word-wrap and font size toggles
- Display code statistics in sidebar

---

### PHASE 21 — Reviews & Ratings System

**Deliverable:** Reviews tab on artifact detail page fully functional.

Tasks:
- Implement rating summary widget (bar chart + overall score)
- Implement review submission modal (login required)
- Implement individual review cards (avatar, rating, content, helpful votes, report)
- Implement "Helpful" voting on reviews
- Implement review sorting (Most Helpful, Newest)
- Connect to Oracle Cloud reviews table

---

### PHASE 22 — Comments System

**Deliverable:** Comments tab on artifact detail page.

Tasks:
- Implement comment submission (login required)
- Implement threaded comment display (1 level of nesting)
- Implement like/upvote on comments
- Implement reply to comment
- Implement report comment
- Connect to Oracle Cloud comments table

---

### PHASE 23 — Creator Profile Page

**Deliverable:** `/creator/[username]` fully functional.

Tasks:
- Implement dark hero section (avatar, name, stats)
- Implement bio section
- Implement artifacts grid with division tabs
- Connect to Oracle Cloud: fetch creator's published artifacts

---

### PHASE 24 — License Information Pages (×4)

**Deliverable:** All four `/license/*` pages.

Tasks:
- Implement hero panel (license color, mascot icon, name)
- Implement permissions table
- Implement narrative explanation
- Implement comparison table (appears on all 4 pages)
- Implement "use this license" guidance section

---

### PHASE 25 — About Page

**Deliverable:** `/about` page fully built.

Tasks:
- Implement all 9 sections as described in Section 6.10
- Implement division infographic (three panels with real counts from Oracle Cloud)

---

### PHASE 26 — Onboarding / Get Started Flow

**Deliverable:** `/get-started` interactive walkthrough.

Tasks:
- Implement multi-step card flow with forward/back navigation
- Implement division selection (interactive, saves to session)
- Implement license comparison table
- Implement moderation timeline graphic
- Final step links to sign-in/sign-up (existing implementation)

---

### PHASE 27 — Contributor Workspace Dashboard

**Deliverable:** `/workspace` dashboard for authenticated users.

Tasks:
- Implement three stat cards (Publications, Cases, Consent Tier)
- Implement Recent Submissions table with status badges
- Implement Recent Cases table with priority badges
- Implement empty states for new users
- Connect to Oracle Cloud: fetch real data from authenticated user's records
- Implement quick action buttons

---

### PHASE 28 — Submission Form — Steps 1 & 2

**Deliverable:** Steps 1 (Basic Info) and 2 (Division & Type) of the submission wizard.

Tasks:
- Implement step progress indicator component
- Implement Step 1 form (Title, Description, character counter)
- Implement Step 2 division selection (3 large cards)
- Implement Step 2 sub-type dropdown (changes based on division)
- Implement form state management (use `react-hook-form` or `zustand` store for multi-step state)
- Implement forward/back navigation between steps
- Validate Step 1 before allowing progress to Step 2

---

### PHASE 29 — Submission Form — Step 3 (License)

**Deliverable:** Step 3 license selection.

Tasks:
- Implement four large license selection cards
- Implement selected state (highlighted border + checked indicator)
- Implement "Compare licenses" modal (opens comparison table)
- Implement validation (must select a license before proceeding)

---

### PHASE 30 — Submission Form — Step 4 (Files)

**Deliverable:** File upload step with all division variants.

Tasks:
- Implement drag-and-drop upload zone
- Implement file chip display after upload (filename + remove button)
- Implement Oracle Cloud storage upload with progress bar
- Implement Division 1 variant (single file + optional cover image)
- Implement Division 2 variant: 3D file upload
- Implement Division 2 photogrammetry variant: 4–6 photos + angle labels + "Generate 360°" button
- Implement Division 3 variant: code file / ZIP upload + optional thumbnail
- Handle upload errors gracefully
- Implement chunked upload for large files

---

### PHASE 31 — Photogrammetry Pipeline (Backend + Frontend)

**Deliverable:** The 360° view generation from multiple photos.

Tasks:
- Set up backend API endpoint (`/api/photogrammetry/stitch`)
- Implement image upload to Oracle Cloud temp storage
- Implement stitching pipeline (Node.js or Python microservice)
- Implement Server-Sent Events for progress reporting
- Implement progress UI in submission form (0%→100% bar)
- Implement fallback gallery view when stitching fails
- Create `PhotogrammetryViewer.tsx` component (equirectangular panorama viewer)

---

### PHASE 32 — Submission Form — Steps 5 & 6

**Deliverable:** Steps 5 (Tags & Metadata) and 6 (Review & Submit).

Tasks:
- Implement Step 5: tag input (add-on-enter, pill chips with remove), year dropdown, school input, creator's note textarea
- Implement Step 6: read-only summary of all previous steps
- Implement two confirmation checkboxes
- Implement "Submit for Review" button
- On success: POST to Oracle Cloud, show success toast, redirect to `/workspace`
- On failure: show error toast, remain on Step 6

---

### PHASE 33 — Cases Inbox & Case Detail Thread

**Deliverable:** `/workspace/cases` and `/workspace/cases/[caseId]`.

Tasks:
- Implement cases list table (case number, priority, status, last activity, view link)
- Implement empty state
- Implement case detail thread (message list, reply box, case sidebar)
- Implement reply submission (POST to Oracle Cloud)
- Implement real-time updates (Oracle Cloud Realtime subscription for new messages)

---

### PHASE 34 — Your Artifacts Page

**Deliverable:** `/workspace/artifacts` management view.

Tasks:
- Implement tab navigation (All / Published / Under Review / Declined / Draft)
- Implement management table (thumbnail, title+type, status, division, date, views, rating, actions)
- Implement "View →" link to public artifact page
- Implement "Archive" action (soft delete)

---

### PHASE 35 — Profile & Settings Page

**Deliverable:** `/workspace/profile` settings.

Tasks:
- Implement bio, location, social links (read + edit)
- Implement submission defaults (license, division)
- Implement notification preferences (checkboxes, save to Oracle Cloud)
- Implement privacy toggles
- Connect all fields to Oracle Cloud user profiles table

---

### PHASE 36 — Admin Queue Page

**Deliverable:** `/admin/queue` moderation queue.

Tasks:
- Implement admin layout (darker sidebar, ink header)
- Implement queue stat strip (Pending, Flagged, Accepted Today, Declined Today)
- Implement sortable table with all columns
- Implement wait time color-coded badges
- Implement batch selection and batch actions
- Implement filters

---

### PHASE 37 — Admin Review Panel

**Deliverable:** `/admin/review/[submissionId]` full review panel.

Tasks:
- Implement two-panel layout (content left, controls right)
- Implement quality assessment rating inputs
- Implement Accept / Request Revision / Decline buttons
- Accept action: triggers Cloudflare Worker (webhook)
- Decline action: opens modal for reason, creates case thread
- Implement Previous/Next navigation through queue

---

### PHASE 38 — Admin User Management

**Deliverable:** `/admin/users` user list.

Tasks:
- Implement user table (avatar, username, email, consent tier, submissions, published, joined)
- Implement search by username/email
- Implement actions (view profile, change tier, suspend, delete)
- Implement confirmation modals for destructive actions

---

### PHASE 39 — Social Share Panel

**Deliverable:** Share panel on artifact detail pages.

Tasks:
- Create `SharePanel.tsx` component
- Implement copy-link button (clipboard API)
- Implement share links (X, WhatsApp, Bluesky, Mastodon, LinkedIn, Discord)
- Implement embed code display
- Create `/embed/artifact/[slug]` route for embeds

---

### PHASE 40 — Dynamic OG Image Generation

**Deliverable:** `/api/og` route generating dynamic Open Graph images.

Tasks:
- Create `src/app/api/og/route.tsx`
- Install `@vercel/og`
- Design OG image layout (dark background, title, creator, division badge, star rating, URL)
- Accept `slug` query param, fetch artifact data, render image
- Test by pasting artifact URL into WhatsApp, Discord, LinkedIn

---

### PHASE 41 — SEO & Schema.org Layer

**Deliverable:** All public pages have full SEO metadata and JSON-LD.

Tasks:
- Implement `generateMetadata()` on all artifact detail pages
- Implement JSON-LD script injection on artifact pages
- Implement `app/sitemap.ts` dynamic sitemap
- Implement `app/robots.ts`
- Test sitemap at `/sitemap.xml`
- Verify Google Rich Results Test passes for schema markup

---

### PHASE 42 — Post-Moderation Distribution (Cloudflare Worker)

**Deliverable:** Automated social posting on artifact acceptance.

Tasks:
- Create Cloudflare Worker `press-distribution-worker.js`
- Implement webhook receiver (triggered by Oracle Cloud DB webhook on status change to 'accepted')
- Implement Twitter/X API v2 posting
- Implement Bluesky AT Protocol posting
- Implement Mastodon API posting
- Implement Ping-O-Matic + Google/Bing sitemap pinging
- Test end-to-end: accept a test artifact in admin → verify posts appear on social accounts

---

### PHASE 43 — Animation Layer & Micro-interactions

**Deliverable:** All motion/animation from Section 10 implemented.

Tasks:
- Install `framer-motion`
- Implement page transition animations (AnimatePresence)
- Implement card hover lift animations (CSS transitions)
- Implement button press animations
- Implement toast enter/exit animations
- Implement modal enter/exit animations
- Implement 3D viewer auto-rotation
- Implement hero banner slide crossfade
- Verify all animations respect `prefers-reduced-motion`

---

### PHASE 44 — Responsive & Mobile Polish

**Deliverable:** All pages fully responsive at all breakpoints.

Tasks:
- Systematically test every page at: 375px, 480px, 640px, 768px, 1024px, 1280px, 1440px
- Fix any overflow, wrapping, or layout issues at each breakpoint
- Implement mobile bottom nav for workspace
- Verify touch interactions work (carousel swiping, 3D viewer drag, dropdown menus)
- Verify all tap targets are minimum 44×44px (accessibility)

---

### PHASE 45 — Quality Audit & Launch Readiness

**Deliverable:** Production-ready codebase.

Tasks:
- **Accessibility audit:** Test with keyboard-only navigation. Add `aria-label`, `aria-live`, `role` attributes where missing. All interactive elements must be reachable via Tab. Focus rings must be visible.
- **Performance audit:** Run Lighthouse on homepage, browse page, and one artifact detail page. Target: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95. Optimize any images using `next/image`. Check for unused JS bundles.
- **Error state coverage:** Visit every page while disconnected from internet. Verify all empty/error states render correctly.
- **Cross-browser testing:** Chrome, Firefox, Safari, Edge. Fix any CSS incompatibilities.
- **Security review:** Ensure all API routes validate authentication. Ensure file uploads are type-checked server-side. Ensure Oracle Cloud Row Level Security (RLS) policies are set.
- **Final visual QA:** Screenshot every page at 1440px and compare against this specification. Document any deviations.
- **Environment variables:** Document all required environment variables in `README.md`.
- **Deployment:** Deploy to Vercel (or chosen host). Configure custom domain. Set up Cloudflare proxy.

---

## APPENDIX A — Environment Variables Required

```bash
# Oracle Cloud
NEXT_PUBLIC_Oracle Cloud_URL=
NEXT_PUBLIC_Oracle Cloud_ANON_KEY=
Oracle Cloud_SERVICE_ROLE_KEY=

# Cloudflare
CLOUDFLARE_WORKER_SECRET=
CLOUDFLARE_ACCOUNT_ID=

# Social Distribution
TWITTER_BEARER_TOKEN=
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=
BLUESKY_USERNAME=
BLUESKY_APP_PASSWORD=
MASTODON_INSTANCE_URL=
MASTODON_ACCESS_TOKEN=

# Open Graph Image
OG_SECRET=

# Open Rockets Auth (already implemented)
NEXT_PUBLIC_OR_AUTH_URL=
OR_AUTH_SECRET=
```

---

## APPENDIX B — Oracle Cloud Table Definitions (for frontend integration)

These are the tables the frontend consumes. Backend implementation may differ.

```sql
artifacts (
  id uuid primary key,
  slug text unique,
  title text,
  abstract text,
  division text,  -- 'artifacts' | '3d' | 'code'
  type text,
  license text,   -- 'eagle' | 'beaver' | 'fox' | 'finch'
  file_url text,
  cover_url text,
  creator_id uuid,
  tags text[],
  year_created int,
  school text,
  creator_note text,
  status text,    -- 'pending' | 'under_review' | 'accepted' | 'declined' | 'needs_revision'
  submitted_at timestamptz,
  accepted_at timestamptz,
  view_count int,
  bookmark_count int,
  avg_rating numeric,
  review_count int
)

reviews (
  id uuid primary key,
  artifact_id uuid references artifacts,
  user_id uuid,
  rating int,
  content text,
  created_at timestamptz,
  helpful_count int
)

comments (
  id uuid primary key,
  artifact_id uuid references artifacts,
  user_id uuid,
  parent_id uuid references comments,
  content text,
  created_at timestamptz,
  like_count int
)

cases (
  id uuid primary key,
  artifact_id uuid references artifacts,
  creator_id uuid,
  subject text,
  status text,
  priority text,
  created_at timestamptz,
  updated_at timestamptz
)

case_messages (
  id uuid primary key,
  case_id uuid references cases,
  sender_id uuid,
  sender_type text,  -- 'creator' | 'moderator'
  content text,
  created_at timestamptz
)

creator_profiles (
  id uuid primary key,
  user_id uuid unique,
  display_name text,
  bio text,
  location text,
  website_url text,
  github_url text,
  youtube_url text,
  school text,
  consent_tier text,
  joined_at timestamptz
)
```

---

## APPENDIX C — Component Directory Summary

```
src/
└── components/
    ├── layout/
    │   ├── PublicNav.tsx
    │   ├── WorkspaceSidebar.tsx
    │   ├── AdminSidebar.tsx
    │   └── Footer.tsx
    ├── cards/
    │   └── ArtifactCard.tsx
    ├── badges/
    │   ├── LicenseBadge.tsx
    │   └── DivisionBadge.tsx
    ├── reviews/
    │   ├── StarRating.tsx
    │   ├── ReviewCard.tsx
    │   └── RatingSummary.tsx
    ├── comments/
    │   ├── CommentThread.tsx
    │   └── CommentCard.tsx
    ├── viewers/
    │   ├── ThreeDViewer.tsx
    │   ├── CodeViewer.tsx
    │   ├── PhotogrammetryViewer.tsx
    │   └── PDFViewer.tsx
    ├── upload/
    │   ├── FileDropZone.tsx
    │   └── PhotogrammetryUpload.tsx
    ├── social/
    │   └── SharePanel.tsx
    ├── search/
    │   └── SearchBar.tsx
    ├── submission/
    │   ├── StepIndicator.tsx
    │   ├── Step1BasicInfo.tsx
    │   ├── Step2Division.tsx
    │   ├── Step3License.tsx
    │   ├── Step4Files.tsx
    │   ├── Step5Metadata.tsx
    │   └── Step6Review.tsx
    ├── icons/
    │   ├── ORPressLogo.tsx
    │   ├── DivisionArtifact.tsx
    │   ├── Division3D.tsx
    │   ├── DivisionCode.tsx
    │   ├── LicenseEagle.tsx
    │   ├── LicenseBeaver.tsx
    │   ├── LicenseFox.tsx
    │   ├── LicenseFinch.tsx
    │   └── index.ts
    └── ui/
        ├── Toast.tsx
        ├── Modal.tsx
        ├── Skeleton.tsx
        ├── Button.tsx
        ├── Input.tsx
        ├── Textarea.tsx
        ├── Dropdown.tsx
        ├── Badge.tsx
        ├── Tag.tsx
        └── Pagination.tsx
```

---

*End of Open Rockets Press Frontend UI Implementation Plan — v1.0*
*Document prepared for Open Rockets Inc. development team.*
*Total phases: 45 | Total pages: 24 | Total components: 55+*
