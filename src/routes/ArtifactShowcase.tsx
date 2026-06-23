import { ArtifactCard } from '@/components/cards/ArtifactCard';
import { LicenseBadge } from '@/components/badges/LicenseBadge';
import { StarRating } from '@/components/reviews/StarRating';
import { ArtifactCardSkeleton, ProfileSkeleton, DashboardSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/lib/toast';
import { Modal, useModal } from '@/components/ui/Modal';
import { useState } from 'react';

export function ArtifactShowcase() {
  const toast = useToast();
  const { isOpen: isModalOpen, openModal, closeModal } = useModal();
  const [interactiveRating, setInteractiveRating] = useState(0);

  const dummyArtifact = {
    pubId: 'demo-123',
    title: 'Advanced Titanium Propulsion Nozzle Mark IV',
    creator: 'Dr. Evelyn Sato',
    date: 'Oct 14, 2026',
    description: 'A highly optimized, open-source titanium rocket nozzle designed for high-stress atmospheric exits. Includes CAD files, simulation data, and comprehensive thermal analysis reports. Suitable for mid-range orbital vehicles.',
    tags: ['aerospace', 'titanium', 'cad', 'simulation', 'thermal'],
    rating: 4.5,
    thumbnailUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=800',
  };

  const dummy3D = {
    ...dummyArtifact,
    pubId: 'demo-456',
    title: 'Orbital Habitat Modular Frame',
    division: '3d' as const,
    license: 'fox' as const,
    rating: 5,
    thumbnailUrl: undefined, // test placeholder
  };

  const dummyCode = {
    ...dummyArtifact,
    pubId: 'demo-789',
    title: 'Trajectory Prediction Engine (Python)',
    division: 'code' as const,
    license: 'eagle' as const,
    rating: 3,
    description: 'Python library for predicting LEO orbital decay based on real-time solar flux data.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
  };

  return (
    <div className="min-h-screen bg-surface-1 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        <div className="space-y-4">
          <h1 className="t-section-heading text-ink">ArtifactCard Showcase</h1>
          <p className="t-body text-ink-light max-w-2xl">
            This page tests the visual fidelity of the <code>ArtifactCard</code> component across its three variants: Default, Compact, and List-Row.
          </p>
        </div>

        {/* Default Variant */}
        <section className="space-y-6">
          <h2 className="t-eyebrow text-gold border-b border-cream-border pb-2">Variant: Default (Grid)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ArtifactCard {...dummyArtifact} division="artifact" license="beaver" />
            <ArtifactCard {...dummy3D} />
            <ArtifactCard {...dummyCode} />
          </div>
        </section>

        {/* Compact Variant */}
        <section className="space-y-6">
          <h2 className="t-eyebrow text-gold border-b border-cream-border pb-2">Variant: Compact (Carousels/Sidebars)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <ArtifactCard {...dummyArtifact} division="artifact" license="beaver" variant="compact" />
            <ArtifactCard {...dummy3D} variant="compact" />
            <ArtifactCard {...dummyCode} variant="compact" />
            <ArtifactCard {...dummyArtifact} division="artifact" license="finch" variant="compact" />
            <ArtifactCard {...dummyCode} variant="compact" />
          </div>
        </section>

        {/* List Row Variant */}
        <section className="space-y-6">
          <h2 className="t-eyebrow text-gold border-b border-cream-border pb-2">Variant: List Row (Search Results)</h2>
          <div className="flex flex-col gap-4 max-w-4xl">
            <ArtifactCard {...dummyArtifact} division="artifact" license="beaver" variant="list-row" />
            <ArtifactCard {...dummy3D} variant="list-row" />
            <ArtifactCard {...dummyCode} variant="list-row" />
          </div>
        </section>

        {/* License Badges */}
        <section className="space-y-6">
          <h2 className="t-eyebrow text-gold border-b border-cream-border pb-2">License Badges (Phase 9)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="t-label text-ink-light">Size: Small</h3>
              <div className="flex flex-col items-start gap-2">
                <LicenseBadge type="eagle" size="sm" />
                <LicenseBadge type="beaver" size="sm" />
                <LicenseBadge type="fox" size="sm" />
                <LicenseBadge type="finch" size="sm" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="t-label text-ink-light">Size: Medium</h3>
              <div className="flex flex-col items-start gap-3">
                <LicenseBadge type="eagle" size="md" />
                <LicenseBadge type="beaver" size="md" />
                <LicenseBadge type="fox" size="md" />
                <LicenseBadge type="finch" size="md" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="t-label text-ink-light">Size: Large</h3>
              <div className="flex flex-col items-start gap-4">
                <LicenseBadge type="eagle" size="lg" />
                <LicenseBadge type="beaver" size="lg" />
                <LicenseBadge type="fox" size="lg" />
                <LicenseBadge type="finch" size="lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Star Rating */}
        <section className="space-y-6">
          <h2 className="t-eyebrow text-gold border-b border-cream-border pb-2">Star Rating (Phase 10)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface-0 border border-cream-border rounded-xl p-6">
            <div className="space-y-6">
              <h3 className="t-label text-ink-light">Display Mode (Fractional)</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="w-12 text-sm text-ink font-medium">1.0</span>
                  <StarRating rating={1.0} size={20} />
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-12 text-sm text-ink font-medium">2.5</span>
                  <StarRating rating={2.5} size={20} />
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-12 text-sm text-ink font-medium">3.8</span>
                  <StarRating rating={3.8} size={20} />
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-12 text-sm text-ink font-medium">4.1</span>
                  <StarRating rating={4.1} size={20} />
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-12 text-sm text-ink font-medium">5.0</span>
                  <StarRating rating={5.0} size={20} />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="t-label text-ink-light">Interactive Mode</h3>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-ink">Rate this component:</p>
                <StarRating 
                  rating={interactiveRating} 
                  interactive 
                  size={32} 
                  onRate={setInteractiveRating} 
                />
                <p className="text-sm text-ink-light mt-2">
                  Selected Rating: <strong className="text-gold">{interactiveRating}</strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Toast / Notification */}
        <section className="space-y-6">
          <h2 className="t-eyebrow text-gold border-b border-cream-border pb-2">Toast Notifications (Phase 11)</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => toast.success("Artifact successfully published!", "Success")}
              className="px-4 py-2 bg-surface-0 border border-gold text-gold hover:bg-gold hover:text-cream transition-colors rounded-md t-label"
            >
              Trigger Success Toast
            </button>
            <button
              onClick={() => toast.error("Failed to upload 3D model. File too large.", "Upload Error")}
              className="px-4 py-2 bg-surface-0 border border-error text-error hover:bg-error hover:text-cream transition-colors rounded-md t-label"
            >
              Trigger Error Toast
            </button>
            <button
              onClick={() => toast.warning("Your session expires in 5 minutes.", "Warning")}
              className="px-4 py-2 bg-surface-0 border border-warning text-warning hover:bg-warning hover:text-cream transition-colors rounded-md t-label"
            >
              Trigger Warning Toast
            </button>
            <button
              onClick={() => toast.info("New dataset is now available for download.", "Update Available")}
              className="px-4 py-2 bg-surface-0 border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-cream transition-colors rounded-md t-label"
            >
              Trigger Info Toast
            </button>
          </div>
        </section>

        {/* Skeleton Loaders */}
        <section className="space-y-6">
          <h2 className="t-eyebrow text-gold border-b border-cream-border pb-2">Skeleton Loaders (Phase 12)</h2>
          <p className="t-body-sm text-ink-light mb-4">Using strict accessible greys (bg-surface-2) per user requirement.</p>
          
          <div className="space-y-12">
            <div>
              <h3 className="t-label text-ink mb-4">Artifact Card Skeletons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <ArtifactCardSkeleton variant="default" />
                <ArtifactCardSkeleton variant="default" />
              </div>
              <div className="flex gap-6 mb-6 overflow-hidden">
                <ArtifactCardSkeleton variant="compact" />
                <ArtifactCardSkeleton variant="compact" />
                <ArtifactCardSkeleton variant="compact" />
              </div>
              <div className="space-y-4 max-w-4xl">
                <ArtifactCardSkeleton variant="list-row" />
                <ArtifactCardSkeleton variant="list-row" />
              </div>
            </div>
            
            <div className="border p-4 border-cream-border rounded-xl bg-surface-1">
              <h3 className="t-label text-ink mb-4">Profile Skeleton</h3>
              <ProfileSkeleton />
            </div>

            <div className="border p-4 border-cream-border rounded-xl bg-surface-1">
              <h3 className="t-label text-ink mb-4">Dashboard Skeleton</h3>
              <div className="bg-surface-0 rounded-xl overflow-hidden shadow-sm">
                <DashboardSkeleton />
              </div>
            </div>
          </div>
        </section>

        {/* Modal System */}
        <section className="space-y-6 pb-20">
          <h2 className="t-eyebrow text-gold border-b border-cream-border pb-2">Modal System (Phase 13)</h2>
          <div className="flex gap-4">
            <button
              onClick={openModal}
              className="px-4 py-2 bg-ink text-surface-0 hover:bg-ink-light transition-colors rounded-md t-label"
            >
              Open Test Modal
            </button>
          </div>

          <Modal
            open={isModalOpen}
            onClose={closeModal}
            title="Terms & Conditions"
            width="md"
            footer={
              <>
                <button onClick={closeModal} className="px-4 py-2 text-ink hover:bg-surface-2 rounded-md transition-colors t-label">
                  Decline
                </button>
                <button onClick={closeModal} className="px-4 py-2 bg-gold text-cream hover:bg-gold-light rounded-md transition-colors t-label">
                  I Accept
                </button>
              </>
            }
          >
            <div className="space-y-4">
              <p className="t-body">
                By accessing Open Rockets Press, you agree to comply with our open-source sharing standards. All schematics uploaded must fall under one of our approved licenses.
              </p>
              <div className="h-64 bg-surface-1 border border-cream-border rounded flex items-center justify-center">
                <span className="t-label text-ink-light">Long content to test scrolling</span>
              </div>
              <p className="t-body">
                This is additional text at the bottom to ensure the body scrolls correctly while the header and footer remain locked in place.
              </p>
            </div>
          </Modal>
        </section>

      </div>
    </div>
  );
}
