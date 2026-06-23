import { useState, useEffect, useMemo } from 'react';

const SHIMMER_VARIANTS = [
  // Light pink/rose
  'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(253, 226, 235, 0.6) 50%, rgba(255,255,255,0) 100%)',
  // Light purple
  'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(235, 226, 253, 0.6) 50%, rgba(255,255,255,0) 100%)',
  // Light lavender
  'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(243, 232, 255, 0.6) 50%, rgba(255,255,255,0) 100%)',
  // Soft peach/pink
  'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255, 233, 236, 0.6) 50%, rgba(255,255,255,0) 100%)'
];

interface ImageWithShimmerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
}

export function ImageWithShimmer({ wrapperClassName = '', className = '', src, alt, ...props }: ImageWithShimmerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Pick a random shimmer gradient variant once on mount
  const shimmerGradient = useMemo(() => {
    return SHIMMER_VARIANTS[Math.floor(Math.random() * SHIMMER_VARIANTS.length)];
  }, []);

  return (
    <div 
      className={`image-shimmer-wrapper ${wrapperClassName}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        background: isLoaded ? 'transparent' : '#f8f9fa',
        ...props.style
      }}
    >
      {/* Shimmer Animation Layer */}
      {!isLoaded && (
        <div
          className="shimmer-animation-layer"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: shimmerGradient,
            backgroundSize: '200% 100%',
            animation: 'shimmerSlide 2s infinite linear',
            zIndex: 1
          }}
        />
      )}

      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setIsLoaded(true)}
        style={{
          ...props.style,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.4s ease-in-out',
          width: '100%',
          height: '100%',
          position: 'relative',
          zIndex: 2,
          // Preserve the original object-fit behavior from className
        }}
        {...props}
      />
    </div>
  );
}
