import { Hono } from 'hono';
import { db } from '../db';

export const dashboardsRouter = new Hono();

dashboardsRouter.get('/contributor', async (c) => {
  // Mock aggregation
  return c.json({
    totalViews: 0,
    totalDownloads: 0,
    reputationScore: 0,
    recentSubmissions: [],
  });
});

dashboardsRouter.get('/moderation', async (c) => {
  return c.json({
    queueLength: 0,
    averageReviewTimeHours: 0,
    recentActions: [],
    pendingReviews: [],
  });
});

dashboardsRouter.get('/admin', async (c) => {
  return c.json({
    totalUsers: 0,
    activeSuspensions: 0,
    dsarRequestsPending: 0,
    systemHealth: "operational",
    recentAuditLogs: [],
  });
});
