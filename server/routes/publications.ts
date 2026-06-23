import { Hono } from 'hono';
import { db } from '../db';
import { publications, users } from '../db/schema';
import { desc, eq, and, asc, sql } from 'drizzle-orm';
import { BUCKET_NAME, uploadToStorage } from '../storage/s3';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const publicationsRouter = new Hono();

const getListQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  division: z.enum(['artifacts', '3d', 'code']).optional(),
  license: z.enum(['ORP_BEAVER', 'ORP_EAGLE', 'ORP_KANGAROO']).optional(),
  sort: z.enum(['newest', 'popular', 'oldest']).default('newest'),
});

publicationsRouter.get('/', zValidator('query', getListQuerySchema), async (c) => {
  const { page, limit, division, license, sort } = c.req.valid('query');
  
  const conditions = [eq(publications.status, 'published')];
  
  if (division) conditions.push(eq(publications.division, division));
  if (license) conditions.push(eq(publications.license, license));
  
  const whereClause = and(...conditions);
  
  let orderByClause;
  if (sort === 'popular') {
    orderByClause = desc(publications.viewCount);
  } else if (sort === 'oldest') {
    orderByClause = asc(publications.publishedAt);
  } else {
    orderByClause = desc(publications.publishedAt); // default to newest
  }

  const offset = (page - 1) * limit;

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(publications)
    .where(whereClause);

  const totalPages = Math.ceil(count / limit);

  // Get data with explicit join
  const data = await db
    .select({
      pub: publications,
      authorName: users.displayName,
    })
    .from(publications)
    .leftJoin(users, eq(publications.authorId, users.id))
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  // Map to a clean frontend-friendly structure
  const formattedData = data.map(row => ({
    ...row.pub,
    authorName: row.authorName || 'Unknown Author',
  }));

  return c.json({
    data: formattedData,
    meta: {
      page,
      limit,
      totalRecords: count,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
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
  
  const [data] = await db
    .select({
      pub: publications,
      authorName: users.displayName,
    })
    .from(publications)
    .leftJoin(users, eq(publications.authorId, users.id))
    .where(eq(publications.pubId, pubId))
    .limit(1);

  if (!data) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Publication not found' } }, 404);
  }

  // Increment view count asynchronously to avoid blocking the response
  // We use the integer `id` for faster indexing on the update
  db.update(publications)
    .set({ viewCount: sql`${publications.viewCount} + 1` })
    .where(eq(publications.id, data.pub.id))
    .execute()
    .catch(err => console.error("Failed to increment view count", err));

  const formattedData = {
    ...data.pub,
    authorName: data.authorName || 'Unknown Author',
  };

  return c.json({ success: true, data: formattedData });
});

publicationsRouter.get('/:pubId/download', async (c) => {
  const pubId = c.req.param('pubId');
  const pub = await db.query.publications.findFirst({
    where: eq(publications.pubId, pubId),
  });

  if (!pub) return c.json({ error: 'Publication not found' }, 404);

  // Phase 8: Presigned Download URL
  const { getPresignedDownloadUrl } = await import('../storage/s3');
  try {
    const downloadUrl = await getPresignedDownloadUrl(pub.fileStorageKey);
    return c.redirect(downloadUrl);
  } catch (e) {
    console.error("Download Error", e);
    return c.json({ error: 'Failed to generate download link' }, 500);
  }
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
