import { Link } from "@tanstack/react-router";
import type { HomeInfoModalKind } from "@/components/home/HomeInfoModal";

interface HomeFooterProps {
  onOpenInfo: (kind: HomeInfoModalKind) => void;
}

export function HomeFooter({ onOpenInfo }: HomeFooterProps) {
  return (
    <footer className="home-footer" data-testid="home-footer">
      <div className="home-shell footer-content">
        <p>© 2024-2026 <a href="https://openrockets.com">OpenRockets Press</a> Foundation.</p>
        <p className="footer-sub">OpenRockets Press is a registered, fiscally sponsored 501(c)(3) nonprofit organization operating worldwide by minors and teenagers for the benefit of science.</p>
        <div className="footer-links">
          <Link to="/legal/terms" className="footer-link">Terms of Service</Link>
          <Link to="/legal/privacy-policy" className="footer-link">Privacy Policy</Link>
          <Link to="/legal/parental-consent-form" className="footer-link">Parental Consent</Link>
          <button type="button" className="footer-link" onClick={() => onOpenInfo("about")}>About</button>
        </div>
      </div>
    </footer>
  );
}
