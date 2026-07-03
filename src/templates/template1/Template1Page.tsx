import { Template1Header } from "./Template1Header";
import { Template1Footer } from "./Template1Footer";
import type { HomeInfoModalKind } from "@/components/home/HomeInfoModal";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import { getSessionUser } from "@/lib/authStore";
import { queryKeys } from "@/lib/queryKeys";
import { Spinner } from "@/components/ui/Spinner";
import React, { useState, useEffect, Suspense, lazy } from "react";
const ModelViewerBox = lazy(() => import("./ModelViewerBox").then(module => ({ default: module.ModelViewerBox })));
const PDFViewerBox = lazy(() => import("./PDFViewerBox").then(module => ({ default: module.PDFViewerBox })));
const CodeViewerBox = lazy(() => import("./CodeViewerBox").then(module => ({ default: module.CodeViewerBox })));
const ImageViewerBox = lazy(() => import("./ImageViewerBox").then(module => ({ default: module.ImageViewerBox })));
import { AdsInfoModal } from "@/components/ui/AdsInfoModal";
import labelsData from "@/data/labels.json";
import "react-quill-new/dist/quill.snow.css";
import { Document, Page, pdfjs } from 'react-pdf';
import { getApiBaseUrl } from "@/lib/api";
import { AlertModal } from "@/components/ui/AlertModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

export function Template1Page({ data }: { data?: any }) {
  const [infoModalOpen, setInfoModalOpen] = useState<HomeInfoModalKind | null>(null);
  const [alertState, setAlertState] = useState({ isOpen: false, message: "", title: "Warning" });

  useEffect(() => {
    if (data?.title) {
      document.title = `${data.title} - OpenRockets`;
    }
  }, [data]);

  // Fetch Current User for Author Block
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => getCurrentUser(),
    initialData: () => getSessionUser() ?? undefined,
  });

  const isAdmin = user?.role === 'admin' || (user?.email && user.email.endsWith('@openrockets.com'));
  const isPreviewMode = isAdmin && data?.status !== 'published';
  const shouldShow404 = data?.status !== 'published' && !isAdmin;

  const getAvatarUrl = () => {
    if (data?.authorAvatar) return data.authorAvatar;
    if ((user as any)?.avatarUrl) return (user as any).avatarUrl;
    if ((user as any)?.photoURL) return (user as any).photoURL;
    const seed = [user?.displayName || data?.authorName, user?.email].filter(Boolean).join(' ') || 'Author';
    return `https://api.dicebear.com/10.x/stripes/svg?seed=${encodeURIComponent(seed)}`;
  };

  const authorName = data?.authorName || user?.displayName || user?.email || "Unknown Author";

  const fileStorageKey = data?.fileStorageKey;
  const extraFiles = data?.extraFiles ? (typeof data.extraFiles === 'string' ? JSON.parse(data.extraFiles) : data.extraFiles) : [];
  
  const getLicenseDetails = (licenseKey) => {
    switch (licenseKey) {
      case 'ORP_HUMMINGBIRD':
        return { name: 'OpenRockets® Hummingbird', icon: '/brand/licences/hummingbird.png', link: 'https://press.openrockets.com/licenses/hummingbird' };
      case 'ORP_KANGAROO':
        return { name: 'OpenRockets® Kangaroo', icon: '/brand/licences/kangarooo.png', link: 'https://press.openrockets.com/licenses/kangaroo' };
      case 'CC':
        return { name: 'Creative Commons®', icon: '/brand/licences/creativecommons_usethisforall.png', link: 'https://creativecommons.org/licenses/by/4.0/' };
      case 'ORP_BEAVER':
      default:
        return { name: 'OpenRockets® Beaver', icon: '/brand/licences/beaver,png.png', link: 'https://press.openrockets.com/licenses/beaver' };
    }
  };
  const { name: lName, icon: lIcon, link: lLink } = getLicenseDetails(data?.license || 'ORP_BEAVER');

  const publishDate = data?.submittedAt 
    ? new Date(data.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
    : "2 Mar. 2025";

  // Hashtag engine - loads from hashtags.json
  const [mainTags, setMainTags] = useState<{ id: string, name: string }[]>([]);
  const [generalTags, setGeneralTags] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    if (data?.tags) {
      try {
        const parsedTags = typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags;
        if (Array.isArray(parsedTags)) {
          // Sometimes tags are just strings (IDs) and sometimes full objects
          if (parsedTags.length > 0 && typeof parsedTags[0] === 'object') {
            setMainTags(parsedTags.filter((t: any) => t.type === 'main'));
            setGeneralTags(parsedTags.filter((t: any) => t.type === 'general'));
          } else {
            // If they are just IDs, fallback to fetching
            fetch('/config/hashtags.json')
              .then(res => res.json())
              .then(config => {
                 const all = config.hashtags || config;
                 const matched = all.filter((t: any) => parsedTags.includes(t.id));
                 setMainTags(matched.filter((t: any) => t.type === 'main'));
                 setGeneralTags(matched.filter((t: any) => t.type === 'general'));
              }).catch(console.error);
          }
        }
        return;
      } catch (e) {
        console.error("Failed to parse tags", e);
      }
    }

    // Fallback for mock preview
    fetch('/config/hashtags.json')
      .then(res => res.json())
      .then(config => {
         const all = config.hashtags || config;
         const main = all.filter((t: any) => t.type === 'main');
         const gen = all.filter((t: any) => t.type === 'general');
         
         const shuffledMain = main.sort(() => 0.5 - Math.random()).slice(0, 2);
         const shuffledGen = gen.sort(() => 0.5 - Math.random()).slice(0, 4);
         
         setMainTags(shuffledMain);
         setGeneralTags(shuffledGen);
      }).catch(console.error);
  }, [data?.tags]);

  // Link preview engine
  const parsedLinks = data?.links ? (typeof data.links === 'string' ? JSON.parse(data.links) : data.links) : null;
  const mockLinkUrls = parsedLinks || [
    { url: "https://apple.com", customName: "" },
    { url: "https://microsoft.com", customName: "" }
  ];
  const [linkData, setLinkData] = useState<any[]>([]);
  const [isLinksLoading, setIsLinksLoading] = useState(true);

  useEffect(() => {
    async function fetchLinks() {
      try {
        const results = await Promise.all(
          mockLinkUrls.map(async (l: any) => {
            const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(l.url)}`);
            const data = await res.json();
            return {
              url: l.url,
              customName: l.customName,
              title: data.data?.title || l.url,
              description: data.data?.description || "",
              image: data.data?.image?.url || "",
              favicon: data.data?.logo?.url || ""
            };
          })
        );
        setLinkData(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLinksLoading(false);
      }
    }
    fetchLinks();
  }, [fileStorageKey, extraFiles]);

  useEffect(() => {
    if (data && !isPreviewMode && data.pubId) {
      // Fire and forget view increment
      const baseUrl = getApiBaseUrl();
      fetch(`${baseUrl}/api/publications/${data.pubId}/view`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {});
    }
  }, [data?.pubId, isPreviewMode]);

  useEffect(() => {
    if (data?.title) {
      document.title = `${data.title} - OpenRockets Press`;
    }
  }, [data?.title]);

  // MOCK DATA FOR TEMPLATE PREVIEW
  const artifactType = data?.type || "software_code";
  const title = data?.title || "Sample Code Artifact";
  const subtitle = data?.subtitle || "A comprehensive analysis of biological accumulation in urban environments and structural health impacts.";
  const abstract = data?.abstract || "This study investigates the prevalence of biofilms and fungal growth on high-rise structures... (Mock abstract)";
  const communities: string[] = data?.communities ? (typeof data.communities === 'string' ? JSON.parse(data.communities) : data.communities) : [];
  
  const pubDomain = "press.openrockets.com";
  const pubId = data?.id || "A8F29X";
  const pubYear = data?.createdAt ? new Date(data.createdAt).getFullYear() : new Date().getFullYear();
  
  const bibtex = `@article{${authorName.replace(/\s+/g, "_").toLowerCase()}_${pubYear},
  title={${title}},
  author={${authorName}},
  journal={${pubDomain}},
  year={${pubYear}},
  url={https://${pubDomain}/${pubId}}
}`;

  const isCode = artifactType === "software_code" || artifactType === "code_gist";
  const is3DModel = artifactType === "3d_model" || artifactType === "3d_artifact";
  const isImage = artifactType === "image" || artifactType === "poster";
  const isPDF = artifactType === "book" || artifactType === "research_paper" || artifactType === "magazine";
  const isResearch = artifactType === "research_paper";

  const downloadText = isResearch ? "Download abstract only" : "Download basic only";
  const contentHeading = isResearch ? "Abstract" : "Description";

  const allFileKeys: string[] = [];
  if (fileStorageKey) allFileKeys.push(fileStorageKey);
  if (extraFiles && Array.isArray(extraFiles)) allFileKeys.push(...extraFiles);
  const uniqueFileKeys = Array.from(new Set(allFileKeys)).filter(Boolean);
  
  const fileUrls = uniqueFileKeys.length > 0 
    ? uniqueFileKeys.map(k => k.startsWith('http') ? k : `${getApiBaseUrl()}/api/storage/fetch/${k}`)
    : []; // fallback used later if empty

  // 3D Model state
  const modelList = fileUrls.length > 0 ? fileUrls : ['/brand/FinalBaseMesh.obj', '/brand/FinalBaseMesh.obj', '/brand/FinalBaseMesh.obj'];
  const [activeModelIndex, setActiveModelIndex] = useState(0);
  const [isModelHovered, setIsModelHovered] = useState(false);
  const [isModelInteracting, setIsModelInteracting] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [modelLeftHovered, setModelLeftHovered] = useState(false);
  const [modelRightHovered, setModelRightHovered] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      const JSZipModule = await import("jszip");
      const JSZip = JSZipModule.default || JSZipModule;
      const mainZip = new JSZip();
      const filesZip = new JSZip();
      
      // Add nested zip containing the files
      for (let i = 0; i < fileUrls.length; i++) {
        const url = fileUrls[i];
        let filename = `file-${i}`;
        
        if (url.includes('fileKey=')) {
          const key = decodeURIComponent(url.split('fileKey=')[1]);
          filename = key.split('/').pop() || filename;
        } else {
          filename = url.split('/').pop() || filename;
        }
        
        // Exclude specific files from raw data if needed
        if (filename.includes('worker-bundle')) continue;
        
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error("Failed to fetch file");
          const blob = await response.blob();
          
          filesZip.file(filename, blob);
        } catch (error) {
          console.error("Error fetching file to zip:", error);
        }
      }
      
      // Generate the inner files.zip as a blob and add it to mainZip
      const filesZipBlob = await filesZip.generateAsync({ type: "blob" });
      mainZip.file("files.zip", filesZipBlob);

      // Generate the PDF
      const element = document.getElementById("printable-area");
      if (element && (window as any).html2pdf) {
        const opt = {
          margin:       0.5,
          filename:     'document.pdf',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            scrollY: 0,
            onclone: (clonedDoc) => {
              const imgs = clonedDoc.querySelectorAll('img');
              for (let i = 0; i < imgs.length; i++) {
                const img = imgs[i];
                if (img.src && img.src.startsWith('http') && !img.src.includes(window.location.host)) {
                  img.crossOrigin = "anonymous";
                  img.src = 'https://corsproxy.io/?' + encodeURIComponent(img.src);
                }
              }
            }
          },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        const pdfBlob = await (window as any).html2pdf().from(element).set(opt).output('blob');
        mainZip.file("content.pdf", pdfBlob);
      }
      
      // Generate the outer zip file
      const content = await mainZip.generateAsync({ type: "blob" });
      
      // Trigger download
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (error) {
      console.error("Failed to generate zip", error);
      setAlertState({ isOpen: true, message: "Failed to download files.", title: "Warning" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyBib = async () => {
    try {
      await navigator.clipboard.writeText(bibtex);
      setAlertState({ isOpen: true, message: "Bibliography copied to clipboard!", title: "Notice" });
    } catch (err) {
      console.error("Failed to copy:", err);
      setAlertState({ isOpen: true, message: "Failed to copy bibliography.", title: "Warning" });
    }
  };

  const handleCopyLink = () => {
    const linkToCopy = data?.shortId ? `https://scienteen.com/${data.shortId}` : window.location.href;
    navigator.clipboard.writeText(linkToCopy);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const chevronStyle = (disabled: boolean, hovered: boolean): React.CSSProperties => ({
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    padding: '12px',
    cursor: disabled ? 'default' : 'pointer',
    color: disabled ? '#ccc' : hovered ? '#c7511f' : '#000',
    transition: 'color 0.2s ease',
    opacity: disabled ? 0.3 : 1,
  });

  if (isUserLoading && data?.status !== 'published') {
    return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner /></div>;
  }

  return (
    <div className="home-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <AlertModal 
        isOpen={alertState.isOpen} 
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))} 
        title={alertState.title} 
        message={alertState.message} 
      />
      <div className="no-print">
        <Template1Header onOpenInfo={setInfoModalOpen} />
        {isPreviewMode && (
          <div style={{
            backgroundColor: '#c7511f',
            color: '#fff',
            padding: '10px',
            textAlign: 'center',
            fontFamily: 'Ubuntu, sans-serif',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            Document is in admin preview mode.
          </div>
        )}
      </div>
      
      {shouldShow404 ? (
        <main style={{ flex: 1, padding: '2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <h2 style={{ fontFamily: '"Noto Sans", sans-serif', color: '#111', fontSize: '1.5rem', fontWeight: 500, textAlign: 'center' }}>
            Sorry, this artifact is not found or is currently in review.
          </h2>
        </main>
      ) : (
      <main id="printable-area" style={{ flex: 1, padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Metadata Section */}
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mainTags.length > 0 && (
              <div className="artifact-meta-section">
                <div className="artifact-meta-row">
                  <h2 style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '1.1rem', fontWeight: 600, margin: 0, color: '#111' }}>
                    Repository
                  </h2>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {mainTags.map((tag, idx) => (
                      <a key={`main-${idx}`} href={`/hashtag/${encodeURIComponent(tag.name)}`} style={{
                        color: '#0066cc', 
                        textDecoration: 'none',
                        fontFamily: '"Noto Sans", sans-serif', 
                        fontSize: '0.95rem',
                        fontWeight: 500
                      }}>
                        {tag.name.replace(/^#/, '')}
                      </a>
                    ))}
                  </div>
                </div>
                <hr className="artifact-meta-divider" />
              </div>
            )}

            {/* Related Section (General Hashtags) */}
            {generalTags.length > 0 && (
              <div className="artifact-meta-section">
                <div className="artifact-meta-row">
                  <h2 style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '1.1rem', fontWeight: 600, margin: 0, color: '#111' }}>
                    Related
                  </h2>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {generalTags.map((tag, idx) => (
                      <a key={`gen-${idx}`} href={`/hashtag/${encodeURIComponent(tag.name)}`} style={{
                        color: '#0066cc', 
                        textDecoration: 'none',
                        fontFamily: '"Noto Sans", sans-serif', 
                        fontSize: '0.95rem',
                        fontWeight: 500
                      }}>
                        {tag.name.replace(/^#/, '')}
                      </a>
                    ))}
                  </div>
                </div>
                <hr className="artifact-meta-divider" />
              </div>
            )}

            {/* Contributor name/date - NOT translatable */}
            <div translate="no" className="notranslate artifact-author-block">
              <div className="artifact-author-profile">
                <img 
                  src={getAvatarUrl()} 
                  alt="Profile" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <span style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '1.1rem', color: '#111827', fontWeight: 500 }}>
                  By {authorName}
                </span>
              </div>
              
              <div className="artifact-author-meta">
                <span className="artifact-date">
                  <span className="artifact-date-bullet">• </span>
                  {publishDate}
                </span>
                
                <div className="artifact-views">
                  <img src="/brand/views_icon.png" alt="Views" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                  <span style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '1rem', color: '#6b7280', fontWeight: 500 }}>
                    {data?.viewCount || 0}
                  </span>
                </div>
              </div>
            </div>

            <h1 style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '2.5rem', fontWeight: 500, color: '#000000', lineHeight: 1.2, margin: 0, marginTop: '12px' }}>
              {title}
            </h1>
            <p style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '1.25rem', fontWeight: 400, color: '#4b5563', margin: 0 }}>
              {subtitle}
            </p>
          </div>

          {/* ============ VIEWER CONTAINERS ============ */}
          {/* PDF VIEWER */}
          {isPDF && (
            <div className="no-print" style={{ width: '100%', marginBottom: '2rem' }}>
              <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading Viewer...</div>}>
<PDFViewerBox files={fileUrls.length > 0 ? fileUrls : ['/sample1.pdf']} />
</Suspense>
            </div>
          )}

          {/* 3D MODEL VIEWER */}
          {is3DModel && (
            <div className="no-print" style={{ display: 'flex', width: '100%', alignItems: 'flex-start', gap: '0', marginBottom: '2rem' }}>
              {/* Left Chevron */}
              <div style={{ position: 'sticky', top: '7rem', height: 'fit-content', zIndex: 10 }}>
                <button
                  disabled={activeModelIndex === 0}
                  onClick={() => setActiveModelIndex(Math.max(0, activeModelIndex - 1))}
                  onMouseEnter={() => setModelLeftHovered(true)}
                  onMouseLeave={() => setModelLeftHovered(false)}
                  style={chevronStyle(activeModelIndex === 0, modelLeftHovered)}
                  title="Previous Model"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
              </div>

              {/* Main 3D Area */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* 3D Viewport */}
                <div
                  style={{
                    width: '100%',
                    height: '500px',
                    backgroundColor: '#ffffff',
                    position: 'relative',
                    cursor: isModelHovered ? 'grab' : 'default',
                  }}
                  onMouseEnter={() => setIsModelHovered(true)}
                  onMouseLeave={() => { setIsModelHovered(false); setIsModelInteracting(false); }}
                  onMouseDown={() => setIsModelInteracting(true)}
                  onMouseUp={() => setIsModelInteracting(false)}
                  onTouchStart={() => setIsModelInteracting(true)}
                  onTouchEnd={() => setIsModelInteracting(false)}
                >
                  <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading Viewer...</div>}>
<ModelViewerBox
                    url={modelList[activeModelIndex]}
                    isThumbnail={false}
                    isHovered={isModelHovered}
                    onError={(err) => setModelError(err?.message || "Unknown error")}
                  />
</Suspense>
                  {/* Hover overlay: Drag, Zoom, Move - shows when OUTSIDE container */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                      opacity: (!isModelHovered) ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                      backgroundColor: '#ffffff',
                      border: '2px solid #000000',
                      borderRadius: '4px',
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      zIndex: 5
                    }}
                  >
                    <video
                      src="/728472842748274.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                    />
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'black', fontFamily: '"Noto Sans", sans-serif' }}>Drag, Zoom, Move</span>
                  </div>
                </div>

                {/* Model Switcher Thumbnails */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', padding: '16px 0' }}>
                  {modelList.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveModelIndex(idx)}
                      style={{
                        background: '#fff',
                        border: activeModelIndex === idx ? '2px solid #000' : '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        padding: '4px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '80px',
                        height: '80px'
                      }}
                      title={`Preview Model ${idx + 1}`}
                    >
                      <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                        <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading Viewer...</div>}>
<ModelViewerBox url={file} isThumbnail={true} />
</Suspense>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Chevron */}
              <div style={{ position: 'sticky', top: '7rem', height: 'fit-content', zIndex: 10 }}>
                <button
                  disabled={activeModelIndex === modelList.length - 1}
                  onClick={() => setActiveModelIndex(Math.min(modelList.length - 1, activeModelIndex + 1))}
                  onMouseEnter={() => setModelRightHovered(true)}
                  onMouseLeave={() => setModelRightHovered(false)}
                  style={chevronStyle(activeModelIndex === modelList.length - 1, modelRightHovered)}
                  title="Next Model"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
          )}

          {/* CODE VIEWER */}
          {isCode && (
            <div className="no-print" style={{ width: '100%', marginBottom: '2rem' }}>
              <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading Viewer...</div>}>
<CodeViewerBox 
                initialFiles={fileUrls.length > 0 ? fileUrls.map(u => ({ url: u, name: u.split('/').pop() || 'code' })) : [
                  { url: "/brand/18-basemodel.rar", name: "18-basemodel.rar" },
                  { url: "/brand/index.html", name: "index.html" },
                  { url: "/brand/vite.config.ts", name: "vite.config.ts" }
                ]}
                licenseName={lName} 
                licenseIcon={lIcon}
                licenseLink={lLink}
              />
</Suspense>
            </div>
          )}

          {/* IMAGE VIEWER */}
          {isImage && (
            <div className="no-print image-container image-content" style={{ width: '100%', marginBottom: '2rem' }}>
              <Suspense fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading Viewer...</div>}>
<ImageViewerBox files={fileUrls.length > 0 ? fileUrls : ['/brand/welcomepage2.png', '/brand/DARKMODEFAVICON.png']} />
</Suspense>
            </div>
          )}

          {/* Abstract / Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '1.5rem', fontWeight: 500, color: '#000000', margin: 0 }}>
              {contentHeading}
            </h2>
            <div className="ql-snow">
              <div 
                className="ql-editor"
                style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '1.1rem', lineHeight: 1.8, color: '#111827', textAlign: 'justify', margin: 0, fontWeight: 400, padding: 0 }}
                dangerouslySetInnerHTML={{ __html: abstract }}
              />
            </div>
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
              onClick={handleDownloadAll}
              disabled={isDownloading}
              style={{ padding: '8px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 500, cursor: isDownloading ? 'not-allowed' : 'pointer', fontFamily: '"Noto Sans", sans-serif', display: 'flex', alignItems: 'center', gap: '8px', opacity: isDownloading ? 0.7 : 1 }}
            >
              {isDownloading ? (
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 1s linear infinite' }} />
              ) : (
                <img src="/paper_clip_3d.png" alt="Download all" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              )}
              {isDownloading ? "Processing..." : "Download all"}
            </button>
            <button 
              onClick={handlePrint}
              style={{ padding: '8px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', fontFamily: '"Noto Sans", sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <img src="/hard_drive_3d_icon.png" alt="Print" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              Print
            </button>
          </div>

          {/* Link Previews Section - NOT translatable */}
          <div translate="no" className="notranslate" style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '800px' }}>
            <h3 style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '1.25rem', fontWeight: 500, color: '#111', margin: '0 0 8px 0' }}>
              External Links
            </h3>
            
            {isLinksLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1, 2].map((i) => (
                  <div key={i} className="ads-modal-shimmer" style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px", backgroundColor: "#fff" }}>
                    <div className="shimmer-line" style={{ height: '30px', width: '50%', marginBottom: '16px', backgroundColor: '#eee', borderRadius: '4px' }}></div>
                    <div className="shimmer-line" style={{ height: '100px', width: '100%', marginBottom: '16px', backgroundColor: '#eee', borderRadius: '4px' }}></div>
                  </div>
                ))}
              </div>
            ) : (
              linkData.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <div style={{ border: "1px solid #000", borderRadius: "8px", overflow: "hidden", backgroundColor: "#fff", cursor: "pointer" }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#000', padding: '12px 16px', borderBottom: '1px solid #000' }}>
                      <img src="/brand/983473984834.png" alt="Icon" style={{ width: '22px', height: '22px', marginRight: '12px' }} />
                      <h3 style={{ margin: 0, fontFamily: '"Noto Sans", sans-serif', fontSize: '16px', fontWeight: 600, color: '#fff' }}>
                        {link.customName || link.title || `Link ${idx + 1}`}
                      </h3>
                    </div>
                    {link.image && (
                      <div style={{ width: '100%', height: '80px', overflow: 'hidden', borderBottom: '1px solid #eee' }}>
                        <img src={link.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: '16px' }}>
                      <h4 style={{ margin: '0 0 6px 0', fontFamily: '"Noto Sans", sans-serif', fontSize: '1rem', color: '#111', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {link.title || link.url}
                      </h4>
                      {link.description && (
                        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#555', fontFamily: '"Noto Sans", sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {link.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {link.favicon ? (
                          <img src={link.favicon} alt="favicon" style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ width: '16px', height: '16px', backgroundColor: '#ccc', borderRadius: '4px', flexShrink: 0 }}></div>
                        )}
                        <span style={{ fontSize: '0.8rem', color: '#000', fontFamily: '"Noto Sans", sans-serif', maxWidth: '50%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {link.url}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>

          {/* Bibliography Section - NOT translatable */}
          <div translate="no" className="notranslate no-print" style={{ 
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
              style={{ width: '100%', height: '120px', padding: '12px', fontFamily: 'monospace', fontSize: '0.9rem', backgroundColor: '#faf8f0', border: '1px solid #000', borderRadius: '4px', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleCopyBib}
                style={{ padding: '8px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', fontFamily: '"Noto Sans", sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <img src="/bibtex_badge.png" alt="Copy BibTeX" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                Copy Bibliography
              </button>
              
              <button 
                onClick={handleCopyLink}
                style={{ padding: '8px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', fontFamily: '"Noto Sans", sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <img src="/paper_clip_3d.png" alt="Copy link" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                {linkCopied ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>

          {/* Communities Section */}
          {communities.length > 0 && (
            <div translate="no" className="notranslate" style={{ 
              marginTop: '16px', 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '16px',
              width: '100%'
            }}>
              {communities.map((badgeId, idx) => {
                const labelInfo = labelsData.find(l => l.id === badgeId);
                if (labelInfo && labelInfo.image) {
                  return (
                    <div key={`badge-${idx}`} style={{ display: 'flex' }}>
                      <img 
                        src={labelInfo.image} 
                        alt={labelInfo.name} 
                        style={{ height: '7rem', width: 'auto', objectFit: 'contain' }} 
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}

        </div>
      </main>
      )}

      {/* Footer - NOT translatable */}
      <div translate="no" className="notranslate no-print">
        <Template1Footer onOpenInfo={setInfoModalOpen} />
      </div>

      {/* 3D Model Error Modal */}
      {modelError && (
        <AdsInfoModal 
          onClose={() => setModelError(null)}
          title="Error loading 3D model"
        >
          <div style={{ marginTop: '16px', color: '#000000', fontSize: '1rem', lineHeight: 1.5, fontFamily: '"Noto Sans", sans-serif' }}>
            <p>We're sorry. The 3D object is missing, broken, or corrupted. Unfortunately, we couldn't load it.</p>
            <p style={{ marginTop: '8px' }}>Try reloading.</p>
          </div>
        </AdsInfoModal>
      )}
    </div>
  );
}
