import { createHash } from "node:crypto";
import type { AdminClient } from "./appwrite";

const WINDOW_MS = 60_000;
const MAX_CALLS = 10;

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

function windowStart(): string {
  const now = Date.now();
  const bucket = Math.floor(now / WINDOW_MS) * WINDOW_MS;
  return new Date(bucket).toISOString();
}

export class RateLimitError extends Error {
  readonly statusCode = 429;
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

export async function enforceRateLimit(
  client: AdminClient,
  functionId: string,
  ip: string,
): Promise<void> {
  if (!ip) return;

  const ipHash = hashIp(ip);
  const window = windowStart();
  const docId = `${ipHash.slice(0, 16)}_${functionId}_${window}`
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 36);

  const dbId = client.env.APPWRITE_DATABASE_ID;

  try {
    const existing = await client.db.getDocument(dbId, "rate_limits", docId);
    const currentCount = Number(existing.count ?? 0);

    if (currentCount >= MAX_CALLS) {
      throw new RateLimitError("Rate limit exceeded. Try again in a minute.");
    }

    await client.db.updateDocument(dbId, "rate_limits", docId, { count: currentCount + 1 });
  } catch (err) {
    if (err instanceof RateLimitError) throw err;

    try {
      await client.db.createDocument(dbId, "rate_limits", docId, {
        ip_hash: ipHash,
        function_id: functionId,
        count: 1,
        window_start: window,
      });
    } catch {
      try {
        const existing2 = await client.db.getDocument(dbId, "rate_limits", docId);
        if (Number(existing2.count ?? 0) >= MAX_CALLS) {
          throw new RateLimitError("Rate limit exceeded. Try again in a minute.");
        }
        await client.db.updateDocument(dbId, "rate_limits", docId, {
          count: Number(existing2.count ?? 0) + 1,
        });
      } catch (inner) {
        if (inner instanceof RateLimitError) throw inner;
        // Fail open — allow request through on race condition errors
      }
    }
  }
}
