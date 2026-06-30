import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Template1Page } from "@/templates/template1/Template1Page";
import { Spinner } from "@/components/ui/Spinner";

export function ArtifactShortlinkPage() {
  const { shortId } = useParams({ strict: false }) as any;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        if (!shortId) throw new Error("Invalid short ID");
        
        const res = await fetch(`/api/publications/short/${shortId}`);
        const result = await res.json();
        
        if (!result.success) {
          throw new Error(result.error?.message || "Failed to load artifact");
        }
        
        setData(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchArtifact();
  }, [shortId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
        <Spinner color="#1a73e8" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Artifact Not Found</h1>
        <p style={{ color: '#666' }}>{error || "The requested short link is invalid or has expired."}</p>
      </div>
    );
  }

  return <Template1Page data={data} />;
}
