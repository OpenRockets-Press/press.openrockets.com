import type { IconProps } from './types';

export const LicenseFinch = ({ size = 24, color = "currentColor", className = "", ...props }: IconProps) => (
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
    {/* Finch abstraction on branch */}
    <path d="M22 20H2" />
    <path d="M18 10c0-4-3-7-7-7-2 0-4 1-5 2-2 2-3 5-3 8 0 2 2 4 5 5 1 .5 3 2 5 2h2c1 0 2-1 3-2 1-1 2-2 2-3v-5z" />
    <path d="M8 12c-2 0-4-1-4-3" />
    <path d="M14 9h.01" />
    <path d="M13 20v2" />
    <path d="M17 20v2" />
  </svg>
);
