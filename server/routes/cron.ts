import { Hono } from 'hono';
import { db } from '../db';
import { auditLogs } from '../db/schema';
import { lt, sql } from 'drizzle-orm';

export const cronRouter = new Hono();

cronRouter.post('/cleanup', async (c) => {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = c.req.header('authorization');

  // Securely lock down this endpoint so only the automated infrastructure can call it
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing CRON secret' } }, 401);
  }

  try {
    // Calculate timestamp for 90 days ago
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Delete audit logs older than 90 days to prevent infinite database bloat
    const [result] = await db.delete(auditLogs)
      .where(lt(auditLogs.createdAt, ninetyDaysAgo));

    const rowsAffected = (result as any)?.affectedRows || 0;

    return c.json({
      success: true,
      message: 'Database cleanup executed successfully',
      prunedRecords: rowsAffected,
    });
  } catch (error) {
    console.error('CRON cleanup error:', error);
    return c.json({ success: false, error: { code: 'CRON_FAILED', message: 'Failed to execute cleanup' } }, 500);
  }
});
