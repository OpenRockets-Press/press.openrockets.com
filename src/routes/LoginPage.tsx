import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { login, toUserFacingError } from "@/lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);

    try {
      await login(email.trim(), password);
      await navigate({ to: "/dashboard" });
    } catch (submitError) {
      setError(toUserFacingError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-wrap auth-wrap">
      <section className="panel">
        <h1>Sign In</h1>
        <p className="muted">Use your contributor email to continue.</p>

        <form onSubmit={onSubmit} className="form-grid">
          <label className="field-group">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="contributor@example.org"
            />
          </label>

          <label className="field-group">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your account password"
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <div className="button-row">
            <button type="submit" className="solid-button" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </button>
            <Link to="/register" className="ghost-button">
              Create account
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
