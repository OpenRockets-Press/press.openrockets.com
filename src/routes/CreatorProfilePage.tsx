import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { Globe, Heart, Star, Download, GitFork, ShieldCheck, Code, Briefcase } from 'lucide-react';
import { ArtifactCard } from '@/components/cards/ArtifactCard';
import { DivisionArtifact, Division3D, DivisionCode } from '@/components/icons';

// Mock Data
const MOCK_CREATOR = {
  username: 'open-aerospace',
  displayName: 'Open Aerospace Initiative',
  avatar: 'https://images.unsplash.com/photo-1541873676-11814e1ed8d3?auto=format&fit=crop&q=80&w=200',
  bio: 'A non-profit collective of aerospace engineers dedicated to open-sourcing orbital mechanics, thermal dynamics, and propulsion systems. Building the foundation for decentralized space exploration.',
  joinedDate: 'Joined March 2024',
  isVerified: true,
  links: {
    github: 'https://github.com/open-aerospace',
    linkedin: 'https://linkedin.com/company/open-aerospace',
    website: 'https://openaerospace.org'
  },
  stats: {
    downloads: '142K',
    forks: '12.4K',
    avgRating: '4.9'
  }
};

const MOCK_ARTIFACTS = Array.from({ length: 6 }).map((_, i) => ({
  pubId: `art-${i}`,
  title: i % 3 === 0 ? 'Titanium Thermal Plating' : i % 3 === 1 ? 'Ion Thruster Array' : 'Orbital Trajectory Alg',
  creator: 'Open Aerospace Initiative',
  date: 'Oct 16, 2026',
  description: 'Open-source documentation and schematics for advanced aerospace manufacturing.',
  tags: ['aerospace', 'propulsion', 'thermal'],
  rating: 4.8,
  division: (i % 3 === 0 ? 'artifact' : i % 3 === 1 ? '3d' : 'code') as 'artifact' | '3d' | 'code',
  license: 'fox' as const,
  thumbnailUrl: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&q=80&w=800',
}));

export function CreatorProfilePage() {
  const { username } = useParams({ strict: false }) as { username?: string };
  const [activeTab, setActiveTab] = useState<'all' | 'artifact' | '3d' | 'code'>('all');

  const filteredArtifacts = activeTab === 'all' 
    ? MOCK_ARTIFACTS 
    : MOCK_ARTIFACTS.filter(a => a.division === activeTab);

  return (
    <div className="min-h-screen bg-surface-1 pb-20">
      
      {/* Dark Hero Section */}
      <div className="bg-zinc-950 text-cream pt-20 pb-16 px-4 sm:px-6 lg:px-8 border-b-4 border-gold">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">
          
          <img 
            src={MOCK_CREATOR.avatar} 
            alt={MOCK_CREATOR.displayName} 
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-surface-0 object-cover shadow-2xl"
          />
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-4xl md:text-5xl font-serif">{MOCK_CREATOR.displayName}</h1>
              {MOCK_CREATOR.isVerified && (
                <ShieldCheck size={28} className="text-gold" />
              )}
            </div>
            
            <p className="font-mono text-cream-muted mb-4">@{username || MOCK_CREATOR.username}</p>
            
            <p className="text-lg text-cream/80 max-w-2xl leading-relaxed mb-6">
              {MOCK_CREATOR.bio}
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8">
              <a href={MOCK_CREATOR.links.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium">
                <Code size={18} /> GitHub
              </a>
              <a href={MOCK_CREATOR.links.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium">
                <Briefcase size={18} /> LinkedIn
              </a>
              <a href={MOCK_CREATOR.links.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium">
                <Globe size={18} /> Website
              </a>
            </div>
            
            {/* Stats Row */}
            <div className="flex items-center justify-center md:justify-start gap-8 border-t border-white/10 pt-6">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 text-cream-muted mb-1 text-sm"><Download size={16} /> Downloads</div>
                <div className="text-2xl font-bold font-mono">{MOCK_CREATOR.stats.downloads}</div>
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 text-cream-muted mb-1 text-sm"><GitFork size={16} /> Forks</div>
                <div className="text-2xl font-bold font-mono">{MOCK_CREATOR.stats.forks}</div>
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 text-cream-muted mb-1 text-sm"><Star size={16} /> Avg Rating</div>
                <div className="text-2xl font-bold font-mono text-gold">{MOCK_CREATOR.stats.avgRating}</div>
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto mt-6 md:mt-0">
            <button className="w-full md:w-auto btn-primary px-8 py-3 flex items-center justify-center gap-2 text-lg shadow-gold">
              <Heart size={20} className="text-red-500 fill-current" /> Support Creator
            </button>
            <p className="text-center text-xs text-cream-muted mt-3">Accepts Crypto & Fiat</p>
          </div>

        </div>
      </div>

      {/* Portfolio Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-serif text-ink">Published Works</h2>
          
          {/* Filter Tabs */}
          <div className="flex bg-surface-0 rounded-lg p-1 shadow-sm border border-cream-border">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-md t-label text-sm transition-colors ${activeTab === 'all' ? 'bg-ink text-surface-0 shadow' : 'text-ink-light hover:text-ink'}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveTab('artifact')}
              className={`px-4 py-2 rounded-md t-label text-sm transition-colors flex items-center gap-2 ${activeTab === 'artifact' ? 'bg-ink text-surface-0 shadow' : 'text-ink-light hover:text-ink'}`}
            >
              <DivisionArtifact size={14} /> Artifacts
            </button>
            <button 
              onClick={() => setActiveTab('3d')}
              className={`px-4 py-2 rounded-md t-label text-sm transition-colors flex items-center gap-2 ${activeTab === '3d' ? 'bg-ink text-surface-0 shadow' : 'text-ink-light hover:text-ink'}`}
            >
              <Division3D size={14} /> 3D Models
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 rounded-md t-label text-sm transition-colors flex items-center gap-2 ${activeTab === 'code' ? 'bg-ink text-surface-0 shadow' : 'text-ink-light hover:text-ink'}`}
            >
              <DivisionCode size={14} /> Code
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArtifacts.map(artifact => (
            <ArtifactCard key={artifact.pubId} {...artifact} />
          ))}
        </div>
        
        {filteredArtifacts.length === 0 && (
          <div className="text-center py-20 bg-surface-0 border border-cream-border rounded-xl">
            <p className="t-body text-ink-light">No publications found in this category.</p>
          </div>
        )}
      </div>

    </div>
  );
}
