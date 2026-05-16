import { useEffect, useState } from "react";

const SLIDE_INTERVAL_MS = 20_000;

const SLIDES = [
  {
    src: "/brand/static/wp-content/New Project (3).png",
    alt: "Open Rockets Press feature banner 1",
  },
  {
    src: "/brand/static/wp-content/New Project (10).png",
    alt: "Open Rockets Press feature banner 2",
  },
  {
    src: "/brand/static/wp-content/New Project (5).png",
    alt: "Open Rockets Press feature banner 2",
  },
  {
    src: "/brand/static/wp-content/New Project (6).png",
    alt: "Open Rockets Press feature banner 3",
  },
  {
    src: "/brand/static/wp-content/New Project (7).png",
    alt: "Open Rockets Press feature banner 4",
  },
  {
    src: "/brand/static/wp-content/New Project (8).png",
    alt: "Open Rockets Press feature banner 5",
  },
  {
    src: "/brand/static/wp-content/New Project (9).png",
    alt: "Open Rockets Press feature banner 6",
  },
] as const;

export function HomeBanner() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (!isPlaying || SLIDES.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % SLIDES.length);
    }, SLIDE_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPlaying]);

  const trackClassName = `home-banner-track home-banner-track-${activeSlide}`;

  return (
    <section className="home-banner" data-testid="home-banner" aria-label="Featured stories carousel">
      <div className="home-banner-shell">
        <div className="home-banner-frame">
          <div className={trackClassName}>
            {SLIDES.map((slide, slideIndex) => (
              <article
                key={slide.src}
                className={`home-banner-slide${slideIndex === activeSlide ? " is-active" : ""}`}
              >
                <img
                  className="home-banner-image"
                  src={slide.src}
                  alt={slide.alt}
                  loading={slideIndex === activeSlide ? "eager" : "lazy"}
                  decoding="async"
                />
              </article>
            ))}
          </div>

          <button
            type="button"
            className="home-banner-toggle"
            aria-label={isPlaying ? "Pause banner carousel" : "Play banner carousel"}
            onClick={() => setIsPlaying((value) => !value)}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
      </div>
    </section>
  );
}