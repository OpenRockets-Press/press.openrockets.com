import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const MIGRATIONS_COLLECTION_ID = "migrations";
const MIGRATION_ID_PATTERN = /^[a-zA-Z0-9._-]{1,36}$/;

// ─── Config ──────────────────────────────────────────────────────────────────

function readConfig() {
  return {
    endpoint: (process.env.APPWRITE_ENDPOINT || "").replace(/\/+$/, ""),
    projectId: process.env.APPWRITE_PROJECT_ID || "",
    apiKey: process.env.APPWRITE_API_KEY || "",
    databaseId: process.env.APPWRITE_DATABASE_ID || "",
    bucketPubFiles: process.env.APPWRITE_BUCKET_PUB_FILES || "pub_files",
    bucketPubCovers: process.env.APPWRITE_BUCKET_PUB_COVERS || "pub_covers",
    bucketCaseAttachments: process.env.APPWRITE_BUCKET_CASE_ATTACHMENTS || "case_attachments",
  };
}

function missingConfig(config) {
  const missing = [];
  if (!config.endpoint) missing.push("APPWRITE_ENDPOINT");
  if (!config.projectId) missing.push("APPWRITE_PROJECT_ID");
  if (!config.apiKey) missing.push("APPWRITE_API_KEY");
  if (!config.databaseId) missing.push("APPWRITE_DATABASE_ID");
  return missing;
}

// ─── REST client ─────────────────────────────────────────────────────────────

function createClient(config) {
  const headers = {
    "Content-Type": "application/json",
    "X-Appwrite-Project": config.projectId,
    "X-Appwrite-Key": config.apiKey,
  };

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function request(method, resourcePath, body, options = {}) {
    const allowStatuses = options.allowStatuses || [];
    const maxRetries = 5;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const response = await fetch(`${config.endpoint}${resourcePath}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const text = await response.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      if (allowStatuses.includes(response.status)) {
        return { status: response.status, data };
      }

      // Retry on 429 with exponential backoff
      if (response.status === 429) {
        const retryAfterMs =
          parseInt(response.headers.get("retry-after") ?? "0", 10) * 1000 ||
          Math.min(2000 * 2 ** attempt, 30_000);

        console.log(
          `[migrate] Rate limited on ${method} ${resourcePath} — retrying in ${retryAfterMs / 1000}s (attempt ${attempt + 1} of ${maxRetries})`,
        );
        await sleep(retryAfterMs);
        continue;
      }

      if (!response.ok) {
        throw new Error(`${method} ${resourcePath} failed (${response.status}): ${JSON.stringify(data)}`);
      }

      return { status: response.status, data };
    }

    throw new Error(`${method} ${resourcePath} failed: max retries exceeded after rate limiting`);
  }

  async function waitForAttributeAvailable(collectionId, attributeKey) {
    const timeoutMs = 60_000;
    const pollMs = 700;
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      const result = await request(
        "GET",
        `/databases/${config.databaseId}/collections/${collectionId}/attributes/${attributeKey}`,
        undefined,
        { allowStatuses: [404] },
      );

      if (result.status === 404) {
        await sleep(pollMs);
        continue;
      }

      const status = result.data?.status || "";
      if (status === "available") return;
      if (status === "failed") {
        throw new Error(`Attribute ${collectionId}.${attributeKey} failed to provision`);
      }

      await sleep(pollMs);
    }

    throw new Error(`Timed out waiting for attribute ${collectionId}.${attributeKey}`);
  }

  async function ensureCollection(collection) {
    const result = await request(
      "POST",
      `/databases/${config.databaseId}/collections`,
      {
        collectionId: collection.id,
        name: collection.name,
        permissions: [],
        documentSecurity: false,
        enabled: true,
      },
      { allowStatuses: [409] },
    );

    console.log(
      result.status === 409
        ? `[migrate] Collection ${collection.id} already exists`
        : `[migrate] Created collection ${collection.id}`,
    );
  }

  async function ensureAttribute(collectionId, attribute) {
    const result = await request(
      "POST",
      `/databases/${config.databaseId}/collections/${collectionId}/attributes/${attribute.type}`,
      attribute.payload,
      { allowStatuses: [409] },
    );

    console.log(
      result.status === 409
        ? `[migrate] Attribute ${collectionId}.${attribute.payload.key} already exists`
        : `[migrate] Created attribute ${collectionId}.${attribute.payload.key}`,
    );

    await waitForAttributeAvailable(collectionId, attribute.payload.key);
  }

  async function ensureIndex(collectionId, index) {
    const result = await request(
      "POST",
      `/databases/${config.databaseId}/collections/${collectionId}/indexes`,
      index,
      { allowStatuses: [409] },
    );

    console.log(
      result.status === 409
        ? `[migrate] Index ${collectionId}.${index.key} already exists`
        : `[migrate] Created index ${collectionId}.${index.key}`,
    );
  }

  async function getDocument(collectionId, documentId) {
    const result = await request(
      "GET",
      `/databases/${config.databaseId}/collections/${collectionId}/documents/${documentId}`,
      undefined,
      { allowStatuses: [404] },
    );

    return result.status === 404 ? null : result.data;
  }

  async function createDocument(collectionId, documentId, data) {
    return request(
      "POST",
      `/databases/${config.databaseId}/collections/${collectionId}/documents`,
      {
        documentId,
        data,
        permissions: [],
      },
      { allowStatuses: [409] },
    );
  }

  // ── Storage helpers ────────────────────────────────────────────────────────

  async function ensureBucket(bucket) {
    const result = await request(
      "POST",
      `/storage/buckets`,
      {
        bucketId: bucket.id,
        name: bucket.name,
        permissions: bucket.permissions ?? [],
        fileSecurity: bucket.fileSecurity ?? false,
        enabled: true,
        maximumFileSize: bucket.maxSize,
        allowedFileExtensions: bucket.allowedExtensions ?? [],
        encryption: bucket.encryption ?? true,
        antivirus: false,
      },
      { allowStatuses: [409] },
    );

    console.log(
      result.status === 409
        ? `[buckets] Bucket ${bucket.id} already exists`
        : `[buckets] Created bucket ${bucket.id}`,
    );
  }

  return {
    ensureCollection,
    ensureAttribute,
    ensureIndex,
    getDocument,
    createDocument,
    ensureBucket,
    request,
  };
}

// ─── Phase 1: DB migrations ───────────────────────────────────────────────────

async function ensureMigrationsCollection(client) {
  await client.ensureCollection({ id: MIGRATIONS_COLLECTION_ID, name: "Migrations" });
  await client.ensureAttribute(MIGRATIONS_COLLECTION_ID, {
    type: "string",
    payload: { key: "name", size: 255, required: true },
  });
  await client.ensureAttribute(MIGRATIONS_COLLECTION_ID, {
    type: "string",
    payload: { key: "description", size: 1000, required: false },
  });
  await client.ensureAttribute(MIGRATIONS_COLLECTION_ID, {
    type: "datetime",
    payload: { key: "appliedAt", required: true },
  });

  await client.ensureIndex(MIGRATIONS_COLLECTION_ID, {
    key: "migrations_name_unique",
    type: "unique",
    attributes: ["name"],
  });
  await client.ensureIndex(MIGRATIONS_COLLECTION_ID, {
    key: "migrations_applied_at",
    type: "key",
    attributes: ["appliedAt"],
    orders: ["ASC"],
  });
}

async function loadMigrations() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const migrationsDir = path.join(currentDir, "migrations");

  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  const files = fs.readdirSync(migrationsDir).filter((name) => name.endsWith(".mjs")).sort();
  const migrations = [];

  for (const filename of files) {
    const modulePath = pathToFileURL(path.join(migrationsDir, filename)).href;
    const mod = await import(modulePath);

    if (!mod.id || typeof mod.up !== "function") {
      throw new Error(`Invalid migration module ${filename}. Expected exports: id, up(client)`);
    }

    if (!MIGRATION_ID_PATTERN.test(mod.id)) {
      throw new Error(`Invalid migration id '${mod.id}' in ${filename}`);
    }

    migrations.push({
      id: mod.id,
      description: mod.description || "",
      up: mod.up,
    });
  }

  return migrations;
}

async function runDbMigrations(client) {
  await ensureMigrationsCollection(client);

  const migrations = await loadMigrations();

  for (const migration of migrations) {
    const alreadyApplied = await client.getDocument(MIGRATIONS_COLLECTION_ID, migration.id);
    if (alreadyApplied) {
      console.log(`[migrate] Skipping ${migration.id}`);
      continue;
    }

    console.log(`[migrate] Applying ${migration.id}`);
    await migration.up(client);

    const record = await client.createDocument(MIGRATIONS_COLLECTION_ID, migration.id, {
      name: migration.id,
      description: migration.description,
      appliedAt: new Date().toISOString(),
    });

    console.log(
      record.status === 409
        ? `[migrate] Migration already recorded ${migration.id}`
        : `[migrate] Applied ${migration.id}`,
    );
  }

  console.log("[migrate] DB migrations complete");
}

// ─── Phase 2: Storage buckets ─────────────────────────────────────────────────

async function ensureStorageBuckets(client, config) {
  console.log("\n[buckets] Ensuring storage buckets...");

  const ROLE_ANY = "any";

  await client.ensureBucket({
    id: config.bucketPubFiles,
    name: "Publication Files",
    permissions: [],            // private — no public read
    fileSecurity: false,
    maxSize: 50 * 1024 * 1024, // 50 MB
    allowedExtensions: ["pdf"],
    encryption: true,
  });

  await client.ensureBucket({
    id: config.bucketPubCovers,
    name: "Publication Covers",
    permissions: [`read("${ROLE_ANY}")`],  // public read for cover images
    fileSecurity: false,
    maxSize: 5 * 1024 * 1024,  // 5 MB
    allowedExtensions: ["jpg", "jpeg", "png", "webp", "gif"],
    encryption: false,
  });

  await client.ensureBucket({
    id: config.bucketCaseAttachments,
    name: "Case Attachments",
    permissions: [],            // private — only via function tokens
    fileSecurity: false,
    maxSize: 20 * 1024 * 1024, // 20 MB
    allowedExtensions: ["pdf", "jpg", "jpeg", "png", "webp", "gif", "txt", "doc", "docx"],
    encryption: true,
  });

  console.log("[buckets] Storage buckets ready");
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export async function runMigrations(options = {}) {
  const strict =
    options.strict === true ||
    process.argv.includes("--strict") ||
    process.env.APPWRITE_MIGRATIONS_STRICT === "true";

  const config = readConfig();
  const missing = missingConfig(config);

  if (missing.length > 0) {
    const message = `[migrate] Missing env vars: ${missing.join(", ")}`;
    if (strict) {
      throw new Error(`${message}. Strict mode enabled.`);
    }
    console.log(`${message}. Skipping migration execution.`);
    return { skipped: true };
  }

  const client = createClient(config);

  console.log("╔══════════════════════════════════════════╗");
  console.log("║      Open Rockets Press  ·  Migrate      ║");
  console.log("╚══════════════════════════════════════════╝\n");

  // Phase 1 — DB schema
  console.log("[phase 1/2] Database migrations");
  await runDbMigrations(client);

  // Phase 2 — Storage
  console.log("\n[phase 2/2] Storage buckets");
  await ensureStorageBuckets(client, config);

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║            Provisioning complete         ║");
  console.log("╚══════════════════════════════════════════╝");

  return { skipped: false };
}

const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  runMigrations().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
