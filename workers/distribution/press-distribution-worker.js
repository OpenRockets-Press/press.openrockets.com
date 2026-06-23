/**
 * Open Rockets Press — Post-Moderation Distribution Worker
 * 
 * This Cloudflare Worker listens for database webhooks (e.g. from Oracle Cloud triggers)
 * triggered when an Artifact's status changes to 'published'.
 * It automatically syndicates the artifact to social platforms (X, Bluesky, Mastodon)
 * and pings search engine sitemaps for immediate indexing.
 * 
 * Deployment: \`wrangler deploy press-distribution-worker.js --name press-distribution\`
 */

export default {
  async fetch(request, env, ctx) {
    // 1. Validate Method and Path
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/webhook/publish') {
      return new Response('Not Found', { status: 404 });
    }

    // 2. Authenticate Webhook Secret
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader !== \`Bearer \${env.WEBHOOK_SECRET}\`) {
      return new Response('Unauthorized', { status: 401 });
    }

    try {
      const payload = await request.json();

      // 3. Validate Payload Structure
      // Expecting a payload shape of: { record: { id, title, author, status, tags }, old_record: { status } }
      const newRecord = payload.record;
      const oldRecord = payload.old_record;

      // Only trigger if transitioning specifically to 'published'
      if (!newRecord || newRecord.status !== 'published' || oldRecord?.status === 'published') {
        return new Response('Ignored: Not a new publication event', { status: 200 });
      }

      // 4. Extract Syndication Data
      const artifactUrl = \`https://press.openrockets.com/p/\${newRecord.id}\`;
      const divisionText = newRecord.tags?.includes('3d') ? '3D Model' : newRecord.tags?.includes('code') ? 'Code' : 'Artifact';
      const postText = \`🚀 New \${divisionText} published on Open Rockets Press!\n\n"\${newRecord.title}" by \${newRecord.author || 'Contributor'}.\n\nExplore it here: \${artifactUrl}\`;

      // 5. Dispatch Syndication Tasks asynchronously (non-blocking)
      ctx.waitUntil(
        Promise.allSettled([
          postToTwitter(postText, env),
          postToBluesky(postText, env),
          postToMastodon(postText, env),
          pingSitemaps()
        ])
      );

      return new Response(JSON.stringify({ success: true, message: 'Syndication dispatched' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Webhook Processing Error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};

/**
 * X / Twitter API v2 Posting
 */
async function postToTwitter(text, env) {
  if (!env.TWITTER_API_KEY) return; // Skip if no keys

  const endpoint = 'https://api.twitter.com/2/tweets';
  
  // Note: For production, this requires generating an OAuth 1.0a signature or using OAuth 2.0.
  // Assuming Bearer token for simplified app-only posting if supported, or an external library.
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${env.TWITTER_BEARER_TOKEN}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) {
      console.error('Twitter API Error:', await response.text());
    }
  } catch (err) {
    console.error('Twitter fetch failed:', err);
  }
}

/**
 * Bluesky (AT Protocol) Posting
 */
async function postToBluesky(text, env) {
  if (!env.BLUESKY_IDENTIFIER || !env.BLUESKY_PASSWORD) return;

  const pdsUrl = 'https://bsky.social';

  try {
    // 1. Create Session
    const sessionRes = await fetch(\`\${pdsUrl}/xrpc/com.atproto.server.createSession\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: env.BLUESKY_IDENTIFIER,
        password: env.BLUESKY_PASSWORD
      })
    });

    if (!sessionRes.ok) throw new Error('Bluesky auth failed');
    const session = await sessionRes.json();

    // 2. Create Post Record
    const postRes = await fetch(\`\${pdsUrl}/xrpc/com.atproto.repo.createRecord\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${session.accessJwt}\`
      },
      body: JSON.stringify({
        repo: session.did,
        collection: 'app.bsky.feed.post',
        record: {
          $type: 'app.bsky.feed.post',
          text: text,
          createdAt: new Date().toISOString(),
          // Note: Facets for URLs would be generated here in a full implementation
        }
      })
    });

    if (!postRes.ok) {
      console.error('Bluesky Post Error:', await postRes.text());
    }
  } catch (err) {
    console.error('Bluesky fetch failed:', err);
  }
}

/**
 * Mastodon API Posting
 */
async function postToMastodon(text, env) {
  if (!env.MASTODON_INSTANCE_URL || !env.MASTODON_ACCESS_TOKEN) return;

  const endpoint = \`\${env.MASTODON_INSTANCE_URL}/api/v1/statuses\`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${env.MASTODON_ACCESS_TOKEN}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: text,
        visibility: 'public'
      })
    });

    if (!response.ok) {
      console.error('Mastodon Post Error:', await response.text());
    }
  } catch (err) {
    console.error('Mastodon fetch failed:', err);
  }
}

/**
 * Search Engine Sitemap Pinging
 * Instantly alerts Google/Bing that the sitemap has updated.
 */
async function pingSitemaps() {
  const sitemapUrl = encodeURIComponent('https://press.openrockets.com/sitemap.xml');
  
  const endpoints = [
    \`https://www.google.com/ping?sitemap=\${sitemapUrl}\`,
    \`https://www.bing.com/ping?sitemap=\${sitemapUrl}\`
  ];

  for (const endpoint of endpoints) {
    try {
      await fetch(endpoint, { method: 'GET' });
    } catch (err) {
      console.error(\`Failed to ping \${endpoint}:\`, err);
    }
  }
}
