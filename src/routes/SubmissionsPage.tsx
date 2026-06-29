import { useState, useEffect } from "react";
import { PublishLayout } from "@/components/publish/PublishLayout";
import localforage from "localforage";
import { useNavigate } from "@tanstack/react-router";
import { clsx } from "clsx";

interface Hashtag {
  id: string;
  name: string;
  type: "main" | "general";
}

interface Submission {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  fileCount: number;
  publisherDomain: string;
  linkId?: string;
  hashtags?: Hashtag[];
  author: string;
  status: string;
  createdAt?: number;
}

export function SubmissionsPage() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSubmissions = async () => {
      setIsLoaded(false); // start loading overlay
      try {
        const data = await localforage.getItem<Submission[]>("openRockets_submissions");
        if (data && Array.isArray(data)) {
          // Sort chronologically (latest first)
          const sorted = data.sort((a, b) => {
            const timeA = a.createdAt || 0;
            const timeB = b.createdAt || 0;
            return timeB - timeA;
          });
          setSubmissions(sorted);
        }
      } catch (err) {
        console.error("Failed to load submissions", err);
      } finally {
        setTimeout(() => setIsLoaded(true), 600); // small delay for the spinner visual
      }
    };
    loadSubmissions();
  }, []);

  const handleDelete = async (id: string) => {
    const updated = submissions.filter(sub => sub.id !== id);
    setSubmissions(updated);
    await localforage.setItem("openRockets_submissions", updated);
  };

  return (
    <PublishLayout>
      <div 
        className="publish-step-container"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "70vh",
          padding: "1rem 0",
          width: "100%",
          alignItems: "flex-start",
        }}
      >
        <h1 style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "2rem", marginBottom: "2rem", color: "#111", margin: "0 0 1.5rem 0" }}>
          Your Submissions
        </h1>

        {!isLoaded ? (
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            padding: "4rem",
            backgroundColor: "#fff",
            borderRadius: "8px",
            width: "100%"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderTop: "3px solid #007bff",
              borderRadius: "50%",
              animation: "spinner-spin 1s linear infinite"
            }} />
            <style>{`
              @keyframes spinner-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <p style={{ marginTop: "1rem", color: "#666", fontFamily: "Ubuntu, sans-serif" }}></p>
          </div>
        ) : submissions.length === 0 ? (
          <div style={{ color: "#666", fontSize: "1.1rem" }}>
            The submission section is currently empty. Head over to Publish to submit your first artifact!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", marginBottom: "2rem" }}>
            {submissions.map((sub) => (
              <div 
                key={sub.id}
                style={{
                  border: "1px solid #000",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#faf8f0",
                }}
              >
                {/* Header Row */}
                <div className="sidebar-header" style={{ margin: 0, borderRadius: 0, borderBottom: "1px solid #000" }}>
                  <div className="sidebar-header-left">
                    <img 
                      src="/brand/983473984834.png" 
                      alt="Icon" 
                      className="sidebar-book-icon"
                    />
                    <h3 style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "16px", fontWeight: "bold", textTransform: "capitalize" }}>
                      {sub.type}
                    </h3>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                      padding: "2px 8px",
                      backgroundColor: sub.status === "pending" ? "#c7511f" : sub.status === "accepted" ? "#10b981" : "#ef4444",
                      color: "#fff",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      fontFamily: "Ubuntu, sans-serif"
                    }}>
                      {sub.status}
                    </div>
                  </div>
                </div>

                {/* Content Row */}
                <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <h4 style={{ margin: "0 0 6px 0", fontFamily: "Ubuntu, sans-serif", fontSize: "1.2rem", fontWeight: "bold", color: "#111" }}>
                      {sub.title}
                    </h4>
                    {sub.subtitle && (
                      <p style={{ margin: "0 0 10px 0", fontSize: "0.95rem", color: "#111", fontFamily: "Ubuntu, sans-serif", lineHeight: "1.4" }}>
                        {sub.subtitle}
                      </p>
                    )}
                  </div>

                  <div>
                    <span style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      backgroundColor: "#c7511f",
                      color: "#fff",
                      borderRadius: "4px",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      fontFamily: "Ubuntu, sans-serif"
                    }}>
                      {sub.fileCount} files attached
                    </span>
                  </div>

                  <div style={{ marginTop: "4px" }}>
                    <a 
                      href={`https://${sub.publisherDomain}/${sub.linkId || sub.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "1.1rem",
                        color: "#2563eb",
                        fontWeight: "bold",
                        textDecoration: "underline",
                        wordBreak: "break-all",
                        fontFamily: "Ubuntu, sans-serif"
                      }}
                    >
                      {sub.publisherDomain}/{sub.linkId || sub.id}
                    </a>
                  </div>

                  {sub.hashtags && sub.hashtags.length > 0 && (
                    <div className="rich-tags-container" style={{ marginTop: "12px", marginBottom: "4px" }}>
                      {sub.hashtags.map((tag, idx) => (
                        <span 
                          key={`${tag.id}-${idx}`}
                          className={clsx("rich-tag notranslate", tag.type === "main" ? "tag-main" : "tag-normal")}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate({ to: `/hashtag/${encodeURIComponent(tag.name)}` });
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "6px",
                    marginTop: "8px" 
                  }}>
                    <span style={{ fontSize: "0.9rem", color: "#111", fontFamily: "Ubuntu, sans-serif" }}>by</span>
                    <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#111", fontFamily: "Ubuntu, sans-serif" }}>{sub.author}</span>
                    <i className="bi bi-patch-check-fill" style={{ color: "#0d6efd", fontSize: "1rem", marginLeft: "2px" }}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublishLayout>
  );
}
