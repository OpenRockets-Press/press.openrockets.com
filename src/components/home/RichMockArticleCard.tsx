import { memo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArtifactType, LicenseType, ProgrammingLanguage } from "@/lib/mockArticles";
import type { MockArticle } from "@/lib/mockArticles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faCode, faCube, faImage, faOtter, faDove, faPaw, faScaleBalanced, faC } from '@fortawesome/free-solid-svg-icons';
import { faPython, faJs, faRust, faCreativeCommons, faGolang } from '@fortawesome/free-brands-svg-icons';

interface RichMockArticleCardProps {
  article: MockArticle;
}

const TYPE_LABELS = {
  [ArtifactType.ResearchPaper]: "Research",
  [ArtifactType.Software]: "Software and Code",
  [ArtifactType.Artifact3D]: "3D Artifact",
  [ArtifactType.Scienteen]: "Scienteen Library of Science",
};
const TYPE_IMAGE_PATHS: Record<string, string> = {
  [ArtifactType.Software]: "/brand/software_icon.png",
  [ArtifactType.Artifact3D]: "/brand/3d_icon.png",
  [ArtifactType.Scienteen]: "/brand/imagifact.png",
};

const CODE_BGS: Record<string, string> = {
  'Light Crimson': '#FFE4E8',
  'Light Pink': '#FFB6C1',
  'Pure White': '#FFFFFF',
  'Marble': '#F0EAD6',
  'Gray': '#E0E0E0'
};

const LICENSE_ICONS: Record<string, string> = {
  [LicenseType.Kangaroo]: "/brand/licences/kangarooo.png",
  [LicenseType.Beaver]: "/brand/licences/beaver,png.png",
  [LicenseType.Hummingbird]: "/brand/licences/hummingbird.png",
  [LicenseType.CC]: "/brand/licences/creativecommons_usethisforall.png",
};

const LANGUAGE_COLORS: Record<string, string> = {
  [ProgrammingLanguage.Python]: "#3776AB",
  [ProgrammingLanguage.JS]: "#F7DF1E",
  [ProgrammingLanguage.Rust]: "#CE412B", // Orange/Red
  [ProgrammingLanguage.C]: "#00599C", // Blue
  [ProgrammingLanguage.Cpp]: "#00599C", // Blue
};

const LANGUAGE_ICONS: Record<string, any> = {
  [ProgrammingLanguage.Python]: faPython,
  [ProgrammingLanguage.JS]: faJs,
  [ProgrammingLanguage.Rust]: faRust,
  [ProgrammingLanguage.C]: faC,
  [ProgrammingLanguage.Cpp]: faC,
};

function RichMockArticleCardComponent({ article }: RichMockArticleCardProps) {
  const navigate = useNavigate();
  const type = article.type || ArtifactType.Scienteen;

  const renderPreview = () => {
    if (type === ArtifactType.Software) {
      const lang = article.metadata?.language as ProgrammingLanguage;
      const IconComponent = lang ? LANGUAGE_ICONS[lang] : faCode;
      const langColor = lang ? LANGUAGE_COLORS[lang] : '#569cd6';
      
      const bgName = article.metadata?.codeBackground || 'Pure White';
      const bgColor = CODE_BGS[bgName] || '#FFFFFF';

      const textBase = '#333333';
      const keyword = '#0000ff';
      const stringCol = '#a31515';
      const funcCol = '#795e26';
      const control = '#af00db';

      return (
        <div style={{ height: '220px', display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e', overflow: 'hidden', position: 'relative', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
          <div style={{ padding: '16px 16px 8px 16px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <FontAwesomeIcon icon={IconComponent || faCode} style={{ color: langColor, fontSize: '16px' }} />
            <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '14px' }}>{lang || 'Code'}</span>
          </div>
          <div style={{ flex: 1, backgroundColor: bgColor, padding: '16px', color: textBase, fontFamily: 'monospace', fontSize: '24px', lineHeight: '1.4', overflow: 'hidden' }}>
            <pre style={{ margin: 0, opacity: 0.9 }}>
              <code style={{ display: 'block' }}>
                <span style={{ color: keyword }}>import</span> {'{'} optimize {'}'} <span style={{ color: keyword }}>from</span> <span style={{ color: stringCol }}>'@ffmpeg/core'</span>;<br/>
                <br/>
                <span style={{ color: keyword }}>async function</span> <span style={{ color: funcCol }}>processStream</span>(input) {'{'}<br/>
                &nbsp;&nbsp;<span style={{ color: keyword }}>const</span> buffer = <span style={{ color: control }}>await</span> optimize(input);<br/>
                &nbsp;&nbsp;<span style={{ color: control }}>return</span> buffer;<br/>
                {'}'}
              </code>
            </pre>
          </div>
        </div>
      );
    }
    
    if (type === ArtifactType.Artifact3D) {
      return (
        <div style={{ height: '220px', position: 'relative', backgroundColor: '#f0f0f0', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', overflow: 'hidden' }}>
          <img src={article.mainImage} alt="3D Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div className="threed-icon-container" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#ffffff', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <img src="/brand/3d artifcat.png.png" alt="3D Indicator" className="threed-icon-image" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <span className="threed-hover-text">3D</span>
          </div>
        </div>
      );
    }

    // Default collage (Scienteen / ResearchPaper)
    return (
      <div className="rich-article-collage">
        <div className="collage-main">
          <img src={article.mainImage} alt="Main Collage" />
        </div>
        <div className="collage-side">
          <img src={article.sideImage1} alt="Top Collage" />
          <img src={article.sideImage2} alt="Bottom Collage" />
        </div>
      </div>
    );
  };

  return (
    <div className="rich-article-card" data-testid="publication-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {renderPreview()}
      
      <div className="rich-article-content" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {type === ArtifactType.Software && article.metadata?.license && (
          <Link 
            to={`/licenses/${encodeURIComponent(article.metadata.license.toLowerCase())}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#007185', fontWeight: 'bold', textDecoration: 'none', marginBottom: '8px' }}
          >
            <img 
              src={LICENSE_ICONS[article.metadata.license as LicenseType] || "/brand/licences/creativecommons_usethisforall.png"} 
              alt={`${article.metadata.license} License`}
              style={{ width: '16px', height: '16px', objectFit: 'contain' }}
            />
            {article.metadata.license} License
          </Link>
        )}

        <h3 className="card-title" style={{ fontSize: "1rem", marginBottom: "4px", lineHeight: "1.2" }}>
          {article.title}
        </h3>
        <p className="card-description" style={{ fontSize: "0.8rem", color: "#444", lineHeight: "1.4", marginBottom: "10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {article.description}
        </p>
        
        <div className="rich-tags-container">
          {article.tags.map((tag, idx) => (
            <span 
              key={`${tag.name}-${idx}`}
              className={`rich-tag notranslate ${tag.isMain ? 'tag-main' : 'tag-normal'}`}
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

        <div style={{ marginTop: 'auto', marginBottom: '8px' }}>
          <button 
            type="button"
            className="artifact-type-badge"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', backgroundColor: 'var(--panel)', borderRadius: '6px', fontSize: '11px', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {type === ArtifactType.ResearchPaper ? (
              <FontAwesomeIcon icon={faFileAlt} />
            ) : (
              <img src={TYPE_IMAGE_PATHS[type]} alt={TYPE_LABELS[type]} style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
            )}
            {TYPE_LABELS[type]}
          </button>
        </div>

        <div className="rich-article-meta" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
          <div className="rich-rating" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ display: "flex", color: "#F59E0B" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <span style={{ fontSize: "0.75rem", color: "#007185", fontWeight: 500 }}>{article.rating}</span>
          </div>

          <div className="rich-comments" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <Link to="/" style={{ fontSize: "0.75rem", color: "#007185", textDecoration: "underline", fontWeight: 500 }}>{article.comments} comments</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const RichMockArticleCard = memo(RichMockArticleCardComponent);
