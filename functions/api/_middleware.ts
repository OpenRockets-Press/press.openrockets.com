import type { Env } from "../_shared/env";

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Appwrite-JWT",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const response = await context.next();

  const newHeaders = new Headers(response.headers);
  newHeaders.set("Access-Control-Allow-Origin", "*");
  newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  newHeaders.set("Access-Control-Allow-Headers", "Content-Type, X-Appwrite-JWT");

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  });
};
