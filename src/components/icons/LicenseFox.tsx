import type { IconProps } from './types';

export const LicenseFox = ({ size = 24, color = "currentColor", className = "", ...props }: IconProps) => (
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
    {/* Fox head abstraction */}
    <path d="M22 6l-4 6-6 10L6 12 2 6l6 2 4 4 4-4 6-2z" />
    <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
    <path d="M8 10h.01" />
    <path d="M16 10h.01" />
  </svg>
);
