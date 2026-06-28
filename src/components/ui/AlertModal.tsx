import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  showSupportLink?: boolean;
}

export function AlertModal({ isOpen, onClose, title, message, showSupportLink }: AlertModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    
    // Prevent background scrolling
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="ads-modal-overlay fade-in" onClick={onClose} style={{ zIndex: 999999 }}>
      <div 
        className="ads-modal-container slide-down" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-modal-title"
      >
        <div className="ads-modal-header sidebar-header" style={{ margin: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
          <div className="sidebar-header-left">
            <img src="/brand/ad-info-icon.png" alt="Info" style={{ width: 22, height: 22, marginRight: 8 }} />
            <h3 id="alert-modal-title">{title}</h3>
          </div>
          <button type="button" className="ads-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <span>Close</span>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="ads-modal-body">
          <div className="ads-modal-content fade-in">
            <p style={{ margin: 0, fontSize: "1rem", lineHeight: "1.5" }}>
              {message}
            </p>
            {showSupportLink && (
              <a 
                href="https://about.openrockets.com/press/supported-media-file-types" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="ads-modal-link"
                style={{ display: "block", marginTop: "12px" }}
              >
                Supported Media File Types
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}