import { useEffect, useState, useMemo } from "react";

const LOGOS = [
  "/brand/welcomepage1.png",
  "/brand/welcomepage2.png",
  "/brand/welcomepage3.png",
  "/brand/welcomepage4.png",
  "/brand/welcomepage5.png",
];

const BACKGROUND_IMAGES = [
  "/brand/WELCOMECREEN-ASSETS/12088_2024_1218_Fig1_HTML.png",
  "/brand/WELCOMECREEN-ASSETS/5df08d169f4fe0ed3875d9fb6965202d-origami-dragon-red-illustration.png",
  "/brand/WELCOMECREEN-ASSETS/85933.png",
  "/brand/WELCOMECREEN-ASSETS/DIY-car-amplifier-circuit-.png",
  "/brand/WELCOMECREEN-ASSETS/camera-capturing-forest-.png",
  "/brand/WELCOMECREEN-ASSETS/cracked-painted-egg-light-blue-and-white-v6d173886.png",
  "/brand/WELCOMECREEN-ASSETS/isolated-plaster-copy-of-michelangelos-david-head-ancient-greek-sculpture-png.webp",
  "/brand/WELCOMECREEN-ASSETS/teens-drawing-eyes-.png",
  "/brand/WELCOMECREEN-ASSETS/test-tube-blood-test-chemistry-blood-test.png",
];

const WORDS = [
  "artifact",
  "painting",
  "code",
  "research",
  "handcraft",
  "software",
  "poster",
  "3D Model",
  "website",
  "banner",
  "photograph",
  "portrait",
  "landscape",
  "invention",
  "critique",
  "review",
  "abstract",
  "proof"
];

export function WelcomeScreen() {
  const [slideIn, setSlideIn] = useState(false);
  const [logoIndex, setLogoIndex] = useState(0);
  const [scales, setScales] = useState<Record<string, number>>({});
  const [wordIndex, setWordIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = WORDS[wordIndex];
    let typeSpeed = isDeleting ? 40 : 100;
    
    // Create a slight randomness in typing speed for realism
    if (!isDeleting) {
      typeSpeed += Math.random() * 50;
    }
    
    let timer: NodeJS.Timeout;
    
    if (!isDeleting && typedText === currentWord) {
      timer = setTimeout(() => setIsDeleting(true), 1500); // Wait 1.5s before deleting
    } else if (isDeleting && typedText === "") {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    } else {
      timer = setTimeout(() => {
        const nextText = isDeleting 
          ? currentWord.substring(0, typedText.length - 1)
          : currentWord.substring(0, typedText.length + 1);
        setTypedText(nextText);
      }, typeSpeed);
    }
    
    return () => clearTimeout(timer);
  }, [typedText, isDeleting, wordIndex]);

  const bgImagesData = useMemo(() => {
    return BACKGROUND_IMAGES.map((src, index) => {
      const angle = (index / BACKGROUND_IMAGES.length) * 2 * Math.PI + (Math.random() * 0.5 - 0.25);
      
      const targetRadiusX = 35 + Math.random() * 15; // 35vw to 50vw
      const targetRadiusY = 30 + Math.random() * 15; // 30vh to 45vh
      
      const startRadiusX = targetRadiusX + 100; // Start far offscreen
      const startRadiusY = targetRadiusY + 100;
      
      const size = 12 + Math.random() * 12; // 12vw to 24vw (Medium to Large)
      
      const targetX = 50 + Math.cos(angle) * targetRadiusX; // percentage of viewport
      const targetY = 50 + Math.sin(angle) * targetRadiusY;
      
      const startX = 50 + Math.cos(angle) * startRadiusX;
      const startY = 50 + Math.sin(angle) * startRadiusY;
      
      const rotation = (Math.random() - 0.5) * 60; // random rotation
      const startScale = 2 + Math.random() * 2; // start 2-4x bigger (zoom out effect)

      return {
        src,
        startX, startY,
        targetX, targetY,
        size,
        rotation,
        startScale,
        duration: 3500 + Math.random() * 2000, // 3.5s to 5.5s
      };
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSlideIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogoIndex((prev) => (prev + 1) % LOGOS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleImageLoad = (logo: string, e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    const ratio = img.naturalWidth / img.naturalHeight;
    if (ratio < 1.5) {
      setScales((prev) => ({ ...prev, [logo]: 1.5 }));
    } else {
      setScales((prev) => ({ ...prev, [logo]: 1 }));
    }
  };

  return (
    <>
      {/* Animated Background Assets */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {bgImagesData.map((img, i) => (
          <img 
            key={i} 
            src={img.src} 
            alt="background asset"
            style={{
              position: 'absolute',
              width: `${img.size}vw`,
              height: 'auto',
              left: '0', top: '0',
              transformOrigin: 'center center',
              transform: slideIn 
                ? `translate(calc(${img.targetX}vw - 50%), calc(${img.targetY}vh - 50%)) scale(1) rotate(${img.rotation}deg)` 
                : `translate(calc(${img.startX}vw - 50%), calc(${img.startY}vh - 50%)) scale(${img.startScale}) rotate(${img.rotation}deg)`,
              opacity: 1, // Keep full opacity as requested
              transition: `transform ${img.duration}ms cubic-bezier(0.1, 0.8, 0.2, 1)`,
            }}
          />
        ))}

        {/* The White Mask Overlay */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#fff',
          opacity: slideIn ? 0.75 : 0, // Fades in to ~75% white mask as images settle
          transition: 'opacity 4s ease-out', // Slow progression
        }} />
      </div>

      <div 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "flex-start", 
          justifyContent: "center", 
          minHeight: "70vh", 
          textAlign: "left",
          transform: slideIn ? 'translateX(0)' : 'translateX(20px)',
          opacity: slideIn ? 1 : 0,
          transition: 'all 0.4s ease-out',
          padding: '2rem',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div className="welcome-logo-container" style={{ position: "relative", width: "100%" }}>
          {LOGOS.map((logo, idx) => {
            const scale = scales[logo] || 1;
            return (
              <img 
                key={logo}
                src={logo} 
                alt="Journal Logo" 
                onLoad={(e) => handleImageLoad(logo, e)}
                className="welcome-logo-image"
                style={{ 
                  '--scale': scale,
                  opacity: logoIndex === idx ? 1 : 0,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
        <h1 style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "2.5rem", maxWidth: "800px", lineHeight: "1.2", marginBottom: "3rem", color: "#111" }}>
          Publish your <span className="typing-cursor" style={{ color: "#00a4e4" }}>{typedText}</span> with<br />
          the most prestigious student publishers<br />
          in the world.
        </h1>
        <button 
          onClick={() => window.location.hash = "#type-selector"}
          style={{
            padding: "12px 48px",
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.2rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "transform 0.2s, backgroundColor 0.2s"
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Next
        </button>

        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "1rem",
          marginTop: "3rem",
          padding: "1.5rem",
          backgroundColor: "#faf8f0",
          border: "1px solid #111",
          borderRadius: "8px",
          maxWidth: "600px"
        }}>
          <img 
            src="/brand/email_icon.png" 
            alt="Email Notification" 
            style={{ height: "4rem", width: "auto", objectFit: "contain", flexShrink: 0 }} 
          />
          <div style={{ fontFamily: "Ubuntu, sans-serif", color: "#111", lineHeight: "1.5", fontSize: "0.95rem" }}>
            <p style={{ margin: "0 0 0.5rem 0" }}>
              <span style={{ fontSize: "1.4rem", fontWeight: "bold" }}>E</span><span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>mail Notifications</span>
            </p>
            <p style={{ margin: 0 }}>
              Once your submission gets accepted to the relevant publisher you have chosen, we will send you an email from the publisher regarding the final decision on your submission.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
