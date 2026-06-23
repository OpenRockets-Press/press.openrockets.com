const fs = require('fs');
let content = fs.readFileSync('src/lib/api.ts', 'utf8');

// Remove Appwrite imports
content = content.replace(/import \{[\s\S]*?\} from "@\/lib\/appwrite";/, '');

// Remove JWT and appwrite stuff up to callApi
content = content.replace(/let jwtCache[\s\S]*?async function callApi/m, 'async function callApi');

// Replace callApi
content = content.replace(/async function callApi[\s\S]*?\/\/ ── Appwrite utilities/m, `const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function callApi<T>(path: string, body?: unknown, opts?: { method?: string; skipAuth?: boolean }): Promise<T> {
  const method = opts?.method ?? (body !== undefined ? 'POST' : 'GET');
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  
  // Oracle Cloud SSO token handling
  const token = window.localStorage.getItem('orp.session.token');
  if (token && !opts?.skipAuth) headers['Authorization'] = \`Bearer \${token}\`;

  const res = await fetch(\`\${API_BASE}/\${path}\`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(\`API request failed: \${res.status}\`);
  return res.json() as Promise<T>;
}

// ── Appwrite utilities`);

// Remove the Appwrite utilities section completely
content = content.replace(/\/\/ ── Appwrite utilities[\s\S]*?\/\/ ── Type helpers/m, '// ── Type helpers');

// Replace AppwriteDocument references
content = content.replace(/interface AppwriteDocument[\s\S]*?\}/, '');
content = content.replace(/AppwriteDocument/g, 'any');

fs.writeFileSync('src/lib/api.ts', content);
