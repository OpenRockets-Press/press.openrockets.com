import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Spinner } from '@/components/ui/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerBoxProps {
  files: string[];
}

export function PDFViewerBox({ files }: PDFViewerBoxProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftHovered, setLeftHovered] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setIsLoading(false);
    setNumPages(numPages);
  };

  const goLeft = () => {
    setActiveIdx(prev => {
      if (prev > 0) {
        setIsLoading(true);
        setNumPages(null);
        return prev - 1;
      }
      return prev;
    });
  };
  const goRight = () => {
    setActiveIdx(prev => {
      if (prev < files.length - 1) {
        setIsLoading(true);
        setNumPages(null);
        return prev + 1;
      }
      return prev;
    });
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

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {isLoading && (
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundColor: '#ffffff', 
          zIndex: 20, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Spinner color="#0067b8" />
        </div>
      )}
      <div style={{ display: 'flex', width: '100%', alignItems: 'flex-start', gap: '0' }}>
        {/* Left Chevron - sticky in viewport */}
        <div style={{ position: 'sticky', top: '7rem', height: 'fit-content', zIndex: 10 }}>
          <button
            disabled={activeIdx === 0}
            onClick={goLeft}
            onMouseEnter={() => setLeftHovered(true)}
            onMouseLeave={() => setLeftHovered(false)}
            style={chevronStyle(activeIdx === 0, leftHovered)}
            title="Previous Document"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        </div>

        {/* Main PDF Area */}
        <div ref={containerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0', overflow: 'hidden' }}>
          {/* PDF Viewer */}
          <div style={{
            width: '100%',
            height: '600px',
            backgroundColor: '#f3f4f6', // soft background to separate pages
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflowY: 'auto',
            padding: '16px 0',
          }}>
            <Document
              file={files[activeIdx]}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div />}
              error={<div style={{ padding: '40px', color: '#000', fontFamily: '"Noto Sans", sans-serif' }}>Error loading PDF.</div>}
            >
              {Array.from(new Array(numPages || 1), (el, index) => (
                <div key={`page_${index + 1}`} style={{ marginBottom: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                  <Page
                    pageNumber={index + 1}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    width={Math.min(containerWidth - 16, 900)}
                  />
                </div>
              ))}
            </Document>
          </div>

          {/* Bottom PDF Thumbnail Previews */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            padding: '16px 0',
          }}>
            {files.map((file, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveIdx(prev => {
                    if (prev !== idx) {
                      setIsLoading(true);
                      setNumPages(null);
                      return idx;
                    }
                    return prev;
                  });
                }}
                style={{
                  padding: '4px',
                  border: activeIdx === idx ? '2px solid #000' : '1px solid #ccc',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: 'pointer',
                  width: '80px',
                  height: '100px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'border-color 0.2s ease',
                }}
                title={`Document ${idx + 1}`}
              >
                <Document file={file} loading={<Spinner color="#0067b8" />}>
                  <Page pageNumber={1} width={72} renderTextLayer={false} renderAnnotationLayer={false} />
                </Document>
              </button>
            ))}
          </div>
        </div>

        {/* Right Chevron - sticky in viewport */}
        <div style={{ position: 'sticky', top: '7rem', height: 'fit-content', zIndex: 10 }}>
          <button
            disabled={activeIdx === files.length - 1}
            onClick={goRight}
            onMouseEnter={() => setRightHovered(true)}
            onMouseLeave={() => setRightHovered(false)}
            style={chevronStyle(activeIdx === files.length - 1, rightHovered)}
            title="Next Document"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </div>
  );
}
