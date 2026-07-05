import { useState, useRef, useCallback, useEffect } from 'react';
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

  // Magnifier — use refs instead of state so mouse tracking doesn't trigger React re-renders
  const magnifierRef = useRef<HTMLDivElement>(null);
  const magnifierImgRef = useRef<HTMLImageElement>(null);
  const isMouseOverImage = useRef(false);
  const rafId = useRef<number>(0);
  const currentImgEl = useRef<HTMLImageElement | null>(null);

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

  // Magnifier: all DOM updates via refs — zero React re-renders during mouse tracking
  const handleMouseEnter = useCallback(() => {
    isMouseOverImage.current = true;
    if (magnifierRef.current) {
      magnifierRef.current.style.display = 'block';
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    const elem = e.currentTarget;
    currentImgEl.current = elem;

    const { top, left } = elem.getBoundingClientRect();
    const cursorX = e.clientX - left;
    const cursorY = e.clientY - top;
    const imgW = elem.offsetWidth;
    const imgH = elem.offsetHeight;

    // Cancel any pending rAF to avoid stacking
    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const lens = magnifierRef.current;
      const zoomedImg = magnifierImgRef.current;
      if (!lens || !zoomedImg) return;

      lens.style.top = `${cursorY - magnifierSize / 2}px`;
      lens.style.left = `${cursorX - magnifierSize / 2}px`;

      zoomedImg.style.width = `${imgW * zoomLevel}px`;
      zoomedImg.style.height = `${imgH * zoomLevel}px`;
      zoomedImg.style.left = `${-cursorX * zoomLevel + magnifierSize / 2}px`;
      zoomedImg.style.top = `${-cursorY * zoomLevel + magnifierSize / 2}px`;
    });
  }, [magnifierSize, zoomLevel]);

  const handleMouseLeave = useCallback(() => {
    isMouseOverImage.current = false;
    if (magnifierRef.current) {
      magnifierRef.current.style.display = 'none';
    }
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = 0;
    }
  }, []);

  // Hide magnifier when switching images
  useEffect(() => {
    if (magnifierRef.current) {
      magnifierRef.current.style.display = 'none';
    }
  }, [activeIdx]);

  // Cleanup rAF on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
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

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', width: '100%', alignItems: 'flex-start', gap: '0' }}>
        {/* Left Chevron */}
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
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/*
              GPU-Composited Image Stack:
              All images are stacked with position:absolute and use opacity for switching.
              opacity 0→1 is a compositor-only operation (GPU) — no layout, no paint, no main-thread work.
              will-change:opacity promotes each image to its own GPU layer on page load.
            */}
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {displayFiles.map((file, idx) => (
                <img
                  key={idx}
                  src={file}
                  alt={`Image ${idx + 1}`}
                  loading="eager"
                  decoding="async"
                  style={{
                    position: idx === 0 ? 'relative' : 'absolute',
                    top: idx === 0 ? undefined : 0,
                    left: idx === 0 ? undefined : 0,
                    right: idx === 0 ? undefined : 0,
                    bottom: idx === 0 ? undefined : 0,
                    margin: 'auto',
                    maxWidth: '100%',
                    maxHeight: '500px',
                    objectFit: 'contain',
                    opacity: activeIdx === idx ? 1 : 0,
                    pointerEvents: activeIdx === idx ? 'auto' : 'none',
                    willChange: 'opacity',
                    transition: 'opacity 0.15s ease',
                  }}
                  onLoad={() => handleImageLoad(idx)}
                  onMouseEnter={handleMouseEnter}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                />
              ))}

              {/* Magnifier lens — DOM-only updates via refs, no React state */}
              <div
                ref={magnifierRef}
                style={{
                  display: 'none',
                  position: 'absolute',
                  pointerEvents: 'none',
                  width: `${magnifierSize}px`,
                  height: `${magnifierSize}px`,
                  borderRadius: '50%',
                  border: '2px solid #ccc',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                  zIndex: 20,
                  backgroundColor: 'white',
                }}
              >
                <img
                  ref={magnifierImgRef}
                  src={displayFiles[activeIdx]}
                  alt=""
                  decoding="async"
                  style={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    maxWidth: 'none',
                    maxHeight: 'none',
                  }}
                />
              </div>
            </div>

            {/* Loading indicator */}
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

        {/* Right Chevron */}
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
