import { Hono } from 'hono';
import * as crypto from 'crypto';
import { db } from '../db';
import { publications, users, auditLogs } from '../db/schema';
import { desc, eq, and, or, like, asc, sql } from 'drizzle-orm';
import { BUCKET_NAME, uploadToStorage } from '../storage/s3';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { createPublicationSchema, updatePublicationSchema } from '../validators/schemas';
import { notifyDiscordWebhook } from '../utils/discord';
import { sendReviewEmail } from '../utils/email';
export const publicationsRouter = new Hono();

const getListQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  q: z.string().optional(),
  division: z.enum(['artifacts', '3d', 'code']).optional(),
  license: z.enum(['ORP_BEAVER', 'ORP_EAGLE', 'ORP_KANGAROO']).optional(),
  sort: z.enum(['newest', 'popular', 'oldest']).default('newest'),
});

publicationsRouter.get('/', zValidator('query', getListQuerySchema), async (c) => {
  const { page, limit, q, division, license, sort } = c.req.valid('query');
  
  const conditions = [eq(publications.status, 'published')];
  
  if (q) {
    conditions.push(
      or(
        like(publications.title, `%${q}%`),
        like(publications.tags, `%${q}%`),
        like(publications.abstract, `%${q}%`)
      )
    );
  }

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

  // Get data with explicit join and optimized select (Omit content to save bandwidth)
  const data = await db
    .select({
      id: publications.id,
      title: publications.title,
      division: publications.division,
      category: publications.category,
      license: publications.license,
      status: publications.status,
      viewCount: publications.viewCount,
      downloadCount: publications.downloadCount,
      abstract: publications.abstract,
      coverImageUrl: publications.coverImageUrl,
      tags: publications.tags,
      createdAt: publications.createdAt,
      submittedAt: publications.submittedAt,
      publishedAt: publications.publishedAt,
      authorId: publications.authorId,
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
    ...row,
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

publicationsRouter.post('/pre-upload', authMiddleware, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const files = body.files as { name: string; type: string }[];
  
  if (!files || !Array.isArray(files) || files.length === 0 || files.length > 5) {
    return c.json({ success: false, error: 'Must provide 1 to 5 files for pre-upload' }, 400);
  }

  const { getPresignedUploadUrl } = await import('../storage/s3');
  
  try {
    const uploadUrls = await Promise.all(
      files.map(async (f) => {
        const fileExt = f.name.split('.').pop();
        const key = `uploads/${user.id}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const url = await getPresignedUploadUrl(key, f.type || 'application/octet-stream');
        return { originalName: f.name, key, url };
      })
    );
    
    return c.json({ success: true, data: uploadUrls });
  } catch (error) {
    console.error('Pre-upload error:', error);
    return c.json({ success: false, error: 'Failed to generate upload URLs' }, 500);
  }
});

publicationsRouter.post('/', authMiddleware, zValidator('json', createPublicationSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  // Generate a unique 16-character alphanumeric publication ID
  const pubId = crypto.randomBytes(8).toString('hex');
  
  // Generate a 7-character short link identifier (e.g. 845s73v)
  const shortId = crypto.randomBytes(4).toString('hex').substring(0, 7);

  try {
    await db.insert(publications).values({
      pubId,
      shortId,
      authorId: user.id, // Authenticated user ID
      title: body.title,
      subtitle: body.subtitle || null,
      abstract: body.abstract || null,
      type: body.type,
      license: body.license,
      division: body.division,
      publisherId: body.publisherId || null,
      status: 'pending_review',
      fileStorageKey: body.fileStorageKey || null,
      extraFiles: body.extraFiles || null,
      coverStorageKey: body.coverStorageKey || null,
      customThumbnailStorageKey: body.customThumbnailStorageKey || null,
      githubRepoUrl: body.githubRepoUrl || null,
      threejsModelKey: body.threejsModelKey || null,
      tags: body.tags || null,
      communities: body.communities || null,
      links: body.links || null,
    });

    // Trigger Discord Webhook Notification
    // Run asynchronously so it doesn't block the client response
    notifyDiscordWebhook(body, user.displayName || 'Contributor').catch(err => {
      console.error("Discord Webhook Background Error:", err);
    });

    return c.json({ success: true, data: { pubId, shortId } }, 201);
  } catch (error) {
    console.error("Publication creation failed:", error);
    return c.json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to create publication' } }, 500);
  }
});

publicationsRouter.get('/by-slug/:slug', async (c) => {
  const slug = c.req.param('slug');
  try {
    const allPubs = await db
      .select({
        pub: publications,
        author: {
          displayName: users.displayName,
          email: users.email
        }
      })
      .from(publications)
      .leftJoin(users, eq(publications.authorId, users.id));

    const matched = allPubs.find((p) => {
      const generatedSlug = p.pub.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return generatedSlug === slug;
    });

    if (!matched) {
      c.header('X-Robots-Tag', 'noindex, nofollow');
      return c.json({ success: false, error: { message: "Artifact not found" } }, 404);
    }

    // Merge author info into pub
    const responseData = {
      ...matched.pub,
      authorName: matched.author?.displayName || matched.author?.email || "Unknown Author",
      authorAvatar: matched.author?.avatarUrl
    };

    c.header('X-Robots-Tag', 'noindex, nofollow');
    return c.json({ success: true, data: responseData });
  } catch (err: any) {
    c.header('X-Robots-Tag', 'noindex, nofollow');
    return c.json({ success: false, error: { message: err.message } }, 500);
  }
});

publicationsRouter.get('/admin-all', authMiddleware, async (c) => {
  const user = c.get('user');

  // Verify the user is the super-admin
  if (user.email !== 'press@openrockets.com' && user.role !== 'admin') {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Administrator access required' } }, 403);
  }

  try {
    const data = await db
      .select({
        pub: publications,
        authorName: users.displayName,
      })
      .from(publications)
      .leftJoin(users, eq(publications.authorId, users.id))
      .orderBy(desc(publications.submittedAt));

    const formattedData = data.map(r => ({
      ...r.pub,
      authorName: r.authorName || 'Unknown Author',
    }));

    return c.json({ success: true, data: formattedData });
  } catch (err: any) {
    return c.json({ success: false, error: { message: err.message } }, 500);
  }
});

// Short URL Resolver Endpoint
publicationsRouter.get('/short/:shortId', async (c) => {
  const shortId = c.req.param('shortId');
  
  const [data] = await db
    .select({
      pub: publications,
      authorName: users.displayName,
      authorAvatar: users.email // Or however you get avatar
    })
    .from(publications)
    .leftJoin(users, eq(publications.authorId, users.id))
    .where(eq(publications.shortId, shortId))
    .limit(1);

  if (!data) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Publication not found' } }, 404);
  }

  // Same view increment logic as standard view
  db.update(publications)
    .set({ viewCount: sql`${publications.viewCount} + 1` })
    .where(eq(publications.id, data.pub.id))
    .execute()
    .catch(err => console.error("Failed to increment view count on short URL", err));

  const formattedData = {
    ...data.pub,
    authorName: data.authorName || 'Unknown Author',
  };

  return c.json({ success: true, data: formattedData });
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

publicationsRouter.put('/:pubId', authMiddleware, zValidator('json', updatePublicationSchema), async (c) => {
  const pubId = c.req.param('pubId');
  const user = c.get('user');
  const body = c.req.valid('json');

  // Verify existence and ownership
  const pub = await db.query.publications.findFirst({
    where: eq(publications.pubId, pubId),
  });

  if (!pub) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Publication not found' } }, 404);
  }

  // Only the author or an admin/moderator should be allowed to edit
  if (pub.authorId !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to edit this publication' } }, 403);
  }

  try {
    await db.update(publications)
      .set({
        title: body.title,
        abstract: body.abstract,
        tags: body.tags,
      })
      .where(eq(publications.pubId, pubId));

    return c.json({ success: true, message: 'Publication updated' });
  } catch (error) {
    console.error("Publication update failed:", error);
    return c.json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to update publication' } }, 500);
  }
});

publicationsRouter.get('/:pubId/download', async (c) => {
  const pubId = c.req.param('pubId');
  const pub = await db.query.publications.findFirst({
    where: eq(publications.pubId, pubId),
  });

  if (!pub) return c.json({ error: 'Publication not found' }, 404);

  const fileKey = c.req.query('fileKey') || pub.fileStorageKey;
  if (!fileKey) return c.json({ error: 'No file associated' }, 404);

  // Phase 8: Presigned Download URL
  const { getPresignedDownloadUrl } = await import('../storage/s3');
  try {
    const downloadUrl = await getPresignedDownloadUrl(fileKey);
    return c.redirect(downloadUrl);
  } catch (e) {
    console.error("Download Error", e);
    return c.json({ error: 'Failed to generate download link' }, 500);
  }
});



publicationsRouter.post('/:pubId/review', authMiddleware, async (c) => {
  const pubId = c.req.param('pubId');
  const user = c.get('user');

  if (user.role !== 'admin' && user.role !== 'moderator' && user.email !== 'press@openrockets.com') {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Only moderators can review publications' } }, 403);
  }

  const body = await c.req.json();
  const action = body.action || body.decision;
  const feedback = body.feedback || '';
  
  let newStatus = 'rejected';
  if (action === 'approved' || action === 'approve') newStatus = 'published';
  else if (action === 'pending') newStatus = 'pending_review';

  try {
    const pubWithAuthor = await db
      .select({
        pub: publications,
        authorEmail: users.email,
        authorFirstName: users.displayName,
      })
      .from(publications)
      .leftJoin(users, eq(publications.authorId, users.id))
      .where(eq(publications.pubId, pubId))
      .limit(1);

    const pubData = pubWithAuthor[0];
    if (!pubData) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Publication not found' } }, 404);
    }

    await db.update(publications)
      .set({ 
        status: newStatus,
        publishedAt: newStatus === 'published' ? new Date() : null,
      })
      .where(eq(publications.pubId, pubId));

    // Audit Log (Phase 21 related, doing it now for deep implementation)
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      actorId: user.id,
      action: `publication_${newStatus}`,
      targetId: pubId,
      metadata: JSON.stringify({ feedback, previousStatus: 'pending_review' }),
    });

    if ((newStatus === 'published' || newStatus === 'rejected') && pubData.authorEmail) {
      // Send email without blocking the response
      sendReviewEmail(
        pubData.authorEmail,
        pubData.authorFirstName || 'Contributor',
        pubData.pub.title,
        pubData.pub.publisherId || 'nyrj', // default to an arbitrary one if null
        newStatus,
        pubData.pub.pubId
      ).catch(e => console.error("Email dispatch failed:", e));
    }

    return c.json({ success: true });
  } catch (err) {
    console.error("Review update failed:", err);
    return c.json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to process review' } }, 500);
  }
});

publicationsRouter.post('/:pubId/retract', authMiddleware, async (c) => {
  const pubId = c.req.param('pubId');
  const user = c.get('user');

  // Verify ownership or admin rights
  const pub = await db.query.publications.findFirst({
    where: eq(publications.pubId, pubId),
  });

  if (!pub) return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Publication not found' } }, 404);

  if (pub.authorId !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Permission denied' } }, 403);
  }

  try {
    await db.delete(publications).where(eq(publications.pubId, pubId));

    // Audit Log
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      actorId: user.id,
      action: `publication_retracted`,
      targetId: pubId,
      metadata: JSON.stringify({ title: pub.title }),
    });

    return c.json({ success: true });
  } catch (err) {
    console.error("Retraction failed:", err);
    return c.json({ success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to retract publication' } }, 500);
  }
});

publicationsRouter.post('/:pubId/view', async (c) => {
  const pubId = c.req.param('pubId');
  try {
    await db.update(publications)
      .set({ viewCount: sql`view_count + 1` })
      .where(eq(publications.pubId, pubId));
    return c.json({ success: true });
  } catch (err) {
    console.error('Failed to increment view', err);
    return c.json({ success: false }, 500);
  }
});
