import type { Env } from "./env";

export class AppwriteError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly type?: string,
    public readonly method?: string,
    public readonly path?: string,
  ) {
    super(message);
    this.name = "AppwriteError";
  }
}

export function createAdminClient(env: Env) {
  const adminHeaders = {
    "X-Appwrite-Project": env.APPWRITE_PROJECT_ID,
    "X-Appwrite-Key": env.APPWRITE_API_KEY,
  };

  async function req<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
    const headers = body !== undefined
      ? { ...adminHeaders, "Content-Type": "application/json" }
      : adminHeaders;

    const res = await fetch(`${env.APPWRITE_ENDPOINT}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!res.ok) {
      const d = data as Record<string, unknown>;
      throw new AppwriteError(
        String(d?.message ?? `Request failed ${res.status}`),
        res.status,
        String(d?.type ?? ""),
        method,
        path,
      );
    }

    return data as T;
  }

  const db = {
    getDocument: <T = Record<string, unknown>>(dbId: string, colId: string, docId: string) =>
      req<T>("GET", `/databases/${dbId}/collections/${colId}/documents/${docId}`),

    listDocuments: <T = { documents: Record<string, unknown>[]; total: number }>(
      dbId: string,
      colId: string,
      queries: string[] = [],
    ) => {
      const params = new URLSearchParams();
      queries.forEach((q, index) => {
        params.append(`queries[${index}]`, q);
      });
      const qs = params.toString();
      return req<T>("GET", `/databases/${dbId}/collections/${colId}/documents${qs ? `?${qs}` : ""}`);
    },

    createDocument: (
      dbId: string,
      colId: string,
      docId: string,
      data: unknown,
      permissions: string[] = [],
    ) =>
      req<Record<string, unknown>>("POST", `/databases/${dbId}/collections/${colId}/documents`, {
        documentId: docId,
        data,
        permissions,
      }),

    updateDocument: (dbId: string, colId: string, docId: string, data: unknown) =>
      req<Record<string, unknown>>(
        "PATCH",
        `/databases/${dbId}/collections/${colId}/documents/${docId}`,
        { data },
      ),

    deleteDocument: (dbId: string, colId: string, docId: string) =>
      req("DELETE", `/databases/${dbId}/collections/${colId}/documents/${docId}`),
  };

  const users = {
    create: (userId: string, email: string, password: string, name: string) =>
      req<Record<string, unknown>>("POST", `/users`, { userId, email, password, name }),

    get: (userId: string) => req<Record<string, unknown>>("GET", `/users/${userId}`),

    updateLabels: (userId: string, labels: string[]) =>
      req("PATCH", `/users/${userId}/labels`, { labels }),

    updateStatus: (userId: string, status: boolean) =>
      req("PATCH", `/users/${userId}/status`, { status }),

    delete: (userId: string) => req("DELETE", `/users/${userId}`),
  };

  const storage = {
    getFile: (bucketId: string, fileId: string) =>
      req<Record<string, unknown>>("GET", `/storage/buckets/${bucketId}/files/${fileId}`),

    getFileDownload: (bucketId: string, fileId: string) =>
      fetch(`${env.APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/download`, {
        headers: adminHeaders,
      }),

    deleteFile: (bucketId: string, fileId: string) =>
      req("DELETE", `/storage/buckets/${bucketId}/files/${fileId}`),
  };

  // Query builder matching Appwrite SDK v24 JSON query format
  const buildQuery = (method: string, attribute?: string, values?: unknown): string => {
    const payload: {
      method: string;
      attribute?: string;
      values?: unknown[];
    } = { method };

    if (attribute !== undefined) payload.attribute = attribute;
    if (values !== undefined) payload.values = Array.isArray(values) ? values : [values];

    return JSON.stringify(payload);
  };

  const query = {
    equal: (attr: string, value: unknown) => buildQuery("equal", attr, value),
    orderDesc: (attr: string) => buildQuery("orderDesc", attr),
    orderAsc: (attr: string) => buildQuery("orderAsc", attr),
    limit: (n: number) => buildQuery("limit", undefined, n),
    lessThan: (attr: string, value: unknown) => buildQuery("lessThan", attr, value),
    isNotNull: (attr: string) => buildQuery("isNotNull", attr),
  };

  const id = {
    unique: () => crypto.randomUUID().replace(/-/g, "").slice(0, 20),
  };

  return { db, users, storage, query, id, env };
}

export type AdminClient = ReturnType<typeof createAdminClient>;

// Verify an Appwrite JWT and return the account (or null if invalid)
export async function getSessionUser(
  request: Request,
  env: Env,
): Promise<Record<string, unknown> | null> {
  const jwt = request.headers.get("X-Appwrite-JWT");
  if (!jwt) return null;

  const res = await fetch(`${env.APPWRITE_ENDPOINT}/account`, {
    headers: {
      "X-Appwrite-Project": env.APPWRITE_PROJECT_ID,
      "X-Appwrite-JWT": jwt,
    },
  });

  if (!res.ok) return null;
  return res.json() as Promise<Record<string, unknown>>;
}
