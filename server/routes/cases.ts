import { Hono } from 'hono';
import { db } from '../db';
import { cases, caseMessages } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { zValidator } from '@hono/zod-validator';
import { createCaseSchema } from '../validators/schemas';

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

casesRouter.get('/:caseId/messages', async (c) => {
  const caseId = c.req.param('caseId');
  const messages = await db.query.caseMessages.findMany({
    where: eq(caseMessages.caseId, caseId),
    orderBy: [desc(caseMessages.createdAt)],
  });

  return c.json(messages);
});

casesRouter.post('/:caseId/reply', async (c) => {
  const caseId = c.req.param('caseId');
  const { message } = await c.req.json();

  await db.insert(caseMessages).values({
    id: "MSG-" + Date.now().toString(),
    caseId,
    senderId: "mock_user",
    senderRole: "contributor",
    body: message,
  });

  return c.json({ success: true });
});

casesRouter.post('/:caseId/resolve', async (c) => {
  const caseId = c.req.param('caseId');
  const { resolution } = await c.req.json();

  await db.update(cases)
    .set({ status: 'resolved' })
    .where(eq(cases.id, caseId));

  return c.json({ success: true });
});
