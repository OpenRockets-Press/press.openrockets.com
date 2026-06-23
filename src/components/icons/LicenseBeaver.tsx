import type { IconProps } from './types';

export const LicenseBeaver = ({ size = 24, color = "currentColor", className = "", ...props }: IconProps) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className} 
    {...props}
  >
    {/* Beaver geometric abstraction */}
    <path d="M18 16c2 0 4-1 4-3s-2-3-4-3c-1.5 0-3 .5-4 1-2-1.5-4.5-2-7-1-3 1.5-4 5-3 8 1 2.5 3.5 4 6 4 3 0 5-2 6-4" />
    <path d="M7 13h.01" />
    <path d="M12 18v2h-4v-2" />
  </svg>
);
