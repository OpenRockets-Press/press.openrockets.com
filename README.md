# Open Rockets Press

Open Rockets Press is a youth-first publication platform with legally aware consent flows, moderator-led review, and a template-locked public home experience.

## Repository Layout

- `src`: React + TypeScript frontend with TanStack Router/Query.
- `public`: static frontend assets.
- `e2e`: Playwright end-to-end tests.
- `functions`: Appwrite Function handlers for auth, consent, publication review, cases, analytics, and compliance operations.
- `migrations`: idempotent Appwrite database migration runner and schema migrations.
- `shared`: cross-layer shared types.
- `plan.md`: full product and implementation blueprint.

## Toolchain

- Runtime/package manager: Bun
- Frontend: Vite, React 19, TanStack Router, TanStack Query
- Backend: Appwrite Functions (Node 21)
- Tests: Vitest, Playwright

## Quick Start

1. Install dependencies:

```bash
bun install
```

2. Run interactive Appwrite setup wizard:

```bash
bun run setup
```

The setup wizard prompts for endpoint, project ID, and API key, then:

- creates/validates database and storage buckets,
- runs all migrations,
- writes a unified `.env.local` (server + `VITE_*` client vars),
- optionally applies all server env vars to existing Appwrite functions.

3. Optional non-interactive bootstrap:

```bash
node migrations/setup.mjs --endpoint <APPWRITE_ENDPOINT> --api-key <APPWRITE_API_KEY> --project <APPWRITE_PROJECT_ID>
```

4. Validate quality gates:

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

## Implemented Highlights

- Template-locked public home route parity with mandatory structure.
- Consent tier engine (`coppa`, `gdpr_eu`, `gdpr_es`, `general`) and guardian gating.
- In-session guardian consent workflow with strict checkbox requirements.
- Publication and case function handlers with analytics hooks.
- Migration framework with ordered, idempotent schema files.

## Deployment Notes

- `appwrite.json` maps all function directories for Appwrite CLI deployment.
- Use Appwrite Sites for frontend deployment.
- Keep all server-only secrets in non-`VITE_` env variables.
