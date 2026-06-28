import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { BASE_TYPES } from "./TypeSelectorScreen";
import { clsx } from "clsx";

interface LicenseDef {
  id: string;
  title: string;
  logo: string;
  isOpenRockets: boolean;
  renderBullets: (label: string) => React.ReactNode;
  learnMoreLink: string;
}

const LICENSES: LicenseDef[] = [
  {
    id: "beaver",
    title: "OpenRockets\u00AE Beaver",
    logo: "/brand/licences/beaver,png.png",
    isOpenRockets: true,
    learnMoreLink: "https://press.openrockets.com/licenses/beaver",
    renderBullets: (label) => (
      <>
        <li>Your {label} is protected explicitly for creators under the age of 18.</li>
        <li>Allows other minors to copy, share, and make derivative works, provided they cite the OpenRockets Press link.</li>
        <li>Semi-Open Source: Adults and the general public can view it, but cannot use it without permission.</li>
        <li>Adults must file a formal request at openrockets.com/licenses/request which OpenRockets Press will review on your behalf.</li>
        <li>Note: We are in the process of registering this as a formal license.</li>
      </>
    )
  },
  {
    id: "kangaroo",
    title: "OpenRockets\u00AE Kangaroo",
    logo: "/brand/licences/kangarooo.png",
    isOpenRockets: true,
    learnMoreLink: "https://press.openrockets.com/licenses/kangaroo",
    renderBullets: (label) => (
      <>
        <li>Provides full open source access for your {label}.</li>
        <li>Enables the general public to copy, use (commercial or non-commercial), make derivative works, and share.</li>
        <li>Strictly prohibits usage without citing the specific original author and referencing the OpenRockets Press resource link.</li>
      </>
    )
  },
  {
    id: "hummingbird",
    title: "OpenRockets\u00AE Hummingbird",
    logo: "/brand/licences/hummingbird.png",
    isOpenRockets: true,
    learnMoreLink: "https://press.openrockets.com/licenses/hummingbird",
    renderBullets: (label) => (
      <>
        <li>Suitable for both minors and adults publishing their {label}.</li>
        <li>Strictly prohibits derivative works by any party.</li>
        <li>Allows everyone to copy and use the property as long as they prominently display the resource link or the author's name.</li>
      </>
    )
  },
  {
    id: "cc",
    title: "Creative Commons\u00AE",
    logo: "/brand/licences/creativecommons_usethisforall.png",
    isOpenRockets: false,
    learnMoreLink: "https://creativecommons.org/licenses/by/4.0/",
    renderBullets: (label) => (
      <>
        <li>Standard, globally recognized license for protecting your {label}.</li>
        <li>Allows others to distribute, remix, adapt, and build upon your material in any medium or format.</li>
        <li>Requires attribution (credit) to be given to the creator.</li>
      </>
    )
  }
];

export function LicenseScreen() {
  const [slideIn, setSlideIn] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [expandedLicense, setExpandedLicense] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const artifactId = localStorage.getItem("publish_artifact_type") || "research";
  const artifactObj = BASE_TYPES.find(t => t.id === artifactId);
  const isSoftware = artifactObj?.coreCategory === "Software and Code";
  const artifactLabel = artifactObj?.label.toLowerCase() || "artifact";

  const sortedLicenses = useMemo(() => {
    if (isSoftware) return LICENSES;
    // If not software, OpenRockets licenses are unavailable. Move CC (isOpenRockets: false) to top.
    return [...LICENSES].sort((a, b) => {
      if (a.isOpenRockets === b.isOpenRockets) return 0;
      return a.isOpenRockets ? 1 : -1;
    });
  }, [isSoftware]);

  useEffect(() => {
    const saved = localStorage.getItem("publish_artifact_license");
    if (saved) {
      // Validate saved license against software constraints
      const savedLic = LICENSES.find(l => l.id === saved);
      if (savedLic && !isSoftware && savedLic.isOpenRockets) {
        // Saved license is invalid for this artifact type, override it
        setSelectedLicense("cc");
        localStorage.setItem("publish_artifact_license", "cc");
      } else {
        setSelectedLicense(saved);
      }
    } else {
      // Set Default selections
      const defaultLic = isSoftware ? "beaver" : "cc";
      setSelectedLicense(defaultLic);
      localStorage.setItem("publish_artifact_license", defaultLic);
    }

    const timer = setTimeout(() => {
      setSlideIn(true);
      if (!isSoftware) {
        setIsModalOpen(true);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [isSoftware]);

  const handleSelect = (id: string, disabled: boolean) => {
    if (disabled) return;
    setSelectedLicense(id);
    localStorage.setItem("publish_artifact_license", id);
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLicense(prev => prev === id ? null : id);
  };

  const handleNext = () => {
    if (selectedLicense) {
      window.location.hash = "#publisher";
    }
  };

  return (
    <div 
      style={{ 
        display: "flex", 
        flexDirection: "column",
        minHeight: "70vh",
        transform: slideIn ? 'translateX(0)' : 'translateX(20px)',
        opacity: slideIn ? 1 : 0,
        transition: 'all 0.4s ease-out',
        padding: '1rem'
      }}
    >
      <h1 style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "2rem", marginBottom: "0.5rem", color: "#111" }}>
        Protect your intellectual property with strong licenses from OpenRockets&reg; and Creative Commons&reg;.
      </h1>
      <p style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "1rem", color: "#555", marginBottom: "2rem" }}>
        Select one license from these licenses
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {sortedLicenses.map((lic) => {
          const isDisabled = !isSoftware && lic.isOpenRockets;
          const isExpanded = expandedLicense === lic.id;
          const isSelected = selectedLicense === lic.id;
          
          return (
            <div 
              key={lic.id}
              className={clsx("license-card", isSelected && "selected", isDisabled && "disabled")}
              onClick={() => handleSelect(lic.id, isDisabled)}
            >
              <div className="license-card-left">
                <img src={lic.logo} alt={lic.title} />
                <h3>{lic.title}</h3>
                <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "8px", fontFamily: "Ubuntu, sans-serif", fontSize: "0.9rem", color: isSelected ? "#008a3c" : "#666" }}>
                  <div style={{ 
                    width: "16px", 
                    height: "16px", 
                    borderRadius: "50%", 
                    border: isSelected ? "5px solid #008a3c" : "2px solid #ccc",
                    backgroundColor: "#fff",
                    boxSizing: "border-box"
                  }} />
                  {isSelected ? <strong>Selected</strong> : <span>Select</span>}
                </div>
              </div>
              <div className="license-card-right">
                <div className="license-card-right-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <img src="/brand/ad-info-icon.png" alt="Info" style={{ width: "18px", height: "18px" }} />
                    About the License
                  </div>
                </div>
                
                {isDisabled && (
                  <div style={{ padding: "12px 24px", color: "#c7511f", fontFamily: "Ubuntu, sans-serif", fontSize: "0.9rem", fontWeight: "bold" }}>
                    This license is not available for non-code artifacts.
                  </div>
                )}
                
                {!isExpanded && (
                  <div 
                    onClick={(e) => toggleExpand(lic.id, e)}
                    style={{
                      padding: "12px 24px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#c7511f",
                      fontFamily: "Ubuntu, sans-serif",
                      fontWeight: "bold",
                      fontSize: "0.95rem"
                    }}
                  >
                    Click to expand
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                )}

                <div className={clsx("license-expandable-content", isExpanded && "expanded")}>
                  <div className="license-expandable-inner">
                    <div className="license-card-right-body">
                      <ul>
                        {lic.renderBullets(artifactLabel)}
                      </ul>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                        <a href={lic.learnMoreLink} className="license-card-link" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                          Learn More
                        </a>
                        <div 
                          onClick={(e) => toggleExpand(lic.id, e)}
                          style={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "#c7511f",
                            fontFamily: "Ubuntu, sans-serif",
                            fontWeight: "bold",
                            fontSize: "0.95rem"
                          }}
                        >
                          Hide details
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(180deg)" }}>
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem' }}>
        <button 
          onClick={() => window.location.hash = "#type-selector"}
          style={{
            padding: "10px 24px",
            backgroundColor: "transparent",
            color: "#000",
            border: "1px solid #000",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Back
        </button>
        <button 
          onClick={handleNext}
          disabled={!selectedLicense}
          style={{
            padding: "10px 32px",
            backgroundColor: selectedLicense ? "#000" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: selectedLicense ? "pointer" : "not-allowed",
            transition: "all 0.2s"
          }}
        >
          Next
        </button>
      </div>

      {isModalOpen && typeof document !== "undefined" && createPortal(
        <div className="ads-modal-overlay fade-in" onClick={() => setIsModalOpen(false)}>
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
                <h3 id="ads-modal-title">Information</h3>
              </div>
              <button type="button" className="ads-modal-close-btn" onClick={() => setIsModalOpen(false)} aria-label="Close modal">
                <span>Close</span>
                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="times" className="svg-inline--fa fa-times fa-w-11 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512" style={{ height: '1em' }}><path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg>
              </button>
            </div>

            <div className="ads-modal-body">
              <div className="ads-modal-content fade-in" style={{ padding: "24px" }}>
                <p style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "16px", lineHeight: "1.6", color: "#333", margin: 0 }}>
                  Since you have selected {artifactObj?.label || "this type"}, and OpenRockets semi-open source licenses are only available for software and code, you will need to choose from Creative Commons licenses.
                </p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
