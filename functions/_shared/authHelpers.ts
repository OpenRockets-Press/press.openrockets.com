import type { AdminClient } from "./appwrite";
import { OrpError } from "./errors";

/**
 * Resolves the effective role for an authenticated user, using the same priority
 * as me.ts: DB document role > Appwrite account labels > "contributor".
 *
 * This ensures consistency even when Appwrite labels are not synced (e.g. on
 * deployments where updateLabels returns 404, or when a role was set manually
 * in the database without going through the promote-user endpoint).
 */
export async function getActorRole(
  user: Record<string, unknown>,
  client: AdminClient,
): Promise<"admin" | "moderator" | "contributor"> {
  // 1. DB document role is source of truth (matches me.ts priority).
  //    Document ID == Appwrite user.$id (set in register.ts), so this is a
  //    direct key lookup — no index required.
  try {
    const userId = String(user.$id);
    const doc = await client.db.getDocument(
      client.env.APPWRITE_DATABASE_ID,
      "users",
      userId,
    ) as Record<string, unknown>;
    const docRole = String(doc.role ?? "contributor");
    if (docRole === "admin") return "admin";
    if (docRole === "moderator") return "moderator";
  } catch { /* doc may not exist for bootstrap-only admins; fall through to labels */ }

  // 2. Appwrite account labels as secondary fallback
  const labels = Array.isArray((user as { labels?: unknown }).labels)
    ? (user as { labels: string[] }).labels
    : [];
  if (labels.includes("admin")) return "admin";
  if (labels.includes("moderator")) return "moderator";

  return "contributor";
}

export function requireModOrAdmin(role: string): void {
  if (role !== "moderator" && role !== "admin") {
    throw new OrpError("Forbidden", 403);
  }
}

export function requireAdmin(role: string): void {
  if (role !== "admin") {
    throw new OrpError("Forbidden", 403);
  }
}
