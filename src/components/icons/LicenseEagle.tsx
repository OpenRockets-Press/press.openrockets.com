import type { IconProps } from './types';

export const LicenseEagle = ({ size = 24, color = "currentColor", className = "", ...props }: IconProps) => (
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
    {/* Eagle profile silhouette abstraction */}
    <path d="M22 10c0-2-3-4-8-5s-8 2-10 6c0 0-1 4 4 3 0 0 3-1 6-1 2 0 4 2 6 2s2-5 2-5z" />
    <path d="M4 14c2 2 4 4 8 4s6-2 8-5" />
    <path d="M16 9h.01" />
  </svg>
);
