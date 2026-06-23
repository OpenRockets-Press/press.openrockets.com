import { Link } from '@tanstack/react-router';
import { Star } from 'lucide-react';
import {
  DivisionArtifact,
  Division3D,
  DivisionCode,
  LicenseEagle,
  LicenseBeaver,
  LicenseFox,
  LicenseFinch
} from '@/components/icons';

export type ArtifactDivision = 'artifact' | '3d' | 'code';
export type ArtifactLicense = 'eagle' | 'beaver' | 'fox' | 'finch';
export type CardVariant = 'default' | 'compact' | 'list-row';

export interface ArtifactCardProps {
  pubId: string;
  title: string;
  creator: string;
  date: string;
  description: string;
  tags: string[];
  rating: number;
  thumbnailUrl?: string;
  division: ArtifactDivision;
  license: ArtifactLicense;
  variant?: CardVariant;
  titleNode?: React.ReactNode;
  descriptionNode?: React.ReactNode;
}

const DivisionIconMap: Record<ArtifactDivision, typeof DivisionArtifact> = {
  'artifact': DivisionArtifact,
  '3d': Division3D,
  'code': DivisionCode,
};

const LicenseIconMap: Record<ArtifactLicense, typeof LicenseEagle> = {
  'eagle': LicenseEagle,
  'beaver': LicenseBeaver,
  'fox': LicenseFox,
  'finch': LicenseFinch,
};

export function ArtifactCard({
  pubId,
  title,
  creator,
  date,
  description,
  tags,
  rating,
  thumbnailUrl,
  division,
  license,
  variant = 'default',
}: ArtifactCardProps) {
  const DivIcon = DivisionIconMap[division];
  const LicIcon = LicenseIconMap[license];
  
  const displayTags = tags.slice(0, 3);
  const remainingTags = tags.length - displayTags.length;

  const renderStars = () => {
    const fullStars = Math.floor(rating);
    const elements = [];
    for (let i = 0; i < 5; i++) {
      elements.push(
        <Star 
          key={i} 
          size={14} 
          className={i < fullStars ? "text-gold fill-gold" : "text-cream-border"} 
        />
      );
    }
    return elements;
  };

  const imagePlaceholder = (
    <div className="w-full h-full bg-surface-2 flex items-center justify-center text-ink-light">
      <DivIcon size={48} className="opacity-20" />
    </div>
  );

  const thumbnailContent = thumbnailUrl ? (
    <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
  ) : imagePlaceholder;

  if (variant === 'list-row') {
    return (
      <Link 
        to="/p/$pubId" 
        params={{ pubId }} 
        className="group flex flex-col sm:flex-row gap-6 bg-surface-0 border border-cream-border p-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
      >
        <div className="w-full sm:w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg relative">
          {thumbnailContent}
          <div className="absolute top-2 left-2 bg-surface-0/90 backdrop-blur-sm p-1 rounded-md text-ink">
            <DivIcon size={16} />
          </div>
        </div>
        
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <span className="t-label text-gold uppercase tracking-wider text-xs">{division}</span>
              <span className="text-cream-border">&bull;</span>
              <span className="text-xs text-ink-light flex items-center gap-1">
                <LicIcon size={12} /> {license}
              </span>
            </div>
            <div className="flex items-center gap-1 hidden sm:flex">
              {renderStars()}
            </div>
          </div>

          <h3 className="t-card-title text-ink truncate mb-1 group-hover:text-gold transition-colors">{titleNode || title}</h3>
          
          <div className="flex items-center gap-2 text-sm text-ink-light mb-3">
            <span className="font-medium text-ink">{creator}</span>
            <span>&bull;</span>
            <span>{date}</span>
          </div>

          <p className="t-body-sm text-ink-light line-clamp-2 mb-4 max-w-2xl">{descriptionNode || description}</p>

          <div className="mt-auto flex items-center gap-2 flex-wrap">
            {displayTags.map(t => (
              <span key={t} className="px-2 py-1 bg-surface-1 border border-cream-border rounded-md text-[10px] uppercase font-medium text-ink-light">
                {t}
              </span>
            ))}
            {remainingTags > 0 && (
              <span className="px-2 py-1 text-[10px] font-medium text-ink-light">
                +{remainingTags}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link 
        to="/p/$pubId" 
        params={{ pubId }} 
        className="group flex flex-col bg-surface-0 border border-cream-border rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full"
      >
        <div className="w-full aspect-video relative overflow-hidden flex-shrink-0 border-b border-cream-border">
          {thumbnailContent}
          <div className="absolute top-2 right-2 bg-surface-0/90 backdrop-blur-sm px-2 py-1 rounded-md text-ink flex items-center gap-1 shadow-sm">
            <DivIcon size={14} />
            <LicIcon size={14} />
          </div>
        </div>
        
        <div className="p-4 flex flex-col flex-1">
          <h3 className="t-label text-ink line-clamp-1 mb-1 group-hover:text-gold transition-colors" title={title}>{title}</h3>
          <p className="text-xs text-ink-light mb-2">{creator}</p>
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-1">
              {renderStars()}
            </div>
            <span className="text-xs text-ink-light">{date}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Default Variant
  return (
    <Link 
      to="/p/$pubId" 
      params={{ pubId }} 
      className="group flex flex-col bg-surface-0 border border-cream-border rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full"
    >
      <div className="w-full aspect-square md:aspect-video relative overflow-hidden flex-shrink-0 border-b border-cream-border">
        {thumbnailContent}
        <div className="absolute top-3 left-3 bg-surface-0/90 backdrop-blur-sm p-1.5 rounded-lg text-ink shadow-sm">
          <DivIcon size={20} />
        </div>
        <div className="absolute bottom-3 right-3 bg-ink/90 backdrop-blur-sm px-2 py-1 rounded-md text-cream flex items-center gap-1.5 shadow-sm">
          <LicIcon size={14} />
          <span className="text-xs font-medium uppercase tracking-wider">{license}</span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="t-label text-gold uppercase tracking-wider text-[10px]">{division}</span>
          <div className="flex items-center gap-1">
            {renderStars()}
          </div>
        </div>

        <h3 className="t-card-title text-ink line-clamp-2 mb-2 group-hover:text-gold transition-colors leading-tight" title={title}>{title}</h3>
        
        <div className="flex items-center gap-2 text-sm text-ink-light mb-3">
          <span className="font-medium text-ink">{creator}</span>
          <span>&bull;</span>
          <span>{date}</span>
        </div>

        <p className="t-body-sm text-ink-light line-clamp-3 mb-6 flex-1">{description}</p>

        <div className="mt-auto flex items-center gap-2 flex-wrap pt-4 border-t border-cream-border border-dashed">
          {displayTags.map(t => (
            <span key={t} className="px-2.5 py-1 bg-surface-1 border border-cream-border rounded-md text-[10px] uppercase font-semibold text-ink hover:border-gold transition-colors">
              {t}
            </span>
          ))}
          {remainingTags > 0 && (
            <span className="px-2 py-1 text-[10px] font-medium text-ink-light">
              +{remainingTags}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
