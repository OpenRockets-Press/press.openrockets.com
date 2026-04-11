import { Link } from "@tanstack/react-router";

export function SuspendedPage() {
  return (
    <main className="page-wrap auth-wrap">
      <section className="panel">
        <p className="eyebrow">Account suspended</p>
        <h1>Access restricted</h1>
        <p className="muted">
          Your account has been suspended. Please contact a moderator if you believe this is an error.
        </p>
        <div className="button-row" style={{ justifyContent: "center" }}>
          <Link to="/" className="ghost-button">
            Return to home
          </Link>
        </div>
      </section>
    </main>
  );
}
