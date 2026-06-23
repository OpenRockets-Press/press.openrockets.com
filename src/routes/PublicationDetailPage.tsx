import { useState, useEffect } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPublicationByPubId, downloadPublication, toUserFacingError } from "@/lib/api";
import { ArtifactCard } from "@/components/cards/ArtifactCard";
import { LicenseBadge } from "@/components/badges/LicenseBadge";
import { StarRating } from "@/components/reviews/StarRating";
import { DivisionArtifact, Division3D, DivisionCode } from "@/components/icons";
import { ThreeDViewer } from "@/components/ui/ThreeDViewer";
import { CodeViewer } from "@/components/ui/CodeViewer";
import { ReviewsTab } from "@/components/reviews/ReviewsTab";
import { CommentsTab } from "@/components/reviews/CommentsTab";
import { SharePanel } from "@/components/SharePanel";
import { Modal } from "@/components/ui/Modal";
import { Download, GitFork, User, Calendar, FileText, ChevronRight, Share2, AlertCircle, MessageSquare, Box, Code } from "lucide-react";

// Mock recommendations data
const MOCK_RECOMMENDATIONS = Array.from({ length: 4 }).map((_, i) => ({
  pubId: `rec-${i}`,
  title: `Related Subsystem ${i + 1}`,
  creator: 'Open Aerospace Initiative',
  date: 'Oct 16, 2026',
  description: 'A related subsystem that frequently integrates with this artifact.',
  tags: ['aerospace', 'integration'],
  rating: 4.5,
  division: 'artifact' as const,
  license: 'fox' as const,
  thumbnailUrl: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&q=80&w=800',
}));

export function PublicationDetailPage() {
  const { pubId } = useParams({ strict: false }) as { pubId?: string };
  const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'reviews' | 'comments'>('overview');
  const [downloading, setDownloading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { data: publication, isLoading, error } = useQuery({
    queryKey: ["publication", "detail", pubId],
    queryFn: () => getPublicationByPubId(pubId!),
    enabled: Boolean(pubId),
    staleTime: 1000 * 60 * 5,
  });

  // SEO & Meta Injection
  useEffect(() => {
    if (!publication) return;

    // 1. Update Document Title
    document.title = `${publication.title} - Open Rockets Press`;

    // 2. Inject OpenGraph Tags
    const updateMeta = (name: string, content: string, property = false) => {
      let element = document.querySelector(`meta[${property ? 'property' : 'name'}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('og:title', publication.title, true);
    updateMeta('og:description', publication.abstract || 'Open Rockets Press Artifact', true);
    updateMeta('og:type', 'article', true);
    
    // Dynamic OG Image from Phase 40
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://press.openrockets.com';
    const encodedTitle = encodeURIComponent(publication.title);
    const encodedAuthor = encodeURIComponent(publication.authorDisplayName);
    const division = publication.tags?.includes('3d') ? '3D Model' : publication.tags?.includes('code') ? 'Code' : 'Artifact';
    const ogUrl = `${origin}/api/og?slug=${publication.id}&title=${encodedTitle}&author=${encodedAuthor}&division=${division}`;
    updateMeta('og:image', ogUrl, true);

    // 3. Inject JSON-LD Schema
    const scriptId = 'schema-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": publication.title,
      "description": publication.abstract,
      "author": {
        "@type": "Person",
        "name": publication.authorDisplayName
      },
      "publisher": {
        "@type": "Organization",
        "name": "Open Rockets Press"
      },
      "datePublished": "2026-10-15"
    };
    scriptEl.textContent = JSON.stringify(schemaData);

    return () => {
      // Cleanup on unmount
      document.title = 'Open Rockets Press';
    };
  }, [publication]);

  const handleDownload = async () => {
    if (!pubId) return;
    setDownloading(true);
    try {
      await downloadPublication(pubId);
    } catch (err) {
      console.error(err);
      alert(toUserFacingError(err));
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-1 py-12 px-4 flex justify-center">
        <div className="animate-pulse flex flex-col gap-4 w-full max-w-7xl">
          <div className="h-8 bg-surface-2 rounded w-1/4"></div>
          <div className="h-64 bg-surface-2 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="min-h-screen bg-surface-1 py-20 px-4 flex flex-col items-center text-center">
        <AlertCircle size={48} className="text-error mb-4" />
        <h1 className="t-card-title text-ink mb-2">Artifact Not Found</h1>
        <p className="t-body text-ink-light mb-8 max-w-md">
          {error ? toUserFacingError(error) : "This publication does not exist or has not been approved yet."}
        </p>
        <Link to="/browse" className="btn-primary px-6 py-2 t-label">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isDivision3D = publication.tags?.includes('3d') || pubId === 'test-3d'; 
  const isDivisionCode = publication.tags?.includes('code') || pubId === 'test-code'; 
  const isDivisionArtifact = !isDivision3D && !isDivisionCode;

  const divisionTitle = isDivision3D ? '3D Models' : isDivisionCode ? 'Code' : 'Artifacts';
  const divisionIcon = isDivision3D ? <Division3D size={20} /> : isDivisionCode ? <DivisionCode size={20} /> : <DivisionArtifact size={20} />;
  const divisionColor = isDivision3D ? 'bg-slate-800' : isDivisionCode ? 'bg-zinc-950 border-b-2 border-green-500' : 'bg-blue-900';

  return (
    <div className="min-h-screen bg-surface-1 pb-20">
      {/* Breadcrumbs */}
      <div className="bg-surface-0 border-b border-cream-border py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 t-body-sm text-ink-light">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to={isDivision3D ? "/category/3d" : isDivisionCode ? "/category/code" : "/category/artifacts"} className="hover:text-gold transition-colors capitalize">
            {divisionTitle}
          </Link>
          <ChevronRight size={14} />
          <span className="text-ink font-medium truncate">{publication.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col lg:flex-row gap-12">
        
        {/* Left Column (Main Content) */}
        <div className="flex-1 min-w-0">
          
          {/* Header Block */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-1.5 ${divisionColor} text-cream rounded-md shadow-sm flex items-center justify-center`}>
                {divisionIcon}
              </div>
              <span className="t-label text-ink">Division: {divisionTitle}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-cream-border mx-1" />
              <StarRating rating={4.8} size="md" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif text-ink mb-4 leading-tight">
              {publication.title}
            </h1>
            
            <div className="flex items-center gap-4 text-ink-light t-body-sm">
              <span className="flex items-center gap-1.5"><User size={16} /> {publication.authorDisplayName}</span>
              <span className="flex items-center gap-1.5"><Calendar size={16} /> Oct 15, 2026</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-cream-border mb-8 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'preview', label: isDivision3D ? '3D Viewer' : isDivisionCode ? 'Source Code' : 'File Preview', icon: isDivision3D ? Box : isDivisionCode ? Code : Search },
              { id: 'reviews', label: 'Reviews', icon: StarRating },
              { id: 'comments', label: 'Comments', icon: MessageSquare }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 t-label transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-gold text-ink bg-surface-0' 
                    : 'border-transparent text-ink-light hover:text-ink hover:bg-surface-0/50'
                }`}
              >
                {tab.id !== 'reviews' ? <tab.icon size={16} /> : <StarRating rating={5} size="sm" />}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-surface-0 border border-cream-border rounded-xl p-6 md:p-8 shadow-sm">
            {activeTab === 'overview' && (
              <div className="prose prose-zinc max-w-none">
                {/* Note: Normally we'd use react-markdown here. Mocking the render for Phase 18 */}
                <h3>Creator's Note</h3>
                <blockquote className="border-l-4 border-gold pl-4 italic text-ink-light mb-8">
                  "This artifact represents over 400 hours of simulated thermal stress testing. Please ensure you are reviewing the V2 documentation before manufacturing."
                </blockquote>
                
                <h3>Description</h3>
                <p className="t-body text-ink mb-6">
                  {publication.abstract || 'Detailed structural and thermal analysis for atmospheric entry vehicles.'}
                </p>
                <p className="t-body text-ink mb-6">
                  The primary focus of this schematic is to provide an open-source, reproducible framework for building titanium-reinforced thermal plating. It has been validated against standard NASA reentry models.
                </p>

                <h3>Technical Specifications</h3>
                <ul className="list-disc pl-5 mb-8 space-y-2 text-ink">
                  <li><strong>Material:</strong> Titanium Alloy (Grade 5)</li>
                  <li><strong>Thermal Tolerance:</strong> Up to 1,650°C</li>
                  <li><strong>Mass Density:</strong> 4.43 g/cm³</li>
                </ul>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className={`flex flex-col items-center justify-center py-12 bg-surface-1 border border-cream-border rounded-lg overflow-hidden ${isDivisionCode ? 'p-0 border-none bg-transparent' : ''}`}>
                {isDivision3D ? (
                  // Use a public URL to a lightweight dummy OBJ for demonstration
                  <div className="w-full">
                    <ThreeDViewer url="https://raw.githubusercontent.com/alecjacobson/common-3d-test-models/master/data/bunny.obj" />
                  </div>
                ) : isDivisionCode ? (
                  <div className="w-full mt-[-3rem]">
                    <CodeViewer 
                      filename="thermal_simulation.py"
                      language="python"
                      code={`import numpy as np
import matplotlib.pyplot as plt

def simulate_thermal_stress(temperature, duration):
    """
    Simulates the thermal stress on a titanium alloy over time.
    """
    base_stress = 4.43 * temperature
    decay = np.exp(-0.01 * duration)
    return base_stress * decay

# Execute simulation for reentry profile
temps = np.linspace(20, 1650, num=100)
durations = np.arange(0, 600, 6)

stress_results = [simulate_thermal_stress(t, d) for t, d in zip(temps, durations)]

print(f"Max Stress: {max(stress_results):.2f} MPa")
print("Simulation complete. Safe to proceed with manufacturing.")`}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText size={48} className="text-ink-light mb-4 opacity-50" />
                    <h3 className="t-card-title text-ink mb-2">PDF Document Ready</h3>
                    <p className="t-body-sm text-ink-light mb-6">Previewing 14-page schematic document.</p>
                    <button className="btn-secondary px-4 py-2 t-label flex items-center gap-2">
                      <Search size={16} /> Open Lightbox Viewer
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewsTab />
            )}

            {activeTab === 'comments' && (
              <CommentsTab />
            )}
          </div>

        </div>

        {/* Right Column (Sidebar) */}
        <aside className="w-full lg:w-80 shrink-0 space-y-6">
          
          {/* Primary Actions */}
          <div className="bg-surface-0 border border-cream-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <button 
              onClick={handleDownload}
              disabled={downloading}
              className="w-full btn-primary py-3 t-label flex items-center justify-center gap-2"
            >
              <Download size={20} />
              {downloading ? 'Preparing...' : 'Download Artifact'}
            </button>
            <button className="w-full btn-secondary py-3 t-label flex items-center justify-center gap-2">
              <GitFork size={20} />
              Fork to Workspace
            </button>
          </div>

          {/* License Panel */}
          <div className="bg-surface-0 border border-cream-border rounded-xl p-6 shadow-sm">
            <h3 className="t-eyebrow text-ink mb-4">Licensing</h3>
            <div className="mb-4">
              {/* @ts-ignore - Mocking the mapped license for the UI display */}
              <LicenseBadge type="fox" size="md" /> 
            </div>
            <p className="t-body-sm text-ink-light">
              This artifact allows commercial use and modification, provided you credit the original creator. It does not require you to share-alike.
            </p>
          </div>

          {/* Details & Tags */}
          <div className="bg-surface-0 border border-cream-border rounded-xl p-6 shadow-sm">
            <h3 className="t-eyebrow text-ink mb-4">Details</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between t-body-sm">
                <span className="text-ink-light">Version</span>
                <span className="text-ink font-medium">2.0.4</span>
              </div>
              <div className="flex justify-between t-body-sm">
                <span className="text-ink-light">File Size</span>
                <span className="text-ink font-medium">14.2 MB</span>
              </div>
              <div className="flex justify-between t-body-sm">
                <span className="text-ink-light">Forks</span>
                <span className="text-ink font-medium">342</span>
              </div>
            </div>

            <h3 className="t-eyebrow text-ink mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {publication.tags?.length ? publication.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-surface-2 text-ink-light rounded t-body-sm font-mono text-[11px] tracking-wide">
                  {tag}
                </span>
              )) : (
                <span className="px-2.5 py-1 bg-surface-2 text-ink-light rounded t-body-sm font-mono text-[11px] tracking-wide">
                  aerospace
                </span>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-cream-border">
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 text-ink-light hover:text-ink transition-colors t-label w-full justify-center"
              >
                <Share2 size={16} /> Share Artifact
              </button>
            </div>
          </div>

        </aside>

      </div>

      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Artifact"
      >
        <SharePanel publication={publication} />
      </Modal>

      {/* Recommendations Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 border-t border-cream-border pt-16">
        <h2 className="t-section-heading text-ink mb-8">More like this</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_RECOMMENDATIONS.map(item => (
            <ArtifactCard key={item.pubId} {...item} variant="compact" />
          ))}
        </div>
      </section>

    </div>
  );
}
