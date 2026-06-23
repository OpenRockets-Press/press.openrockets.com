import { Hono } from 'hono';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const usersRouter = new Hono();

usersRouter.get('/', async (c) => {
  const allUsers = await db.query.users.findMany();
  return c.json(allUsers);
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

usersRouter.post('/:userId/manage', async (c) => {
  const userId = c.req.param('userId');
  const { action, reason } = await c.req.json();
  
  // Here you would implement ban/suspend logic
  return c.json({ success: true });
});

usersRouter.post('/:userId/promote', async (c) => {
  const userId = c.req.param('userId');
  const { newRole } = await c.req.json();
  
  await db.update(users)
    .set({ role: newRole })
    .where(eq(users.id, userId));

  return c.json({ success: true });
});
