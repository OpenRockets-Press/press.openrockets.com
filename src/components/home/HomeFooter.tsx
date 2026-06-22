import { Link } from "@tanstack/react-router";
import type { HomeInfoModalKind } from "@/components/home/HomeInfoModal";

interface HomeFooterProps {
  onOpenInfo: (kind: HomeInfoModalKind) => void;
}

export function HomeFooter({ onOpenInfo }: HomeFooterProps) {
  return (
    <footer className="home-footer" data-testid="home-footer" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '40px', paddingBottom: '40px', backgroundColor: '#000', color: '#fff' }}>
      <div className="home-shell footer-content" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="footer-top-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
          
          <div className="footer-col">
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>OpenRockets Inc.</h3>
            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.6' }}>
              An infrastructure service provider for nonprofits run by exceptional minors and teenagers worldwide.
            </p>
            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.6', marginTop: '10px' }}>
              Revitalize youth volunteering. Make a difference. Join the network of elites.
            </p>
          </div>

          <div className="footer-col">
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', color: '#888' }}>Legal & Press</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/legal/terms" style={{ color: '#ddd', textDecoration: 'none', fontSize: '14px' }}>Terms of Service</Link>
              <Link to="/legal/privacy-policy" style={{ color: '#ddd', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</Link>
              <Link to="/legal/parental-consent-form" style={{ color: '#ddd', textDecoration: 'none', fontSize: '14px' }}>Parental Consent</Link>
              <button type="button" style={{ color: '#ddd', textDecoration: 'none', fontSize: '14px', background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }} onClick={() => onOpenInfo("about")}>About OpenRockets Press</button>
            </div>
          </div>

          <div className="footer-col">
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', color: '#888' }}>Social</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="https://discord.gg/djXh8udpbn" style={{ color: '#ddd', textDecoration: 'none', fontSize: '14px' }}>Discord</a>
              <a href="https://linkedin.com/company/openrocketsinc" style={{ color: '#ddd', textDecoration: 'none', fontSize: '14px' }}>LinkedIn</a>
              <a href="https://x.com/openrockets" style={{ color: '#ddd', textDecoration: 'none', fontSize: '14px' }}>Twitter / X</a>
              <a href="https://blog.openrockets.com" style={{ color: '#ddd', textDecoration: 'none', fontSize: '14px' }}>Blog</a>
            </div>
          </div>

          <div className="footer-col">
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', color: '#888' }}>Contact (24/7)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="mailto:support@openrockets.com" style={{ color: '#ddd', textDecoration: 'none', fontSize: '14px' }}>support@openrockets.com</a>
              <span style={{ color: '#ddd', fontSize: '14px' }}>+1 (603) 777-2159</span>
              <span style={{ color: '#aaa', fontSize: '13px', marginTop: '10px', lineHeight: '1.5' }}>
                266 Elmwood Ave, Ste 420<br />
                Buffalo, NY 14222, USA
              </span>
            </div>
          </div>

        </div>

        <div className="footer-bottom-row" style={{ borderTop: '1px solid #333', paddingTop: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '15px' }}>
          <span style={{ color: '#666', fontSize: '13px' }}>
            OpenRockets is a 100% teen-run United States C-Corporation.<br />
            © & (TM) 2022-2026 OpenRockets Incorporated. All Rights Reserved.
          </span>
          <a href="https://openrockets.com" style={{ color: '#666', fontSize: '13px', textDecoration: 'none' }}>Update cookie preferences</a>
        </div>
      </div>
    </footer>
  );
}
