import { useState } from "react";
import { Template1Header } from "./Template1Header";
import { Template1Footer } from "./Template1Footer";
import type { HomeInfoModalKind } from "@/components/home/HomeInfoModal";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import { getSessionUser } from "@/lib/authStore";
import { queryKeys } from "@/lib/queryKeys";

export function Template1Page() {
  const [infoModalOpen, setInfoModalOpen] = useState<HomeInfoModalKind | null>(null);

  // Fetch Current User for Author Block
  const { data: user } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => getCurrentUser(),
    initialData: () => getSessionUser() ?? undefined,
  });

  const getAvatarUrl = () => {
    if (user?.photoURL) return user.photoURL;
    if (user?.displayName) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=0D8A50&color=fff`;
    }
    if (user?.email) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=0D8A50&color=fff`;
    }
    return `https://ui-avatars.com/api/?name=Author&background=0D8A50&color=fff`;
  };

  const authorName = user?.displayName || user?.email || "Unknown Author";
  const publishDate = "MAR 2 2025"; // Mock date format specified

  // MOCK DATA FOR TEMPLATE PREVIEW
  const artifactType = "research_paper"; // options: 'research_paper', 'image', 'poster', 'software', '3d_model'
  const title = "Research about collecting microorganisms from a sample of building";
  const subtitle = "A comprehensive analysis of biological accumulation in urban environments and structural health impacts.";
  const description = "Microorganisms are ubiquitous in the built environment, yet their community dynamics within building materials remain poorly understood. This study analyzes samples collected from commercial building facades to identify the dominant microbial taxa and their potential metabolic pathways. Using high-throughput 16S rRNA sequencing, we observed significant variations in microbial diversity correlated with the material's porosity and ambient humidity levels. These findings offer preliminary insights into how structural materials might be engineered to selectively resist pathogenic colonization while supporting benign biofilms.";
  
  const pubDomain = "scienteen.com";
  const pubId = "A8F29X"; // 6 character alphanumeric
  
  const bibtex = `@article{${authorName.replace(/\s+/g, "_").toLowerCase()}_2026,
  title={${title}},
  author={${authorName}},
  journal={${pubDomain}},
  year={2026},
  url={https://${pubDomain}/${pubId}}
}`;

  const isResearch = artifactType === "research_paper";
  const downloadText = isResearch ? "Download abstract only" : "Download basic only";
  const contentHeading = isResearch ? "Abstract" : "Description";

  const handlePrint = () => {
    window.print();
  };

  const handleCopyBib = async () => {
    try {
      await navigator.clipboard.writeText(bibtex);
      alert("Bibliography copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="home-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Template1Header onOpenInfo={setInfoModalOpen} />
      
      <main style={{ flex: 1, padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Metadata Section */}
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Hashtags Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 600, color: '#4b5563', fontSize: '0.95rem' }}>Repository:</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <a href="/?q=%23COMPUTER_SCIENCE" style={{ fontFamily: '"Noto Sans", sans-serif', color: '#0000ff', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>#COMPUTER_SCIENCE</a>
                  <a href="/?q=%23BIOLOGY" style={{ fontFamily: '"Noto Sans", sans-serif', color: '#0000ff', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>#BIOLOGY</a>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 600, color: '#4b5563', fontSize: '0.95rem' }}>Related:</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <a href="/?q=%23MICROBES" style={{ fontFamily: '"Noto Sans", sans-serif', color: '#0000ff', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>#MICROBES</a>
                  <a href="/?q=%23BUILDING_MATERIALS" style={{ fontFamily: '"Noto Sans", sans-serif', color: '#0000ff', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>#BUILDING_MATERIALS</a>
                  <a href="/?q=%23DNA_SEQUENCING" style={{ fontFamily: '"Noto Sans", sans-serif', color: '#0000ff', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>#DNA_SEQUENCING</a>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img 
                src={getAvatarUrl()} 
                alt="Profile" 
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
              />
              <span style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '1.1rem', color: '#111827', fontWeight: 500 }}>
                By {authorName} <span style={{ color: '#6b7280', marginLeft: '6px' }}>• {publishDate}</span>
              </span>
            </div>
            <h1 style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '2.5rem', fontWeight: 500, color: '#000000', lineHeight: 1.2, margin: 0 }}>
              {title}
            </h1>
            <p style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '1.25rem', fontWeight: 400, color: '#4b5563', margin: 0 }}>
              {subtitle}
            </p>
          </div>

          {/* Content Viewer (Invisible Structural Wrapper) */}
          <div className="no-print" style={{ width: '100%', minHeight: '20px' }}></div>

          {/* Abstract / Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '1.5rem', fontWeight: 500, color: '#000000', margin: 0 }}>
              {contentHeading}
            </h2>
            <p style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '1.1rem', lineHeight: 1.8, color: '#111827', textAlign: 'justify', margin: 0, fontWeight: 400 }}>
              {description}
            </p>
          </div>

          {/* Action Buttons (Excluded on Print) */}
          <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
            <button 
              onClick={handlePrint}
              style={{ padding: '8px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', fontFamily: '"Noto Sans", sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <img src="/upload_3d_icon.png" alt="Download abstract" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              {downloadText}
            </button>
            <button 
              style={{ padding: '8px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', fontFamily: '"Noto Sans", sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <img src="/paper_clip_3d.png" alt="Download all" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              Download all
            </button>
            <button 
              onClick={handlePrint}
              style={{ padding: '8px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', fontFamily: '"Noto Sans", sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <img src="/hard_drive_3d_icon.png" alt="Print" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              Print
            </button>
          </div>

          {/* Bibliography Section (Excluded on Print) */}
          <div className="no-print" style={{ 
            marginTop: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start',
            gap: '1rem'
          }}>
            <h3 style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '1.25rem', fontWeight: 500, color: '#111', margin: 0 }}>
              Bibliography
            </h3>
            <textarea 
              readOnly 
              value={bibtex}
              style={{ width: '100%', height: '120px', padding: '12px', fontFamily: 'monospace', fontSize: '0.9rem', backgroundColor: '#faf8f0', border: '1px solid #d1d5db', borderRadius: '4px', resize: 'vertical' }}
            />
            <button 
              onClick={handleCopyBib}
              style={{ padding: '8px 24px', backgroundColor: 'transparent', color: '#000', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', fontFamily: '"Noto Sans", sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <img src="/bibtex_badge.png" alt="Copy BibTeX" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              Copy Bibliography
            </button>
          </div>

        </div>
      </main>

      <Template1Footer onOpenInfo={setInfoModalOpen} />
    </div>
  );
}
