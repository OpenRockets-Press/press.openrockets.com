import { useState } from "react";
import { MousePointerClick, Maximize2, Minimize2 } from "lucide-react";

interface PhotogrammetryViewerProps {
  className?: string;
}

export function PhotogrammetryViewer({ className = "" }: PhotogrammetryViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  return (
    <div 
      className={`relative bg-surface-2 border border-cream-border rounded-xl overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : `h-[400px] ${className}`
      }`}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
    >
      {/* Mock 360 View Background */}
      <div 
        className="absolute inset-0 bg-surface-3 transition-transform duration-1000 ease-linear"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, var(--surface-1) 0%, var(--surface-3) 100%)',
          transform: isInteracting ? 'scale(1.05)' : 'scale(1)'
        }}
      >
        {/* Placeholder mesh/grid to simulate 3D space */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(var(--ink) 1px, transparent 1px), linear-gradient(90deg, var(--ink) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)'
        }} />
      </div>

      {/* Center Subject Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-32 h-32 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center backdrop-blur-sm animate-pulse">
          <span className="font-serif text-gold-dark font-bold">360° Object</span>
        </div>
      </div>

      {/* Interaction Hint Overlay */}
      {!isInteracting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/5 backdrop-blur-[1px] transition-opacity">
          <div className="bg-surface-0/80 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 shadow-lg border border-cream-border/50">
            <MousePointerClick size={20} className="text-ink" />
            <span className="text-ink font-medium t-label">Click & Drag to Rotate</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="w-10 h-10 rounded-lg bg-surface-0/80 backdrop-blur-md border border-cream-border/50 flex items-center justify-center text-ink hover:bg-surface-1 transition-colors shadow-sm"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

    </div>
  );
}
