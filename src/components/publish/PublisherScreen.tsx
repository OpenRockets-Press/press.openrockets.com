import { useState, useEffect, useMemo } from "react";
import { clsx } from "clsx";

interface Publisher {
  id: string;
  name: string;
  domain: string;
  about: string;
  learnMoreLink: string;
  logoUrl: string;
  isInternal: boolean;
  categoryHashtags?: string[];
  normalHashtags?: string[];
}

function generateRandomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function PublisherScreen() {
  const [slideIn, setSlideIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [expandedPublisherId, setExpandedPublisherId] = useState<string | null>(null);
  const [dynamicId, setDynamicId] = useState("");

  useEffect(() => {
    setDynamicId(generateRandomId());
    const timer = setTimeout(() => setSlideIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function loadPublishers() {
      try {
        const res = await fetch("/config/publishers.json");
        if (res.ok) {
          const data = await res.json();
          setPublishers(data.publishers || []);
          
          const stored = localStorage.getItem("publish_artifact_publisher");
          if (!stored && data.publishers) {
            const defaultPub = data.publishers.find((p: Publisher) => p.id === "scienteen");
            if (defaultPub) {
              localStorage.setItem("publish_artifact_publisher", defaultPub.id);
              setExpandedPublisherId(defaultPub.id);
            }
          } else if (stored) {
             setExpandedPublisherId(stored);
          }
        }
      } catch (err) {
        console.error("Failed to load publishers", err);
      }
    }
    loadPublishers();
  }, []);

  const filteredPublishers = useMemo(() => {
    if (!searchQuery.trim()) return publishers;
    const lower = searchQuery.toLowerCase();
    const filtered = publishers.filter(p => 
      p.name.toLowerCase().includes(lower) || 
      p.domain.toLowerCase().includes(lower) ||
      p.about.toLowerCase().includes(lower)
    );
    if (filtered.length === 0) {
      const scienteen = publishers.find(p => p.id === "scienteen");
      if (scienteen) return [scienteen];
    }
    return filtered;
  }, [publishers, searchQuery]);

  const handlePublisherClick = (publisher: Publisher) => {
    localStorage.setItem("publish_artifact_publisher", publisher.id);
    setExpandedPublisherId(publisher.id);
  };

  const handleConfirm = () => {
    localStorage.setItem("publish_artifact_link_id", dynamicId);
    window.location.hash = "#next-stage";
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
        padding: '1rem 0', // No horizontal padding, hug left
        width: "100%",
        alignItems: "flex-start" // Force absolute left alignment
      }}
    >
      <h1 style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "2rem", marginBottom: "0.25rem", color: "#111", margin: 0 }}>
        Select a publisher
      </h1>
      
      <p style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "1rem", color: "#111", marginBottom: "1.5rem", marginTop: "0.25rem" }}>
        Choose a network that will host and review your artifact.
      </p>

      {/* Exact Search Bar matching HomeHeader */}
      <div style={{ width: "100%", position: "relative" }}>
        
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', position: 'relative', width: '100%', zIndex: 10 }}>
          <label htmlFor="publisher-search" className="sr-only">
            Search publications
          </label>
          
          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <input
                id="publisher-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="search-input"
                type="text"
                placeholder="Search for publishers..."
                aria-label="Search publications"
                autoComplete="off"
                style={{ width: '100%' }}
              />
            </div>

            {/* The Dropdown containing the list of publishers */}
            <div style={{ 
              width: "100%", 
              backgroundColor: "var(--panel, #fff)", 
              border: "1px solid var(--border, #ccc)", 
              borderTop: "none", 
              borderRadius: "0 0 8px 8px", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              display: "flex", 
              flexDirection: "column",
              marginTop: "4px",
              overflow: "hidden"
            }}>
              {filteredPublishers.map((pub) => {
                const isSelected = localStorage.getItem("publish_artifact_publisher") === pub.id;
                const isExpanded = expandedPublisherId === pub.id;
                
                const catTags = pub.categoryHashtags || [];
                const normTags = pub.normalHashtags || [];
                const maxDisplay = 3;
                const displayedCat = catTags.slice(0, maxDisplay);
                const displayedNorm = normTags.slice(0, Math.max(0, maxDisplay - displayedCat.length));
                const extraCount = (catTags.length + normTags.length) - (displayedCat.length + displayedNorm.length);
                
                return (
                  <div key={pub.id} style={{ display: "flex", flexDirection: "column" }}>
                    <div 
                      onClick={() => handlePublisherClick(pub)}
                      style={{ 
                        cursor: "pointer", 
                        display: "flex", 
                        alignItems: "center",
                        padding: "8px 12px", 
                        borderBottom: isExpanded ? "none" : "1px solid #eee",
                        backgroundColor: isSelected ? "rgba(199, 81, 31, 0.08)" : "transparent",
                        transition: "background-color 0.2s"
                      }}
                    >
                      <img 
                        src={pub.logoUrl} 
                        alt={pub.name} 
                        style={{ width: "32px", height: "32px", objectFit: "contain", borderRadius: "8px", marginRight: "12px" }} 
                      />
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.95rem", fontFamily: "Ubuntu, sans-serif", color: "#000", fontWeight: "bold", whiteSpace: "normal", wordBreak: "break-word" }}>
                          {pub.name}
                        </span>
                        
                        {/* Hashtags Preview on the right side */}
                        <div style={{ display: "flex", gap: "4px", marginLeft: "auto", overflow: "hidden", alignItems: "center" }}>
                          {displayedCat.map(t => (
                            <span 
                              key={t} 
                              className="rich-tag notranslate tag-main"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = `/hashtag/${encodeURIComponent(t)}`;
                              }}
                              style={{ padding: "2px 6px", fontSize: "10px", borderRadius: "4px", cursor: "pointer", whiteSpace: "nowrap" }}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
                              {t}
                            </span>
                          ))}
                          {displayedNorm.map(t => (
                            <span 
                              key={t} 
                              className="rich-tag notranslate tag-normal"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = `/hashtag/${encodeURIComponent(t)}`;
                              }}
                              style={{ padding: "2px 6px", fontSize: "10px", borderRadius: "4px", cursor: "pointer", whiteSpace: "nowrap" }}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
                              {t}
                            </span>
                          ))}
                          {extraCount > 0 && (
                            <span style={{ backgroundColor: "#eee", color: "#666", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold", whiteSpace: "nowrap" }}>+{extraCount}</span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#c7511f", fontWeight: "bold", fontSize: "0.85rem", marginLeft: "12px" }}>
                          <div style={{ width: "12px", height: "12px", borderRadius: "50%", border: "4px solid #c7511f", backgroundColor: "#fff" }} />
                          Selected
                        </div>
                      )}
                    </div>
                    
                    {/* Expanded Accordion Area */}
                    {isExpanded && (
                      <div className="fade-in" style={{ padding: "16px 24px 24px 24px", backgroundColor: isSelected ? "rgba(199, 81, 31, 0.04)" : "#fafafa", borderBottom: "1px solid #eee" }}>
                        
                        <div className="publisher-expanded-logo-wrapper" style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px", width: "100%" }}>
                          <img 
                            src={pub.logoUrl} 
                            alt={pub.name} 
                            style={{ width: "100%", height: "auto", objectFit: "contain" }} 
                          />
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px", justifyContent: "flex-start" }}>
                          {pub.categoryHashtags?.map(t => (
                            <span 
                              key={t} 
                              className="rich-tag notranslate tag-main"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = `/hashtag/${encodeURIComponent(t)}`;
                              }}
                              style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
                              {t}
                            </span>
                          ))}
                          {pub.normalHashtags?.map(t => (
                            <span 
                              key={t} 
                              className="rich-tag notranslate tag-normal"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = `/hashtag/${encodeURIComponent(t)}`;
                              }}
                              style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "4px", cursor: "pointer" }}
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
                              {t}
                            </span>
                          ))}
                        </div>
                        
                        <h4 style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "1.2rem", marginBottom: "1rem", color: "#111", marginTop: 0 }}>
                          {pub.name}
                        </h4>

                        <ul style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "15px", lineHeight: "1.6", color: "#111", margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <li><strong>{pub.name}</strong> will review your manuscript.</li>
                          
                          <li>If accepted, you will be able to access your artifact via this link: <br />
                            <a href={`https://${pub.domain}/${dynamicId}`} target="_blank" rel="noreferrer" style={{ color: "#c7511f", fontWeight: "bold", textDecoration: "underline" }}>
                              {pub.domain}/{dynamicId}
                            </a>
                          </li>

                          <li>The publisher will take anywhere around <strong>1 to 7 days</strong> to accept your article.</li>
                          
                          <ul>
                            <li>If you select <strong>Scienteen Library of Science&trade;</strong>, it is almost guaranteed that you will hear back within 1 to 7 days since we are processing it internally.</li>
                            <li>For external networks, timelines depend heavily on the third-party's internal peer-review cycles and may take anywhere from 2 to 12 weeks.</li>
                          </ul>
                          
                          <li>In extreme cases where the publisher is unable to accept this article within 7 days, your submission will be <strong>deleted</strong>, and you will no longer have access to it.</li>
                          
                          <li>If the publication is declined, your article, information, and submitted documents will be automatically deleted and we won't keep a copy of it.</li>
                          
                          <li>If you have any further concerns or questions, please email us at <a href="mailto:team@openrockets.com" style={{ color: "#c7511f" }}>team@openrockets.com</a>. Please don't forget to read the open documentation at <a href="https://about.openrockets.com" target="_blank" rel="noreferrer" style={{ color: "#c7511f" }}>about.openrockets.com</a>.</li>
                        </ul>
                        
                        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                          <button 
                            onClick={handleConfirm}
                            style={{
                              padding: "8px 24px",
                              backgroundColor: "#000",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "0.95rem",
                              fontWeight: "bold",
                              cursor: "pointer",
                              fontFamily: "Ubuntu, sans-serif"
                            }}
                          >
                            Select Publisher & Continue
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredPublishers.length === 0 && (
                <div style={{ textAlign: "center", padding: "1rem", color: "#000", fontFamily: "Ubuntu, sans-serif", fontSize: "0.9rem" }}>
                  No publishers found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '3rem' }}>
        <button 
          onClick={() => window.location.hash = "#license"}
          style={{
            padding: "8px 20px",
            backgroundColor: "transparent",
            color: "#000",
            border: "1px solid #000",
            borderRadius: "6px",
            fontSize: "0.95rem",
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "Ubuntu, sans-serif"
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
