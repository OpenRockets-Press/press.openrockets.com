import { useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPublicationByPubId } from "@/lib/api";
import { Division3D, DivisionCode, DivisionArtifact } from "@/components/icons";
import { StarRating } from "@/components/reviews/StarRating";

export function EmbedPage() {
  const { pubId } = useParams({ strict: false }) as { pubId?: string };

  const { data: publication, isLoading, error } = useQuery({
    queryKey: ["publication", "detail", pubId],
    queryFn: () => getPublicationByPubId(pubId!),
    enabled: Boolean(pubId),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-surface-0 border border-cream-border p-6 rounded-xl font-sans">
        <div className="animate-pulse w-8 h-8 rounded-full bg-surface-2" />
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-surface-0 border border-cream-border p-6 rounded-xl text-center font-sans">
        <div>
          <p className="text-ink-light font-medium mb-2">Artifact Unavailable</p>
          <a href="https://press.openrockets.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:underline">
            Visit Open Rockets Press
          </a>
        </div>
      </div>
    );
  }

  const isDivision3D = publication.tags?.includes('3d') || pubId === 'test-3d'; 
  const isDivisionCode = publication.tags?.includes('code') || pubId === 'test-code'; 
  
  const divisionTitle = isDivision3D ? '3D Models' : isDivisionCode ? 'Code' : 'Artifacts';
  const divisionIcon = isDivision3D ? <Division3D size={16} /> : isDivisionCode ? <DivisionCode size={16} /> : <DivisionArtifact size={16} />;
  const divisionColor = isDivision3D ? 'bg-slate-800' : isDivisionCode ? 'bg-zinc-950' : 'bg-blue-900';

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col bg-surface-0 border border-cream-border rounded-xl overflow-hidden font-sans">
      
      {/* Visual Header */}
      <div className="h-40 bg-surface-2 relative flex items-center justify-center overflow-hidden shrink-0">
        {publication.coverStorageId ? (
          <img src={`https://placehold.co/800x400?text=${encodeURIComponent(publication.title)}`} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="text-ink-light/20 scale-[2]">
            {divisionIcon}
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 bg-surface-0/90 backdrop-blur-sm rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
            {publication.type}
          </span>
          <span className="px-2.5 py-1 bg-gold text-cream rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
            {publication.license}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1 flex items-center justify-center rounded text-cream ${divisionColor}`}>
            {divisionIcon}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-light">{divisionTitle}</span>
          <div className="w-1 h-1 rounded-full bg-cream-border" />
          <StarRating rating={4.8} size="sm" />
        </div>
        
        <h2 className="text-xl font-serif text-ink mb-2 line-clamp-2 leading-tight">
          {publication.title}
        </h2>
        
        <div className="flex items-center gap-2 text-xs text-ink-light mb-4">
          <span className="font-medium text-ink">{publication.authorDisplayName}</span>
          <span>•</span>
          <span>Oct 15, 2026</span>
        </div>

        <p className="text-sm text-ink-light line-clamp-3 mb-6 flex-1">
          {publication.abstract || "Detailed structural and thermal analysis for atmospheric entry vehicles."}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-cream-border">
          <a 
            href={`/p/${publication.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-ink text-surface-0 text-sm font-medium rounded-lg hover:bg-ink-light transition-colors"
          >
            View Full Artifact
          </a>
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-light/50">
            Open Rockets Press
          </span>
        </div>
      </div>

    </div>
  );
}
