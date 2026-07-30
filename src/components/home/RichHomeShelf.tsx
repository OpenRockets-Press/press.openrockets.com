import { memo, useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { RichArticleCard, type RichArticleCardProps } from "@/components/home/RichArticleCard";
import { useTranslationContext } from "@/lib/TranslationContext";

interface RichHomeShelfProps {
  testId: string;
  title: React.ReactNode;
  items: RichArticleCardProps["article"][];
  hashtagLink?: string; // e.g. "/hashtag/Mathematics"
  emptyMessage?: React.ReactNode;
}

function RichHomeShelfComponent({ testId, title, items, hashtagLink, emptyMessage }: RichHomeShelfProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [loadState, setLoadState] = useState({ signature: "", loadedCount: 0, isExpanded: false });
  const sectionRef = useRef<HTMLElement>(null);
  const itemsSignature = useMemo(() => items.map(item => item?.id ?? item?.title ?? "").join("|"), [items]);
  
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


  // Once a shelf is close enough to view, keep loading cards one at a time
  // instead of waiting for the user to scroll to a bottom sentinel.
  useEffect(() => {
    if (!isVisible) return;

    const activeLoadedCount = loadState.signature === itemsSignature ? loadState.loadedCount : 0;
    const activeIsExpanded = loadState.signature === itemsSignature ? loadState.isExpanded : false;
    const maxDisplay = activeIsExpanded ? items.length : 10;
    if (activeLoadedCount >= maxDisplay || activeLoadedCount >= items.length) return;

    setIsContentLoading(true);
    const timer = setTimeout(() => {
      setLoadState(prev => {
        const loadedCount = prev.signature === itemsSignature ? prev.loadedCount : 0;
        const isExpanded = prev.signature === itemsSignature ? prev.isExpanded : false;
        const maxDisplay = isExpanded ? items.length : 10;

        return {
          signature: itemsSignature,
          loadedCount: Math.min(loadedCount + 1, maxDisplay, items.length),
          isExpanded,
        };
      });
      setIsContentLoading(false);
    }, activeLoadedCount === 0 ? 400 : 350);

    return () => {
      clearTimeout(timer);
      setIsContentLoading(false);
    };
  }, [isVisible, loadState, items.length, itemsSignature, setIsContentLoading]);

  const activeLoadedCount = loadState.signature === itemsSignature ? loadState.loadedCount : 0;
  const activeIsExpanded = loadState.signature === itemsSignature ? loadState.isExpanded : false;
  const maxDisplay = activeIsExpanded ? items.length : 10;
  // Display up to activeLoadedCount items (max maxDisplay)
  const displayItems = items.slice(0, activeLoadedCount);
  const hasMore = !activeIsExpanded && activeLoadedCount >= 10 && items.length > 10;
  const isLoadingMore = isVisible && activeLoadedCount > 0 && activeLoadedCount < maxDisplay && activeLoadedCount < items.length;

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
        {!isVisible || activeLoadedCount === 0 ? (
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
                        setLoadState(prev => ({
                          signature: itemsSignature,
                          loadedCount: prev.signature === itemsSignature ? prev.loadedCount : 0,
                          isExpanded: true,
                        }));
                        setIsContentLoading(true);
                        setTimeout(() => {
                          setLoadState(prev => ({
                            signature: itemsSignature,
                            loadedCount: Math.min((prev.signature === itemsSignature ? prev.loadedCount : 0) + 1, items.length),
                            isExpanded: true,
                          }));
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
      
    </section>
  );
}

export const RichHomeShelf = memo(RichHomeShelfComponent);
