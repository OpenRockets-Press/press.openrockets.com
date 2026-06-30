import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Template1Page } from "@/templates/template1/Template1Page";
import { Spinner } from "@/components/ui/Spinner";
import { API_BASE } from "@/lib/api";

export function ArtifactViewPage() {
  const { titleSlug } = useParams({ strict: false });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Inject bot-blocking tag
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      meta.setAttribute('content', 'noindex, nofollow');
      document.head.appendChild(meta);
    } else {
      meta.setAttribute('content', 'noindex, nofollow');
    }

    async function fetchArtifact() {
      try {
        // Extract the pubId (the 16-character code) from the end of the URL slug
        const pubId = titleSlug ? titleSlug.split('-').pop() : '';
        if (!pubId) throw new Error("Invalid publication ID");
        const res = await fetch(`${API_BASE}/api/publications/${pubId}`);
        const result = await res.json();
        
        if (res.ok && result.success) {
          setData(result.data);
        } else {
          setError(result.error?.message || "Failed to load artifact");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchArtifact();
  }, [titleSlug]);

  if (loading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>;
  
  if (error || !data) return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Ubuntu, sans-serif" }}>
      <h2>Artifact not found</h2>
      <p>{error}</p>
    </div>
  );

  return <Template1Page data={data} />;
}
