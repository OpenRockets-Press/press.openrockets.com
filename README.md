# Open Rockets Press

Open Rockets Press is a youth-first publication platform with legally aware consent flows, moderator-led review, and a template-locked public home experience. It serves as the world's first fully open-source repository for aerospace schematics, 3D models, and control software.

## Repository Architecture

This platform utilizes a robust, enterprise-grade architecture hosted on **Oracle Cloud Infrastructure (OCI)** for maximum scale and security.

- **Frontend Framework:** React 19 + TypeScript + Vite
- **Routing:** TanStack Router (File-based, Type-safe)
- **State Management:** TanStack Query + Zustand
- **Styling:** Tailwind CSS + Vanilla CSS Tokens
- **Animation:** Framer Motion
- **Backend API:** Hono (Node Server)
- **Database:** Oracle MySQL (via Drizzle ORM)
- **File Storage:** Oracle Cloud Object Storage (S3 Compatible)
- **Authentication:** `accounts.openrockets.com` (Unified SSO)

## Directory Structure

- `src/`: React frontend source code
  - `components/`: UI tokens, complex inputs, and layout frames
  - `routes/`: TanStack Router page views
  - `lib/`: Utilities, API layer pointing to OCI backend, and Auth store
- `public/`: Static assets (fonts, images)
- `server/`: Backend API and database schemas
  - `db/`: Drizzle ORM schema and connection pool to Oracle MySQL
  - `storage/`: S3 Compatible integration for Oracle Cloud Object Storage

## Quick Start

1. **Install dependencies:**
```bash
bun install
```

2. **Configure Environment:**
Copy the required environment variables from `.env.example` into a local `.env` file. These connect the application to the Oracle Cloud database and SSO.

3. **Start the Development Server:**
```bash
bun run dev
```

4. **Validate Build:**
Ensure the application compiles without type errors before pushing to production:
```bash
bun run typecheck
bun run build
```

---

## Environment Variables

The following environment variables must be configured in your deployment environment (VPS/Oracle Cloud Compute) and your local `.env` file for the backend and frontend to operate.

### Oracle Database (MySQL)
```env
DATABASE_URL="mysql://orp_user:YOUR_SECURE_PASSWORD@127.0.0.1:3306/orp_db"
```

### Oracle Cloud Object Storage
```env
S3_ENDPOINT="https://<YOUR_NAMESPACE>.compat.objectstorage.<YOUR_REGION>.oraclecloud.com"
S3_REGION="us-sanjose-1"
S3_ACCESS_KEY_ID="your_access_key"
S3_SECRET_ACCESS_KEY="your_secret_key"
S3_BUCKET_NAME="openrockets-artifacts"
```

### Authentication (Global SSO)
```env
SSO_SESSION_SECRET="your-secure-session-secret"
```

### App Configuration
```env
PORT=3000
NODE_ENV="development"
APP_BASE_URL="https://press.openrockets.com"
VITE_API_BASE_URL="/api"
```

## Deployment

The application is configured to deploy directly to an **Oracle Cloud VPS**.
- **Build command:** `bunx --bun vite build`
- **Deploy Workflow:** Automated via `.github/workflows/deploy.yml` using PM2 restarts.
