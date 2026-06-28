import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Spinner } from '@/components/ui/Spinner';
import { AdsInfoModal } from '@/components/ui/AdsInfoModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faJs, 
  faCss3, 
  faHtml5, 
  faPython, 
  faJava, 
  faMarkdown, 
  faReact,
  faNodeJs
} from '@fortawesome/free-brands-svg-icons';
import { faFileCode, faFileLines, faFileArchive, faFileImage, faChevronRight, faChevronDown, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import { Archive } from 'libarchive.js';

Archive.init({
    workerUrl: '/worker-bundle.js'
});

export interface InitialCodeFile {
  url: string;
  name: string;
}

interface CodeViewerBoxProps {
  initialFiles: InitialCodeFile[];
  licenseName: string;
  licenseIcon?: string;
  licenseLink?: string;
}

type FileNode = {
  id: string;
  name: string;
  content?: string;
  language?: string;
  icon: any;
  isArchive?: boolean;
  isExpanded?: boolean;
  isExtracted?: boolean;
  isTooLarge?: boolean;
  url?: string; // used to fetch if it's an archive or an independent file
  fileObj?: any;
  children?: FileNode[];
};

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'mjs':
    case 'cjs':
      return faJs;
    case 'jsx':
    case 'tsx':
      return faReact;
    case 'ts':
      return faJs;
    case 'css':
      return faCss3;
    case 'html':
      return faHtml5;
    case 'py':
      return faPython;
    case 'java':
      return faJava;
    case 'md':
      return faMarkdown;
    case 'json':
      return faNodeJs;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return faFileImage;
    case 'zip':
    case 'rar':
    case 'tar':
    case 'gz':
    case '7z':
      return faFileArchive;
    case 'txt':
      return faFileLines;
    default:
      return faFileCode;
  }
};

const getLanguage = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': case 'jsx': case 'mjs': return 'javascript';
    case 'ts': case 'tsx': return 'typescript';
    case 'css': return 'css';
    case 'html': return 'html';
    case 'json': return 'json';
    case 'md': return 'markdown';
    case 'py': return 'python';
    case 'java': return 'java';
    case 'cpp': case 'cc': return 'cpp';
    case 'c': return 'c';
    case 'go': return 'go';
    case 'rs': return 'rust';
    case 'rb': return 'ruby';
    case 'php': return 'php';
    case 'sh': return 'bash';
    case 'sql': return 'sql';
    case 'xml': return 'xml';
    case 'yaml': case 'yml': return 'yaml';
    default: return 'text';
  }
};

export function CodeViewerBox({ initialFiles, licenseName, licenseIcon, licenseLink }: CodeViewerBoxProps) {
  const [nodes, setNodes] = useState<FileNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the root nodes based on initialFiles
    const initNodes = initialFiles.map((file, idx) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isArchive = ['zip', 'rar', 'tar', 'gz', '7z'].includes(ext);
      return {
        id: `root-${idx}`,
        name: file.name,
        icon: getFileIcon(file.name),
        isArchive,
        isExpanded: false,
        isExtracted: false,
        url: file.url,
        children: []
      } as FileNode;
    });
    setNodes(initNodes);
  }, [initialFiles]);

  const extractArchive = async (node: FileNode) => {
    if (!node.url) return [];
    
    const response = await fetch(node.url);
    if (!response.ok) throw new Error('Failed to fetch archive file');
    
    const blob = await response.blob();
    const file = new File([blob], node.name, { type: blob.type });

    const archive = await Archive.open(file);
    await archive.extractFiles();
    const fileArray = await archive.getFilesArray();
    
    const loadedFiles: FileNode[] = [];
    let count = 0;

    for (const item of fileArray) {
      if (count >= 1000) break;
      const f = item.file as any;
      const name = f.name || "unknown";
      if (!name.includes('__MACOSX') && !name.startsWith('.')) {
        loadedFiles.push({
          id: `extracted-${count++}-${name}`,
          name: name,
          language: getLanguage(name),
          icon: getFileIcon(name),
          fileObj: f
        });
      }
    }

    return loadedFiles;
  };

  const handleNodeClick = async (node: FileNode) => {
    setActiveFileId(node.id);

    if (node.isArchive) {
      if (!node.isExtracted) {
        // Extract it now
        try {
          setIsLoading(true);
          setError(null);
          const children = await extractArchive(node);
          
          setNodes(prev => {
            const newNodes = [...prev];
            const targetNode = newNodes.find(n => n.id === node.id);
            if (targetNode) {
              targetNode.isExtracted = true;
              targetNode.isExpanded = true;
              targetNode.children = children;
            }
            return newNodes;
          });
        } catch (err: any) {
          console.error("Extraction error:", err);
          setError(err.message || "Extraction failed");
        } finally {
          setIsLoading(false);
        }
      } else {
        // Just toggle expansion
        setNodes(prev => {
          const newNodes = [...prev];
          const targetNode = newNodes.find(n => n.id === node.id);
          if (targetNode) {
            targetNode.isExpanded = !targetNode.isExpanded;
          }
          return newNodes;
        });
      }
    } else {
      // It's an independent file or extracted file
      // If we haven't fetched its content yet
      if (!node.content) {
        try {
          setIsLoading(true);
          setError(null);
          let text = "";

          let isTooLarge = false;

          if (node.fileObj) {
            let extractedFile = node.fileObj;
            if (typeof extractedFile.extract === 'function') {
               extractedFile = await extractedFile.extract();
            }
            if (extractedFile.size > 500 * 1024) {
               isTooLarge = true;
            } else {
               text = await extractedFile.text();
            }
          } else if (node.url) {
            const res = await fetch(node.url);
            text = await res.text();
          }

          if (text || text === "" || isTooLarge) {
            setNodes(prev => {
              const newNodes = [...prev];
              const updateDeepNode = (nodesList: FileNode[]): boolean => {
                for (const n of nodesList) {
                  if (n.id === node.id) {
                    n.content = text;
                    n.language = getLanguage(node.name);
                    n.isTooLarge = isTooLarge;
                    return true;
                  }
                  if (n.children && updateDeepNode(n.children)) return true;
                }
                return false;
              };
              updateDeepNode(newNodes);
              return newNodes;
            });
          }
        } catch (err) {
          console.error("Fetch file failed", err);
          setError("Failed to read file");
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  // Helper to flatten tree for rendering sidebar
  const renderSidebarNodes = () => {
    const renderNode = (node: FileNode, depth = 0): JSX.Element[] => {
      const items = [];
      const isActive = node.id === activeFileId;
      
      items.push(
        <button
          key={node.id}
          onClick={() => handleNodeClick(node)}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: `8px 16px 8px ${16 + (depth * 16)}px`,
            backgroundColor: '#ffffff',
            border: 'none',
            borderLeft: isActive ? '3px solid #000' : '3px solid transparent',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontFamily: 'monospace',
            color: '#000',
            transition: 'border-left 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: isActive ? 700 : 400
          }}
        >
          {node.isArchive && (
            <FontAwesomeIcon 
              icon={node.isExpanded ? faChevronDown : faChevronRight} 
              style={{ width: '12px', height: '12px', marginRight: '4px' }} 
            />
          )}
          <FontAwesomeIcon icon={node.icon} style={{ width: '16px', height: '16px' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {node.name}
          </span>
        </button>
      );

      if (node.isExpanded && node.children) {
        for (const child of node.children) {
          items.push(...renderNode(child, depth + 1));
        }
      }

      return items;
    };

    return nodes.flatMap(n => renderNode(n, 0));
  };

  // Find active node for rendering in editor
  let activeNode: FileNode | undefined;
  const findNode = (list: FileNode[]) => {
    for (const n of list) {
      if (n.id === activeFileId) {
        activeNode = n;
        return;
      }
      if (n.children) findNode(n.children);
    }
  };
  findNode(nodes);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%', 
      height: '600px', 
      border: '1px solid #000', 
      backgroundColor: '#ffffff',
      fontFamily: '"Noto Sans", sans-serif',
      position: 'relative'
    }}>
      {isLoading && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#ffffff', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner color="#0067b8" />
        </div>
      )}
      
      {error && !isLoading && (
        <AdsInfoModal 
          onClose={() => setError(null)}
          title="Error"
        >
          <div style={{ marginTop: '16px', color: '#000000', fontSize: '1rem', lineHeight: 1.5, fontFamily: '"Noto Sans", sans-serif' }}>
            <p>We are sorry, something wrong with this edit. Something wrong happened.</p>
            <p style={{ marginTop: '8px' }}>Please refresh the page to continue.</p>
          </div>
        </AdsInfoModal>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', backgroundColor: '#ffffff' }}>
        {/* Sidebar */}
        <div style={{ width: '250px', borderRight: '1px solid #000', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {renderSidebarNodes()}
          </div>
        </div>
        
        {/* Editor Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#faf8f0' }}>
          {activeNode ? (
            <>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #000', backgroundColor: '#faf8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={activeNode.icon} style={{ color: '#000' }} />
                <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#000' }}>
                  {activeNode.name}
                </span>
              </div>
              <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#faf8f0', display: 'flex', flexDirection: 'column' }}>
                {activeNode.isArchive ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <span style={{ color: '#666', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                      {activeNode.isExtracted ? "" : "Archive selected. Click to extract contents."}
                    </span>
                  </div>
                ) : activeNode.isTooLarge ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '16px' }}>
                    <span style={{ color: '#000', fontFamily: '"Noto Sans", sans-serif', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FontAwesomeIcon icon={faInfoCircle} />
                      This file is too large to render, please click download all to download this
                    </span>
                    <button 
                      style={{ padding: '8px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', fontFamily: '"Noto Sans", sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <img src="/paper_clip_3d.png" alt="Download all" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                      Download all
                    </button>
                  </div>
                ) : (
                  <SyntaxHighlighter 
                    language={activeNode.language} 
                    style={prism}
                    customStyle={{ margin: 0, padding: '16px', fontSize: '0.9rem', backgroundColor: '#faf8f0', minHeight: '100%' }}
                    showLineNumbers={true}
                  >
                    {activeNode.content || ""}
                  </SyntaxHighlighter>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#666', fontFamily: 'monospace', fontSize: '0.95rem' }}></span>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div style={{ 
        height: '32px', 
        backgroundColor: '#ffffff', 
        color: '#000', 
        borderTop: '1px solid #000',
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 16px',
        fontSize: '0.85rem',
        fontWeight: 500,
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {licenseIcon && (
            <img src={licenseIcon} alt={licenseName} style={{ height: '16px', objectFit: 'contain' }} />
          )}
          {licenseName}
          <a href={licenseLink || "/licenses"} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#000', marginLeft: '4px' }}>License Information</a>
        </div>
        <div style={{ flex: 1 }}></div>
        {activeNode && !activeNode.isArchive && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FontAwesomeIcon icon={activeNode.icon} />
            {activeNode.language}
          </div>
        )}
      </div>
    </div>
  );
}
