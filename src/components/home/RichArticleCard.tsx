import { memo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faCode, faCube, faPaw, faScaleBalanced, faEye } from '@fortawesome/free-solid-svg-icons';
import { faPython, faJs, faRust, faCreativeCommons, faGolang } from '@fortawesome/free-brands-svg-icons';
import { clsx } from "clsx";

export interface RichArticleCardProps {
  article: any; // We'll type this properly later when we map it
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
  'image': "Image"
};

const TYPE_IMAGE_PATHS: Record<string, string> = {
  'software_code': "/brand/software_icon.png",
  'code_gist': "/brand/software_icon.png",
  '3d_artifact': "/brand/3d_icon.png",
  '3d_model': "/brand/3d_icon.png",
};

const LICENSE_ICONS: Record<string, string> = {
  'ORP_KANGAROO': "/brand/licences/kangarooo.png",
  'ORP_BEAVER': "/brand/licences/beaver,png.png",
  'ORP_EAGLE': "/brand/licences/hummingbird.png",
};

const LANGUAGE_COLORS: Record<string, string> = {
  'python': "#3776AB",
  'javascript': "#F7DF1E",
  'typescript': "#3178C6",
  'rust': "#CE412B",
  'c': "#00599C",
  'cpp': "#00599C",
  'zip': "#F6B26B"
};

const LANGUAGE_ICONS: Record<string, any> = {
  'python': faPython,
  'javascript': faJs,
  'typescript': faJs, // no TS icon in free brands sometimes, use JS
  'rust': faRust,
  'c': faCode,
  'cpp': faCode,
  'zip': faFileAlt
};

function RichArticleCardComponent({ article }: RichArticleCardProps) {
  const navigate = useNavigate();
  const type = article.type || 'research_paper';

  // Parse tags
  let parsedTags: string[] = [];
  try {
    if (typeof article.tags === 'string') parsedTags = JSON.parse(article.tags);
    else if (Array.isArray(article.tags)) parsedTags = article.tags;
  } catch (e) {}

  const isCode = type === 'software_code' || type === 'code_gist';
  const is3D = type === '3d_artifact' || type === '3d_model';
  
  const renderPreview = () => {
    if (isCode) {
      const lang = article.primaryLanguage?.toLowerCase() || 'code';
      const IconComponent = LANGUAGE_ICONS[lang] || faCode;
      const langColor = LANGUAGE_COLORS[lang] || '#569cd6';
      const bgColor = '#FFFFFF';

      const snippet = article.codeSnippet || `// No preview available for this code artifact.`;

      return (
        <div style={{ height: '220px', display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e', overflow: 'hidden', position: 'relative', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
          <div style={{ padding: '16px 16px 8px 16px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <FontAwesomeIcon icon={IconComponent} style={{ color: langColor, fontSize: '16px' }} />
            <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '14px', textTransform: 'capitalize' }}>{lang}</span>
          </div>
          <div style={{ flex: 1, backgroundColor: bgColor, padding: '16px', color: '#333', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.4', overflow: 'hidden' }}>
            <pre style={{ margin: 0, opacity: 0.9, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              <code>{snippet}</code>
            </pre>
          </div>
        </div>
      );
    }
    
    if (is3D) {
      const previewUrl = article.previewStorageKey ? `https://press.openrockets.com/storage/${article.previewStorageKey}` : '/brand/imagifact.png';
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

    // Default Preview (PDF or Image)
    const previewUrl = article.previewStorageKey 
      ? `https://press.openrockets.com/storage/${article.previewStorageKey}` 
      : article.coverStorageKey 
        ? `https://press.openrockets.com/storage/${article.coverStorageKey}`
        : '/brand/imagifact.png';

    return (
      <div className="rich-article-collage" style={{ height: '220px', position: 'relative', backgroundColor: '#f0f0f0', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', overflow: 'hidden' }}>
        <img src={previewUrl} alt="Artifact Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  };

  return (
    <div className="rich-article-card" data-testid="publication-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {renderPreview()}
      
      <div className="rich-article-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '16px' }}>
        
        {/* AUTHOR & CATEGORY TOP ROW */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${article.authorName || 'User'}`} alt="Author" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>{article.authorName || 'Unknown Author'}</span>
          <span style={{ fontSize: '12px', color: '#999', margin: '0 4px' }}>&bull;</span>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#007185', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {article.division || 'Artifacts'}
          </span>
        </div>

        {isCode && article.license && (
          <Link 
            to={`/licenses/${encodeURIComponent(article.license.toLowerCase())}` as any}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#007185', fontWeight: 'bold', textDecoration: 'none', marginBottom: '8px', position: 'relative', zIndex: 2 }}
          >
            <img 
              src={LICENSE_ICONS[article.license] || "/brand/licences/creativecommons_usethisforall.png"} 
              alt={`${article.license} License`}
              style={{ width: '16px', height: '16px', objectFit: 'contain' }}
            />
            {article.license.replace('ORP_', '')} License
          </Link>
        )}

        <h3 className="card-title" style={{ fontSize: "1rem", marginBottom: "4px", lineHeight: "1.2" }}>
          {article.title}
        </h3>
        
        {article.subtitle && (
          <p className="card-description" style={{ fontSize: "0.8rem", color: "#444", lineHeight: "1.4", marginBottom: "10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {article.subtitle}
          </p>
        )}
        
        {/* HASHTAGS (Categories vs General) */}
        <div className="rich-tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px', position: 'relative', zIndex: 2 }}>
          {parsedTags.map((tag, idx) => (
            <span 
              key={`${tag}-${idx}`}
              className="rich-tag tag-normal"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate({ to: `/hashtag/${encodeURIComponent(tag)}` });
              }}
              style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', backgroundColor: '#e9ecef', color: '#495057' }}
            >
              <span style={{ color: '#007185' }}>#</span>
              {tag}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 'auto', marginBottom: '8px', position: 'relative', zIndex: 2 }}>
          <button 
            type="button"
            className="artifact-type-badge"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', backgroundColor: 'var(--panel)', borderRadius: '6px', fontSize: '11px', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {type === 'research_paper' ? (
              <FontAwesomeIcon icon={faFileAlt} />
            ) : TYPE_IMAGE_PATHS[type] ? (
              <img src={TYPE_IMAGE_PATHS[type]} alt={TYPE_LABELS[type]} style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
            ) : (
              <FontAwesomeIcon icon={faCube} />
            )}
            {TYPE_LABELS[type] || 'Artifact'}
          </button>
        </div>

        {/* VIEWS SECTION AT THE BOTTOM */}
        <div className="rich-article-meta" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '12px', fontWeight: 'bold' }}>
            <FontAwesomeIcon icon={faEye} />
            <span>{article.viewCount || 0} views</span>
          </div>
        </div>

      </div>
      
      {/* Click Overlay */}
      <Link 
        to={`/artifact/${article.pubId || article.id}` as any}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
        aria-label={`View ${article.title}`}
      />
    </div>
  );
}

export const RichArticleCard = memo(RichArticleCardComponent);
