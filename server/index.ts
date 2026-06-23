import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { db } from './db';
import { users, publications } from './db/schema';
import { s3Client, uploadToStorage, BUCKET_NAME } from './storage/s3';

const app = new Hono();

import { publicationsRouter } from './routes/publications';
import { usersRouter } from './routes/users';
import { casesRouter } from './routes/cases';
import { dashboardsRouter } from './routes/dashboards';

// Middleware
app.use('*', logger());
app.use('/api/*', cors({
  origin: process.env.APP_BASE_URL || 'http://localhost:5173',
  credentials: true,
}));

// Setup Routers
app.route('/api/publications', publicationsRouter);
app.route('/api/users', usersRouter);
app.route('/api/cases', casesRouter);
app.route('/api/dashboards', dashboardsRouter);

// Basic Health Check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', message: 'Open Rockets Press API is running' });
});

// Phase 3 Placeholder: SSO Callback from accounts.openrockets.com
app.get('/api/auth/sso-callback', async (c) => {
  const token = c.req.query('token');
  const returnTo = c.req.query('returnTo') || '/dashboard';
  
  // TODO: Implement token validation against openrocketsauth.alwaysdata.net
  // TODO: Upsert user into `users` table
  // TODO: Set secure HTTP-only cookie session
  
  // For now, redirect to the frontend with the token so the frontend can mock login
  return c.redirect(`${returnTo}?token=${token}`);
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
