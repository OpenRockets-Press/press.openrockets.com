import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { db } from './db';
import { users, publications } from './db/schema';
import { eq } from 'drizzle-orm';
import { s3Client, uploadToStorage, BUCKET_NAME } from './storage/s3';

const app = new Hono();

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

// Global Not Found Middleware
app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `The requested endpoint ${c.req.method} ${c.req.url} was not found.`,
    }
  }, 404);
});

// Phase 3 Placeholder: SSO Callback from accounts.openrockets.com
app.get('/api/auth/sso-callback', async (c) => {
  const token = c.req.query('token');
  const returnTo = c.req.query('returnTo') || '/dashboard';
  
  if (token) {
    try {
      const payloadStr = atob(token.split('.')[1]);
      const payload = JSON.parse(payloadStr);
      const userId = payload.sub;
      if (userId) {
        let [dbUser] = await db.select().from(users).where(eq(users.id, userId));
        if (!dbUser) {
          await db.insert(users).values({
            id: userId,
            displayName: payload.name || 'Contributor',
            email: payload.email || 'user@example.com',
            role: 'contributor',
          });
        }
      }
    } catch (e) {
      console.error("SSO Upsert Error", e);
    }
  }
  
  return c.redirect(`${returnTo}?token=${token}`);
});

// Discord webhook utility is decoupled and called natively within the publications POST router

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

console.log(`🚀 Starting Open Rockets Press API on port ${port}...`);

serve({
  fetch: app.fetch,
  port
});
