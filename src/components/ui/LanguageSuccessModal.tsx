import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useTranslationContext } from '@/lib/TranslationContext';

export function LanguageSuccessModal() {
  const { successMessage, setSuccessMessage } = useTranslationContext();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSuccessMessage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setSuccessMessage]);

  if (!successMessage) return null;

  return (
    <div className="ads-modal-overlay fade-in" onClick={() => setSuccessMessage(null)}>
      <div 
        className="ads-modal-container slide-down" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lang-modal-title"
      >
        <div className="ads-modal-header sidebar-header" style={{ margin: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
          <div className="sidebar-header-left">
            <img src="/brand/ad-info-icon.png" alt="Info" style={{ width: 22, height: 22, marginRight: 8 }} />
            <h3 id="lang-modal-title" className="notranslate">Language Updated</h3>
          </div>
          <button type="button" className="ads-modal-close-btn notranslate" onClick={() => setSuccessMessage(null)} aria-label="Close modal">
            <span>Close</span>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="ads-modal-body">
          <div className="ads-modal-content fade-in">
            <p style={{ fontSize: '1.1rem', fontWeight: 500, color: '#111', marginTop: '16px', marginBottom: '24px' }}>
              {successMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
