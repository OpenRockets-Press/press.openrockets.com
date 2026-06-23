import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Slight delay to ensure element is mounted before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      setQuery(''); // Reset query on close
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate({ to: '/search', search: { q: query.trim() } });
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[300] flex flex-col bg-surface-0/95 backdrop-blur-md animate-fade-in">
      {/* Header Bar */}
      <div className="w-full flex justify-end p-4 sm:p-6">
        <button 
          onClick={onClose}
          className="p-2 text-ink-light hover:text-ink hover:bg-surface-2 rounded-full transition-colors flex items-center gap-2 t-label"
        >
          <span>Close</span>
          <X size={24} />
        </button>
      </div>

      {/* Massive Centered Search */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 -mt-20">
        <form onSubmit={handleSubmit} className="w-full max-w-4xl relative">
          <Search size={48} className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-light opacity-50 hidden sm:block" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search schematics, models, or code..."
            className="w-full bg-transparent border-b-2 border-cream-border focus:border-gold outline-none py-4 sm:pl-16 text-3xl sm:text-5xl font-serif text-ink placeholder-ink-light/40 transition-colors"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <p className="t-body-sm text-ink-light mt-4 text-center sm:text-left sm:pl-16">
            Press <kbd className="font-mono bg-surface-2 px-2 py-1 rounded border border-cream-border mx-1">Enter</kbd> to search
          </p>
        </form>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return content;
}
