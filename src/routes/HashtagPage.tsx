import { getHomeFeed } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { useState, useContext, useMemo, useRef, useEffect } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { AdsInfoModal } from "@/components/ui/AdsInfoModal";
import { MagazineArticles } from "@/components/home/MagazineArticles";
import { RichHomeShelf } from "@/components/home/RichHomeShelf";
import { SearchContext } from "@/routes/RootLayout";
import { CATEGORIES } from "@/lib/categories";
import { generateMockArticles, CATEGORY_HASHTAGS, ArtifactType } from "@/lib/mockArticles";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faDesktop, faFlask, faDna, faUsers, faPalette, faMicrochip, faChevronRight, faChevronDown, faTimes, faFileAlt, faCode, faCube, faImage } from "@fortawesome/free-solid-svg-icons";

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

const ICON_MAP: Record<string, any> = {
  star: faStar,
  desktop: faDesktop,
  flask: faFlask,
  dna: faDna,
  users: faUsers,
  palette: faPalette,
  microchip: faMicrochip
};

export function HashtagPage() {
  const { hashtagId } = useParams({ strict: false }) as { hashtagId: string };
  const decodedHashtag = decodeURIComponent(hashtagId);
  const [activeType, setActiveType] = useState<string>("all");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [adsModalOpen, setAdsModalOpen] = useState(false);

  // Is this a primary category?
  const isPrimaryCategory = CATEGORY_HASHTAGS.includes(decodedHashtag);
  const { search, setSearch, selectedHashtags, setSelectedHashtags } = useContext(SearchContext);

  // Generate mock data specific to this hashtag
  const { data } = useQuery({ queryKey: queryKeys.home.feed({ q: decodedHashtag }), queryFn: () => getHomeFeed({ q: decodedHashtag }), staleTime: 60_000 });
  const rawFeed = data?.data || [];
  const rawNewReleases = useMemo(() => [...rawFeed].sort((a,b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()), [rawFeed]);
  const rawFeatured = useMemo(() => [...rawFeed].sort((a,b) => (b.viewCount || 0) - (a.viewCount || 0)), [rawFeed]);
  
  // Create intersection shelves (Hashtag X and Hashtag Y)
  const rawIntersectionShelves = useMemo(() => {
    const cats = CATEGORY_HASHTAGS.filter(cat => cat.toLowerCase() !== decodedHashtag.toLowerCase()).slice(0, 3);
    return cats.map(cat => {
      const articles = rawFeed.filter(art => {
         let parsed = [];
         try { parsed = typeof art.tags === 'string' ? JSON.parse(art.tags) : (Array.isArray(art.tags) ? art.tags : []); } catch(e){}
         const tagNames = parsed.map(t => typeof t === 'string' ? t.toLowerCase() : (t.name || String(t)).toLowerCase());
         return tagNames.includes(cat.toLowerCase());
      });
      return { cat, articles };
    });
  }, [decodedHashtag, rawFeed]);

  // Create further exploration shelves at the bottom
  const rawExplorationShelves = useMemo(() => {
    const cats = CATEGORY_HASHTAGS.filter(cat => cat.toLowerCase() !== decodedHashtag.toLowerCase()).slice(3, 5);
    return cats.map(cat => {
      const articles = rawFeed.filter(art => {
         let parsed = [];
         try { parsed = typeof art.tags === 'string' ? JSON.parse(art.tags) : (Array.isArray(art.tags) ? art.tags : []); } catch(e){}
         const tagNames = parsed.map(t => typeof t === 'string' ? t.toLowerCase() : (t.name || String(t)).toLowerCase());
         return tagNames.includes(cat.toLowerCase());
      });
      return { cat, articles };
    });
  }, [decodedHashtag, rawFeed]);

  const filterArticles = (articles: any[]) => {
    return articles.filter(article => {
      if (search.trim()) {
        const query = search.toLowerCase();
        if (!article.title?.toLowerCase().includes(query) && !article.description?.toLowerCase().includes(query) && !article.abstract?.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (selectedHashtags.length > 0) {
        let parsedTags = [];
        try { parsedTags = typeof article.tags === 'string' ? JSON.parse(article.tags) : (Array.isArray(article.tags) ? article.tags : []); } catch(e) {}
        const articleTagNames = parsedTags.map((t: any) => typeof t === 'string' ? t.toLowerCase() : (t.name || String(t)).toLowerCase());
        const hasAllTags = selectedHashtags.every(tag => articleTagNames.includes(tag.toLowerCase()));
        if (!hasAllTags) {
          return false;
        }
      }
      return true;
    });
  };

  const newReleases = useMemo(() => filterArticles(rawNewReleases), [rawNewReleases, search, selectedHashtags]);
  const featured = useMemo(() => filterArticles(rawFeatured), [rawFeatured, search, selectedHashtags]);

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
          <div className="hashtag-header-container" id="search-results-section">
            <Link 
              to={`/hashtag/${encodeURIComponent(decodedHashtag)}`} 
              className="hashtag-header-link"
              style={{ backgroundColor: isPrimaryCategory ? '#C7511F' : '#111' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="9" x2="20" y2="9"></line>
                <line x1="4" y1="15" x2="20" y2="15"></line>
                <line x1="10" y1="3" x2="8" y2="21"></line>
                <line x1="16" y1="3" x2="14" y2="21"></line>
              </svg>
              <span className="hashtag-header-text notranslate">{decodedHashtag}</span>
            </Link>
            
            {(search.trim() || selectedHashtags.length > 0) && (
              <div className="search-summary-card">
                <div className="search-summary-main">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                  <strong className="search-summary-title">Results for</strong>
                  {search.trim() && <span className="search-summary-chip">"{search}"</span>}
                  {selectedHashtags.map(tag => (
                    <span key={tag} className="search-summary-chip">{tag}</span>
                  ))}
                </div>
                <button
                  type="button"
                  className="search-summary-clear"
                  onClick={() => {
                    setSearch('');
                    setSelectedHashtags([]);
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Clear
                </button>
              </div>
            )}
          </div>

          <RichHomeShelf
            testId="hashtag-shelf-new-releases"
            title={<span>New Releases in <span style={{ color: 'var(--brand)' }}>#{decodedHashtag}</span></span>}
            items={newReleases}
            emptyMessage={`No new releases found in #${decodedHashtag}.`}
          />

          <hr className="section-divider" />

          <RichHomeShelf
            testId="hashtag-shelf-featured"
            title={<span>Featured Contributions in <span style={{ color: 'var(--brand)' }}>#{decodedHashtag}</span></span>}
            items={featured}
            emptyMessage={`No featured contributions found in #${decodedHashtag}.`}
          />

          {rawIntersectionShelves.map(({ cat, articles }) => {
             const filtered = filterArticles(articles);
             
             if (filtered.length === 0) return null;

             const papers = filtered.filter(a => a.type === ArtifactType.ResearchPaper);
             const software = filtered.filter(a => a.type === ArtifactType.Software);
             const artifacts3D = filtered.filter(a => a.type === ArtifactType.Artifact3D);
             const scienteens = filtered.filter(a => a.type === ArtifactType.Scienteen);

             return (
               <div key={`intersect-${cat}`}>
                 <hr className="section-divider" />
                 <h2 className="notranslate" style={{ fontSize: '1.25rem', marginBottom: '1.5rem', paddingLeft: '20px' }}>
                   {decodedHashtag} and {cat}
                 </h2>
                 
                 {papers.length > 0 && (
                   <div style={{ marginBottom: '2rem', paddingLeft: '20px' }}>
                     <RichHomeShelf
                       testId={`hashtag-shelf-intersect-${cat}-papers`}
                       title={<span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><FontAwesomeIcon icon={faFileAlt} style={{color: '#888'}}/> Research</span>}
                       items={papers}
                       hashtagLink={`/hashtag/${encodeURIComponent(cat)}?type=ResearchPaper`}
                     />
                   </div>
                 )}
                 
                 {software.length > 0 && (
                   <div style={{ marginBottom: '2rem', paddingLeft: '20px' }}>
                     <RichHomeShelf
                       testId={`hashtag-shelf-intersect-${cat}-software`}
                       title={<span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><img src="/brand/software_icon.png" alt="Software and Code" style={{ width: '18px', height: '18px', objectFit: 'contain' }}/> Software and Code</span>}
                       items={software}
                       hashtagLink={`/hashtag/${encodeURIComponent(cat)}?type=Software`}
                     />
                   </div>
                 )}

                 {artifacts3D.length > 0 && (
                   <div style={{ marginBottom: '2rem', paddingLeft: '20px' }}>
                     <RichHomeShelf
                       testId={`hashtag-shelf-intersect-${cat}-3d`}
                       title={<span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><img src="/brand/3d artifcat.png.png" alt="3D Artifacts" style={{ width: '18px', height: '18px', objectFit: 'contain' }}/> 3D Artifacts</span>}
                       items={artifacts3D}
                       hashtagLink={`/hashtag/${encodeURIComponent(cat)}?type=Artifact3D`}
                     />
                   </div>
                 )}

                 {scienteens.length > 0 && (
                   <div style={{ padding: '0 20px', marginBottom: '20px' }}>
                     <RichHomeShelf 
                       testId={`hashtag-shelf-intersect-${cat}-scienteens`}
                       title={<span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><img src="/brand/imagifact.png" alt="Scienteen Library of Science" style={{ width: '18px', height: '18px', objectFit: 'contain' }}/> Scienteen Library of Science</span>}
                       items={scienteens}
                       hashtagLink={`/hashtag/${encodeURIComponent(cat)}?type=Scienteen`}
                     />
                   </div>
                 )}
               </div>
             );
          })}

          {rawExplorationShelves.map(({ cat, articles }) => {
             const filtered = filterArticles(articles);
             
             if (filtered.length === 0) return null;

             const papers = filtered.filter(a => a.type === ArtifactType.ResearchPaper);
             const software = filtered.filter(a => a.type === ArtifactType.Software);
             const artifacts3D = filtered.filter(a => a.type === ArtifactType.Artifact3D);
             const scienteens = filtered.filter(a => a.type === ArtifactType.Scienteen);

             return (
               <div key={`explore-${cat}`}>
                 <hr className="section-divider" />
                 <h2 className="notranslate" style={{ fontSize: '1.25rem', marginBottom: '1.5rem', paddingLeft: '20px' }}>
                   Interested in {cat}?
                 </h2>
                 
                 {papers.length > 0 && (
                   <div style={{ marginBottom: '2rem', paddingLeft: '20px' }}>
                     <RichHomeShelf
                       testId={`hashtag-shelf-explore-${cat}-papers`}
                       title={<span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><FontAwesomeIcon icon={faFileAlt} style={{color: '#888'}}/> Research</span>}
                       items={papers}
                       hashtagLink={`/hashtag/${encodeURIComponent(cat)}?type=ResearchPaper`}
                     />
                   </div>
                 )}
                 
                 {software.length > 0 && (
                   <div style={{ marginBottom: '2rem', paddingLeft: '20px' }}>
                     <RichHomeShelf
                       testId={`hashtag-shelf-explore-${cat}-software`}
                       title={<span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><img src="/brand/software_icon.png" alt="Software and Code" style={{ width: '18px', height: '18px', objectFit: 'contain' }}/> Software and Code</span>}
                       items={software}
                       hashtagLink={`/hashtag/${encodeURIComponent(cat)}?type=Software`}
                     />
                   </div>
                 )}

                 {artifacts3D.length > 0 && (
                   <div style={{ marginBottom: '2rem', paddingLeft: '20px' }}>
                     <RichHomeShelf
                       testId={`hashtag-shelf-explore-${cat}-3d`}
                       title={<span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><img src="/brand/3d artifcat.png.png" alt="3D Artifacts" style={{ width: '18px', height: '18px', objectFit: 'contain' }}/> 3D Artifacts</span>}
                       items={artifacts3D}
                       hashtagLink={`/hashtag/${encodeURIComponent(cat)}?type=Artifact3D`}
                     />
                   </div>
                 )}

                 {scienteens.length > 0 && (
                   <div style={{ padding: '0 20px', marginBottom: '20px' }}>
                     <RichHomeShelf 
                       testId={`hashtag-shelf-explore-${cat}-scienteens`}
                       title={<span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><img src="/brand/imagifact.png" alt="Scienteen Library of Science" style={{ width: '18px', height: '18px', objectFit: 'contain' }}/> Scienteen Library of Science</span>}
                       items={scienteens}
                       hashtagLink={`/hashtag/${encodeURIComponent(cat)}?type=Scienteen`}
                     />
                   </div>
                 )}
               </div>
             );
          })}

        </main>
      </div>
      {adsModalOpen && <AdsInfoModal onClose={() => setAdsModalOpen(false)} />}
    </div>
  );
}
