import { useEffect, useMemo, useState, useRef, useContext } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { HomeInfoModalKind } from "@/components/home/HomeInfoModal";
import { getSessionUser } from "@/lib/authStore";
import { LanguagePicker } from "@/components/home/LanguagePicker";
import { SearchContext, SidebarContext } from "@/routes/RootLayout";
import { CATEGORY_HASHTAGS, NORMAL_HASHTAGS } from "@/lib/mockArticles";

interface HomeHeaderProps {
  onOpenInfo: (kind: HomeInfoModalKind) => void;
}

export function HomeHeader({ onOpenInfo }: HomeHeaderProps) {
  if (typeof window !== "undefined" && window.location.href.toLowerCase().includes("/template")) return null;

  const { search, setSearch, selectedCategory, setSelectedCategory, selectedHashtags, setSelectedHashtags } = useContext(SearchContext);
  const { isSidebarOpen, setSidebarOpen } = useContext(SidebarContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCompactSearch, setIsCompactSearch] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isPlaceholderFading, setIsPlaceholderFading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);
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
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPlaceholders() {
      try {
        const response = await fetch("/config/hashtags.json");
        if (!response.ok) return;

        const payload = (await response.json()) as { hashtags?: { name: string }[] };
        if (!isMounted || !Array.isArray(payload.hashtags)) return;

        const allTags = payload.hashtags.map(t => t.name).filter(Boolean);
        if (allTags.length < 2) return;

        // Generate 20 random placeholder combinations
        const generated: string[] = [];
        for (let i = 0; i < 20; i++) {
          const shuffled = [...allTags].sort(() => 0.5 - Math.random());
          generated.push(`Search ${shuffled[0]}, ${shuffled[1]} and more...`);
        }

        if (generated.length > 0) {
          setDynamicPlaceholders(generated);
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

  const autofillSuggestion = useMemo(() => {
    if (!search.trim()) return "";
    const lowerSearch = search.toLowerCase();
    const allTags = [...CATEGORY_HASHTAGS, ...NORMAL_HASHTAGS];
    const match = allTags.find(tag => tag.toLowerCase().startsWith(lowerSearch));
    if (match && match.toLowerCase() !== lowerSearch) {
      return match.substring(search.length);
    }
    return "";
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && autofillSuggestion) {
      e.preventDefault();
      setSearch(search + autofillSuggestion);
    } else if (e.key === "Enter") {
      e.preventDefault();
      executeSearch();
    }
  };

  const executeSearch = () => {
    setIsSearchFocused(false);
    if (selectedCategory) {
      navigate({ to: `/hashtag/${encodeURIComponent(selectedCategory)}` });
    } else {
      navigate({ to: `/` });
    }
  };

  return (
    <header className="home-header" data-testid="home-header">
      <div className="home-shell">
        <div className="top-row">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {(pathname === '/' || pathname.startsWith('/hashtag/')) && (
              <button 
                className="mobile-hamburger-btn"
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                aria-label="Toggle Menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            )}
            <Link to="/" className="brand-lockup" aria-label="Open Rockets Press home">
              <img className="brand-main" style={{ visibility: "hidden", display: "none" }} src="/brand/271742354.png" alt="Open Rockets" />
              <img className="brand-mark" src="/brand/9283527.png" alt="Open Rockets mark" />
              <img className="brand-mark" style={{ width: "6rem" }} src="/brand/987935879357.png" alt="Open Rockets mark" />
            </Link>
          </div>

          <div className="search-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }} ref={searchWrapRef}>
            <label htmlFor="home-search" className="sr-only">
              Search publications
            </label>
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <input
                id="home-search"
                data-testid="home-search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleKeyDown}
                className={`search-input${isPlaceholderFading && !isCompactSearch ? " placeholder-fade" : ""}`}
                type="text"
                placeholder={activePlaceholder}
                aria-label="Search publications"
                style={{ width: '100%', paddingRight: (selectedCategory || selectedHashtags.length) ? '160px' : '16px' }}
                autoComplete="off"
              />
              
              {autofillSuggestion && isSearchFocused && (
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'transparent', whiteSpace: 'pre', overflow: 'hidden' }}>
                  {search}<span style={{ color: 'var(--text-muted, #777)' }}>{autofillSuggestion}</span>
                </div>
              )}

              <div style={{ position: 'absolute', right: '12px', display: 'flex', gap: '4px', pointerEvents: 'none' }}>
                {selectedCategory && (
                  <span className="search-badge orange-badge" style={{ backgroundColor: '#C7511F', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                    {selectedCategory}
                  </span>
                )}
                {selectedHashtags.length > 0 && (
                  <span className="search-badge dark-badge" style={{ backgroundColor: '#333', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                    {selectedHashtags.length > 1 ? `${selectedHashtags[0]} +${selectedHashtags.length - 1}` : selectedHashtags[0]}
                  </span>
                )}
              </div>
            </div>

            <button 
              type="button" 
              className="search-btn" 
              aria-label="Submit search"
              onClick={executeSearch}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px',
                borderRadius: '50%', backgroundColor: 'var(--panel)', border: '1px solid var(--border)',
                color: 'var(--text)', cursor: 'pointer', flexShrink: 0
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {isSearchFocused && (
              <div className="search-popover fade-in" style={{
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', 
                backgroundColor: 'var(--panel)', border: '1px solid var(--border)', 
                borderRadius: '8px', padding: '16px', zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text)' }}>
                  For the best results, use filters.
                </div>
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {CATEGORY_HASHTAGS.map(cat => (
                      <button type="button" key={cat}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        style={{
                          padding: '4px 10px', borderRadius: '16px', fontSize: '12px', border: '1px solid #C7511F',
                          backgroundColor: selectedCategory === cat ? '#C7511F' : 'transparent',
                          color: selectedCategory === cat ? '#fff' : '#C7511F', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {NORMAL_HASHTAGS.map(tag => {
                      const isSelected = selectedHashtags.includes(tag);
                      return (
                        <button type="button" key={tag}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedHashtags(prev => prev.filter(t => t !== tag));
                            } else if (selectedHashtags.length < 5) {
                              setSelectedHashtags(prev => [...prev, tag]);
                            }
                          }}
                          style={{
                            padding: '4px 10px', borderRadius: '16px', fontSize: '12px', border: isSelected ? '1px solid #fff' : '1px solid #666',
                            backgroundColor: isSelected ? '#000' : 'transparent',
                            color: isSelected ? '#fff' : 'var(--text)', cursor: 'pointer',
                            opacity: (!isSelected && selectedHashtags.length >= 5) ? 0.4 : 1, transition: 'all 0.2s'
                          }}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Menu
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </button>

          <nav className="desktop-nav" aria-label="Primary" style={{ alignItems: 'center' }}>
            <LanguagePicker />
            <a href="https://about.openrockets.com/docs/press/get-started" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              Get started
            </a>
            <Link preload={false} to="/publish" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
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
                    src={session.avatarUrl || `https://api.dicebear.com/10.x/stripes/svg?seed=${encodeURIComponent([session.displayName, session.email].filter(Boolean).join(' ') || 'User')}`} 
                    alt="Profile" 
                    className="profile-avatar-img" 
                  />
                </button>
                
                {profileOpen && (
                  <div className="profile-dropdown slide-down">
                    <div className="profile-dropdown-header sidebar-header" style={{ margin: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                      <div className="sidebar-header-left">
                        <img src="/pen_icon_9x1.png" alt="Pen Icon" className="sidebar-book-icon" />
                        <h3 className="notranslate">{session.displayName || 'User'}</h3>
                      </div>
                    </div>
                    <div className="profile-dropdown-links" style={{ padding: '0.5rem 0' }}>
                      <Link preload={false} to="/publish" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                        Publish
                      </Link>
                      <Link to="/profile" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Your Profile
                      </Link>
                      <Link to="/submissions" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                        Submissions
                      </Link>
                      <a href="https://about.openrockets.com/press/introduction" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        About
                      </a>
                      <a href="https://about.openrockets.com/docs/press/get-started" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                        Publishing Guidelines
                      </a>
                      <a 
                        href="/" 
                        onClick={(e) => {
                          e.preventDefault();
                          window.localStorage.removeItem("orp.session.token");
                          window.localStorage.removeItem("orp.session.v1");
                          window.location.href = "/";
                        }}
                        className="dropdown-item" 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Sign Out
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link preload={false} to="/login" className="nav-link nav-link-cta">
                Sign In
              </Link>
            )}
          </nav>
        </div>

        <nav id="mobile-nav" className={menuOpen ? "mobile-nav open" : "mobile-nav"} aria-label="Mobile">
          <a
            href="https://about.openrockets.com/docs/press/get-started"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Get started
          </a>
          <Link preload={false} to="/publish" className="mobile-nav-link" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
            Publish
          </Link>
          {session ? (
            <Link to="/dashboard" search={{ token: undefined }} className="mobile-nav-link" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
              Dashboard
            </Link>
          ) : (
            <Link preload={false} to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#000' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
