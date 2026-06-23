import { Link } from "@tanstack/react-router";
import type { HomeInfoModalKind } from "@/components/home/HomeInfoModal";

interface HomeFooterProps {
  onOpenInfo: (kind: HomeInfoModalKind) => void;
}

export function HomeFooter({ onOpenInfo }: HomeFooterProps) {
  return (
    <footer className="home-footer" data-testid="home-footer" style={{ borderTop: '1px solid #ffffff', paddingTop: '40px', paddingBottom: '40px', backgroundColor: '#000000', color: '#ffffff' }}>
      <div className="home-shell footer-content" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', marginBottom: '10px' }}>
          <img src="/brand/DARKMODEFAVICON.png?v=999" alt="OpenRockets Mode Logo" style={{ width: '7rem', maxWidth: '100%' }} />
          <hr style={{ width: '100%', border: 'none', borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '20px' }} />
        </div>
        <div className="footer-top-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
          
          <div className="footer-col" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <img src="/brand/271742354.png" alt="OpenRockets Logo" width="220" style={{ marginBottom: '15px', display: 'block', filter: 'invert(1) brightness(100)' }} />
            <p style={{ color: '#ffffff', fontSize: '14px', lineHeight: '1.6', textAlign: 'left' }}>
              An infrastructure service provider for nonprofits run by exceptional minors and teenagers worldwide.
            </p>
            <p style={{ color: '#ffffff', fontSize: '14px', lineHeight: '1.6', marginTop: '10px', textAlign: 'left' }}>
              Revitalize youth volunteering. Make a difference. Join the network of elites.
            </p>
          </div>

          <div className="footer-col" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', color: '#ffffff' }}>Legal & Press</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
              <Link to="/legal/terms" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', textAlign: 'left' }}>Terms of Service</Link>
              <Link to="/legal/privacy-policy" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', textAlign: 'left' }}>Privacy Policy</Link>
              <button type="button" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }} onClick={() => onOpenInfo("about")}>About OpenRockets Press</button>
            </div>
          </div>

          <div className="footer-col" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', color: '#ffffff' }}>Social</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <a href="https://discord.gg/djXh8udpbn" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                Discord
              </a>
              <a href="https://linkedin.com/company/openrocketsinc" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.924 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
              <a href="https://x.com/openrockets" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Twitter / X
              </a>
              <a href="https://blog.openrockets.com" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18H3V3zm15 15V6H6v12h12zm-2-9H8v2h8V9zm0 4H8v2h8v-2z"/></svg>
                Blog
              </a>
              <a href="https://www.crunchbase.com/organization/openrockets" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 0H2.4A2.4 2.4 0 000 2.4v19.2A2.4 2.4 0 002.4 24h19.2a2.4 2.4 0 002.4-2.4V2.4A2.4 2.4 0 0021.6 0zM17.65 16.53c-1.25 1.4-3.08 2.22-5.4 2.22-3.8 0-6.85-2.86-6.85-6.8 0-3.9 3.1-6.72 6.88-6.72 2.37 0 4.14.88 5.4 2.25l-2.12 2.2c-.85-.85-1.85-1.28-3.26-1.28-2.02 0-3.6 1.58-3.6 3.55s1.58 3.55 3.6 3.55c1.45 0 2.4-.48 3.24-1.32l2.1 2.35zm1.5-6.85v4.5h-1.5v-4.5h1.5z"/></svg>
                Crunchbase
              </a>
            </div>
          </div>

          <div className="footer-col" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', color: '#ffffff' }}>Ping us anytime</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'flex-start', textAlign: 'left' }}>
              <div>
                <strong style={{ fontSize: '12px', color: '#ffffff', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Email</strong>
                <a href="mailto:team@openrockets.com" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px' }}>team@openrockets.com</a>
              </div>
              <div>
                <strong style={{ fontSize: '12px', color: '#ffffff', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Mailing Address</strong>
                <span style={{ color: '#ffffff', fontSize: '14px', lineHeight: '1.5', display: 'block' }}>
                  Melville Lane<br />
                  Fairfax, Virginia<br />
                  United States
                </span>
              </div>
            </div>
          </div>

        </div>

        <div className="footer-bottom-row" style={{ borderTop: '1px solid #ffffff', paddingTop: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '15px' }}>
          <span style={{ color: '#ffffff', fontSize: '13px', textAlign: 'left' }}>
            OpenRockets is a 100% teen-run United States C-Corporation.<br />
            © & (TM) 2022-2026 OpenRockets Incorporated. All Rights Reserved.
          </span>
          <a href="#" id="open_preferences_center" style={{ color: '#ffffff', fontSize: '13px', textDecoration: 'none' }}>Update cookies preferences</a>
        </div>
      </div>
    </footer>
  );
}
