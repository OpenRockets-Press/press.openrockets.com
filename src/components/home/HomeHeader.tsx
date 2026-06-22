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
            <img className="brand-main" src="/brand/271742354.png" alt="Open Rockets" />
            <img className="brand-mark" src="/brand/9283527.png" alt="Open Rockets mark" />
            <img className="brand-mark" src="/brand/987935879357.png" alt="Open Rockets mark" />
          </Link>

          <div className="search-wrap">
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
            />
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
            <button type="button" className="nav-link" onClick={() => onOpenInfo("about")}>
              About
            </button>
            <Link to="/publish" className="nav-link">
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
          <button
            type="button"
            className="mobile-nav-link"
            onClick={() => { onOpenInfo("about"); setMenuOpen(false); }}
          >
            About
          </button>
          <Link to="/publish" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
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
