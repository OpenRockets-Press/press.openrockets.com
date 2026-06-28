export function Spinner({ color }: { color?: string }) {
  return (
    <div className="google-spinner-wrapper">
      <svg className="google-spinner" viewBox="0 0 50 50">
        <circle 
          className="path" 
          cx="25" cy="25" r="20" fill="none" strokeWidth="4" 
          style={color ? { stroke: color } : undefined}
        ></circle>
      </svg>
    </div>
  );
}
