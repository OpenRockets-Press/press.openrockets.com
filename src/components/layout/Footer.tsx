import { Link } from '@tanstack/react-router';
import { ORPressLogo, LicenseEagle, LicenseBeaver, LicenseFox, LicenseFinch } from '@/components/icons';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink text-cream border-t border-ink-light pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <ORPressLogo size={32} className="text-cream group-hover:text-gold transition-colors" />
              <span className="t-card-title text-cream">Open Rockets Press</span>
            </Link>
            <p className="t-body-sm text-cream/80 leading-relaxed max-w-xs">
              A modern publishing platform for open hardware, digital artifacts, and software. We empower creators to share their work with the world under robust open licenses.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-4 pt-2">
              <a href="#" aria-label="X (Twitter)" className="text-cream/60 hover:text-gold transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" aria-label="Bluesky" className="t-label text-cream/60 hover:text-gold transition-colors">
                BSKY
              </a>
              <a href="#" aria-label="Mastodon" className="t-label text-cream/60 hover:text-gold transition-colors">
                MASTODON
              </a>
            </div>
          </div>

          {/* Column 2: Browse */}
          <div>
            <h3 className="t-eyebrow text-gold mb-6">Browse</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="t-body-sm text-cream/80 hover:text-gold transition-colors">
                  Physical Artifacts
                </Link>
              </li>
              <li>
                <Link to="/" className="t-body-sm text-cream/80 hover:text-gold transition-colors">
                  3D Models
                </Link>
              </li>
              <li>
                <Link to="/" className="t-body-sm text-cream/80 hover:text-gold transition-colors">
                  Code & Digital
                </Link>
              </li>
              <li>
                <Link to="/" className="t-body-sm text-cream/80 hover:text-gold transition-colors">
                  Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Licenses */}
          <div>
            <h3 className="t-eyebrow text-gold mb-6">Licenses</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="flex items-center gap-2 t-body-sm text-cream/80 hover:text-gold transition-colors group">
                  <LicenseEagle size={16} className="text-cream/60 group-hover:text-gold" />
                  Eagle (Public Domain)
                </Link>
              </li>
              <li>
                <Link to="/" className="flex items-center gap-2 t-body-sm text-cream/80 hover:text-gold transition-colors group">
                  <LicenseBeaver size={16} className="text-cream/60 group-hover:text-gold" />
                  Beaver (Attribution)
                </Link>
              </li>
              <li>
                <Link to="/" className="flex items-center gap-2 t-body-sm text-cream/80 hover:text-gold transition-colors group">
                  <LicenseFox size={16} className="text-cream/60 group-hover:text-gold" />
                  Fox (ShareAlike)
                </Link>
              </li>
              <li>
                <Link to="/" className="flex items-center gap-2 t-body-sm text-cream/80 hover:text-gold transition-colors group">
                  <LicenseFinch size={16} className="text-cream/60 group-hover:text-gold" />
                  Finch (Non-Commercial)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform */}
          <div>
            <h3 className="t-eyebrow text-gold mb-6">Platform</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="t-body-sm text-cream/80 hover:text-gold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/publish" className="t-body-sm text-cream/80 hover:text-gold transition-colors">
                  Publisher Portal
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className="t-body-sm text-cream/80 hover:text-gold transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy-policy" className="t-body-sm text-cream/80 hover:text-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section: Copyright */}
        <div className="border-t border-ink-light pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="t-body-sm text-cream/60">
            &copy; {currentYear} Open Rockets Press. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/legal/privacy-policy" className="t-body-sm text-cream/60 hover:text-gold transition-colors">
              Privacy
            </Link>
            <Link to="/legal/terms" className="t-body-sm text-cream/60 hover:text-gold transition-colors">
              Terms
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
