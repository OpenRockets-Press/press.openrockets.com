import { useState, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface ImageViewerBoxProps {
  files: string[];
}

export function ImageViewerBox({ files }: ImageViewerBoxProps) {
  // We limit to 5 images max
  const displayFiles = files.slice(0, 5);

  const [activeIdx, setActiveIdx] = useState(0);
  const [loadedSet, setLoadedSet] = useState<Set<number>>(new Set());
  const [leftHovered, setLeftHovered] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);

  // Magnifier state
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [[magX, magY], setMagXY] = useState([0, 0]);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const magnifierSize = 150;
  const zoomLevel = 2.5;

  const goLeft = useCallback(() => {
    setActiveIdx(prev => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goRight = useCallback(() => {
    setActiveIdx(prev => (prev < displayFiles.length - 1 ? prev + 1 : prev));
  }, [displayFiles.length]);

  const handleImageLoad = useCallback((idx: number) => {
    setLoadedSet(prev => {
      if (prev.has(idx)) return prev;
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setShowMagnifier(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    const elem = e.currentTarget;
    const { top, left } = elem.getBoundingClientRect();
    const cursorX = e.clientX - left;
    const cursorY = e.clientY - top;
    setMagXY([cursorX, cursorY]);
    imgRef.current = elem;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowMagnifier(false);
  }, []);

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

  const isCurrentLoaded = loadedSet.has(activeIdx);

  // Calculate magnifier lens position and the transform for the zoomed image clone
  const imgEl = imgRef.current;
  const imgW = imgEl?.offsetWidth || 1;
  const imgH = imgEl?.offsetHeight || 1;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', width: '100%', alignItems: 'flex-start', gap: '0' }}>
        {/* Left Chevron - sticky in viewport */}
        <div style={{ position: 'sticky', top: '7rem', height: 'fit-content', zIndex: 10 }}>
          <button
            disabled={activeIdx === 0}
            onClick={goLeft}
            onMouseEnter={() => setLeftHovered(true)}
            onMouseLeave={() => setLeftHovered(false)}
            style={chevronStyle(activeIdx === 0, leftHovered)}
            title="Previous Image"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        </div>

        {/* Main Image Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0', overflow: 'hidden' }}>
          {/* Main Viewer */}
          <div style={{
            width: '100%',
            height: '500px',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', maxHeight: '100%' }}>
              {/* Render ALL images simultaneously — toggle visibility via CSS only */}
              {displayFiles.map((file, idx) => (
                <img
                  key={idx}
                  src={file}
                  alt={`Image ${idx + 1}`}
                  loading="eager"
                  decoding="async"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '500px',
                    objectFit: 'contain',
                    display: activeIdx === idx ? 'block' : 'none',
                    cursor: showMagnifier ? 'none' : 'default',
                  }}
                  onLoad={() => handleImageLoad(idx)}
                  onMouseEnter={handleMouseEnter}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                />
              ))}

              {/* Magnifier lens — uses a clipped <img> with transform:scale instead of backgroundImage to reuse already-decoded bitmap */}
              {showMagnifier && imgEl && (
                <div
                  style={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    width: `${magnifierSize}px`,
                    height: `${magnifierSize}px`,
                    top: `${magY - magnifierSize / 2}px`,
                    left: `${magX - magnifierSize / 2}px`,
                    borderRadius: '50%',
                    border: '2px solid #ccc',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                    zIndex: 20,
                    backgroundColor: 'white',
                  }}
                >
                  <img
                    src={displayFiles[activeIdx]}
                    alt=""
                    decoding="async"
                    style={{
                      position: 'absolute',
                      width: `${imgW * zoomLevel}px`,
                      height: `${imgH * zoomLevel}px`,
                      left: `${-magX * zoomLevel + magnifierSize / 2}px`,
                      top: `${-magY * zoomLevel + magnifierSize / 2}px`,
                      pointerEvents: 'none',
                      maxWidth: 'none',
                      maxHeight: 'none',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Loading indicator — only if the currently active image hasn't finished loading */}
            {!isCurrentLoaded && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.85)', zIndex: 10 }}>
                <span style={{ fontFamily: '"Noto Sans", sans-serif', fontWeight: 600, color: '#0067b8' }}>Loading...</span>
              </div>
            )}
          </div>

          {/* Bottom Image Thumbnails */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            padding: '16px 0',
          }}>
            {displayFiles.map((file, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
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
                title={`Image ${idx + 1}`}
              >
                <img src={file} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} decoding="async" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Chevron - sticky in viewport */}
        <div style={{ position: 'sticky', top: '7rem', height: 'fit-content', zIndex: 10 }}>
          <button
            disabled={activeIdx === displayFiles.length - 1}
            onClick={goRight}
            onMouseEnter={() => setRightHovered(true)}
            onMouseLeave={() => setRightHovered(false)}
            style={chevronStyle(activeIdx === displayFiles.length - 1, rightHovered)}
            title="Next Image"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </div>
  );
}
