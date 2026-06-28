import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";

interface AdsInfoModalProps {
  onClose: () => void;
}

export function AdsInfoModal({ onClose }: AdsInfoModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Escape key listener for better UX
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className="ads-modal-overlay fade-in" onClick={onClose}>
      <div 
        className="ads-modal-container slide-down" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ads-modal-title"
      >
        <div className="ads-modal-header sidebar-header" style={{ margin: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
          <div className="sidebar-header-left">
            <img src="/brand/ad-info-icon.png" alt="Info" style={{ width: 22, height: 22, marginRight: 8 }} />
            <h3 id="ads-modal-title">Why?</h3>
          </div>
          <button type="button" className="ads-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <span>Close</span>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="ads-modal-body">
          {isLoading ? (
            <div className="ads-modal-shimmer">
              <div className="shimmer-line" style={{ width: '40%', height: '30px', marginBottom: '16px' }}></div>
              <div className="shimmer-line"></div>
              <div className="shimmer-line"></div>
              <div className="shimmer-line" style={{ width: '80%' }}></div>
              <div className="shimmer-line" style={{ width: '60%', marginTop: '16px' }}></div>
            </div>
          ) : (
            <div className="ads-modal-content fade-in">
              <img 
                src="/brand/ad-modal-logo.png" 
                alt="OpenRockets Ads Logo" 
                className="ads-modal-logo" 
              />
              <p>
                OpenRockets ads is an advertisement network for nonprofits and communities started by people under the age of 20. 
                We provide them the ability to post ads for 100% free with a rigorous moderation process, abuse protection, 
                and analytics for the best visibility.
              </p>
              <p>
                You are seeing this ad because you are using a product or service developed by OpenRockets Inc.
              </p>
              <a href="https://zeroprofit.org/ads" target="_blank" rel="noopener noreferrer" className="ads-modal-link">
                Learn more at zeroprofit.org/ads
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
