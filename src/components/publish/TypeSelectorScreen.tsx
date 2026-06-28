import { useState, useEffect, useMemo } from "react";
import { clsx } from "clsx";

type BoxSize = 1 | 2 | 3;

interface ArtifactType {
  id: string;
  label: string;
  coreCategory: string;
  size: BoxSize;
}

export const BASE_TYPES: ArtifactType[] = [
  { id: "research", label: "Research", coreCategory: "Research", size: 3 },
  { id: "painting", label: "Painting", coreCategory: "Images", size: 3 },
  { id: "software", label: "Software and Code", coreCategory: "Software and Code", size: 3 },
  
  { id: "3d-model", label: "3D Model", coreCategory: "3D Models", size: 2 },
  { id: "3d-animation", label: "3D Animated Model", coreCategory: "3D Models", size: 2 },
  { id: "3d-print", label: "3D Object for Printing", coreCategory: "3D Models", size: 2 },
  { id: "mobile-app", label: "Mobile App", coreCategory: "Software and Code", size: 2 },
  { id: "web-code", label: "Website Code", coreCategory: "Software and Code", size: 2 },
  { id: "web-game", label: "Web-based Game", coreCategory: "Software and Code", size: 2 },
  { id: "algorithm", label: "Algorithm", coreCategory: "Software and Code", size: 2 },
  { id: "code-solution", label: "Code Problem Solution", coreCategory: "Software and Code", size: 2 },
  { id: "breakthrough", label: "Breakthrough Software", coreCategory: "Software and Code", size: 2 },
  { id: "club-posters", label: "Club Posters", coreCategory: "Club Artifacts", size: 2 },
  { id: "presentation", label: "Presentation Banners", coreCategory: "Club Artifacts", size: 2 },
  
  { id: "creative-photo", label: "Creative Photographs", coreCategory: "Images", size: 1 },
  { id: "still-photo", label: "Still Photograph", coreCategory: "Images", size: 1 },
  { id: "landscape", label: "Landscape", coreCategory: "Images", size: 1 },
  { id: "awareness-pdf", label: "Awareness PDFs", coreCategory: "Club Artifacts", size: 1 },
  { id: "posters", label: "Posters", coreCategory: "Club Artifacts", size: 1 },
  { id: "scripts", label: "Scripts", coreCategory: "Software and Code", size: 1 },
  { id: "lit-review", label: "Literature Review", coreCategory: "Research", size: 1 },
  { id: "meta-analysis", label: "Meta-Analysis", coreCategory: "Research", size: 1 },
  { id: "web-ui", label: "Web UI", coreCategory: "Software and Code", size: 1 },
  { id: "backend", label: "Backend API", coreCategory: "Software and Code", size: 1 },
  { id: "robotics", label: "Robotics Code", coreCategory: "Software and Code", size: 1 },
  { id: "arduino", label: "Arduino Project", coreCategory: "Software and Code", size: 1 },
  { id: "portrait", label: "Portrait", coreCategory: "Images", size: 1 },
  { id: "abstract-art", label: "Abstract Art", coreCategory: "Images", size: 1 },
  { id: "case-study", label: "Case Study", coreCategory: "Research", size: 1 },
  { id: "survey-results", label: "Survey Results", coreCategory: "Research", size: 1 },
  { id: "cad-model", label: "CAD Model", coreCategory: "3D Models", size: 1 },
  { id: "topology", label: "Topology", coreCategory: "3D Models", size: 1 },
  { id: "flyer", label: "Flyer", coreCategory: "Club Artifacts", size: 1 },
  { id: "brochure", label: "Brochure", coreCategory: "Club Artifacts", size: 1 },
  { id: "neural-net", label: "Neural Network", coreCategory: "Software and Code", size: 1 },
  { id: "data-vis", label: "Data Visualization", coreCategory: "Software and Code", size: 1 },
  { id: "cli-tool", label: "CLI Tool", coreCategory: "Software and Code", size: 1 },
  { id: "math-proof", label: "Math Proof", coreCategory: "Research", size: 1 },
];

const METRO_COLORS = [
  "#00a4e4", "#82c341", "#d52b1e", "#f2a900", 
  "#613393", "#e8112d", "#009ca6", "#ff7300"
];

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function TypeSelectorScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("#000");
  const [slideIn, setSlideIn] = useState(false);
  const [ripples, setRipples] = useState<{ x: number, y: number, id: number }[]>([]);

  const types = useMemo(() => {
    const shuffled = shuffleArray(BASE_TYPES);
    // Sort descending by size so that 3x3s are processed first by the grid 
    // and naturally stay near the top, preventing important items from falling to the bottom.
    return shuffled.sort((a, b) => b.size - a.size);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("publish_artifact_type");
    if (saved) {
      setSelectedId(saved);
      setSelectedColor(METRO_COLORS[Math.floor(Math.random() * METRO_COLORS.length)]);
    }

    const timer = setTimeout(() => setSlideIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  const handleSelect = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    createRipple(e);
    setSelectedId(id);
    const randomColor = METRO_COLORS[Math.floor(Math.random() * METRO_COLORS.length)];
    setSelectedColor(randomColor);
    localStorage.setItem("publish_artifact_type", id);

    // Auto-advance after showing color change and ripple
    setTimeout(() => {
      window.location.hash = "#license";
    }, 700);
  };

  return (
    <div 
      style={{ 
        display: "flex", 
        flexDirection: "column",
        minHeight: "70vh",
        transform: slideIn ? 'translateX(0)' : 'translateX(20px)',
        opacity: slideIn ? 1 : 0,
        transition: 'all 0.4s ease-out',
        padding: '1rem'
      }}
    >
      <h1 style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "2rem", marginBottom: "2rem", color: "#111" }}>
        Select your artifact type
      </h1>

      <div className="type-selector-grid">
        {types.map((type) => {
          const isSelected = selectedId === type.id;
          
          let borderWidth = "2px";
          let fontWeight: React.CSSProperties['fontWeight'] = 500;
          let fontSize = "0.9rem";
          
          if (type.size === 3) {
            borderWidth = "4px";
            fontWeight = "bold";
            fontSize = "1.5rem";
          } else if (type.size === 2) {
            borderWidth = "3px";
            fontWeight = 600;
            fontSize = "1.2rem";
          }

          return (
            <button
              key={type.id}
              onClick={(e) => handleSelect(type.id, e)}
              className={clsx(
                "type-box",
                `span-${type.size}`,
                isSelected && "selected"
              )}
              style={{
                borderWidth,
                position: "relative",
                ...(isSelected ? { 
                  backgroundColor: selectedColor, 
                  borderColor: selectedColor,
                  color: "#fff"
                } : {})
              }}
            >
              <span className="type-box-text" style={{ 
                fontSize,
                fontWeight,
                fontFamily: "Ubuntu, sans-serif",
                position: "relative",
                zIndex: 1
              }}>
                {type.label}
              </span>
              {ripples.map((r) => (
                <span
                  key={r.id}
                  className="ripple"
                  style={{
                    left: r.x,
                    top: r.y,
                    width: type.size === 3 ? "300px" : type.size === 2 ? "200px" : "150px",
                    height: type.size === 3 ? "300px" : type.size === 2 ? "200px" : "150px",
                    marginLeft: type.size === 3 ? "-150px" : type.size === 2 ? "-100px" : "-75px",
                    marginTop: type.size === 3 ? "-150px" : type.size === 2 ? "-100px" : "-75px"
                  }}
                />
              ))}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem' }}>
        <button 
          onClick={() => window.location.hash = "#welcome"}
          style={{
            padding: "10px 24px",
            backgroundColor: "transparent",
            color: "#000",
            border: "1px solid #000",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
