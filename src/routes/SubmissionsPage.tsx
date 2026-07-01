import { useState, useEffect } from "react";
import { PublishLayout } from "@/components/publish/PublishLayout";
import localforage from "localforage";
import { useNavigate } from "@tanstack/react-router";
import { clsx } from "clsx";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, getAllAdminPublications, reviewPublication, getContributorPublications } from "@/lib/api";
import { getSessionUser } from "@/lib/authStore";
import { queryKeys } from "@/lib/queryKeys";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: user, isFetched } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => getCurrentUser(),
    initialData: () => getSessionUser() ?? undefined,
  });

  const isAdmin = user?.role === 'admin' || (user?.email && user.email.endsWith('@openrockets.com'));

  useEffect(() => {
    if (!isFetched) return;
    const loadSubmissions = async () => {
      setIsLoaded(false); // start loading overlay
      try {
        if (isAdmin) {
          const pubs = await getAllAdminPublications();
          const mapped = pubs.map((p: any) => {
            let fileCount = p.fileStorageKey || p.fileStorageId ? 1 : 0;
            if (p.extraFiles) {
              try {
                const extra = JSON.parse(p.extraFiles);
                if (Array.isArray(extra)) fileCount += extra.length;
              } catch (e) {}
            }
            
            // Also count 3D models and code gist as a file
            if (p.threejsModelKey) fileCount += 1;

            return {
              id: p.pubId || p.id,
              type: p.type,
              title: p.title,
              subtitle: p.subtitle || "",
              fileCount,
              publisherDomain: "press.openrockets.com",
              linkId: `artifacts/${(p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${p.pubId || p.id}`,
              hashtags: p.tags?.map ? p.tags.map((t: string) => ({ id: t, name: t, type: "general" as const })) : [],
              author: p.authorName || "Unknown Author",
              status: p.status,
              createdAt: p.submittedAt ? new Date(p.submittedAt).getTime() : Date.now()
            };
          });
          setSubmissions(mapped);
        } else {
          const pubs = await getContributorPublications();
          const mapped = pubs.map((p: any) => {
            let fileCount = p.fileStorageKey || p.fileStorageId ? 1 : 0;
            if (p.extraFiles) {
              try {
                const extra = JSON.parse(p.extraFiles);
                if (Array.isArray(extra)) fileCount += extra.length;
              } catch (e) {}
            }
            if (p.threejsModelKey) fileCount += 1;
            return {
              id: p.pubId || p.id,
              type: p.type,
              title: p.title,
              subtitle: p.subtitle || "",
              fileCount,
              publisherDomain: "press.openrockets.com",
              linkId: `artifacts/${(p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${p.pubId || p.id}`,
              hashtags: p.tags?.map ? p.tags.map((t: string) => ({ id: t, name: t, type: "general" as const })) : [],
              author: p.authorName || "Unknown Author",
              status: p.status,
              createdAt: p.submittedAt ? new Date(p.submittedAt).getTime() : Date.now()
            };
          });
          setSubmissions(mapped);
        }
      } catch (err) {
        console.error("Failed to load submissions", err);
      } finally {
        setTimeout(() => setIsLoaded(true), 600); // small delay for the spinner visual
      }
    };
    loadSubmissions();
  }, [isAdmin, isFetched]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const decisionMap: Record<string, "approved" | "rejected" | "pending"> = {
        "published": "approved",
        "rejected": "rejected",
        "pending_review": "pending",
        "accepted": "approved",
        "pending": "pending"
      };
      await reviewPublication(id, decisionMap[newStatus] || "pending");
      setSubmissions(prev => prev.map(sub => sub.id === id ? { ...sub, status: newStatus } : sub));
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredSubmissions = submissions.filter(sub => 
    sub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    sub.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "2rem", color: "#111", margin: 0 }}>
            {isAdmin ? "Admin Submissions Panel" : "Your Submissions"}
          </h1>
        </div>
        
        {isAdmin && (
          <div style={{ width: "100%", marginBottom: "2rem" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: "600px" }}>
              <input 
                type="text" 
                placeholder="Search publications..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 40px",
                  fontSize: "1rem",
                  fontFamily: "Ubuntu, sans-serif",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => e.target.style.borderColor = "#c7511f"}
                onBlur={(e) => e.target.style.borderColor = "#ddd"}
              />
              <svg 
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }}
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
        )}

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
        ) : filteredSubmissions.length === 0 ? (
          <div style={{ color: "#666", fontSize: "1.1rem" }}>
            The submission section is currently empty.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", marginBottom: "2rem" }}>
            {filteredSubmissions.map((sub) => {
              const isUpdating = updatingId === sub.id;
              
              return (
                <div 
                  key={sub.id}
                  style={{
                    border: "1px solid #000",
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: "#faf8f0",
                    position: "relative"
                  }}
                >
                  {isUpdating && (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(255,255,255,0.7)",
                      zIndex: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <div style={{
                        width: "30px",
                        height: "30px",
                        borderTop: "3px solid #c7511f",
                        borderRadius: "50%",
                        animation: "spinner-spin 1s linear infinite"
                      }} />
                    </div>
                  )}

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
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative", zIndex: 11 }}>
                      {isAdmin ? (
                        <select 
                          value={sub.status === "published" || sub.status === "accepted" ? "published" : sub.status === "rejected" ? "rejected" : "pending_review"}
                          onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                          disabled={isUpdating}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: (sub.status === "pending" || sub.status === "pending_review") ? "#c7511f" : (sub.status === "accepted" || sub.status === "published") ? "#10b981" : "#ef4444",
                            color: "#fff",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            fontFamily: "Ubuntu, sans-serif",
                            border: "none",
                            outline: "none",
                            cursor: "pointer"
                          }}
                        >
                          <option value="pending_review" style={{ backgroundColor: "#fff", color: "#000" }}>PENDING</option>
                          <option value="published" style={{ backgroundColor: "#fff", color: "#000" }}>ACCEPTED</option>
                          <option value="rejected" style={{ backgroundColor: "#fff", color: "#000" }}>REJECTED</option>
                        </select>
                      ) : (
                        <div style={{
                          padding: "2px 8px",
                          backgroundColor: (sub.status === "pending" || sub.status === "pending_review") ? "#c7511f" : (sub.status === "accepted" || sub.status === "published") ? "#10b981" : "#ef4444",
                          color: "#fff",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          fontFamily: "Ubuntu, sans-serif"
                        }}>
                          {sub.status === "published" ? "accepted" : sub.status === "pending_review" ? "pending" : sub.status}
                        </div>
                      )}
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
              );
            })}
          </div>
        )}
      </div>
    </PublishLayout>
  );
}
