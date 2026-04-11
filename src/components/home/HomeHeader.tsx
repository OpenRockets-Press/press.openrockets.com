import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { HomeInfoModalKind } from "@/components/home/HomeInfoModal";
import { getSessionUser } from "@/lib/authStore";

interface HomeHeaderProps {
  search: string;
  onSearchChange: (next: string) => void;
  onOpenInfo: (kind: HomeInfoModalKind) => void;
}

export function HomeHeader({ search, onSearchChange, onOpenInfo }: HomeHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const session = getSessionUser();

  return (
    <header className="home-header" data-testid="home-header">
      <div className="home-shell">
        <div className="top-row">
          <Link to="/" className="brand-lockup" aria-label="Open Rockets Press home">
            <img className="brand-main" src="/brand/271742354.png" alt="Open Rockets" />
            <img className="brand-mark" src="/brand/9283527.png" alt="Open Rockets mark" />
            <span className="brand-text">PRESS</span>
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
              className="search-input"
              type="text"
              placeholder="Search publications, research, journals..."
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
              <Link to="/dashboard" className="nav-link nav-link-cta">
                Dashboard
              </Link>
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
