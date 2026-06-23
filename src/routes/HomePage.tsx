import { Link } from '@tanstack/react-router';
import { ArtifactCard } from '@/components/cards/ArtifactCard';
import { LicenseBadge } from '@/components/badges/LicenseBadge';
import { DivisionArtifact, Division3D, DivisionCode } from '@/components/icons';

const dummyArtifact = {
  pubId: 'demo-1',
  title: 'Advanced Titanium Propulsion Nozzle Mark IV',
  creator: 'Dr. Evelyn Sato',
  date: 'Oct 14, 2026',
  description: 'A highly optimized, open-source titanium rocket nozzle designed for high-stress atmospheric exits.',
  tags: ['aerospace', 'titanium', 'cad'],
  rating: 4.8,
  division: 'artifact' as const,
  license: 'beaver' as const,
  thumbnailUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=800',
};

const dummy3D = {
  ...dummyArtifact,
  pubId: 'demo-2',
  title: 'Orbital Habitat Modular Frame',
  creator: 'Aero Dynamics',
  division: '3d' as const,
  license: 'fox' as const,
  rating: 5,
  thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
};

const dummyCode = {
  ...dummyArtifact,
  pubId: 'demo-3',
  title: 'Trajectory Prediction Engine (Python)',
  creator: 'SysAdmin404',
  division: 'code' as const,
  license: 'eagle' as const,
  rating: 4.5,
  thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
};

const dummyFinch = {
  ...dummyArtifact,
  pubId: 'demo-4',
  title: 'Lunar Surface Rover Blueprint',
  creator: 'LunaTech',
  division: 'artifact' as const,
  license: 'finch' as const,
  rating: 4.2,
  thumbnailUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=800',
};

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=2000",
    title: "Engineering for ",
    highlight: "Everyone.",
    subtitle: "The world's first fully open-source repository for aerospace schematics, 3D models, and control software."
  },
  {
    image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=2000",
    title: "Innovate ",
    highlight: "Together.",
    subtitle: "Join thousands of engineers verifying, testing, and improving open hardware."
  },
  {
    image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=2000",
    title: "Build the ",
    highlight: "Future.",
    subtitle: "Access enterprise-grade propulsion, avionics, and orbital mechanics completely free."
  }
];

export function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <div className="w-full min-h-screen bg-surface-0 overflow-hidden">
      
      {/* 1. Hero Banner */}
      <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center bg-ink overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src={slide.image}
              alt="Space backdrop" 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 text-center max-w-4xl px-4 flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="t-hero text-cream mb-6">
                {slide.title} <span className="text-gold">{slide.highlight}</span>
              </h1>
              <p className="t-intro text-cream-muted mb-10 max-w-2xl mx-auto">
                {slide.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
          
          <div className="flex gap-4 items-center">
            <Link to="/browse" className="btn-primary px-8 py-3 t-label">
              Explore the Catalog
            </Link>
            <Link to="/publish" className="btn-secondary px-8 py-3 t-label border-cream-border text-cream hover:bg-surface-2 hover:text-ink">
              Publish a Project
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Category Strip */}
      <nav className="w-full bg-surface-1 border-b border-cream-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
          <ul className="flex gap-8 items-center h-14 whitespace-nowrap">
            {['All Projects', 'Aerodynamics', 'Propulsion', 'Avionics', 'Life Support', 'Orbital Mechanics'].map((cat, i) => (
              <li key={cat}>
                <Link to="/browse" className={`t-label transition-colors hover:text-gold ${i === 0 ? 'text-gold border-b-2 border-gold h-14 flex items-center' : 'text-ink-light'}`}>
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 3. Stats Bar */}
      <section className="bg-ink text-cream py-12 border-b border-ink">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-cream-border/20">
          <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
            <span className="text-4xl md:text-5xl font-serif text-gold mb-2">12,450</span>
            <span className="t-label text-cream-muted">Open Artifacts</span>
          </div>
          <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
            <span className="text-4xl md:text-5xl font-serif text-gold mb-2">340</span>
            <span className="t-label text-cream-muted">Active Contributors</span>
          </div>
          <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
            <span className="text-4xl md:text-5xl font-serif text-gold mb-2">99%</span>
            <span className="t-label text-cream-muted">Open Source Verified</span>
          </div>
        </div>
      </section>

      {/* 4. New Releases */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="t-section-heading text-ink mb-2">New Releases</h2>
            <p className="t-body text-ink-light">Freshly published schematics and code.</p>
          </div>
          <Link to="/browse" className="t-label text-gold hover:underline">View All &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ArtifactCard {...dummyArtifact} />
          <ArtifactCard {...dummy3D} />
          <ArtifactCard {...dummyCode} />
          <ArtifactCard {...dummyFinch} />
        </div>
      </section>

      {/* 5. Featured Contributions */}
      <section className="bg-surface-1 border-y border-cream-border">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
          <div className="lg:w-1/2 p-8 lg:p-20 flex flex-col justify-center">
            <span className="t-eyebrow text-gold mb-4">Featured Contribution</span>
            <h2 className="text-4xl md:text-5xl font-serif text-ink leading-tight mb-6">
              Next-Gen Thermal Plating
            </h2>
            <p className="t-body text-ink-light mb-8">
              A community-driven effort has resulted in a radical new lightweight thermal plating design. Utilizing generative AI to optimize heat dissipation, this completely open-source CAD model is ready for deep space deployment.
            </p>
            <Link to="/browse" className="btn-primary w-fit px-8 py-3 t-label">
              View the Schematics
            </Link>
          </div>
          <div className="lg:w-1/2 min-h-[400px] bg-ink relative">
            <img 
              src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1000" 
              alt="Thermal plating" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 6. Browse by Division */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="t-section-heading text-ink mb-4">Browse by Division</h2>
          <p className="t-body text-ink-light max-w-2xl mx-auto">Explore content organized by file type and application domain.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/browse?division=artifact" className="group bg-surface-0 border border-cream-border rounded-xl p-8 hover:border-gold transition-colors text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-6 text-ink group-hover:text-gold transition-colors">
              <DivisionArtifact size={32} />
            </div>
            <h3 className="t-card-title text-ink mb-2">Artifacts</h3>
            <p className="t-body-sm text-ink-light">Blueprints, PDFs, Schematics</p>
          </Link>
          <Link to="/browse?division=3d" className="group bg-surface-0 border border-cream-border rounded-xl p-8 hover:border-gold transition-colors text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-6 text-ink group-hover:text-gold transition-colors">
              <Division3D size={32} />
            </div>
            <h3 className="t-card-title text-ink mb-2">3D Models</h3>
            <p className="t-body-sm text-ink-light">CAD, STL, STEP Files</p>
          </Link>
          <Link to="/browse?division=code" className="group bg-surface-0 border border-cream-border rounded-xl p-8 hover:border-gold transition-colors text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mb-6 text-ink group-hover:text-gold transition-colors">
              <DivisionCode size={32} />
            </div>
            <h3 className="t-card-title text-ink mb-2">Code Snippets</h3>
            <p className="t-body-sm text-ink-light">Scripts, Firmware, Algorithms</p>
          </Link>
        </div>
      </section>

      {/* 7. Trending Row */}
      <section className="bg-surface-1 border-y border-cream-border py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <h2 className="t-section-heading text-ink">Trending Today</h2>
        </div>
        <div className="flex overflow-x-auto pb-8 pt-2 px-4 md:px-8 gap-6 no-scrollbar snap-x max-w-7xl mx-auto">
          {[...Array(6)].map((_, i) => (
            <div className="snap-start shrink-0" key={i}>
              <ArtifactCard {...dummyCode} variant="compact" pubId={`trend-${i}`} />
            </div>
          ))}
        </div>
      </section>

      {/* 8. License Callout */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/3">
            <h2 className="t-section-heading text-ink mb-6">Built on Open Trust</h2>
            <p className="t-body text-ink-light mb-8">
              Open Rockets Press relies on a custom set of robust, easy-to-understand open-source licenses. Whether you want to place your work in the public domain or strictly forbid commercial use, we have a license for you.
            </p>
            <Link to="/license" className="t-label text-gold hover:underline">Read the Legal Docs &rarr;</Link>
          </div>
          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <div className="bg-surface-0 p-6 border border-cream-border rounded-xl flex flex-col items-start gap-4 hover:border-gold transition-colors">
              <LicenseBadge type="eagle" size="lg" />
              <p className="t-body-sm text-ink-light">Place your work entirely in the public domain. No attribution required.</p>
            </div>
            <div className="bg-surface-0 p-6 border border-cream-border rounded-xl flex flex-col items-start gap-4 hover:border-gold transition-colors">
              <LicenseBadge type="beaver" size="lg" />
              <p className="t-body-sm text-ink-light">Allow any use, provided the original creator receives credit.</p>
            </div>
            <div className="bg-surface-0 p-6 border border-cream-border rounded-xl flex flex-col items-start gap-4 hover:border-gold transition-colors">
              <LicenseBadge type="fox" size="lg" />
              <p className="t-body-sm text-ink-light">Derivatives must be shared under the exact same open terms.</p>
            </div>
            <div className="bg-surface-0 p-6 border border-cream-border rounded-xl flex flex-col items-start gap-4 hover:border-gold transition-colors">
              <LicenseBadge type="finch" size="lg" />
              <p className="t-body-sm text-ink-light">Free for personal and academic use. No commercial exploitation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Contributor CTA */}
      <section className="bg-ink text-center py-24 px-4 border-t-4 border-gold">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-serif text-cream mb-6">Ready to launch?</h2>
          <p className="t-intro text-cream-muted mb-10">
            Join thousands of aerospace engineers, students, and hobbyists. Publish your first schematic today and contribute to the open future of space exploration.
          </p>
          <div className="flex gap-4">
            <Link to="/register" className="btn-primary px-8 py-3 t-label bg-gold text-ink hover:bg-gold-light border-none">
              Create an Account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
