import { Hono } from 'hono';
import { getPresignedUploadUrl, s3Client, BUCKET_NAME } from '../storage/s3';
import { authMiddleware } from '../middleware/auth';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export const storageRouter = new Hono();

// Proxy to fetch images/files from storage
storageRouter.get('/fetch/*', async (c) => {
  const key = c.req.path.replace('/api/storage/fetch/', '');
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    const response = await s3Client.send(command);
    if (!response.Body) return c.text('Not found', 404);
    
    const headers = new Headers();
    if (response.ContentType) headers.set('Content-Type', response.ContentType);
    if (response.ContentLength) headers.set('Content-Length', response.ContentLength.toString());
    
    return new Response(response.Body as any, { headers });
  } catch (e) {
    console.error('Storage Fetch Error:', e);
    return c.text('Error fetching file', 500);
  }
});

const presignedUrlSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().max(50_000_000, "File too large (max 50MB)"), // 50MB max
});

// Phase 7: Presigned URL Upload Endpoint
storageRouter.post(
  '/presigned-url',
  authMiddleware,
  zValidator('json', presignedUrlSchema),
  async (c) => {
    const { filename, contentType } = c.req.valid('json');
    const user = c.get('user');
    
    // Generate unique key based on date and user ID to prevent collision and organize
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const key = `artifacts/${new Date().getFullYear()}/${user.id}-${timestamp}-${sanitizedFilename}`;
    
    try {
      const uploadUrl = await getPresignedUploadUrl(key, contentType, 900); // 15 min
      return c.json({
        success: true,
        data: { uploadUrl, fileKey: key }
      });
    } catch (e) {
      console.error("Presigned URL Error:", e);
      return c.json({ success: false, error: { code: 'STORAGE_ERROR', message: 'Failed to generate upload URL' } }, 500);
    }
  }
);
