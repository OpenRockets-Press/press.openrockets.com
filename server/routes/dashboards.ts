import { Hono } from 'hono';
import { db } from '../db';

import { eq, desc, sql } from 'drizzle-orm';
import { publications, cases } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

export const dashboardsRouter = new Hono();

dashboardsRouter.get('/contributor', authMiddleware, async (c) => {
  const user = c.get('user');

  // Aggregate stats
  const [stats] = await db
    .select({
      totalViews: sql`COALESCE(SUM(${publications.viewCount}), 0)`.mapWith(Number),
      totalDownloads: sql`COALESCE(SUM(${publications.downloadCount}), 0)`.mapWith(Number),
      totalPublications: sql`COUNT(${publications.id})`.mapWith(Number),
      pendingCount: sql`SUM(CASE WHEN ${publications.status} = 'pending_review' THEN 1 ELSE 0 END)`.mapWith(Number),
      publishedCount: sql`SUM(CASE WHEN ${publications.status} = 'published' THEN 1 ELSE 0 END)`.mapWith(Number),
      rejectedCount: sql`SUM(CASE WHEN ${publications.status} = 'rejected' THEN 1 ELSE 0 END)`.mapWith(Number),
    })
    .from(publications)
    .where(eq(publications.authorId, user.id));

  // Fetch recent publications
  const recentSubmissions = await db.query.publications.findMany({
    where: eq(publications.authorId, user.id),
    orderBy: [desc(publications.submittedAt)],
    limit: 5,
  });

  // Fetch recent cases opened by this user
  const recentCases = await db.query.cases.findMany({
    where: eq(cases.contributorUserId, user.id),
    orderBy: [desc(cases.updatedAt)],
    limit: 5,
  });

  // Reputation Score (mock formula for now: 1 download = 5 points, 1 view = 1 point)
  const reputationScore = (stats?.totalDownloads || 0) * 5 + (stats?.totalViews || 0);

  return c.json({
    success: true,
    data: {
      stats: {
        totalViews: stats?.totalViews || 0,
        totalDownloads: stats?.totalDownloads || 0,
        totalPublications: stats?.totalPublications || 0,
        pendingCount: stats?.pendingCount || 0,
        publishedCount: stats?.publishedCount || 0,
        rejectedCount: stats?.rejectedCount || 0,
        reputationScore,
      },
      recentSubmissions,
      recentCases,
    }
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
