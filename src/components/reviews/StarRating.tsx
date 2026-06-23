import { useState } from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  /** The current rating (0-5) */
  rating?: number;
  /** If true, the component allows user interaction */
  interactive?: boolean;
  /** Callback fired when a user selects a rating in interactive mode */
  onRate?: (rating: number) => void;
  /** Size of the stars in pixels */
  size?: number;
}

export function StarRating({
  rating = 0,
  interactive = false,
  onRate,
  size = 16,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // In interactive mode, we show full stars based on hover or selected rating.
  // In display mode, we can show fractional stars.
  const displayRating = interactive ? (hoverRating ?? rating) : rating;

  const handleStarClick = (index: number) => {
    if (!interactive) return;
    
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300); // match duration

    if (onRate) {
      onRate(index);
    }
  };

  const renderStar = (index: number) => {
    // index is 1-based (1, 2, 3, 4, 5)
    
    // For fractional display
    const fillPercentage = Math.max(0, Math.min(100, (displayRating - (index - 1)) * 100));
    
    const isInteractiveStyle = interactive ? 'cursor-pointer' : '';
    const animationClass = (interactive && isAnimating && (hoverRating ?? rating) >= index) 
      ? 'animate-star-pulse' 
      : 'transition-transform duration-200 hover:scale-110';

    return (
      <div 
        key={index}
        className={`relative ${isInteractiveStyle} ${interactive ? animationClass : ''}`}
        onMouseEnter={() => interactive && setHoverRating(index)}
        onMouseLeave={() => interactive && setHoverRating(null)}
        onClick={() => handleStarClick(index)}
      >
        {/* Background Star (Empty) */}
        <Star size={size} className="text-cream-border stroke-cream-border" />
        
        {/* Foreground Star (Filled) - Using clip-path for fractional rendering */}
        {fillPercentage > 0 && (
          <div 
            className="absolute top-0 left-0 overflow-hidden" 
            style={{ width: `${fillPercentage}%` }}
          >
            <Star size={size} className="text-gold fill-gold stroke-gold" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((index) => renderStar(index))}
      {/* Custom keyframes injected inline or we rely on tailwind.config.js - we'll just use scale-110 if we don't want to add to tailwind config, or add simple inline style if needed. Let's just use CSS. */}
      <style>{`
        @keyframes starPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .animate-star-pulse {
          animation: starPulse 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
