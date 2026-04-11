import { Link } from "@tanstack/react-router";

export function NotFoundPage() {
  return (
    <main className="page-wrap legal-wrap">
      <h1>Page Not Found</h1>
      <p>The page you requested could not be found.</p>
      <Link className="solid-button" to="/">
        Return to Home
      </Link>
    </main>
  );
}
