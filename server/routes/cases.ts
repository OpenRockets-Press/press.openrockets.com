import { Hono } from 'hono';
import { db } from '../db';
import { cases, caseMessages } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

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

casesRouter.post('/', async (c) => {
  const { subject, openingMessage, relatedPubId, labels } = await c.req.json();
  const caseId = "CASE-" + Date.now().toString();

  await db.insert(cases).values({
    id: caseId,
    contributorUserId: "mock_user",
    subject,
    relatedPubId,
  });

  await db.insert(caseMessages).values({
    id: "MSG-" + Date.now().toString(),
    caseId,
    senderId: "mock_user",
    senderRole: "contributor",
    body: openingMessage,
  });

  return c.json({ id: caseId });
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
