import { Link } from "@tanstack/react-router";

export function HomeBanner() {
  return (
    <div className="home-banner" data-testid="home-banner">
      <h2>Empowering Youth Voices</h2>
      <p>Discover fresh ideas, research, and literature powered by the next generation.</p>
      <Link to="/register" className="banner-cta">
        Start Contributing
      </Link>
    </div>
  );
}
