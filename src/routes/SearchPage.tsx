import { useSearch } from '@tanstack/react-router';
import { ArtifactCard } from '@/components/cards/ArtifactCard';
import { Search } from 'lucide-react';
import React from 'react';

const DUMMY_RESULTS = [
  {
    pubId: 'search-1',
    title: 'Titanium Thermal Plating',
    creator: 'Aero Dynamics',
    date: 'Oct 15, 2026',
    description: 'High-stress thermal plating for atmospheric entry. Designed using titanium alloys and validated via extensive thermal simulation models.',
    tags: ['aerospace', 'thermal', 'titanium'],
    rating: 4.8,
    division: 'artifact' as const,
    license: 'fox' as const,
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
  },
  {
    pubId: 'search-2',
    title: 'Thermal Simulation Engine (Python)',
    creator: 'SysAdmin404',
    date: 'Sep 22, 2026',
    description: 'A robust python library for executing real-time thermal simulations. Frequently used alongside titanium parts for orbital re-entry testing.',
    tags: ['python', 'simulation', 'thermal'],
    rating: 4.2,
    division: 'code' as const,
    license: 'eagle' as const,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
  }
];

// Highlight utility
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-gold/30 text-ink font-medium px-0.5 rounded">{part}</mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

export function SearchPage() {
  const { q: rawQuery } = useSearch({ from: '/search' });
  const query = (rawQuery as string) || '';

  // Filter local dummy data based on query
  const results = DUMMY_RESULTS.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface-1 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="pb-6 border-b border-cream-border">
          <h1 className="text-3xl font-serif text-ink mb-2">
            Search Results for "{query}"
          </h1>
          <p className="t-body text-ink-light">
            Found {results.length} results matching your query.
          </p>
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-surface-0 border border-cream-border rounded-xl">
            <Search size={48} className="text-ink-light opacity-30 mb-6" />
            <h2 className="t-card-title text-ink mb-2">No exact matches found</h2>
            <p className="t-body text-ink-light max-w-md">
              We couldn't find any schematics or models matching "{query}". Try adjusting your search terms or checking your spelling.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((item) => {
              // We intercept the title and description to render highlighted versions
              const highlightedItem = {
                ...item,
                titleNode: <HighlightText text={item.title} query={query} />,
                descriptionNode: <HighlightText text={item.description} query={query} />,
              };
              
              return (
                <ArtifactCard 
                  key={highlightedItem.pubId} 
                  {...highlightedItem} 
                  variant="list-row"
                />
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
