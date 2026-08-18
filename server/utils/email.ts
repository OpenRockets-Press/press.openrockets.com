import * as fs from 'fs';
import * as path from 'path';

// API Key provided by user
const RESEND_API_KEY = 're_M5Fnm48E_9pEL2U5NeR4sqZ3yvDYNHd9v';
const SENDER_EMAIL = 'press@mail.openrockets.com';


export async function sendReviewEmail(
  authorEmail: string,
  authorFirstName: string,
  title: string,
  publisherId: string,
  status: 'published' | 'rejected',
  shortId: string
) {
  let publisherName = "OpenRockets Press";
  let publisherLogo = "https://openrockets.com/v/openrockets-w.png";
  let publisherDomain = "openrockets.com";
  let learnMoreLink = "";
  
  try {
    const candidates = [
      path.join(process.cwd(), 'public/config/publishers.json'),
      path.join(process.cwd(), 'dist/config/publishers.json'),
    ];
    for (const pubPath of candidates) {
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
          learnMoreLink = pubInfo.learnMoreLink || "";
        }
        break;
      }
    }
  } catch (e) {
    console.error("Failed to load publishers.json for email", e);
  }

  const artifactLink = `https://${publisherDomain}/${shortId}`;
  
  const isAccepted = status === 'published';
  const subject = isAccepted 
    ? `ACCEPTED - Submission: ${title}`
    : `DECLINED - Submission: ${title}`;

  const moreInfoHtml = learnMoreLink 
    ? `<br><br>More info: <a href="${learnMoreLink}" style="color: #0066cc; text-decoration: underline;">${learnMoreLink}</a>`
    : '';

  const bodyContent = isAccepted
    ? `Your submission "<b>${title}</b>" that was submitted to <b>${publisherName}</b> has been accepted after review. We congratulate you for this accomplishment.<br><br>You can visit your submission by clicking on this link: <a href="${artifactLink}" style="color: #0066cc; text-decoration: underline;">${artifactLink}</a>.<br><br>We look forward to hearing from you if you have any questions or clarifications.${moreInfoHtml}`
    : `Your submission "<b>${title}</b>" that was submitted to <b>${publisherName}</b> has been declined. Unfortunately, we welcome you to make your artifact more aligned with the publisher by visiting the publisher's website: <a href="https://${publisherDomain}" style="color: #0066cc; text-decoration: underline;">${publisherDomain}</a>.<br><br>We wish you the best of luck.${moreInfoHtml}`;

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
        
        <div style="text-align: left; line-height: 1.6; font-size: 16px; margin-bottom: 40px;">
          <p style="color: #000000;">Hello ${authorFirstName},</p>
          <p style="color: #000000;">${bodyContent}</p>
        </div>
        
        <div style="text-align: left; border-top: 1px solid #000000; padding-top: 20px; font-size: 12px; line-height: 1.5; color: #000000;">
          <img src="https://openrockets.com/v/openrockets-w.png" alt="OpenRockets Logo" style="max-width: 60px; height: auto; margin-bottom: 10px;" />
          <p style="color: #000000; margin-bottom: 8px;">Security and Platform by OpenRockets Inc.</p>
          <p style="color: #000000; margin-bottom: 4px;">&copy; 2022-${new Date().getFullYear()} &amp; (TM) OpenRockets Incorporated. All rights reserved.</p>
          <p style="color: #000000; margin-bottom: 15px;">OpenRockets is an infrastructure service provider for nonprofits run by exceptional minors and teenagers worldwide.</p>
          
          <div style="display: flex; gap: 15px; align-items: center;">
            <a href="https://openrockets.com" style="color: #0066cc; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 6px;">
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/8e/Globe_icon_4.svg" style="width: 18px; height: 18px; object-fit: contain;" />
              OpenRockets.com
            </a>
            <a href="https://linkedin.com/company/openrocketsinc" style="color: #0066cc; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 6px;">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" style="width: 18px; height: 18px; object-fit: contain;" />
              LinkedIn
            </a>
            <a href="https://zeroprofit.org" style="color: #0066cc; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 6px;">
              <img src="https://substackcdn.com/image/fetch/$s_!YU9o!,w_170,c_limit,f_auto,q_auto:best,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcc66b391-ca1e-435a-bca3-c286b6c97085_314x314.png" style="width: 18px; height: 18px; object-fit: contain;" />
              Register your nonprofit
            </a>
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
