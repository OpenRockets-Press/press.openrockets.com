import { Link } from "@tanstack/react-router";

export function HomeBanner() {
  return (
    <div className="home-banner" data-testid="home-banner">
      <Link to="/publish" className="banner-cta" aria-label="Upload a publication">
        Upload
      </Link>
    </div>
  );
}
