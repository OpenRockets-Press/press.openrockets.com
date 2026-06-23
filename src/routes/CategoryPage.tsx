import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { ArtifactCard } from '@/components/cards/ArtifactCard';
import { DivisionArtifact, Division3D, DivisionCode } from '@/components/icons';
import { ArrowLeft } from 'lucide-react';

const CATEGORY_CONFIG = {
  artifacts: {
    title: 'Artifacts',
    description: 'Blueprints, schematics, and rigorous scientific papers. The foundation of open aerospace.',
    icon: DivisionArtifact,
    heroClass: 'bg-blue-900', // Mocking a specific blue
    tabs: ['All', 'Propulsion', 'Avionics', 'Life Support', 'Aerodynamics', 'Materials'],
  },
  '3d': {
    title: '3D Models',
    description: 'CAD files, STLs, and highly detailed polygonal meshes ready for simulation or printing.',
    icon: Division3D,
    heroClass: 'bg-slate-800',
    tabs: ['All', 'Engine Blocks', 'Habitats', 'Rovers', 'Satellites', 'Tools'],
  },
  code: {
    title: 'Code Snippets',
    description: 'Firmware, trajectory algorithms, and telemetry parsers. The digital nervous system.',
    icon: DivisionCode,
    heroClass: 'bg-zinc-950 border-b-2 border-green-500', // Terminal aesthetic
    tabs: ['All', 'Python', 'C++', 'Rust', 'Embedded', 'Simulations'],
  }
} as const;

type DivisionId = keyof typeof CATEGORY_CONFIG;

// Generate dummy data ensuring we have items for all divisions
const DUMMY_DATA = Array.from({ length: 24 }).map((_, i) => {
  let div: DivisionId = 'artifacts';
  if (i % 3 === 1) div = '3d';
  if (i % 3 === 2) div = 'code';

  return {
    pubId: `cat-item-${i}`,
    title: `${div === 'artifacts' ? 'Blueprint' : div === '3d' ? 'CAD Model' : 'Script'} ${i + 1}`,
    creator: 'Open Aerospace Initiative',
    date: 'Oct 16, 2026',
    description: `A highly detailed open-source component representing the best of the ${div} category.`,
    tags: [div, 'open-source', 'aerospace'],
    rating: 4 + (Math.random() * 1),
    division: div === 'artifacts' ? 'artifact' as const : div,
    license: 'fox' as const,
    thumbnailUrl: div !== 'code' ? 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800' : undefined,
  };
});

export function CategoryPage() {
  const { divisionId } = useParams({ from: '/category/$divisionId' });
  const [activeTab, setActiveTab] = useState('All');

  // Validate division
  if (!(divisionId in CATEGORY_CONFIG)) {
    return (
      <div className="min-h-screen bg-surface-1 flex flex-col items-center justify-center">
        <h1 className="t-card-title text-ink mb-4">Division not found</h1>
        <Link to="/browse" className="btn-primary px-6 py-2 t-label">Return to Catalog</Link>
      </div>
    );
  }

  const config = CATEGORY_CONFIG[divisionId as DivisionId];
  const Icon = config.icon;

  // Filter data (In a real app, this would use activeTab + divisionId for an API call)
  const filteredData = DUMMY_DATA.filter(item => {
    const itemDiv = item.division === 'artifact' ? 'artifacts' : item.division;
    return itemDiv === divisionId;
  });

  return (
    <div className="min-h-screen bg-surface-0 pb-20">
      
      {/* Dynamic Hero */}
      <section className={`w-full py-20 px-4 text-center relative ${config.heroClass} transition-colors duration-500`}>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <Link to="/" className="absolute left-0 top-0 text-cream-muted hover:text-cream flex items-center gap-2 t-label transition-colors">
            <ArrowLeft size={16} /> Back
          </Link>
          
          <div className="w-24 h-24 bg-surface-0/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6 text-cream border border-cream/20 shadow-xl">
            <Icon size={48} />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif text-cream mb-6 tracking-tight">
            {config.title}
          </h1>
          <p className="t-intro text-cream-muted max-w-2xl">
            {config.description}
          </p>
        </div>
      </section>

      {/* Sub-category Tabs */}
      <div className="w-full bg-surface-1 border-y border-cream-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 py-3 items-center">
            {config.tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full t-label whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? 'bg-ink text-surface-0' 
                    : 'bg-surface-0 border border-cream-border text-ink-light hover:border-ink hover:text-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="t-section-heading text-ink">
            {activeTab === 'All' ? `All ${config.title}` : `${activeTab} ${config.title}`}
          </h2>
          <span className="t-body-sm text-ink-light">Showing {filteredData.length} items</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredData.map(item => (
            <ArtifactCard key={item.pubId} {...item} variant="default" />
          ))}
        </div>
      </section>

    </div>
  );
}
