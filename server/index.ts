import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { db } from './db';
import { users, publications } from './db/schema';
import { s3Client, uploadToStorage, BUCKET_NAME } from './storage/s3';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('/api/*', cors({
  origin: process.env.APP_BASE_URL || 'http://localhost:5173',
  credentials: true,
}));

// Basic Health Check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', message: 'Open Rockets Press API is running' });
});

import { setCookie } from 'hono/cookie';

async function deriveKey(secret: string): Promise<CryptoKey> {
  const raw = new TextEncoder().encode(secret);
  return crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await deriveKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${b64}.${btoa(payload)}`;
}

// Phase 3: SSO Callback from accounts.openrockets.com
app.get('/api/auth/sso-callback', async (c) => {
  const token = c.req.query('token');
  let returnTo = c.req.query('returnTo') || '/';
  if (!returnTo.startsWith('/')) returnTo = '/';

  if (!token) return c.redirect(returnTo);

  try {
    const response = await fetch("https://openrocketsauth.alwaysdata.net/api/auth/me", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });

    if (!response.ok) return c.redirect(`${returnTo}?error=sso_failed`);
    
    const userData: any = await response.json();

    // Upsert User into Database
    await db.insert(users).values({
      id: String(userData.id),
      displayName: userData.name,
      email: userData.email,
    }).onDuplicateKeyUpdate({
      set: {
        displayName: userData.name,
        email: userData.email,
      }
    });

    // Create session payload
    const sessionUser = {
      id: String(userData.id),
      name: userData.name,
      email: userData.email,
      token: token
    };

    const secret = process.env.SSO_SESSION_SECRET || 'openrockets-dev-secret-change-me-before-production';
    const signedToken = await sign(JSON.stringify(sessionUser), secret);

    setCookie(c, '__or_press_session', signedToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      secure: process.env.NODE_ENV === 'production'
    });

    return c.redirect(returnTo);
  } catch (error) {
    console.error("SSO Exception:", error);
    return c.redirect(`${returnTo}?error=sso_exception`);
  }
});

// Phase 4 Placeholder: Discord Webhook trigger for Publication submission
app.post('/api/discord/interactions', async (c) => {
  // TODO: Implement discord webhook firing when a user submits an artifact
  return c.json({ success: true, message: 'Discord integration coming soon' });
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

console.log(`🚀 Starting Open Rockets Press API on port ${port}...`);

serve({
  fetch: app.fetch,
  port
});
