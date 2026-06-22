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

// Phase 3 Placeholder: SSO Callback from accounts.openrockets.com
app.post('/api/auth/sso-callback', async (c) => {
  // TODO: Implement token validation against openrocketsauth.alwaysdata.net
  // TODO: Upsert user into `users` table
  // TODO: Set secure HTTP-only cookie session
  return c.json({ success: true, message: 'SSO callback not yet fully implemented' });
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
