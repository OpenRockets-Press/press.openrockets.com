import type { HomeInfoModalKind } from "@/components/home/HomeInfoModal";

interface HomeFooterProps {
  onOpenInfo: (kind: HomeInfoModalKind) => void;
}

export function HomeFooter({ onOpenInfo }: HomeFooterProps) {
  return (
    <footer className="home-footer" data-testid="home-footer">
      <div className="home-shell footer-content">
        <p>© 2026 Open Rockets Foundation. Empowering youth-led contributions globally.</p>
        <p className="footer-sub">A legally recognized nonprofit ecosystem protecting minors' intellectual property.</p>
        <div className="footer-links">
          <button type="button" className="footer-link" onClick={() => onOpenInfo("privacy")}>Privacy</button>
          <button type="button" className="footer-link" onClick={() => onOpenInfo("parental")}>Parental Consent</button>
        </div>
      </div>
    </footer>
  );
}
