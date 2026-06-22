import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import type { HomeInfoModalKind } from "@/components/home/HomeInfoModal";
import { getSessionUser } from "@/lib/authStore";

interface HomeHeaderProps {
  search: string;
  onSearchChange: (next: string) => void;
  onOpenInfo: (kind: HomeInfoModalKind) => void;
}

export function HomeHeader({ search, onSearchChange, onOpenInfo }: HomeHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCompactSearch, setIsCompactSearch] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isPlaceholderFading, setIsPlaceholderFading] = useState(false);
  const [dynamicPlaceholders, setDynamicPlaceholders] = useState<string[]>([
    "Search student research and journals...",
  ]);
  const session = getSessionUser();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPlaceholders() {
      try {
        const response = await fetch("/config/home-search-placeholders.json");
        if (!response.ok) return;

        const payload = (await response.json()) as { placeholders?: unknown };
        if (!isMounted || !Array.isArray(payload.placeholders)) return;

        const cleaned = payload.placeholders
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.trim())
          .filter(Boolean)
          .slice(0, 20);

        if (cleaned.length > 0) {
          setDynamicPlaceholders(cleaned);
          setPlaceholderIndex(0);
        }
      } catch {
        // Keep fallback placeholder list when JSON is unavailable.
      }
    }

    loadPlaceholders();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const applyMode = (matches: boolean) => {
      setIsCompactSearch(matches);
      setIsPlaceholderFading(false);
    };

    applyMode(mediaQuery.matches);

    const handleMediaChange = (event: MediaQueryListEvent) => {
      applyMode(event.matches);
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  useEffect(() => {
    if (isCompactSearch) return;
    if (dynamicPlaceholders.length < 2) return;

    const cycleTimer = window.setInterval(() => {
      setIsPlaceholderFading(true);

      window.setTimeout(() => {
        setPlaceholderIndex((previous) => (previous + 1) % dynamicPlaceholders.length);
        setIsPlaceholderFading(false);
      }, 450);
    }, 15_000);

    return () => {
      window.clearInterval(cycleTimer);
    };
  }, [dynamicPlaceholders, isCompactSearch]);

  const activePlaceholder = useMemo(() => {
    if (isCompactSearch) {
      return "Search journals, research papers, and more...";
    }

    return dynamicPlaceholders[placeholderIndex] ?? "Search student research and journals...";
  }, [dynamicPlaceholders, placeholderIndex, isCompactSearch]);

  return (
    <header className="home-header" data-testid="home-header">
      <div className="home-shell">
        <div className="top-row">
          <Link to="/" className="brand-lockup" aria-label="Open Rockets Press home">
            <img className="brand-main" style={{ visibility: "hidden", display: "none" }} src="/brand/271742354.png" alt="Open Rockets" />
            <img className="brand-mark" src="/brand/9283527.png" alt="Open Rockets mark" />
            <img className="brand-mark" style={{ width: "6rem" }} src="/brand/987935879357.png" alt="Open Rockets mark" />
          </Link>

          <div className="search-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="home-search" className="sr-only">
              Search publications
            </label>
            <input
              id="home-search"
              data-testid="home-search-input"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className={`search-input${isPlaceholderFading && !isCompactSearch ? " placeholder-fade" : ""}`}
              type="text"
              placeholder={activePlaceholder}
              aria-label="Search publications"
              style={{ flex: 1 }}
            />
            <button 
              type="button" 
              className="search-btn" 
              aria-label="Submit search"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--panel)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                cursor: 'pointer'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          <button
            type="button"
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((value) => !value)}
          >
            Menu
          </button>

          <nav className="desktop-nav" aria-label="Primary">
            <a href="https://press.openrockets.com/docs/get-started" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              Get started
            </a>
            <Link to="/publish" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
              Publish
            </Link>
            {session ? (
              <div className="profile-menu-container" ref={profileRef}>
                <button 
                  type="button" 
                  className="profile-avatar-btn" 
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(session.displayName || 'User')}&background=0D8A50&color=fff`} 
                    alt="Profile" 
                    className="profile-avatar-img" 
                  />
                </button>
                
                {profileOpen && (
                  <div className="profile-dropdown slide-down">
                    <div className="profile-dropdown-header">
                      <strong>{session.displayName || 'User'}</strong>
                    </div>
                    <div className="profile-dropdown-links">
                      <Link to="/dashboard" className="dropdown-item">Dashboard</Link>
                      <Link to="/dashboard" className="dropdown-item">Your Profile</Link>
                      <Link to="/dashboard" className="dropdown-item">Your Artifacts</Link>
                      <button type="button" onClick={() => onOpenInfo("about")} className="dropdown-item text-left">About</button>
                      <a href="mailto:support@openrockets.com" className="dropdown-item">Helpful Links</a>
                      <hr className="dropdown-divider" />
                      <a href="/api/auth/logout" className="dropdown-item sign-out">Sign Out</a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav-link nav-link-cta">
                Sign In
              </Link>
            )}
          </nav>
        </div>

        <nav id="mobile-nav" className={menuOpen ? "mobile-nav open" : "mobile-nav"} aria-label="Mobile">
          <a
            href="https://press.openrockets.com/docs/get-started"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Get started
          </a>
          <Link to="/publish" className="mobile-nav-link" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
            Publish
          </Link>
          {session ? (
            <Link to="/dashboard" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
