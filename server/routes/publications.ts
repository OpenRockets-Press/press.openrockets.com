import { Hono } from 'hono';
import { db } from '../db';
import { publications } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { BUCKET_NAME, uploadToStorage } from '../storage/s3';

export const publicationsRouter = new Hono();

publicationsRouter.get('/', async (c) => {
  // getHomeFeed equivalent
  const pubs = await db.query.publications.findMany({
    where: eq(publications.status, 'published'),
    orderBy: [desc(publications.publishedAt)],
    limit: 20,
    with: {
      authorId: true,
    }
  });

  return c.json({
    featured: pubs.slice(0, 5),
    trending: pubs.slice(5, 10),
    newReleases: pubs.slice(10, 20),
  });
});

publicationsRouter.get('/contributor', async (c) => {
  // We'd extract the user from the JWT token here
  // Mocking userId for now since SSO validation is pending
  const userId = "mock_user";
  
  const pubs = await db.query.publications.findMany({
    where: eq(publications.authorId, userId),
    orderBy: [desc(publications.submittedAt)],
  });

  return c.json(pubs);
});

publicationsRouter.post('/', async (c) => {
  const body = await c.req.parseBody();
  // Assume file upload handling here
  const title = body['title'] as string;
  const abstract = body['abstract'] as string;
  const type = body['type'] as any;
  const license = body['license'] as any;
  
  // Fake S3 upload
  const fileStorageKey = `pubs/${Date.now()}.pdf`;

  const pubId = "ORP-" + Date.now().toString();

  await db.insert(publications).values({
    pubId,
    authorId: "mock_user", // from token
    title,
    abstract,
    type,
    license,
    status: 'pending_review',
    fileStorageKey,
  });

  return c.json({ id: pubId });
});

publicationsRouter.get('/:pubId', async (c) => {
  const pubId = c.req.param('pubId');
  const pub = await db.query.publications.findFirst({
    where: eq(publications.pubId, pubId),
  });

  if (!pub) {
    return c.json({ error: 'Publication not found' }, 404);
  }

  return c.json(pub);
});

publicationsRouter.get('/:pubId/download', async (c) => {
  const pubId = c.req.param('pubId');
  return c.json({ url: `https://example.com/download/${pubId}` });
});

publicationsRouter.post('/:pubId/review', async (c) => {
  const pubId = c.req.param('pubId');
  const { action, feedback } = await c.req.json();

  await db.update(publications)
    .set({ status: action === 'approved' ? 'published' : 'rejected' })
    .where(eq(publications.pubId, pubId));

  return c.json({ success: true });
});

publicationsRouter.post('/:pubId/retract', async (c) => {
  const pubId = c.req.param('pubId');
  await db.delete(publications).where(eq(publications.pubId, pubId));
  return c.json({ success: true });
});
