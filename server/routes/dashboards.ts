import { Hono } from 'hono';
import { db } from '../db';

import { eq, desc, sql, asc } from 'drizzle-orm';
import { publications, cases, auditLogs, users } from '../db/schema';
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

  // Fetch recent publications (Optimized: Omit abstract and content)
  const recentSubmissions = await db
    .select({
      id: publications.id,
      title: publications.title,
      status: publications.status,
      type: publications.type,
      submittedAt: publications.submittedAt,
    })
    .from(publications)
    .where(eq(publications.authorId, user.id))
    .orderBy(desc(publications.submittedAt))
    .limit(5);

  // Fetch recent cases opened by this user
  const recentCases = await db
    .select({
      id: cases.id,
      subject: cases.subject,
      status: cases.status,
      priority: cases.priority,
      updatedAt: cases.updatedAt,
    })
    .from(cases)
    .where(eq(cases.contributorUserId, user.id))
    .orderBy(desc(cases.updatedAt))
    .limit(5);

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

dashboardsRouter.get('/moderation', authMiddleware, async (c) => {
  const user = c.get('user');

  if (user.role !== 'admin' && user.role !== 'moderator') {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Moderator access required' } }, 403);
  }

  // Calculate the queue length
  const [queueStats] = await db
    .select({
      count: sql`COUNT(${publications.id})`.mapWith(Number)
    })
    .from(publications)
    .where(eq(publications.status, 'pending_review'));

  // Fetch the oldest pending reviews for the queue
  const pendingReviews = await db
    .select({
      pub: publications,
      authorName: users.displayName,
    })
    .from(publications)
    .leftJoin(users, eq(publications.authorId, users.id))
    .where(eq(publications.status, 'pending_review'))
    .orderBy(asc(publications.submittedAt))
    .limit(10);

  // Fetch recent actions performed by this exact moderator
  const recentActions = await db.query.auditLogs.findMany({
    where: eq(auditLogs.actorId, user.id),
    orderBy: [desc(auditLogs.createdAt)],
    limit: 10,
  });

  // Format pending reviews to match UI expectations
  const formattedPendingReviews = pendingReviews.map(r => ({
    ...r.pub,
    authorName: r.authorName || 'Unknown Author',
  }));

  return c.json({
    success: true,
    data: {
      queueLength: queueStats?.count || 0,
      averageReviewTimeHours: 24, // Mock metric for now
      recentActions,
      pendingReviews: formattedPendingReviews,
    }
  });
});

dashboardsRouter.get('/admin', authMiddleware, async (c) => {
  const user = c.get('user');

  if (user.role !== 'admin') {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Administrator access required' } }, 403);
  }

  // Count total platform users
  const [userStats] = await db
    .select({ count: sql`COUNT(${users.id})`.mapWith(Number) })
    .from(users);

  // Fetch the 10 most recent global system audit logs
  const recentAuditLogs = await db
    .select({
      log: auditLogs,
      actorName: users.displayName,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(10);

  // Format the logs
  const formattedAuditLogs = recentAuditLogs.map(r => ({
    ...r.log,
    actorName: r.actorName || 'System',
  }));

  // Note: activeSuspensions and dsarRequestsPending are mocked for now until Phase 23 (DSAR Engine)
  return c.json({
    success: true,
    data: {
      totalUsers: userStats?.count || 0,
      activeSuspensions: 0, 
      dsarRequestsPending: 0,
      systemHealth: "operational",
      recentAuditLogs: formattedAuditLogs,
    }
  });
});
