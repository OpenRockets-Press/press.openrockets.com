import { useState } from 'react';

interface ImageWithShimmerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
}

export function ImageWithShimmer({
  wrapperClassName = '',
  className = '',
  src,
  alt,
  ...props
}: ImageWithShimmerProps) {
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
        ...props.style,
      }}
    >
      {/* Copyright Placeholder */}
      {!isLoaded && (
        <div
          className="copyright-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '16px',
            boxSizing: 'border-box',
            color: '#6b7280',
            fontSize: '14px',
            lineHeight: '1.5',
            zIndex: 1,
          }}
        >
          Copyrighted content. All rights reserved.
        </div>
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
        }}
        {...props}
      />
    </div>
  );
}
