import type { IconProps } from './types';

export const ORPressLogo = ({ size = 24, color = "currentColor", className = "", ...props }: IconProps) => (
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
    {/* Clean abstraction of a statue/rocket silhouette */}
    <path d="M12 2L8 8v8l-2 4h12l-2-4V8z" />
    <path d="M12 16v6" />
    <path d="M10 22h4" />
  </svg>
);
