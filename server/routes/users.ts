import { Hono } from 'hono';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const usersRouter = new Hono();

usersRouter.get('/', async (c) => {
  const allUsers = await db.query.users.findMany();
  return c.json(allUsers);
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
