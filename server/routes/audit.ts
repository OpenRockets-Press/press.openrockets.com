import { Hono } from 'hono';
import { db } from '../db';
import { auditLogs, users } from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

export const auditRouter = new Hono();

auditRouter.get('/', authMiddleware, async (c) => {
  const user = c.get('user');

  if (user.role !== 'admin') {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Administrator access required' } }, 403);
  }

  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = (page - 1) * limit;

  // Total count
  const [countResult] = await db
    .select({ count: sql`COUNT(${auditLogs.id})`.mapWith(Number) })
    .from(auditLogs);

  // Paginated logs
  const logs = await db
    .select({
      log: auditLogs,
      actorName: users.displayName,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  const formattedLogs = logs.map(l => ({
    ...l.log,
    actorName: l.actorName || 'Unknown / System',
  }));

  return c.json({
    success: true,
    data: formattedLogs,
    meta: {
      total: countResult?.count || 0,
      page,
      limit,
      totalPages: Math.ceil((countResult?.count || 0) / limit),
    }
  });
});
