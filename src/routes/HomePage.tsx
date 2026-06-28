import { useState, useContext, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { HomeBanner } from "@/components/home/HomeBanner";
import { MagazineArticles } from "@/components/home/MagazineArticles";
import { RichHomeShelf } from "@/components/home/RichHomeShelf";
import { AdsInfoModal } from "@/components/ui/AdsInfoModal";
import { getHomeFeed } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { SearchContext } from "@/routes/RootLayout";
import { CATEGORIES } from "@/lib/categories";
import { generateMockArticles, CATEGORY_HASHTAGS } from "@/lib/mockArticles";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faDesktop, faFlask, faDna, faUsers, faPalette, faMicrochip, faChevronRight, faChevronDown, faTimes } from "@fortawesome/free-solid-svg-icons";

function AdSlot({ id, onOpenAdsInfo }: { id: string; onOpenAdsInfo: () => void }) {
  return (
    <div key={id} className="ad-shimmer-slot">
      <div className="ad-attribution">
        <a href="https://ads.openrockets.com" target="_blank" rel="noopener noreferrer" className="ad-attribution-logo-link">
          <img src="https://ads.openrockets.com/assets/images/logo-45px.png" alt="OpenRockets Ads" className="ad-attribution-logo" />
        </a>
        <div className="ad-attribution-text-group">
          <a href="https://ads.openrockets.com" target="_blank" rel="noopener noreferrer" className="ad-attribution-text">OpenRockets Ads</a>
          <button 
            type="button" 
            className="ad-attribution-why" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenAdsInfo();
            }}
          >
            Why?
          </button>
        </div>
      </div>
    </div>
  );
}

const ICON_MAP: Record<string, any> = {
  star: faStar,
  desktop: faDesktop,
  flask: faFlask,
  dna: faDna,
  users: faUsers,
  palette: faPalette,
  microchip: faMicrochip
};

function DynamicAdLoader({ onOpenAdsInfo }: { onOpenAdsInfo: () => void }) {
  const [adCount, setAdCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mainEl = document.querySelector('.amazon-main-content');
    if (!mainEl || !containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      const mainHeight = entries[0].contentRect.height;
      const containerTop = containerRef.current!.getBoundingClientRect().top;
      const mainTop = mainEl.getBoundingClientRect().top;
      const relativeTop = containerTop - mainTop;
      
      const availableHeight = mainHeight - relativeTop;
      
      // The ad slot height is equal to its width (aspect-ratio: 1/1)
      const slotHeight = containerRef.current!.offsetWidth || 280;
      const gap = 16;
      
      if (availableHeight > 0) {
        // Mathematically determine exact number of slots that fit
        const count = Math.floor(availableHeight / (slotHeight + gap));
        setAdCount(Math.max(1, count));
      }
    });
    
    observer.observe(mainEl);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
      {Array.from({ length: adCount }).map((_, i) => (
        <AdSlot key={`dyn-ad-${i}`} id={`dyn-ad-${i}`} onOpenAdsInfo={onOpenAdsInfo} />
      ))}
    </div>
  );
}

export function HomePage() {
  const { search, setSearch, selectedHashtags, setSelectedHashtags } = useContext(SearchContext);
  const [activeType, setActiveType] = useState<string>("all");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [adsModalOpen, setAdsModalOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data } = useQuery({
    queryKey: queryKeys.home.feed({ q: debouncedSearch, type: activeType as any }),
    queryFn: () => getHomeFeed({ q: debouncedSearch, type: activeType as any }),
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });

  // Generate our 10-item lists
  const newReleases = useMemo(() => generateMockArticles(25), []);
  const featured = useMemo(() => generateMockArticles(25), []);

  return (
    <div className="home-page">
      <div className="home-shell amazon-layout">
        <aside className="amazon-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-header">
              <div className="sidebar-header-left">
                <img src="/b00k_1c0n_x92a.png" alt="Book Icon" className="sidebar-book-icon" />
                <h3>Published Books</h3>
              </div>
              <button className="sidebar-close-btn" aria-label="Close">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <ul className="sidebar-category-list">
              {CATEGORIES.map((category) => {
                const hasSub = category.subcategories && category.subcategories.length > 0;
                const isExpanded = expandedCats[category.value];
                return (
                  <li key={category.value}>
                    <button 
                      type="button"
                      className={clsx("sidebar-category-btn", activeType === category.value && "active")}
                      onClick={() => {
                        setActiveType(category.value);
                        if (hasSub) {
                          setExpandedCats(prev => ({ ...prev, [category.value]: !prev[category.value] }));
                        }
                      }}
                    >
                      <div className="sidebar-category-left">
                        {category.icon && (
                          <FontAwesomeIcon icon={ICON_MAP[category.icon]} className="sidebar-category-icon" />
                        )}
                        <span>{category.label}</span>
                      </div>
                      {hasSub && (
                        <FontAwesomeIcon 
                          icon={isExpanded ? faChevronDown : faChevronRight} 
                          className="sidebar-chevron" 
                        />
                      )}
                    </button>
                    {hasSub && isExpanded && (
                      <ul className="sidebar-subcategory-list fade-in">
                        {category.subcategories!.map(sub => (
                          <li key={sub}>
                            <button type="button" className="sidebar-subcategory-btn">
                              {sub}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div className="ad-shimmers-container">
            {Array.from({ length: 1 }).map((_, i) => (
              <AdSlot key={`top-${i}`} id={`top-${i}`} onOpenAdsInfo={() => setAdsModalOpen(true)} />
            ))}
            <MagazineArticles />
            <DynamicAdLoader onOpenAdsInfo={() => setAdsModalOpen(true)} />
          </div>
        </aside>

        <main className="amazon-main-content">
          <HomeBanner />

          <div className="hashtag-header-container">
            <Link to="/" className="hashtag-header-link">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="9" x2="20" y2="9"></line>
                <line x1="4" y1="15" x2="20" y2="15"></line>
                <line x1="10" y1="3" x2="8" y2="21"></line>
                <line x1="16" y1="3" x2="14" y2="21"></line>
              </svg>
              <span className="hashtag-header-text">All Sections</span>
            </Link>
            
            {(search.trim() || selectedHashtags.length > 0) && (
              <div style={{ padding: '16px', backgroundColor: 'var(--panel)', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                <strong style={{ fontSize: '14px', fontWeight: 'bold' }}>You searched for</strong>
                {search.trim() && <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '13px' }}>"{search}"</span>}
                {selectedHashtags.map(tag => (
                  <span key={tag} style={{ backgroundColor: '#333', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '13px' }}>{tag}</span>
                ))}
                
                <button
                  type="button"
                  style={{
                    marginLeft: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    padding: '4px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    fontWeight: 'bold'
                  }}
                  onClick={() => {
                    setSearch('');
                    setSelectedHashtags([]);
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          <RichHomeShelf
            testId="home-shelf-new-releases"
            title="New Releases"
            items={newReleases}
          />

          <hr className="section-divider" />

          <RichHomeShelf
            testId="home-shelf-featured"
            title="Featured Contributions"
            items={featured}
          />

          {CATEGORY_HASHTAGS.map((cat) => (
            <div key={cat}>
              <hr className="section-divider" />
              <RichHomeShelf
                testId={`home-shelf-${cat}`}
                title={<span className="notranslate">{cat}</span>}
                items={generateMockArticles(10, cat)}
                hashtagLink={`/hashtag/${encodeURIComponent(cat)}`}
              />
            </div>
          ))}

        </main>
      </div>
      {adsModalOpen && <AdsInfoModal onClose={() => setAdsModalOpen(false)} />}
    </div>
  );
}
