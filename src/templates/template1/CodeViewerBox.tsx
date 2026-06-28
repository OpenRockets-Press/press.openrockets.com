import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Spinner } from '@/components/ui/Spinner';

interface CodeFile {
  name: string;
  content: string;
  language: string;
}

interface CodeViewerBoxProps {
  files: CodeFile[];
  license?: string;
}

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'rb': 'ruby',
    'php': 'php',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'sh': 'shell',
    'bash': 'shell',
    'sql': 'sql',
    'swift': 'swift',
    'kt': 'kotlin',
    'r': 'r',
    'txt': 'plaintext',
    'zip': 'plaintext',
    'rar': 'plaintext',
  };
  return langMap[ext] || 'plaintext';
}

export function CodeViewerBox({ files, license = 'Creative Commons BY-NC 4.0' }: CodeViewerBoxProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [activeIdx]);

  const activeFile = files[activeIdx];

  return (
    <div style={{
      width: '100%',
      border: '1px solid #000',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#1e1e1e',
        padding: '8px 16px',
        gap: '8px',
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f57' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#febc2e' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#28c840' }} />
        </div>
        <span style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '0.8rem', color: '#999', marginLeft: '12px' }}>
          {activeFile?.name || 'Code Viewer'}
        </span>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: '450px' }}>
        {/* Sidebar - file list */}
        <div style={{
          width: '200px',
          minWidth: '200px',
          backgroundColor: '#f5f5f5',
          borderRight: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}>
          <div style={{
            padding: '10px 14px',
            fontFamily: '"Noto Sans", sans-serif',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderBottom: '1px solid #e0e0e0',
          }}>
            Files
          </div>
          {files.map((file, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                borderBottom: '1px solid #eee',
                backgroundColor: activeIdx === idx ? '#fff' : 'transparent',
                borderLeft: activeIdx === idx ? '3px solid #000' : '3px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: '"Noto Sans", sans-serif',
                fontSize: '0.85rem',
                color: activeIdx === idx ? '#000' : '#444',
                fontWeight: activeIdx === idx ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>
                {file.name.endsWith('.zip') || file.name.endsWith('.rar') ? '📦' : '📄'}
              </span>
              <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {file.name}
              </span>
            </button>
          ))}
        </div>

        {/* Code editor area */}
        <div style={{ flex: 1, position: 'relative' }}>
          {isLoading && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}>
              <Spinner color="#0067b8" />
            </div>
          )}
          <Editor
            height="100%"
            language={activeFile?.language || 'plaintext'}
            value={activeFile?.content || ''}
            theme="light"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", monospace',
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              renderLineHighlight: 'none',
              padding: { top: 12 },
              domReadOnly: true,
              contextmenu: false,
            }}
            onMount={() => setIsLoading(false)}
          />
        </div>
      </div>

      {/* Status bar - VS Code style */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1e1e1e',
        padding: '4px 16px',
        borderTop: '1px solid #333',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '0.75rem', color: '#ccc' }}>
            {activeFile?.language?.toUpperCase() || 'PLAIN TEXT'}
          </span>
          <span style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '0.75rem', color: '#ccc' }}>
            UTF-8
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/brand/licences/creativecommons_usethisforall.png" alt="License" style={{ width: '14px', height: '14px' }} />
          <span style={{ fontFamily: '"Noto Sans", sans-serif', fontSize: '0.75rem', color: '#ccc' }}>
            {license}
          </span>
        </div>
      </div>
    </div>
  );
}
