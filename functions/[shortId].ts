/**
 * Cloudflare Pages Function: Catch-all for /<shortId> routes.
 *
 * When a request comes in for a 7-character alphanumeric path (e.g. /972f0d4),
 * this function proxies it through press.openrockets.com which performs
 * server-side OG meta tag injection. This ensures that link previews on
 * Discord, WhatsApp, Twitter, iMessage, etc. display the correct paper
 * title, description, and publisher image — even on publisher mirror
 * domains like scienteen.com that are served as static Cloudflare Pages.
 *
 * For all other routes, the request falls through to the static SPA.
 */

const ORIGIN = "https://press.openrockets.com";

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Match /<shortId> — exactly 7 alphanumeric characters
  const shortIdMatch = pathname.match(/^\/([a-zA-Z0-9]{7})$/);

  if (!shortIdMatch) {
    // Not a shortId route — pass through to static SPA
    return context.next();
  }

  const shortId = shortIdMatch[1];

  try {
    // Fetch the OG-injected HTML from the Node.js server
    const response = await fetch(`${ORIGIN}/${shortId}`, {
      headers: {
        "User-Agent": context.request.headers.get("User-Agent") || "CloudflarePages",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      // If the origin returns an error, fall through to the static SPA
      return context.next();
    }

    let html = await response.text();

    // Replace og:url to use the current domain (e.g. scienteen.com)
    // instead of press.openrockets.com, so social platforms show the
    // correct canonical URL
    const currentDomain = url.hostname;
    html = html.replace(
      /(<meta\s+property="og:url"\s+content=")https?:\/\/[^"]*(")/i,
      `$1https://${currentDomain}/${shortId}$2`
    );

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=600",
      },
    });
  } catch (err) {
    console.error("[CF Function] Failed to proxy shortId request:", err);
    // On error, fall through to the static SPA
    return context.next();
  }
};
