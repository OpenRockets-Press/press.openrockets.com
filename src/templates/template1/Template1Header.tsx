import { Link } from "@tanstack/react-router";
import type { HomeInfoModalKind } from "@/components/home/HomeInfoModal";
import { LanguagePicker } from "@/components/home/LanguagePicker";

interface Template1HeaderProps {
  onOpenInfo: (kind: HomeInfoModalKind) => void;
}

export function Template1Header({ onOpenInfo }: Template1HeaderProps) {
  return (
    <header className="home-header" data-testid="home-header">
      <div className="home-shell">
        <div className="top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          
          <a 
  draggable="false" 
  to="/" 
  className="brand-lockup" 
  aria-label="Scienteen Library of Science" 
  style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
  onClick={(e) => {
    e.preventDefault(); // Stops the React Router from handling the click
    window.location.href = "/"; // Forces a real browser reload to hit Cloudflare
  }}
>
  <img 
    className="brand-mark" 
    style={{ height: "3rem", width: "auto" }} 
    src="/brand/welcomepage2.png" 
    alt="Scienteen Library of Science" 
    loading="eager" 
  />
</a>

          <nav className="desktop-nav" aria-label="Primary" style={{ alignItems: 'center', marginLeft: 'auto' }}>
            <LanguagePicker />
          </nav>

        </div>
      </div>
    </header>
  );
}
