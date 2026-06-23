import { Link } from '@tanstack/react-router';
import {
  LicenseEagle,
  LicenseBeaver,
  LicenseFox,
  LicenseFinch
} from '@/components/icons';

export type LicenseType = 'eagle' | 'beaver' | 'fox' | 'finch';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface LicenseBadgeProps {
  type: LicenseType;
  size?: BadgeSize;
}

const configMap: Record<LicenseType, { icon: typeof LicenseEagle, label: string, tooltip: string, colorClass: string }> = {
  eagle: {
    icon: LicenseEagle,
    label: 'Eagle (Public Domain)',
    tooltip: 'No restrictions. Use, modify, and distribute freely.',
    colorClass: 'bg-surface-1 border-cream-border text-ink hover:border-gold hover:text-gold',
  },
  beaver: {
    icon: LicenseBeaver,
    label: 'Beaver (Attribution)',
    tooltip: 'Use freely, but you must credit the original creator.',
    colorClass: 'bg-surface-1 border-cream-border text-ink hover:border-gold hover:text-gold',
  },
  fox: {
    icon: LicenseFox,
    label: 'Fox (ShareAlike)',
    tooltip: 'Derivatives must be shared under the same license terms.',
    colorClass: 'bg-surface-1 border-cream-border text-ink hover:border-gold hover:text-gold',
  },
  finch: {
    icon: LicenseFinch,
    label: 'Finch (Non-Commercial)',
    tooltip: 'Free for personal/research use. Commercial use prohibited.',
    colorClass: 'bg-surface-1 border-cream-border text-ink hover:border-gold hover:text-gold',
  },
};

const sizeMap: Record<BadgeSize, { container: string, iconSize: number, text: string }> = {
  sm: {
    container: 'px-2 py-1 gap-1.5 rounded-md border',
    iconSize: 12,
    text: 'text-[10px] font-medium tracking-wide uppercase',
  },
  md: {
    container: 'px-3 py-1.5 gap-2 rounded-md border',
    iconSize: 16,
    text: 'text-xs font-semibold tracking-wide uppercase',
  },
  lg: {
    container: 'px-4 py-2 gap-2.5 rounded-lg border-2',
    iconSize: 20,
    text: 'text-sm font-semibold tracking-wider uppercase',
  },
};

export function LicenseBadge({ type, size = 'md' }: LicenseBadgeProps) {
  const config = configMap[type];
  const sizing = sizeMap[size];
  const Icon = config.icon;

  return (
    <Link
      to="/license" // Or specific like `/license/$type` if supported
      title={config.tooltip}
      className={`inline-flex items-center transition-colors duration-200 ${sizing.container} ${config.colorClass}`}
    >
      <Icon size={sizing.iconSize} />
      <span className={sizing.text}>{config.label}</span>
    </Link>
  );
}
