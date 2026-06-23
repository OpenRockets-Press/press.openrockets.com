import { useState } from 'react';

interface ImageWithShimmerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
}

export function ImageWithShimmer({ wrapperClassName = '', className = '', src, alt, ...props }: ImageWithShimmerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      className={`image-shimmer-wrapper ${wrapperClassName}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        background: isLoaded ? 'transparent' : '#e5e7eb',
        ...props.style
      }}
    >
      {/* Standard Gray/White Shimmer Animation Layer */}
      {!isLoaded && (
        <div
          className="shimmer-animation-layer"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(200,200,200,0.5) 50%, rgba(255,255,255,0) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmerSlide 1.5s infinite linear',
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
