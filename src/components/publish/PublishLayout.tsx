import { useState, useRef, useEffect, useContext } from "react";
import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import { getSessionUser } from "@/lib/authStore";
import { queryKeys } from "@/lib/queryKeys";
import { clsx } from "clsx";
import { AdsInfoModal } from "@/components/ui/AdsInfoModal";
import { SidebarContext } from "@/routes/RootLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface PublishLayoutProps {
  children: ReactNode;
}

function AdSlot({ id, onOpenAdsInfo }: { id: string; onOpenAdsInfo: () => void }) {
  return (
    <div key={id} className="ad-shimmer-slot mobile-hide">
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
      
      const availableHeight = viewportHeight - containerTop - 24; 
      
      const slotHeight = containerRef.current.offsetWidth || 280;
      const gap = 16;
      
      if (availableHeight > 0) {
        let count = Math.floor(availableHeight / (slotHeight + gap));
        count = Math.max(0, Math.min(1, count)); 
        setAdCount(count);
      } else {
        setAdCount(0);
      }
    };
    
    setTimeout(calculateAds, 50);
    
    window.addEventListener('resize', calculateAds);
    return () => window.removeEventListener('resize', calculateAds);
  }, []);

  return (
    <div ref={containerRef} className="mobile-hide" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
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
  const { isSidebarOpen, setSidebarOpen } = useContext(SidebarContext);

  const { data: user } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => getCurrentUser(),
    initialData: () => getSessionUser() ?? undefined,
  });

  const getAvatarUrl = () => {
    if ((user as any)?.avatarUrl) return (user as any).avatarUrl;
    const seed = [user?.displayName, user?.email].filter(Boolean).join(' ') || 'User';
    return `https://api.dicebear.com/10.x/stripes/svg?seed=${encodeURIComponent(seed)}`;
  };

  return (
    <div className="home-page">
      <div className="mobile-drag-ribbon" onClick={() => setSidebarOpen(true)} aria-label="Open Sidebar" />
      {isSidebarOpen && <div className="mobile-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      
      <div className="home-shell amazon-layout" style={{ minHeight: "100vh" }}>
        <aside className={clsx("amazon-sidebar", isSidebarOpen && "mobile-sidebar-open")}>
          <div className="sidebar-section">
            <div className="sidebar-header">
              <div className="sidebar-header-left">
                <img src="/b00k_1c0n_x92a.png" alt="Book Icon" className="sidebar-book-icon" />
                <h3 className="notranslate">Menu</h3>
              </div>
              <button className="sidebar-close-btn" aria-label="Close" onClick={() => setSidebarOpen(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <button 
              className="mobile-only"
              style={{ width: '100%', padding: '10px', backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center' }}
              onClick={() => setSidebarOpen(false)}
            >
              Close Menu
            </button>
          
            <ul className="sidebar-category-list">
              <li>
                <Link to="/publish" style={{ textDecoration: 'none' }} onClick={() => setSidebarOpen(false)}>
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
                <Link to="/submissions" style={{ textDecoration: 'none' }} onClick={() => setSidebarOpen(false)}>
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
                <Link to="/profile" style={{ textDecoration: 'none' }} onClick={() => setSidebarOpen(false)}>
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
          </div>

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
