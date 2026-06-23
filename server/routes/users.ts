import { Hono } from 'hono';
import { db } from '../db';
import { users } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

export const usersRouter = new Hono();

usersRouter.get('/', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (user.role !== 'admin' && user.role !== 'moderator') {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } }, 403);
  }

  // Use pagination in real life, but simple findMany for now
  const allUsers = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
  });
  
  return c.json({ success: true, data: allUsers });
});

usersRouter.get('/:userId', async (c) => {
  const userId = c.req.param('userId');

  const userProfile = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      displayName: true,
      role: true,
      createdAt: true,
    }
  });

  if (!userProfile) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, 404);
  }

  // Fetch only their published works for public view
  const userPublications = await db.query.publications.findMany({
    where: (publications, { eq, and }) => and(
      eq(publications.authorId, userId),
      eq(publications.status, 'published')
    ),
    orderBy: (publications, { desc }) => [desc(publications.publishedAt)],
  });

  return c.json({
    success: true,
    data: {
      profile: userProfile,
      publications: userPublications,
    }
  });
});

usersRouter.post('/:userId/manage', authMiddleware, async (c) => {
  const adminUser = c.get('user');
  const targetUserId = c.req.param('userId');
  const { action, reason } = await c.req.json();
  
  if (adminUser.role !== 'admin') {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Administrator access required' } }, 403);
  }

  if (action === 'suspend') {
    await db.update(users).set({ isSuspended: true }).where(eq(users.id, targetUserId));
  } else if (action === 'unsuspend') {
    await db.update(users).set({ isSuspended: false }).where(eq(users.id, targetUserId));
  } else {
    return c.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid action' } }, 400);
  }

  // Optionally log this into auditLogs
  
  return c.json({ success: true });
});

usersRouter.post('/:userId/promote', authMiddleware, async (c) => {
  const adminUser = c.get('user');
  const targetUserId = c.req.param('userId');
  const { newRole } = await c.req.json();
  
  if (adminUser.role !== 'admin') {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Administrator access required' } }, 403);
  }

  if (!['contributor', 'moderator', 'admin'].includes(newRole)) {
    return c.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid role specified' } }, 400);
  }

  await db.update(users)
    .set({ role: newRole })
    .where(eq(users.id, targetUserId));

  return c.json({ success: true });
});
