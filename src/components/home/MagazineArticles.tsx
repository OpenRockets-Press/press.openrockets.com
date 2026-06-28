import { useQuery } from "@tanstack/react-query";

interface MagazineArticle {
  id: string;
  title: string;
  slug: string;
  image_url: string | null;
  published_at: string | null;
  created_at: string;
  author: {
    name: string;
    verified: boolean;
  };
}

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInDays = Math.floor(diffInSeconds / 86400);

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 14) return "1 week ago";
  if (diffInDays < 30) return "Within a month";
  if (diffInDays < 60) return "1 month ago";
  return "More than a month ago";
}

export function MagazineArticles() {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["magazine-articles"],
    queryFn: async () => {
      const url = "https://ahkfuaaryzmcmoarxraq.supabase.co/rest/v1/articles?select=id,title,slug,image_url,published_at,created_at,author:authors(name,verified)&order=created_at.desc&limit=5";
      const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoa2Z1YWFyeXptY21vYXJ4cmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDM5OTMsImV4cCI6MjA4MTM3OTk5M30.RG2WZh9lSaMr8zLRJxP2Fz4OGhZzW1NqwHNvJVvpDgo";
      
      const res = await fetch(url, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`
        }
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch articles");
      }
      
      return (await res.json()) as MagazineArticle[];
    },
    staleTime: 60_000 * 5, // 5 mins
  });

  if (isLoading) {
    return (
      <div className="sidebar-section">
        <div className="sidebar-header" style={{ marginBottom: "8px" }}>
          <div className="sidebar-header-left">
            <img src="/mag_icon_v2.png" alt="Magazine" className="sidebar-book-icon" />
            <h3>Magazine Articles</h3>
          </div>
        </div>
        <div style={{ padding: "8px", fontSize: "0.85rem", color: "#666" }}>Loading articles...</div>
      </div>
    );
  }

  if (error || !articles || articles.length === 0) {
    return null; // Silently fail if articles cannot be loaded
  }

  return (
    <div className="sidebar-section">
      <div className="sidebar-header" style={{ marginBottom: "8px" }}>
        <div className="sidebar-header-left">
          <img src="/mag_icon_v2.png" alt="Magazine" className="sidebar-book-icon" />
          <h3>Magazine Articles</h3>
        </div>
      </div>
      <div className="magazine-article-list" style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "4px 8px" }}>
        {articles.map(article => (
          <a href={`https://mag.openrockets.com/p/${article.slug}`} key={article.id} target="_blank" rel="noopener noreferrer" className="magazine-article-item" style={{ fontSize: "0.85rem", lineHeight: "1.3" }}>
            <div className="magazine-article-title">
              {article.title}
            </div>
            <div className="magazine-article-meta">
              <span className="author-name notranslate">{article.author?.name || "Unknown Author"}</span>
              {article.author?.verified && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#3b82f6" stroke="#fff" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"></circle><polyline points="9 11 12 14 22 4"></polyline></svg>
              )}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#888", marginTop: "2px" }}>
              {getRelativeTime(article.published_at || article.created_at)}
            </div>
            <div className="magazine-preview-image-wrapper">
              <img src={article.image_url || "/mag_icon_v2.png"} alt={article.title} className="magazine-preview-image" loading="lazy" />
              <div className="magazine-hover-overlay">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <span>Click to view the article</span>
              </div>
            </div>
          </a>
        ))}
      </div>
      <div style={{ padding: "10px 12px", borderTop: "2px solid #000", marginTop: "8px" }}>
        <a 
          href="https://mag.openrockets.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ fontSize: "0.85rem", color: "#007185", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 500 }}
        >
          <span>Read the largest student magazine, OpenRockets Magazine!</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginLeft: "8px" }}><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </a>
      </div>
    </div>
  );
}
