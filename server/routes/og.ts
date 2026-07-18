import { Hono } from 'hono';
import * as fs from 'fs';
import * as path from 'path';
import { db } from '../db';
import { publications } from '../db/schema';
import { eq } from 'drizzle-orm';

export const ogRouter = new Hono();

/**
 * Resolves publisher info from publishers.json.
 * Tries both public/ and dist/ paths to handle dev and production environments.
 */
function resolvePublisher(publisherId: string | null) {
  const defaults = {
    name: 'OpenRockets Press',
    domain: 'press.openrockets.com',
    logo: 'https://press.openrockets.com/brand/welcomepage2.png',
  };

  if (!publisherId) return defaults;

  const candidates = [
    path.join(process.cwd(), 'public/config/publishers.json'),
    path.join(process.cwd(), 'dist/config/publishers.json'),
  ];

  for (const pubPath of candidates) {
    try {
      if (fs.existsSync(pubPath)) {
        const pubData = JSON.parse(fs.readFileSync(pubPath, 'utf8'));
        const pubInfo = pubData.publishers.find((p: any) => p.id === publisherId);
        if (pubInfo) {
          return {
            name: pubInfo.name,
            domain: pubInfo.domain,
            logo: pubInfo.logoUrl.startsWith('/')
              ? `https://press.openrockets.com${pubInfo.logoUrl}`
              : pubInfo.logoUrl,
          };
        }
      }
    } catch (_) {
      continue;
    }
  }

  return defaults;
}

/**
 * GET /api/og/:shortId
 *
 * Generates a 1200×630 PNG with the publisher's logo centered on a white
 * background. Used as the og:image for link previews on Discord, WhatsApp, etc.
 *
 * If the publication has a custom cover image, redirects to that instead.
 * If @vercel/og image generation fails, redirects to the raw publisher logo.
 */
ogRouter.get('/:shortId', async (c) => {
  const shortId = c.req.param('shortId');

  try {
    const [pub] = await db
      .select({
        coverStorageKey: publications.coverStorageKey,
        publisherId: publications.publisherId,
      })
      .from(publications)
      .where(eq(publications.shortId, shortId))
      .limit(1);

    if (!pub) {
      return c.text('Not found', 404);
    }

    // If the artifact has a custom cover image, redirect to it directly
    if (pub.coverStorageKey) {
      const coverUrl = pub.coverStorageKey.startsWith('http')
        ? pub.coverStorageKey
        : `https://press.openrockets.com/api/storage/fetch/${pub.coverStorageKey}`;
      return c.redirect(coverUrl);
    }

    const publisher = resolvePublisher(pub.publisherId);

    // Generate image: publisher logo centered on white background
    try {
      const { ImageResponse } = await import('@vercel/og');

      const response = new ImageResponse(
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              backgroundColor: '#ffffff',
              padding: '100px',
            },
            children: {
              type: 'img',
              props: {
                src: publisher.logo,
                width: 400,
                height: 400,
                style: {
                  objectFit: 'contain',
                },
              },
            },
          },
        },
        {
          width: 1200,
          height: 630,
        }
      );

      const arrayBuffer = await response.arrayBuffer();

      return c.body(Buffer.from(arrayBuffer), 200, {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      });
    } catch (imgErr) {
      console.error('[OG Image] @vercel/og generation failed, redirecting to logo:', imgErr);
      // Fallback: redirect to the publisher logo directly
      return c.redirect(publisher.logo);
    }
  } catch (error) {
    console.error('[OG Image] Endpoint error:', error);
    return c.redirect('https://press.openrockets.com/brand/welcomepage2.png');
  }
});
