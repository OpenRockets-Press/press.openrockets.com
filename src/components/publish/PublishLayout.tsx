import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import { getSessionUser } from "@/lib/authStore";
import { queryKeys } from "@/lib/queryKeys";
import { clsx } from "clsx";
import { AdsInfoModal } from "@/components/ui/AdsInfoModal";

interface PublishLayoutProps {
  children: ReactNode;
}

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
    const calculateAds = () => {
      if (!containerRef.current) return;
      
      const viewportHeight = window.innerHeight;
      const containerTop = containerRef.current.getBoundingClientRect().top;
      
      // Calculate how much space is left in the viewport for the ads
      // Subtracting a little extra padding/margin at the bottom
      const availableHeight = viewportHeight - containerTop - 24; 
      
      // The ad slot height is equal to its width (aspect-ratio: 1/1)
      const slotHeight = containerRef.current.offsetWidth || 280;
      const gap = 16;
      
      if (availableHeight > 0) {
        let count = Math.floor(availableHeight / (slotHeight + gap));
        count = Math.max(0, Math.min(1, count)); // max 1 dynamic ad (so total max is 2)
        setAdCount(count);
      } else {
        setAdCount(0);
      }
    };
    
    // Initial calculation
    // Use a small timeout to ensure the DOM is fully rendered and containerTop is accurate
    setTimeout(calculateAds, 50);
    
    window.addEventListener('resize', calculateAds);
    return () => window.removeEventListener('resize', calculateAds);
  }, []);

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
      {Array.from({ length: adCount }).map((_, i) => (
        <AdSlot key={`dyn-ad-${i}`} id={`dyn-ad-${i}`} onOpenAdsInfo={onOpenAdsInfo} />
      ))}
    </div>
  );
}

export function PublishLayout({ children }: PublishLayoutProps) {
  const { location } = useRouterState();
  const currentPath = location.pathname;
  const [adsModalOpen, setAdsModalOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => getCurrentUser(),
    initialData: () => getSessionUser() ?? undefined,
  });

  const getAvatarUrl = () => {
    if ((user as any)?.avatarUrl) return (user as any).avatarUrl;
    if (user?.displayName) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=0D8A50&color=fff`;
    }
    return `https://ui-avatars.com/api/?name=User&background=0D8A50&color=fff`;
  };

  return (
    <div className="home-page">
      <div className="home-shell amazon-layout" style={{ minHeight: "100vh" }}>
        <aside className="amazon-sidebar">
          <ul className="sidebar-category-list">
            <li>
              <Link to="/publish" style={{ textDecoration: 'none' }}>
                <button 
                  type="button" 
                  className={clsx("sidebar-category-btn", currentPath === '/publish' && "active")}
                  style={currentPath === '/publish' ? { backgroundColor: '#faf8f0', borderRadius: '4px', padding: '6px 8px', width: '100%' } : { padding: '6px 8px', width: '100%' }}
                >
                  <div className="sidebar-category-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/pen_icon_3d.png" alt="Publish" style={{ width: '16px', height: '16px' }} />
                    <span>Publish</span>
                  </div>
                </button>
              </Link>
            </li>
            <li>
              <Link to="/submissions" style={{ textDecoration: 'none' }}>
                <button 
                  type="button" 
                  className={clsx("sidebar-category-btn", currentPath === '/submissions' && "active")}
                  style={currentPath === '/submissions' ? { backgroundColor: '#faf8f0', borderRadius: '4px', padding: '6px 8px', width: '100%' } : { padding: '6px 8px', width: '100%' }}
                >
                  <div className="sidebar-category-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/mag_icon_v2.png" alt="Submissions" style={{ width: '16px', height: '16px' }} />
                    <span>Submissions</span>
                  </div>
                </button>
              </Link>
            </li>
            <li>
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <button 
                  type="button" 
                  className={clsx("sidebar-category-btn", currentPath === '/profile' && "active")}
                  style={currentPath === '/profile' ? { backgroundColor: '#faf8f0', borderRadius: '4px', padding: '6px 8px', width: '100%' } : { padding: '6px 8px', width: '100%' }}
                >
                  <div className="sidebar-category-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={getAvatarUrl()} alt="Profile" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                    <span>Your Profile</span>
                  </div>
                </button>
              </Link>
            </li>
          </ul>

          <div className="ad-shimmers-container">
            <AdSlot id="hardcoded-ad" onOpenAdsInfo={() => setAdsModalOpen(true)} />
            <DynamicAdLoader onOpenAdsInfo={() => setAdsModalOpen(true)} />
          </div>
        </aside>

        <main className="amazon-main-content">
          {children}
        </main>
      </div>

      {adsModalOpen && <AdsInfoModal onClose={() => setAdsModalOpen(false)} />}
    </div>
  );
}
