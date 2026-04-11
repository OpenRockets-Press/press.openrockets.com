export const CORS_HEADERS: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Appwrite-JWT",
};

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status: number): Response {
  return json({ error: message }, status);
}

export async function parseBody<T = unknown>(request: Request): Promise<T> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return {} as T;
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

export function getIP(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
    ""
  );
}
