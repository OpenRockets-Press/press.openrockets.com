import { useState, useEffect, useMemo } from "react";
import { clsx } from "clsx";

interface Hashtag {
  id: string;
  name: string;
  type: "main" | "general";
}

export function HashtagsScreen() {
  const [slideIn, setSlideIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allHashtags, setAllHashtags] = useState<Hashtag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Hashtag[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setSlideIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function loadHashtags() {
      try {
        const res = await fetch("/config/hashtags.json");
        if (res.ok) {
          const data = await res.json();
          setAllHashtags(data.hashtags || []);
          
          const stored = localStorage.getItem("publish_artifact_hashtags");
          if (stored) {
            try {
              setSelectedTags(JSON.parse(stored));
            } catch (e) {
              // ignore parse error
            }
          }
        }
      } catch (err) {
        console.error("Failed to load hashtags", err);
      }
    }
    loadHashtags();
  }, []);

  const filteredHashtags = useMemo(() => {
    if (!searchQuery.trim()) {
      // Default to 7 random tags if no search
      const shuffled = [...allHashtags].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 7);
    }
    const lower = searchQuery.toLowerCase();
    return allHashtags.filter(t => t.name.toLowerCase().includes(lower));
  }, [allHashtags, searchQuery]);

  const mainCount = selectedTags.filter(t => t.type === "main").length;
  const generalCount = selectedTags.filter(t => t.type === "general").length;

  const handleAddTag = (tag: Hashtag) => {
    if (selectedTags.find(t => t.id === tag.id)) return;
    if (tag.type === "main" && mainCount >= 5) return;
    if (tag.type === "general" && generalCount >= 10) return;
    
    const newTags = [...selectedTags, tag];
    setSelectedTags(newTags);
    localStorage.setItem("publish_artifact_hashtags", JSON.stringify(newTags));
  };

  const handleRemoveTag = (tagId: string) => {
    const newTags = selectedTags.filter(t => t.id !== tagId);
    setSelectedTags(newTags);
    localStorage.setItem("publish_artifact_hashtags", JSON.stringify(newTags));
  };

  const handleConfirm = () => {
    window.location.hash = "#editor";
  };

  return (
    <div 
      className="publish-step-container"
      style={{ 
        display: "flex", 
        flexDirection: "column",
        minHeight: "70vh",
        transform: slideIn ? 'translateX(0)' : 'translateX(20px)',
        opacity: slideIn ? 1 : 0,
        transition: 'all 0.4s ease-out',
        padding: '1rem 0', 
        width: "100%",
        alignItems: "flex-start" 
      }}
    >
      <h1 style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "2rem", marginBottom: "0.25rem", color: "#111", margin: 0 }}>
        Select hashtags
      </h1>
      
      <p style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "1rem", color: "#111", marginBottom: "1.5rem", marginTop: "0.5rem", display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
        Select up to <strong style={{ margin: "0 2px" }}>5</strong>
        <span className="rich-tag notranslate tag-main" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', margin: "0 4px", fontSize: "0.85rem", padding: "2px 6px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
          Main hashtags
        </span>
        and up to <strong style={{ margin: "0 2px" }}>10</strong>
        <span className="rich-tag notranslate tag-normal" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', margin: "0 4px", fontSize: "0.85rem", padding: "2px 6px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
          General hashtags
        </span>
      </p>

      {/* Selected Tags Box */}
      {selectedTags.length > 0 && (
        <div style={{
          width: "100%",
          padding: "16px",
          backgroundColor: "#faf8f0",
          border: "1px solid #000",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          animation: "fadeIn 0.3s ease-in-out"
        }}>
          {selectedTags.map(tag => (
            <span 
              key={tag.id}
              className={clsx("rich-tag notranslate", tag.type === "main" ? "tag-main" : "tag-normal")}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: "0.9rem" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
              {tag.name}
              <button 
                onClick={() => handleRemoveTag(tag.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 2px",
                  marginLeft: "4px",
                  fontWeight: "bold",
                  opacity: 0.7
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Exact Search Bar matching PublisherScreen */}
      <div style={{ width: "100%", position: "relative" }}>
        
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', position: 'relative', width: '100%', zIndex: 10, marginInline: 0 }}>
          <label htmlFor="hashtag-search" className="sr-only">
            Search hashtags
          </label>
          
          <div style={{ position: 'relative', flex: 1, display: 'flex', width: '100%', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <input
                id="hashtag-search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="search-input"
                type="text"
                placeholder="Search hashtags..."
                aria-label="Search hashtags"
                autoComplete="off"
                style={{ width: '100%' }}
              />
            </div>

            {/* The Dropdown containing the list of hashtags */}
            <div style={{ 
              width: "100%", 
              backgroundColor: "#fff", 
              border: "1px solid #000", 
              borderTop: "none", 
              borderRadius: "0 0 8px 8px", 
              display: "flex", 
              flexDirection: "column",
              marginTop: "4px",
              overflow: "hidden"
            }}>
              {filteredHashtags.map((tag) => {
                const isSelected = selectedTags.some(t => t.id === tag.id);
                const isMainFull = tag.type === "main" && mainCount >= 5;
                const isGenFull = tag.type === "general" && generalCount >= 10;
                const isDisabled = isSelected || (!isSelected && (isMainFull || isGenFull));

                return (
                  <div 
                    key={tag.id}
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      borderBottom: "1px solid #eee",
                      backgroundColor: isSelected ? "#f9f9f9" : "#fff"
                    }}
                  >
                    <span 
                      className={clsx("rich-tag notranslate", tag.type === "main" ? "tag-main" : "tag-normal")}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: "0.95rem" }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
                      {tag.name}
                    </span>

                    <button 
                      onClick={() => isSelected ? handleRemoveTag(tag.id) : handleAddTag(tag)}
                      disabled={!isSelected && isDisabled}
                      style={{
                        padding: "6px 16px",
                        backgroundColor: isSelected ? "#dc2626" : (isDisabled ? "#ccc" : "#000"),
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: "bold",
                        cursor: isDisabled && !isSelected ? "not-allowed" : "pointer",
                        fontFamily: "Ubuntu, sans-serif"
                      }}
                    >
                      {isSelected ? "Remove" : "Add"}
                    </button>
                  </div>
                );
              })}
              {filteredHashtags.length === 0 && (
                <div style={{ textAlign: "center", padding: "1rem", color: "#000", fontFamily: "Ubuntu, sans-serif", fontSize: "0.9rem" }}>
                  No hashtags found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", width: "100%" }}>
        <button 
          onClick={() => window.location.hash = "#next-stage"}
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
        <button 
          onClick={handleConfirm}
          disabled={!selectedTags.some(t => t.type === 'main') || !selectedTags.some(t => t.type === 'general')}
          style={{
            padding: "8px 24px",
            backgroundColor: (!selectedTags.some(t => t.type === 'main') || !selectedTags.some(t => t.type === 'general')) ? "#ccc" : "#000",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.95rem",
            fontWeight: "bold",
            cursor: (!selectedTags.some(t => t.type === 'main') || !selectedTags.some(t => t.type === 'general')) ? "not-allowed" : "pointer",
            fontFamily: "Ubuntu, sans-serif"
          }}
        >
          Continue
        </button>
      </div>

    </div>
  );
}
