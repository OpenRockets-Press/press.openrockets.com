import { memo, useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faCode, faCube, faEye, faC } from '@fortawesome/free-solid-svg-icons';
import { faPython, faJs, faRust } from '@fortawesome/free-brands-svg-icons';
import { PDFCover } from "./PDFCover";

export interface RichArticleCardProps {
  article: any;
}

const TYPE_LABELS: Record<string, string> = {
  'research_paper': "Research",
  'software_code': "Software and Code",
  'code_gist': "Code Gist",
  '3d_artifact': "3D Artifact",
  '3d_model': "3D Model",
  'book': "Book",
  'magazine': "Magazine",
  'poster': "Poster",
  'other': "Other",
  'image': "Image",
  'Scienteen': "Scienteen Library of Science",
  'Software': "Software and Code",
  'Artifact3D': "3D Artifact",
  'ResearchPaper': "Research Paper"
};

const TYPE_IMAGE_PATHS: Record<string, string> = {
  'software_code': "/brand/software_icon.png",
  'Software': "/brand/software_icon.png",
  'code_gist': "/brand/software_icon.png",
  '3d_artifact': "/brand/3d artifcat.png.png",
  'Artifact3D': "/brand/3d artifcat.png.png",
  '3d_model': "/brand/3d artifcat.png.png",
  'Scienteen': "/brand/imagifact.png"
};

const CODE_BGS: Record<string, string> = {
  'Light Crimson': '#FFE4E8',
  'Light Pink': '#FFB6C1',
  'Pure White': '#FFFFFF',
  'Marble': '#F0EAD6',
  'Gray': '#E0E0E0'
};

const LANGUAGE_COLORS: Record<string, string> = {
  'python': "#3776AB",
  'javascript': "#F7DF1E",
  'js': "#F7DF1E",
  'rust': "#CE412B",
  'c': "#00599C",
  'cpp': "#00599C",
  'c++': "#00599C"
};

const LANGUAGE_ICONS: Record<string, any> = {
  'python': faPython,
  'javascript': faJs,
  'js': faJs,
  'rust': faRust,
  'c': faC,
  'cpp': faC,
  'c++': faC
};

const LICENSE_ICONS: Record<string, string> = {
  'Kangaroo': "/brand/licences/kangarooo.png",
  'Beaver': "/brand/licences/beaver,png.png",
  'Hummingbird': "/brand/licences/hummingbird.png",
  'CC': "/brand/licences/creativecommons_usethisforall.png",
};

function generateSlug(title: string, pubId: string) {
  const slug = (title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `/artifacts/${slug}-${pubId}`;
}

function DynamicCodePreview({ fileKey, fallbackSnippet, bgColor, textBase }: any) {
  const [codeLines, setCodeLines] = useState<string | null>(null);

  useEffect(() => {
    if (fileKey && fileKey !== 'null' && fileKey.trim() !== '') {
      fetch(`https://press.openrockets.com/storage/${fileKey}`)
        .then(res => res.text())
        .then(text => {
          const lines = text.split('\n').slice(0, 3).join('\n');
          setCodeLines(lines);
        })
        .catch(() => setCodeLines(fallbackSnippet));
    } else {
      setCodeLines(fallbackSnippet);
    }
  }, [fileKey, fallbackSnippet]);

  const displayCode = codeLines || fallbackSnippet || '// No preview available for this code artifact.';

  return (
    <div style={{ flex: 1, backgroundColor: bgColor, padding: '16px', color: textBase, fontFamily: 'monospace', fontSize: '16px', lineHeight: '1.4', overflow: 'hidden' }}>
      <pre style={{ margin: 0, opacity: 0.9, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        <code>{displayCode}</code>
      </pre>
    </div>
  );
}

function RichArticleCardComponent({ article }: RichArticleCardProps) {
  const navigate = useNavigate();
  const type = article.type || 'research_paper';

  let parsedTags: any[] = [];
  try {
    if (typeof article.tags === 'string') {
      parsedTags = JSON.parse(article.tags);
    } else if (Array.isArray(article.tags)) {
      parsedTags = article.tags;
    }
  } catch (e) {}

  parsedTags.sort((a, b) => {
    const aIsMain = typeof a === 'object' && a.isMain;
    const bIsMain = typeof b === 'object' && b.isMain;
    if (aIsMain && !bIsMain) return -1;
    if (!aIsMain && bIsMain) return 1;
    return 0;
  });

  const totalTags = parsedTags.length;
  const displayTags = totalTags > 5 ? parsedTags.slice(0, 4) : parsedTags;

  const isCode = type === 'software_code' || type === 'code_gist' || type === 'Software';
  const is3D = type === '3d_artifact' || type === '3d_model' || type === 'Artifact3D';
  const isImage = type === 'image';

  const renderPreview = () => {
    if (isCode) {
      const lang = (article.primaryLanguage || article.metadata?.language || 'code').toLowerCase();
      const fileExt = article.fileStorageKey ? article.fileStorageKey.split('.').pop() : '';
      let headerLang = lang && lang !== 'code' ? lang : (fileExt ? `.${fileExt}` : 'Code');
      
      const IconComponent = LANGUAGE_ICONS[lang] || faCode;
      const langColor = LANGUAGE_COLORS[lang] || '#569cd6';
      
      const bgName = article.metadata?.codeBackground || 'Pure White';
      const bgColor = CODE_BGS[bgName] || '#FFFFFF';
      const textBase = '#333333';

      const rawSnippet = article.codeSnippet || article.metadata?.codeSnippet;

      return (
        <div style={{ height: '220px', display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e', overflow: 'hidden', position: 'relative', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
          <div style={{ padding: '16px 16px 8px 16px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <FontAwesomeIcon icon={IconComponent} style={{ color: langColor, fontSize: '16px' }} />
            <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '14px', textTransform: 'capitalize' }}>{headerLang}</span>
          </div>
          <DynamicCodePreview 
            fileKey={article.fileStorageKey} 
            fallbackSnippet={rawSnippet} 
            bgColor={bgColor} 
            textBase={textBase} 
          />
        </div>
      );
    }
    
    if (is3D) {
      const previewUrl = article.previewStorageKey ? `https://press.openrockets.com/storage/${article.previewStorageKey}` : (article.mainImage || '/brand/imagifact.png');
      return (
        <div style={{ height: '220px', position: 'relative', backgroundColor: '#f0f0f0', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', overflow: 'hidden' }}>
          <img src={previewUrl} alt="3D Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div className="threed-icon-container" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#ffffff', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <img src="/brand/3d artifcat.png.png" alt="3D Indicator" className="threed-icon-image" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <span className="threed-hover-text">3D</span>
          </div>
        </div>
      );
    }

    let extraImages: any[] = [];
    try {
      if (article.extraFiles) {
        extraImages = typeof article.extraFiles === 'string' ? JSON.parse(article.extraFiles) : article.extraFiles;
      }
    } catch(e) {}

    const hasMultipleImages = (article.mainImage && (article.sideImage1 || article.sideImage2)) || (extraImages && extraImages.length > 0);

    if (hasMultipleImages) {
      const mainImg = article.mainImage || `https://press.openrockets.com/storage/${article.coverStorageKey || article.previewStorageKey}`;
      const side1 = article.sideImage1 || (extraImages[0] ? `https://press.openrockets.com/storage/${extraImages[0]}` : mainImg);
      const side2 = article.sideImage2 || (extraImages[1] ? `https://press.openrockets.com/storage/${extraImages[1]}` : mainImg);

      return (
        <div className="rich-article-collage">
          <div className="collage-main">
            <img src={mainImg} alt="Main Collage" />
          </div>
          <div className="collage-side">
            <img src={side1} alt="Top Collage" />
            <img src={side2} alt="Bottom Collage" />
          </div>
        </div>
      );
    }

    if ((type === 'research_paper' || type === 'ResearchPaper') && !article.previewStorageKey && article.fileStorageKey && article.fileStorageKey !== 'null' && article.fileStorageKey.trim() !== '') {
      const pdfUrl = `https://press.openrockets.com/storage/${article.fileStorageKey}`;
      return (
        <div className="rich-article-collage" style={{ height: '220px', position: 'relative', backgroundColor: '#f0f0f0', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', overflow: 'hidden' }}>
          <PDFCover url={pdfUrl} />
        </div>
      );
    }

    const previewUrl = article.previewStorageKey 
      ? `https://press.openrockets.com/storage/${article.previewStorageKey}` 
      : article.coverStorageKey 
        ? `https://press.openrockets.com/storage/${article.coverStorageKey}`
        : (article.mainImage || '/brand/imagifact.png');

    return (
      <div className="rich-article-collage" style={{ height: '220px', position: 'relative', backgroundColor: '#f0f0f0', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', overflow: 'hidden' }}>
        <img src={previewUrl} alt="Artifact Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  };

  const rawLicense = article.license || article.metadata?.license;
  let cleanLicense = '';
  let iconLicense = '';
  let licenseLink = '';
  
  if (rawLicense) {
    if (rawLicense === 'ORP_EAGLE') {
      cleanLicense = 'Hummingbird';
      iconLicense = 'Hummingbird';
      licenseLink = 'hummingbird';
    } else if (rawLicense === 'ORP_BEAVER') {
      cleanLicense = 'Beaver';
      iconLicense = 'Beaver';
      licenseLink = 'beaver';
    } else if (rawLicense === 'ORP_KANGAROO') {
      cleanLicense = 'Kangaroo';
      iconLicense = 'Kangaroo';
      licenseLink = 'kangaroo';
    } else if (rawLicense.toLowerCase() === 'cc') {
      cleanLicense = 'CC';
      iconLicense = 'CC';
      licenseLink = 'cc';
    } else {
      cleanLicense = rawLicense.replace('ORP_', '').trim();
      iconLicense = cleanLicense.charAt(0).toUpperCase() + cleanLicense.slice(1).toLowerCase();
      licenseLink = cleanLicense.toLowerCase();
    }
  }

  return (
    <div className="rich-article-card" data-testid="publication-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {renderPreview()}
      
      <div className="rich-article-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '16px' }}>
        
        {/* AUTHOR TOP ROW */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', minWidth: 0 }}>
          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${article.authorName || 'User'}`} alt="Author" style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{article.authorName || 'Unknown Author'}</span>
        </div>

        {/* ARTIFACT TYPE & LICENSE BADGES */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap', position: 'relative', zIndex: 2 }}>
          <button 
            type="button"
            className="artifact-type-badge"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', backgroundColor: 'var(--panel)', borderRadius: '6px', fontSize: '11px', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {type === 'research_paper' || type === 'ResearchPaper' ? (
              <FontAwesomeIcon icon={faFileAlt} />
            ) : TYPE_IMAGE_PATHS[type] ? (
              <img src={TYPE_IMAGE_PATHS[type]} alt={TYPE_LABELS[type]} style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
            ) : (
              <FontAwesomeIcon icon={faCube} />
            )}
            {TYPE_LABELS[type] || 'Artifact'}
          </button>
          
          {cleanLicense && (
            <Link 
              to={`/licenses/${encodeURIComponent(licenseLink)}` as any}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#007185', fontWeight: 'bold', textDecoration: 'none', backgroundColor: '#e9ecef', padding: '4px 8px', borderRadius: '6px' }}
            >
              <img 
                src={LICENSE_ICONS[iconLicense] || "/brand/licences/creativecommons_usethisforall.png"} 
                alt={`${cleanLicense} License`}
                style={{ width: '14px', height: '14px', objectFit: 'contain' }}
              />
              {cleanLicense}
            </Link>
          )}
        </div>

        <h3 className="card-title" style={{ fontSize: "1rem", marginBottom: "4px", lineHeight: "1.2" }}>
          {article.title}
        </h3>
        
        <p className="card-description" style={{ fontSize: "0.8rem", color: "#444", lineHeight: "1.4", marginBottom: "10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {article.subtitle || article.description}
        </p>
        
        {/* HASHTAGS (Original Format with Limiting) */}
        <div className="rich-tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px', position: 'relative', zIndex: 2 }}>
          {displayTags.map((tagObj, idx) => {
            const tagName = typeof tagObj === 'string' ? tagObj : (tagObj.name || String(tagObj));
            const isMain = typeof tagObj === 'object' && tagObj.isMain;
            return (
              <span 
                key={`${tagName}-${idx}`}
                className={`rich-tag notranslate ${isMain ? 'tag-main' : 'tag-normal'}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate({ to: `/hashtag/${encodeURIComponent(tagName)}` });
                }}
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '12px', fontSize: '10px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
                {tagName}
              </span>
            );
          })}
          {totalTags > 5 && (
            <span 
              className="rich-tag tag-normal"
              style={{ cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '12px', fontSize: '10px' }}
            >
              +{totalTags - 4} more
            </span>
          )}
        </div>

        {/* VIEWS SECTION AT THE BOTTOM */}
        <div className="rich-article-meta" style={{ marginTop: 'auto', display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
          
          <div className="rich-rating" style={{ display: "flex", alignItems: "center", gap: "4px", visibility: article.rating ? 'visible' : 'hidden' }}>
            <div style={{ display: "flex", color: "#F59E0B" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <span style={{ fontSize: "0.75rem", color: "#007185", fontWeight: 500 }}>{article.rating || '4.5'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {article.comments !== undefined && (
              <div className="rich-comments" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <Link to="/" style={{ fontSize: "0.75rem", color: "#007185", textDecoration: "underline", fontWeight: 500 }}>{article.comments} comments</Link>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '12px', fontWeight: 'bold' }}>
              <FontAwesomeIcon icon={faEye} />
              <span>{article.viewCount || article.views || 0} views</span>
            </div>
          </div>

        </div>

      </div>
      
      {/* Click Overlay */}
      <Link 
        to={generateSlug(article.title, article.pubId || article.id) as any}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
        aria-label={`View ${article.title}`}
      />
    </div>
  );
}

export const RichArticleCard = memo(RichArticleCardComponent);
