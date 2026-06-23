import type { IconProps } from './types';

export const DivisionCode = ({ size = 24, color = "currentColor", className = "", ...props }: IconProps) => (
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
    {/* Opening bracket with a dot */}
    <path d="M10 4H8a4 4 0 0 0-4 4v1.5a2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1 2.5 2.5V16a4 4 0 0 0 4 4h2" />
    <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none" />
  </svg>
);
