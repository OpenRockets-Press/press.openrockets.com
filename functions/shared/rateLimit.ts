import { createHash } from "node:crypto";
import type { Databases, Query as QueryType } from "node-appwrite";

const WINDOW_MS = 60_000;   // 1-minute window
const MAX_CALLS = 10;        // max requests per IP per minute per function

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

function windowStart(): string {
  const now = Date.now();
  const bucket = Math.floor(now / WINDOW_MS) * WINDOW_MS;
  return new Date(bucket).toISOString();
}

/**
 * Check and increment the rate-limit counter for an IP + function combination.
 * Throws an error (to be caught and returned as 429) when the limit is exceeded.
 *
 * @param db         Appwrite Databases instance (admin SDK)
 * @param query      Appwrite Query helper
 * @param databaseId Target database ID
 * @param functionId Logical function identifier (e.g. "register")
 * @param ip         Raw caller IP address
 */
export async function enforceRateLimit(
  db: Databases,
  query: typeof QueryType,
  databaseId: string,
  functionId: string,
  ip: string,
): Promise<void> {
  if (!ip) return; // no IP header → skip (Appwrite internal calls)

  const ipHash = hashIp(ip);
  const window = windowStart();
  const docId = `${ipHash.slice(0, 16)}_${functionId}_${window}`.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 36);

  let currentCount = 0;

  try {
    const existing = await db.getDocument(databaseId, "rate_limits", docId);
    currentCount = Number(existing.count ?? 0);

    if (currentCount >= MAX_CALLS) {
      throw new RateLimitError(`Rate limit exceeded. Try again in a minute.`);
    }

    await db.updateDocument(databaseId, "rate_limits", docId, { count: currentCount + 1 });
  } catch (err) {
    if (err instanceof RateLimitError) throw err;

    // Document does not exist yet — create it.
    try {
      await db.createDocument(databaseId, "rate_limits", docId, {
        ip_hash: ipHash,
        function_id: functionId,
        count: 1,
        window_start: window,
      });
    } catch {
      // Race condition: another request created the document first.
      // Attempt an update; if we cannot, allow the request through to avoid blocking legitimate traffic.
      try {
        const existing2 = await db.getDocument(databaseId, "rate_limits", docId);
        if (Number(existing2.count ?? 0) >= MAX_CALLS) {
          throw new RateLimitError(`Rate limit exceeded. Try again in a minute.`);
        }
        await db.updateDocument(databaseId, "rate_limits", docId, { count: Number(existing2.count ?? 0) + 1 });
      } catch (inner) {
        if (inner instanceof RateLimitError) throw inner;
        // Fail open — log but allow
      }
    }
  }
}

export class RateLimitError extends Error {
  readonly statusCode = 429;
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}
