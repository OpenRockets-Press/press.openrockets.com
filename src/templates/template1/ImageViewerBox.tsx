import { useState, useRef, useEffect } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface ImageViewerBoxProps {
  files: string[];
}

export function ImageViewerBox({ files }: ImageViewerBoxProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftHovered, setLeftHovered] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);

  // Magnifier state
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);

  // We limit to 5 images max
  const displayFiles = files.slice(0, 5);

  const goLeft = () => { 
    setActiveIdx(prev => {
      if (prev > 0) {
        setIsLoading(true);
        return prev - 1;
      }
      return prev;
    });
  };
  const goRight = () => { 
    setActiveIdx(prev => {
      if (prev < displayFiles.length - 1) {
        setIsLoading(true);
        return prev + 1;
      }
      return prev;
    });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLImageElement>) => {
    const elem = e.currentTarget;
    const { width, height } = elem.getBoundingClientRect();
    setSize([width, height]);
    setShowMagnifier(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    const elem = e.currentTarget;
    const { top, left } = elem.getBoundingClientRect();
    const cursorX = e.pageX - left - window.scrollX;
    const cursorY = e.pageY - top - window.scrollY;
    setXY([cursorX, cursorY]);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  // Magnifier settings
  const magnifierSize = 150;
  const zoomLevel = 2.5;

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
        <div ref={containerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0', overflow: 'hidden' }}>
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
              <img 
                src={displayFiles[activeIdx]} 
                alt={`Image ${activeIdx + 1}`} 
                style={{ maxWidth: '100%', maxHeight: '500px', display: 'block', objectFit: 'contain', cursor: showMagnifier ? 'none' : 'default' }} 
                decoding="async"
                onLoad={() => setIsLoading(false)}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
              {showMagnifier && (
                <div
                  style={{
                    position: "absolute",
                    pointerEvents: "none",
                    height: `${magnifierSize}px`,
                    width: `${magnifierSize}px`,
                    top: `${y - magnifierSize / 2}px`,
                    left: `${x - magnifierSize / 2}px`,
                    opacity: 1,
                    border: "2px solid #ccc",
                    borderRadius: "50%",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                    backgroundColor: "white",
                    backgroundImage: `url('${displayFiles[activeIdx]}')`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
                    backgroundPositionX: `${-x * zoomLevel + magnifierSize / 2}px`,
                    backgroundPositionY: `${-y * zoomLevel + magnifierSize / 2}px`,
                    zIndex: 20
                  }}
                />
              )}
            </div>
            {isLoading && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                <Spinner color="#0067b8" />
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
                onClick={() => { 
                  setActiveIdx(prev => {
                    if (prev !== idx) {
                      setIsLoading(true);
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
                title={`Image ${idx + 1}`}
              >
                <img src={file} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} decoding="async" />
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
