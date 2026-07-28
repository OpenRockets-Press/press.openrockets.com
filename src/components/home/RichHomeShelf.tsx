import { memo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { RichArticleCard } from "@/components/home/RichArticleCard";
import { useTranslationContext } from "@/lib/TranslationContext";

interface RichHomeShelfProps {
  testId: string;
  title: React.ReactNode;
  items: any[];
  hashtagLink?: string; // e.g. "/hashtag/Mathematics"
  emptyMessage?: React.ReactNode;
}

function RichHomeShelfComponent({ testId, title, items, hashtagLink, emptyMessage }: RichHomeShelfProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const { setIsContentLoading } = useTranslationContext();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, { rootMargin: "300px" });

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Handle loading more items when the bottom intersects
  useEffect(() => {
    if (!isVisible) return;
    
    // Initial load one by one
    if (loadedCount === 0) {
      setIsContentLoading(true);
      const timer = setTimeout(() => {
        setLoadedCount(1);
        setIsContentLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }

    const maxDisplay = isExpanded ? items.length : 10;
    const loadMoreObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && loadedCount > 0 && loadedCount < maxDisplay && loadedCount < items.length) {
        setIsContentLoading(true);
        setTimeout(() => {
          setLoadedCount(prev => Math.min(prev + 1, maxDisplay, items.length));
          setIsContentLoading(false);
        }, 350);
      }
    }, { rootMargin: "100px" });

    if (loadMoreRef.current) loadMoreObserver.observe(loadMoreRef.current);
    return () => loadMoreObserver.disconnect();
  }, [isVisible, loadedCount, items.length, setIsContentLoading, isExpanded]);

  const maxDisplay = isExpanded ? items.length : 10;
  // Display up to loadedCount items (max maxDisplay)
  const displayItems = items.slice(0, loadedCount);
  const hasMore = !isExpanded && loadedCount >= 10 && items.length > 10;
  const isLoadingMore = isVisible && loadedCount > 0 && loadedCount < maxDisplay && loadedCount < items.length;

  return (
    <section ref={sectionRef} data-testid={testId} style={{ marginBottom: "2rem", minHeight: "240px" }}>
      <div className="shelf-head">
        <h2 className="notranslate">{title}</h2>
        {hashtagLink && (
          <Link to={hashtagLink} className="see-more-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            See more
          </Link>
        )}
      </div>
      <div className="shelf-grid">
        {!isVisible || loadedCount === 0 ? (
          // Shimmer loading state
          Array.from({ length: 5 }).map((_, i) => (
            <div key={`shimmer-${i}`} className="rich-article-card" style={{ height: "300px", background: "#f9f9f9", animation: "pulse 1.5s infinite" }} />
          ))
        ) : items.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', color: 'var(--text-muted, #888)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.5 }}>
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            <p style={{ margin: 0, textAlign: 'center' }}>{emptyMessage || "No articles found."}</p>
          </div>
        ) : (
          displayItems.map((originalItem, index) => {
            const isLastAndMorphing = hasMore && index === 9;
            const item = isLastAndMorphing ? displayItems[0] : originalItem;
            
            return (
              <div 
                key={`${item.id}-${index}`} 
                className={`rich-card-wrapper ${isLastAndMorphing ? 'morphing-wrapper' : ''}`}
                style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <RichArticleCard article={item} />
                
                {isLastAndMorphing && (
                  <div 
                    className="morphing-overlay"
                    onClick={() => {
                      if (hashtagLink) {
                        navigate({ to: hashtagLink });
                      } else {
                        setIsExpanded(true);
                        setIsContentLoading(true);
                        setTimeout(() => {
                          setLoadedCount(prev => Math.min(prev + 1, items.length));
                          setIsContentLoading(false);
                        }, 1000);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <button 
                      className="see-more-artifacts-btn"
                      style={{ pointerEvents: 'none' }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                      See more artifacts
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {isLoadingMore && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
          <svg className="google-spinner" viewBox="25 25 50 50">
            <circle cx="50" cy="50" r="20" />
          </svg>
        </div>
      )}
      
      {/* Invisible element to trigger load more */}
      {isVisible && loadedCount < maxDisplay && loadedCount < items.length && (
        <div ref={loadMoreRef} style={{ height: '20px', width: '100%' }} />
      )}
    </section>
  );
}

export const RichHomeShelf = memo(RichHomeShelfComponent);
