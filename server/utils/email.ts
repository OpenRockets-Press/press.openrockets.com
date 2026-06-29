import * as fs from 'fs';
import * as path from 'path';

// API Key provided by user
const RESEND_API_KEY = 're_eSe2b8bP_GnwHcJPKR3gVM41fEGtnx1mb';
const SENDER_EMAIL = 'press@mail.openrockets.com';


export async function sendReviewEmail(
  authorEmail: string,
  authorFirstName: string,
  title: string,
  publisherId: string,
  status: 'published' | 'rejected',
  pubId: string
) {
  let publisherName = "OpenRockets Press";
  let publisherLogo = "https://openrockets.com/v/openrockets-w.png";
  let publisherDomain = "openrockets.com";
  
  try {
    const pubPath = path.join(process.cwd(), 'public/config/publishers.json');
    if (fs.existsSync(pubPath)) {
      const pubData = JSON.parse(fs.readFileSync(pubPath, 'utf8'));
      const pubInfo = pubData.publishers.find((p: any) => p.id === publisherId);
      if (pubInfo) {
        publisherName = pubInfo.name;
        // Fix relative URLs if any
        publisherLogo = pubInfo.logoUrl.startsWith('/') 
          ? `https://press.openrockets.com${pubInfo.logoUrl}` 
          : pubInfo.logoUrl;
        publisherDomain = pubInfo.domain;
      }
    }
  } catch (e) {
    console.error("Failed to load publishers.json for email", e);
  }

  const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const artifactLink = `https://${publisherDomain}/artifacts/${generatedSlug}-${pubId}`;
  
  const isAccepted = status === 'published';
  const subject = isAccepted 
    ? `ACCEPTED - Submission: ${title}`
    : `DECLINED - Submission: ${title}`;

  const bodyContent = isAccepted
    ? `Your submission "<b>${title}</b>" that was submitted to <b>${publisherName}</b> has been accepted after a review. We congratulate you for this accomplishment.<br><br>You can visit your submission by clicking on this link: <a href="${artifactLink}" style="color: #000; text-decoration: underline;">${artifactLink}</a>.<br><br>We look forward to hearing from you if you have any questions or clarifications.`
    : `Your submission "<b>${title}</b>" that was submitted to <b>${publisherName}</b> has been declined. Unfortunately, we welcome you to make your artifact more aligned with the publisher by visiting the publisher's website: <a href="https://${publisherDomain}" style="color: #000; text-decoration: underline;">${publisherDomain}</a>.<br><br>We wish you the best of luck.`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff; color: #000000;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="text-align: left; margin-bottom: 30px;">
          <img src="${publisherLogo}" alt="${publisherName} Logo" style="max-width: 160px; height: auto;" />
          <h1 style="font-size: 24px; color: #000000; margin-top: 10px; font-weight: bold;">${publisherName}</h1>
        </div>
        
        <div style="text-align: justify; line-height: 1.6; font-size: 16px; margin-bottom: 40px;">
          <p style="color: #000000;">Hello ${authorFirstName},</p>
          <p style="color: #000000;">${bodyContent}</p>
        </div>
        
        <div style="text-align: left; border-top: 1px solid #000000; padding-top: 20px; font-size: 12px; line-height: 1.5; color: #000000;">
          <p style="color: #000000; margin-bottom: 8px;">Security and Platform by Open Rockets Inc.</p>
          <img src="https://openrockets.com/v/openrockets-w.png" alt="Open Rockets Logo" style="max-width: 60px; height: auto; margin-bottom: 10px;" />
          <p style="color: #000000; margin-bottom: 4px;">&copy; and &trade; Open Rockets Incorporated 2022-2026. All rights reserved.</p>
          <p style="color: #000000; margin-bottom: 15px;">Open Rockets is an infrastructure service provider for nonprofits run by exceptional minors and teenagers worldwide.</p>
          
          <div style="display: flex; gap: 15px;">
            <a href="https://openrockets.com" style="color: #000000; text-decoration: none; font-weight: bold; margin-right: 15px;">&#127968; OpenRockets.com</a>
            <a href="https://linkedin.com/company/openrocketsinc" style="color: #000000; text-decoration: none; font-weight: bold; margin-right: 15px;">&#128188; LinkedIn</a>
            <a href="https://zeroprofit.org" style="color: #000000; text-decoration: none; font-weight: bold;">&#128640; Register a non-profit</a>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: authorEmail,
        subject: subject,
        html: html
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Resend review email dispatched:", data);
  } catch (error) {
    console.error("Failed to send review email via Resend:", error);
  }
}
