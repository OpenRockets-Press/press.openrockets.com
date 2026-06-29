import fs from 'node:fs';
import path from 'node:path';
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    const key = parts[0];
    if (key && parts.length > 1) {
      process.env[key.trim()] = parts.slice(1).join('=').trim();
    }
  });
}
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { db } from './db';
import { users, publications } from './db/schema';
import { eq } from 'drizzle-orm';
import { s3Client, uploadToStorage, BUCKET_NAME } from './storage/s3';

export const app = new Hono();

import { publicationsRouter } from './routes/publications';
import { usersRouter } from './routes/users';
import { casesRouter } from './routes/cases';
import { dashboardsRouter } from './routes/dashboards';
import { storageRouter } from './routes/storage';
import { auditRouter } from './routes/audit';
import { cronRouter } from './routes/cron';

// Middleware
app.use('*', logger());
app.use('*', secureHeaders());

app.use('/api/*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      process.env.APP_BASE_URL || 'http://localhost:5173',
      'https://press.openrockets.com',
      'https://openrockets.com'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      return origin || allowedOrigins[0];
    }
    return null;
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 86400, // 24 hours preflight cache
}));

// Content-Type Validation Middleware (Phase 28)
app.use('/api/*', async (c, next) => {
  const method = c.req.method;
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentType = c.req.header('content-type');
    if (!contentType || !contentType.toLowerCase().includes('application/json')) {
      return c.json({ 
        success: false, 
        error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Content-Type must be application/json' } 
      }, 415);
    }
  }
  await next();
});

// Simple In-Memory Rate Limiter (Phase 30)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

// Cleanup stale rate limit records every minute to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60 * 1000);

app.use('/api/*', async (c, next) => {
  const ip = c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 200; // 200 requests per minute

  if (ip !== 'unknown') {
    let record = rateLimitMap.get(ip);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
    } else {
      record.count++;
    }
    rateLimitMap.set(ip, record);

    c.header('X-RateLimit-Limit', maxRequests.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count).toString());

    if (record.count > maxRequests) {
      return c.json({ 
        success: false, 
        error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded. Please try again later.' } 
      }, 429);
    }
  }
  
  await next();
});

app.route('/api/publications', publicationsRouter);
app.route('/api/users', usersRouter);
app.route('/api/cases', casesRouter);
app.route('/api/dashboards', dashboardsRouter);
app.route('/api/storage', storageRouter);
app.route('/api/audit-logs', auditRouter);
app.route('/api/cron', cronRouter);

// Basic Health Check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', message: 'Open Rockets Press API is running' });
});

// Global Error Handling Middleware (Phase 26)
app.onError((err, c) => {
  console.error(`[Global Error] ${c.req.method} ${c.req.url}`, err);
  
  const isDev = process.env.NODE_ENV === 'development';
  const statusCode = err instanceof Error && (err as any).status ? (err as any).status : 500;

  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isDev ? err.message : 'An unexpected internal server error occurred.',
      ...(isDev && { stack: err.stack }),
    }
  }, statusCode);
});

// Global Not Found Middleware for APIs
app.notFound((c) => {
  if (c.req.path.startsWith('/api')) {
    return c.json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `The requested endpoint ${c.req.method} ${c.req.url} was not found.`,
      }
    }, 404);
  }
  return c.text('Not Found', 404);
});

// Phase 3 Placeholder: SSO Callback from accounts.openrockets.com
app.get('/api/auth/sso-callback', async (c) => {
  const token = c.req.query('token');
  const returnTo = c.req.query('returnTo') || '/dashboard';
  
  if (token) {
    try {
      const response = await fetch("https://openrocketsauth.alwaysdata.net/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const userId = String(userData.id);
        const bestName = userData.name || 'Contributor';
        const email = userData.email || 'user@example.com';

        let [dbUser] = await db.select().from(users).where(eq(users.id, userId));
        
        if (!dbUser) {
          await db.insert(users).values({
            id: userId,
            displayName: bestName,
            email: email,
            role: 'contributor',
          });
        } else {
          // Always update name and email in case they changed on the SSO side
          await db.update(users).set({
            displayName: bestName,
            email: email,
          }).where(eq(users.id, userId));
        }
      } else {
        console.error("SSO Token validation failed", response.status);
      }
    } catch (e) {
      console.error("SSO Upsert Error", e);
    }
  }
  
  return c.redirect(`${returnTo}?token=${token}`);
});

// Serve Frontend Assets Custom Handler
import * as fs from 'fs';
import * as path from 'path';
import { getMimeType } from 'hono/utils/mime';

app.use('/assets/*', async (c, next) => {
  try {
    const filePath = path.join(process.cwd(), 'dist', c.req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      let mimeType = 'text/plain';
      if (ext === '.js') mimeType = 'text/javascript';
      else if (ext === '.css') mimeType = 'text/css';
      else if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.svg') mimeType = 'image/svg+xml';
      
      const file = fs.readFileSync(filePath);
      return c.body(file, 200, {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      });
    }
  } catch (e) {
    console.error("Asset serving error:", e);
  }
  return c.text('Not Found', 404);
});

app.use('/*', async (c, next) => {
  try {
    const filePath = path.join(process.cwd(), 'dist', c.req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      let mimeType = 'text/plain';
      if (ext === '.js') mimeType = 'text/javascript';
      else if (ext === '.css') mimeType = 'text/css';
      
      const file = fs.readFileSync(filePath);
      return c.body(file, 200, { 'Content-Type': mimeType });
    }
  } catch (e) {
    // Ignore and pass to fallback
  }
  await next();
});

// Client-side Routing Fallback (React Router)
app.get('*', async (c) => {
  if (c.req.path.startsWith('/api') || c.req.path.startsWith('/assets')) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } }, 404);
  }
  try {
    const indexPath = path.resolve('./dist/index.html');
    const html = fs.readFileSync(indexPath, 'utf-8');
    return c.html(html);
  } catch (e) {
    return c.text('Frontend build not found. Please run npm run build.', 500);
  }
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

console.log(`🚀 Starting Open Rockets Press API on port ${port}...`);

serve({
  fetch: app.fetch,
  port
});
