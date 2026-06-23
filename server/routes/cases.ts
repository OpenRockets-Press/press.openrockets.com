import { Hono } from 'hono';
import { db } from '../db';
import { cases, caseMessages, users } from '../db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { zValidator } from '@hono/zod-validator';
import { createCaseSchema, createCaseMessageSchema } from '../validators/schemas';

export const casesRouter = new Hono();

casesRouter.get('/', async (c) => {
  // getContributorCases
  const userId = "mock_user";
  
  const userCases = await db.query.cases.findMany({
    where: eq(cases.contributorUserId, userId),
    orderBy: [desc(cases.updatedAt)],
  });

  return c.json(userCases);
});

casesRouter.post('/', authMiddleware, zValidator('json', createCaseSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  const caseId = `CASE-${Date.now()}`;
  const messageId = `MSG-${Date.now()}`;

  try {
    // 1. Create the Support Case
    await db.insert(cases).values({
      id: caseId,
      contributorUserId: user.id,
      subject: body.subject,
      priority: body.priority,
      relatedPubId: body.relatedPubId || null,
      status: 'open',
    });

    // 2. Insert the initial message natively
    await db.insert(caseMessages).values({
      id: messageId,
      caseId: caseId,
      senderId: user.id,
      senderRole: user.role,
      body: body.initialMessage,
    });

    return c.json({ success: true, data: { caseId } }, 201);
  } catch (error) {
    console.error("Case creation failed:", error);
    return c.json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to create case' } }, 500);
  }
});

casesRouter.get('/:caseId/messages', authMiddleware, async (c) => {
  const caseId = c.req.param('caseId');
  const user = c.get('user');

  // Verify access to the case
  const supportCase = await db.query.cases.findFirst({
    where: eq(cases.id, caseId),
  });

  if (!supportCase) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Case not found' } }, 404);
  }

  // Restrict to case author, moderator, or admin
  if (supportCase.contributorUserId !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } }, 403);
  }

  const messages = await db
    .select({
      msg: caseMessages,
      senderName: users.displayName,
    })
    .from(caseMessages)
    .leftJoin(users, eq(caseMessages.senderId, users.id))
    .where(eq(caseMessages.caseId, caseId))
    .orderBy(asc(caseMessages.createdAt));

  const formattedMessages = messages.map(m => ({
    ...m.msg,
    senderName: m.senderName || 'System',
  }));

  return c.json({ success: true, data: formattedMessages });
});

casesRouter.post('/:caseId/reply', authMiddleware, zValidator('json', createCaseMessageSchema), async (c) => {
  const caseId = c.req.param('caseId');
  const user = c.get('user');
  const body = c.req.valid('json');

  // Verify access to the case
  const supportCase = await db.query.cases.findFirst({
    where: eq(cases.id, caseId),
  });

  if (!supportCase) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Case not found' } }, 404);
  }

  if (supportCase.contributorUserId !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } }, 403);
  }

  if (supportCase.status === 'closed' || supportCase.status === 'resolved') {
    return c.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Cannot reply to a closed case' } }, 400);
  }

  try {
    const messageId = `MSG-${Date.now()}`;
    await db.insert(caseMessages).values({
      id: messageId,
      caseId,
      senderId: user.id,
      senderRole: user.role,
      body: body.body,
    });

    // Automatically update the 'updatedAt' of the main case
    await db.update(cases)
      .set({ updatedAt: new Date() })
      .where(eq(cases.id, caseId));

    return c.json({ success: true, data: { messageId } }, 201);
  } catch (error) {
    console.error("Failed to post reply:", error);
    return c.json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to post reply' } }, 500);
  }
});

casesRouter.post('/:caseId/resolve', async (c) => {
  const caseId = c.req.param('caseId');
  const { resolution } = await c.req.json();

  await db.update(cases)
    .set({ status: 'resolved' })
    .where(eq(cases.id, caseId));

  return c.json({ success: true });
});
