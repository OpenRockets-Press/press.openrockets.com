import { useState, useEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { ArtifactCard } from '@/components/cards/ArtifactCard';
import { Check, Grid, List, X, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const DUMMY_ARTIFACTS = Array.from({ length: 24 }).map((_, i) => ({
  pubId: `browse-item-${i}`,
  title: `Open-Source Hardware Module ${i + 1}`,
  creator: 'Community Member',
  date: 'Oct 15, 2026',
  description: 'A robust open-source design ready for modification and deployment.',
  tags: ['hardware', 'open-source', 'module'],
  rating: 4 + (Math.random() * 1),
  division: i % 3 === 0 ? ('code' as const) : i % 2 === 0 ? ('3d' as const) : ('artifact' as const),
  license: i % 4 === 0 ? ('eagle' as const) : i % 3 === 0 ? ('fox' as const) : i % 2 === 0 ? ('finch' as const) : ('beaver' as const),
}));

export function BrowsePage() {
  const search = useSearch({ from: '/browse' });
  const navigate = useNavigate({ from: '/browse' });

  // Read search params with defaults
  const currentDivision = (search as any).division || 'all';
  const currentLicense = (search as any).license || 'all';
  const currentSort = (search as any).sort || 'newest';
  const currentView = (search as any).view || 'grid';
  const currentPage = Number((search as any).page) || 1;

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filter the dummy data locally for demonstration
  const filteredData = DUMMY_ARTIFACTS.filter((item) => {
    if (currentDivision !== 'all' && item.division !== currentDivision) return false;
    if (currentLicense !== 'all' && item.license !== currentLicense) return false;
    return true;
  });

  const updateSearch = (newParams: any) => {
    navigate({
      search: (prev: any) => ({ ...prev, ...newParams, page: newParams.page || 1 }),
    });
  };

  const clearFilters = () => {
    navigate({
      search: { view: currentView }, // Preserve view mode
    });
  };

  const hasActiveFilters = currentDivision !== 'all' || currentLicense !== 'all';

  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* Division Filter */}
      <div>
        <h3 className="t-label text-ink mb-4">Division</h3>
        <div className="space-y-2">
          {['all', 'artifact', '3d', 'code'].map((div) => {
            const isSelected = currentDivision === div;
            return (
              <label key={div} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-gold border-gold' : 'border-cream-border bg-surface-0 group-hover:border-gold'}`}>
                  {isSelected && <Check size={14} className="text-cream" />}
                </div>
                <input 
                  type="radio" 
                  name="division" 
                  className="hidden" 
                  checked={isSelected}
                  onChange={() => updateSearch({ division: div === 'all' ? undefined : div })}
                />
                <span className={`t-body-sm capitalize ${isSelected ? 'text-ink font-medium' : 'text-ink-light group-hover:text-ink'}`}>
                  {div === 'all' ? 'All Divisions' : div}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* License Filter */}
      <div>
        <h3 className="t-label text-ink mb-4">License</h3>
        <div className="space-y-2">
          {['all', 'eagle', 'beaver', 'fox', 'finch'].map((lic) => {
            const isSelected = currentLicense === lic;
            return (
              <label key={lic} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-gold border-gold' : 'border-cream-border bg-surface-0 group-hover:border-gold'}`}>
                  {isSelected && <Check size={14} className="text-cream" />}
                </div>
                <input 
                  type="radio" 
                  name="license" 
                  className="hidden" 
                  checked={isSelected}
                  onChange={() => updateSearch({ license: lic === 'all' ? undefined : lic })}
                />
                <span className={`t-body-sm capitalize ${isSelected ? 'text-ink font-medium' : 'text-ink-light group-hover:text-ink'}`}>
                  {lic === 'all' ? 'Any License' : lic}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-1">
      {/* Header */}
      <div className="bg-surface-0 border-b border-cream-border pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-serif text-ink mb-2">Catalog</h1>
          <p className="t-body text-ink-light">Discover, fork, and build upon thousands of open-source projects.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-cream-border">
              <h2 className="t-eyebrow text-gold">Filters</h2>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="t-body-sm text-error hover:underline">
                  Clear All
                </button>
              )}
            </div>
            <FilterSidebar />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          
          {/* Results Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-cream-border">
            <div className="flex items-center gap-4">
              <button 
                className="md:hidden btn-secondary px-3 py-2 flex items-center gap-2 t-body-sm"
                onClick={() => setIsMobileFiltersOpen(true)}
              >
                <SlidersHorizontal size={16} /> Filters {hasActiveFilters && '(Active)'}
              </button>
              <span className="t-body-sm text-ink-light">
                Showing {filteredData.length} results
              </span>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-auto">
              <select 
                className="bg-surface-0 border border-cream-border rounded-md px-3 py-1.5 t-body-sm text-ink outline-none focus:border-gold"
                value={currentSort}
                onChange={(e) => updateSearch({ sort: e.target.value })}
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>

              <div className="flex bg-surface-0 border border-cream-border rounded-md overflow-hidden">
                <button 
                  className={`p-1.5 transition-colors ${currentView === 'grid' ? 'bg-surface-2 text-ink' : 'text-ink-light hover:text-ink'}`}
                  onClick={() => updateSearch({ view: 'grid' })}
                  aria-label="Grid View"
                >
                  <Grid size={18} />
                </button>
                <button 
                  className={`p-1.5 transition-colors ${currentView === 'list' ? 'bg-surface-2 text-ink' : 'text-ink-light hover:text-ink'}`}
                  onClick={() => updateSearch({ view: 'list' })}
                  aria-label="List View"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Results Grid/List */}
          {filteredData.length === 0 ? (
            <div className="py-20 text-center bg-surface-0 border border-cream-border rounded-xl">
              <p className="t-body text-ink-light mb-4">No artifacts match your selected filters.</p>
              <button onClick={clearFilters} className="btn-primary px-6 py-2 t-label">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={currentView === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredData.map((item) => (
                <ArtifactCard 
                  key={item.pubId} 
                  {...item} 
                  variant={currentView === 'grid' ? 'default' : 'list-row'} 
                />
              ))}
            </div>
          )}

          {/* Pagination Footer */}
          {filteredData.length > 0 && (
            <div className="mt-12 pt-8 border-t border-cream-border flex items-center justify-between">
              <p className="t-body-sm text-ink-light">Page {currentPage} of 12</p>
              <div className="flex gap-2">
                <button 
                  className="p-2 border border-cream-border rounded hover:bg-surface-0 transition-colors disabled:opacity-50"
                  disabled={currentPage <= 1}
                  onClick={() => updateSearch({ page: currentPage - 1 })}
                >
                  <ChevronLeft size={20} className="text-ink" />
                </button>
                <button 
                  className="p-2 border border-cream-border rounded hover:bg-surface-0 transition-colors"
                  onClick={() => updateSearch({ page: currentPage + 1 })}
                >
                  <ChevronRight size={20} className="text-ink" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="relative w-[280px] max-w-[80vw] bg-surface-0 h-full flex flex-col shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-cream-border">
              <h2 className="t-eyebrow text-gold">Filters</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 -mr-2 text-ink-light hover:text-ink">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterSidebar />
            </div>
            <div className="p-4 border-t border-cream-border bg-surface-1 flex gap-4">
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-secondary flex-1 t-label py-3">Clear</button>
              )}
              <button onClick={() => setIsMobileFiltersOpen(false)} className="btn-primary flex-1 t-label py-3">Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
