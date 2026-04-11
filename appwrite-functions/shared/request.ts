import { OrpError } from "./errors";

export interface FunctionRequest {
  body?: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  method?: string;
}

export function parseBody<T>(req: FunctionRequest): T {
  if (!req.body) {
    return {} as T;
  }

  try {
    return JSON.parse(req.body) as T;
  } catch {
    throw new OrpError("Request body is not valid JSON.", 400);
  }
}

export function getHeader(req: FunctionRequest, name: string): string | undefined {
  if (!req.headers) return undefined;

  const found = Object.entries(req.headers).find(([key]) => key.toLowerCase() === name.toLowerCase());
  return found?.[1];
}
