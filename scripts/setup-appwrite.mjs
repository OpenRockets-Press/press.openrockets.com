import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  cancel,
  confirm,
  intro,
  isCancel,
  note,
  outro,
  password,
  spinner,
  text,
} from "@clack/prompts";
import { runMigrations } from "../migrations/migrate.mjs";

const DATABASE_ID = "orp_db";
const DATABASE_NAME = "Open Rockets Press";

const BUCKETS = [
  {
    bucketId: "pub_files",
    name: "Publication Files",
    maximumFileSize: 50 * 1024 * 1024,
    allowedFileExtensions: ["pdf"],
  },
  {
    bucketId: "pub_covers",
    name: "Publication Covers",
    maximumFileSize: 5 * 1024 * 1024,
    allowedFileExtensions: ["jpg", "jpeg", "png", "webp"],
  },
  {
    bucketId: "case_attachments",
    name: "Case Attachments",
    maximumFileSize: 20 * 1024 * 1024,
    allowedFileExtensions: ["pdf", "jpg", "jpeg", "png", "webp", "txt"],
  },
];

const FUNCTION_IDS = [
  "register",
  "confirm-consent",
  "submit-publication",
  "review-publication",
  "open-case",
  "reply-case",
  "resolve-case",
  "get-case-upload-token",
  "generate-pub-id",
  "serve-pdf",
  "track-event",
  "deletion-cron",
  "dsar-handler",
  "get-home-feed",
];

const WEB_FUNCTION_ENV = {
  VITE_FUNCTION_REGISTER_ID: "register",
  VITE_FUNCTION_CONFIRM_CONSENT_ID: "confirm-consent",
  VITE_FUNCTION_GET_HOME_FEED_ID: "get-home-feed",
  VITE_FUNCTION_SUBMIT_PUBLICATION_ID: "submit-publication",
  VITE_FUNCTION_REVIEW_PUBLICATION_ID: "review-publication",
  VITE_FUNCTION_OPEN_CASE_ID: "open-case",
  VITE_FUNCTION_REPLY_CASE_ID: "reply-case",
  VITE_FUNCTION_RESOLVE_CASE_ID: "resolve-case",
  VITE_FUNCTION_DSAR_HANDLER_ID: "dsar-handler",
};

function toEnvFile(values) {
  return Object.entries(values)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join("\n");
}

function useInput(value) {
  if (isCancel(value)) {
    cancel("Setup cancelled");
    process.exit(0);
  }

  return value;
}

async function appwriteRequest(options) {
  const {
    endpoint,
    apiKey,
    projectId,
    method,
    resourcePath,
    body,
    allowStatuses = [],
  } = options;

  const response = await fetch(`${endpoint}${resourcePath}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Key": apiKey,
      ...(projectId ? { "X-Appwrite-Project": projectId } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const textBody = await response.text();
  let data = null;
  if (textBody) {
    try {
      data = JSON.parse(textBody);
    } catch {
      data = textBody;
    }
  }

  if (allowStatuses.includes(response.status)) {
    return { ok: true, status: response.status, data };
  }

  if (!response.ok) {
    const details = typeof data === "string" ? data : JSON.stringify(data);
    throw new Error(`${method} ${resourcePath} failed (${response.status}): ${details}`);
  }

  return { ok: true, status: response.status, data };
}

async function ensureDatabase(endpoint, apiKey, projectId) {
  const existing = await appwriteRequest({
    endpoint,
    apiKey,
    projectId,
    method: "GET",
    resourcePath: `/databases/${DATABASE_ID}`,
    allowStatuses: [404],
  });

  if (existing.status !== 404) {
    return;
  }

  await appwriteRequest({
    endpoint,
    apiKey,
    projectId,
    method: "POST",
    resourcePath: "/databases",
    body: {
      databaseId: DATABASE_ID,
      name: DATABASE_NAME,
    },
  });
}

async function ensureBucket(endpoint, apiKey, projectId, bucket) {
  const existing = await appwriteRequest({
    endpoint,
    apiKey,
    projectId,
    method: "GET",
    resourcePath: `/storage/buckets/${bucket.bucketId}`,
    allowStatuses: [404],
  });

  if (existing.status !== 404) {
    return;
  }

  await appwriteRequest({
    endpoint,
    apiKey,
    projectId,
    method: "POST",
    resourcePath: "/storage/buckets",
    body: {
      bucketId: bucket.bucketId,
      name: bucket.name,
      permissions: [],
      fileSecurity: true,
      enabled: true,
      maximumFileSize: bucket.maximumFileSize,
      allowedFileExtensions: bucket.allowedFileExtensions,
      compression: "none",
      encryption: true,
      antivirus: true,
    },
    allowStatuses: [409],
  });
}

async function ensureScopedApiKey(endpoint, apiKey, projectId) {
  const result = await appwriteRequest({
    endpoint,
    apiKey,
    projectId,
    method: "POST",
    resourcePath: `/projects/${projectId}/keys`,
    body: {
      name: "ORP Server Key",
      scopes: [
        "databases.read",
        "databases.write",
        "collections.read",
        "collections.write",
        "documents.read",
        "documents.write",
        "files.read",
        "files.write",
        "functions.read",
        "functions.write",
        "execution.write",
        "users.read",
        "users.write",
      ],
    },
    allowStatuses: [401, 403],
  });

  if (result.status === 401 || result.status === 403 || !result.data?.secret) {
    return apiKey;
  }

  return result.data.secret;
}

async function upsertFunctionVariable(endpoint, apiKey, projectId, functionId, key, value, secret = true) {
  const fn = await appwriteRequest({
    endpoint,
    apiKey,
    projectId,
    method: "GET",
    resourcePath: `/functions/${functionId}`,
    allowStatuses: [404],
  });

  if (fn.status === 404) {
    return;
  }

  const variables = await appwriteRequest({
    endpoint,
    apiKey,
    projectId,
    method: "GET",
    resourcePath: `/functions/${functionId}/variables`,
  });

  const existing = (variables.data?.variables ?? []).find((item) => item.key === key);

  if (!existing) {
    await appwriteRequest({
      endpoint,
      apiKey,
      projectId,
      method: "POST",
      resourcePath: `/functions/${functionId}/variables`,
      body: {
        key,
        value,
        secret,
      },
      allowStatuses: [409],
    });
    return;
  }

  await appwriteRequest({
    endpoint,
    apiKey,
    projectId,
    method: "PUT",
    resourcePath: `/functions/${functionId}/variables/${existing.$id}`,
    body: {
      key,
      value,
      secret,
    },
  });
}

async function main() {
  intro("Open Rockets Press Appwrite Setup Wizard");

  const endpointInput = useInput(
    await text({
      message: "Appwrite endpoint",
      placeholder: "https://cloud.appwrite.io/v1",
      initialValue: process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
      validate(value) {
        if (!value || !String(value).startsWith("http")) {
          return "Provide a valid URL.";
        }
        return undefined;
      },
    }),
  );

  const projectId = useInput(
    await text({
      message: "Appwrite project ID",
      placeholder: "66abc123...",
      initialValue: process.env.APPWRITE_PROJECT_ID || "",
      validate(value) {
        if (!value || String(value).trim().length < 6) {
          return "Project ID looks too short.";
        }
        return undefined;
      },
    }),
  );

  const apiKeyInput = useInput(
    await password({
      message: "Appwrite API key (server key)",
      validate(value) {
        if (!value || String(value).trim().length < 10) {
          return "API key looks too short.";
        }
        return undefined;
      },
    }),
  );

  const appBaseUrl = useInput(
    await text({
      message: "Public app base URL",
      placeholder: "https://press.openrockets.com",
      initialValue: process.env.APP_BASE_URL || "https://press.openrockets.com",
      validate(value) {
        if (!value || !String(value).startsWith("http")) {
          return "Provide a valid URL.";
        }
        return undefined;
      },
    }),
  );

  const plausibleDomain = useInput(
    await text({
      message: "Plausible domain",
      placeholder: "press.openrockets.com",
      initialValue: process.env.PLAUSIBLE_DOMAIN || "press.openrockets.com",
      validate(value) {
        if (!value || String(value).trim().length < 3) {
          return "Provide a valid domain.";
        }
        return undefined;
      },
    }),
  );

  const plausibleApiKey = useInput(
    await password({
      message: "Plausible API key (optional)",
      mask: "*",
    }),
  );

  const shouldConfigureFunctionVars = useInput(
    await confirm({
      message: "Also apply server env vars to all existing Appwrite functions now?",
      initialValue: true,
    }),
  );

  const endpoint = String(endpointInput).replace(/\/+$/, "");
  const apiKey = String(apiKeyInput).trim();

  const setupSpinner = spinner();
  setupSpinner.start("Configuring database, buckets, and migration schema");

  await ensureDatabase(endpoint, apiKey, String(projectId));
  for (const bucket of BUCKETS) {
    await ensureBucket(endpoint, apiKey, String(projectId), bucket);
  }

  const scopedApiKey = await ensureScopedApiKey(endpoint, apiKey, String(projectId));
  const consentSecret = randomBytes(32).toString("hex");
  const guardianSecret = randomBytes(32).toString("hex");

  process.env.APPWRITE_ENDPOINT = endpoint;
  process.env.APPWRITE_PROJECT_ID = String(projectId);
  process.env.APPWRITE_API_KEY = scopedApiKey;
  process.env.APPWRITE_DATABASE_ID = DATABASE_ID;

  await runMigrations({ strict: true });

  const rootEnv = {
    APPWRITE_ENDPOINT: endpoint,
    APPWRITE_PROJECT_ID: String(projectId),
    APPWRITE_API_KEY: scopedApiKey,
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APP_BASE_URL: String(appBaseUrl),
    CONSENT_TOKEN_SECRET: consentSecret,
    GUARDIAN_EMAIL_SECRET: guardianSecret,
    APPWRITE_BUCKET_PUB_FILES: "pub_files",
    APPWRITE_BUCKET_PUB_COVERS: "pub_covers",
    APPWRITE_BUCKET_CASE_ATTACHMENTS: "case_attachments",
    PLAUSIBLE_DOMAIN: String(plausibleDomain),
    PLAUSIBLE_API_KEY: String(plausibleApiKey || ""),
  };

  const webEnv = {
    VITE_APPWRITE_ENDPOINT: endpoint,
    VITE_APPWRITE_PROJECT_ID: String(projectId),
    VITE_APPWRITE_DATABASE_ID: DATABASE_ID,
    VITE_APPWRITE_BUCKET_PUB_FILES: "pub_files",
    VITE_APPWRITE_BUCKET_PUB_COVERS: "pub_covers",
    ...WEB_FUNCTION_ENV,
  };

  const combinedEnv = {
    ...rootEnv,
    ...webEnv,
  };

  fs.writeFileSync(path.resolve(process.cwd(), ".env.local"), `${toEnvFile(combinedEnv)}\n`, "utf8");

  if (shouldConfigureFunctionVars) {
    const variableEntries = Object.entries(rootEnv);
    for (const functionId of FUNCTION_IDS) {
      for (const [key, value] of variableEntries) {
        await upsertFunctionVariable(endpoint, scopedApiKey, String(projectId), functionId, key, value, true);
      }
    }
  }

  setupSpinner.stop("Appwrite bootstrap complete");

  note(
    [
      `Database: ${DATABASE_ID}`,
      `Buckets: ${BUCKETS.map((bucket) => bucket.bucketId).join(", ")}`,
      `Unified env: .env.local`,
    ].join("\n"),
    "Configured Resources",
  );

  outro("Setup finished. Run bun install, then bun run ci to validate the full stack.");
}

main().catch((error) => {
  cancel(error instanceof Error ? error.message : "Setup failed");
  process.exit(1);
});
