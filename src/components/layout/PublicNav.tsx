import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, User } from 'lucide-react';
import { ORPressLogo } from '@/components/icons';
import { getSessionUser, type SessionUser } from '@/lib/authStore';
import { SearchOverlay } from '@/components/layout/SearchOverlay';

const QUOTES = [
  "“The printing press is the greatest weapon in the armory of the modern commander.”",
  "“Ideas are more powerful than guns. We would not let our enemies have guns, why should we let them have ideas.”",
  "“A drop of ink may make a million think.”",
  "“Let us read, and let us dance; these two amusements will never do any harm to the world.”",
  "“Freedom of the press is guaranteed only to those who own one.”",
];

export function PublicNav() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleSignOut = () => {
    // Basic sign out for UI simulation. Real implementation will use auth layer.
    window.localStorage.removeItem('orp.session.v1');
    setUser(null);
    setIsProfileDropdownOpen(false);
    navigate({ to: '/' });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-cream/90 backdrop-blur-md border-b border-cream-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Wordmark */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <ORPressLogo className="text-ink group-hover:text-gold transition-colors duration-200" size={32} />
              <span className="t-card-title text-ink hidden sm:block">Open Rockets Press</span>
            </Link>
          </div>

          {/* Quote Carousel (Hidden on mobile) */}
          <div className="hidden lg:flex flex-1 justify-center px-8 relative h-6 overflow-hidden items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="t-body-sm text-ink-light absolute text-center italic w-full"
              >
                {QUOTES[quoteIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setIsSearchOverlayOpen(true)} 
              className="text-ink hover:text-gold transition-colors duration-200"
              aria-label="Open search"
            >
              <Search size={20} />
            </button>

            <Link to="/publish" className="t-label text-ink hover:text-gold transition-colors duration-200">
              Publish
            </Link>

            {!user ? (
              <Link to="/login" className="px-4 py-2 bg-gold text-cream hover:bg-gold-light transition-colors duration-200 rounded-md t-label">
                Get Started
              </Link>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-ink text-cream hover:bg-gold transition-colors duration-200"
                >
                  <span className="t-label text-cream">{getInitials(user.displayName)}</span>
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-surface-0 border border-cream-border rounded-md shadow-lg py-1 z-50"
                    >
                      <Link to="/dashboard" className="block px-4 py-2 t-body-sm text-ink hover:bg-surface-2 transition-colors">
                        Dashboard
                      </Link>
                      <Link to="/about" className="block px-4 py-2 t-body-sm text-ink hover:bg-surface-2 transition-colors">
                        About
                      </Link>
                      <button onClick={handleSignOut} className="w-full text-left block px-4 py-2 t-body-sm text-error hover:bg-surface-2 transition-colors">
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => setIsSearchOverlayOpen(true)}
              className="text-ink hover:text-gold transition-colors duration-200"
              aria-label="Open search"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-ink hover:text-gold transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Render Search Overlay */}
      <SearchOverlay 
        isOpen={isSearchOverlayOpen} 
        onClose={() => setIsSearchOverlayOpen(false)} 
      />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-cream-border bg-cream overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link 
                to="/publish" 
                className="block t-section-heading text-ink hover:text-gold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Publish
              </Link>
              
              {!user ? (
                <Link 
                  to="/login" 
                  className="block t-section-heading text-gold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              ) : (
                <>
                  <div className="pt-4 border-t border-cream-border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center">
                        <span className="t-label text-cream">{getInitials(user.displayName)}</span>
                      </div>
                      <span className="t-body-lead text-ink">{user.displayName}</span>
                    </div>
                    <div className="space-y-3">
                      <Link to="/dashboard" className="block t-body text-ink" onClick={() => setIsMobileMenuOpen(false)}>
                        Dashboard
                      </Link>
                      <Link to="/about" className="block t-body text-ink" onClick={() => setIsMobileMenuOpen(false)}>
                        About
                      </Link>
                      <button onClick={handleSignOut} className="block w-full text-left t-body text-error">
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
