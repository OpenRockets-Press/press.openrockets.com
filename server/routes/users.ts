import { Hono } from 'hono';
import { db } from '../db';
import { users } from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

export const usersRouter = new Hono();

usersRouter.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ loggedIn: false });
  }

  const token = authHeader.split(' ')[1];
  try {
    const response = await fetch("https://openrocketsauth.alwaysdata.net/api/auth/me", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!response.ok) return c.json({ loggedIn: false });

    const userData = await response.json();
    const userId = String(userData.id);
    let [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) return c.json({ loggedIn: false });

    return c.json({
      userId: user.id,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      accountStatus: user.isSuspended ? 'suspended' : 'active',
      consentTier: 'general',
      loggedIn: true
    });
  } catch (e) {
    return c.json({ loggedIn: false });
  }
});

usersRouter.get('/', authMiddleware, async (c) => {
  const user = c.get('user');
  
  if (user.role !== 'admin' && user.role !== 'moderator') {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } }, 403);
  }

  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  // Get total count
  const [countResult] = await db
    .select({ count: sql`COUNT(${users.id})`.mapWith(Number) })
    .from(users);

  const allUsers = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
    limit,
    offset,
  });
  
  return c.json({ 
    success: true, 
    data: allUsers,
    meta: {
      page,
      limit,
      totalCount: countResult?.count || 0,
      totalPages: Math.ceil((countResult?.count || 0) / limit),
    }
  });
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
