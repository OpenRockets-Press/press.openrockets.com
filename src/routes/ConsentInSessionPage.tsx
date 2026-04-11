import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { confirmConsent, toUserFacingError } from "@/lib/api";
import { consentSchema } from "@/lib/schemas";

export function ConsentInSessionPage() {
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const displayName = params.get("displayName") ?? "Your child";
  const token = params.get("token") ?? "";

  const [guardianEmail, setGuardianEmail] = useState("");
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = check1 && check2 && check3 && guardianEmail.trim().length > 4 && !submitting;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("Consent token is missing or invalid. Please restart registration.");
      return;
    }

    const parsed = consentSchema.safeParse({
      guardianEmail,
      check1,
      check2,
      check3,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please complete all consent fields.");
      return;
    }

    setSubmitting(true);

    try {
      await confirmConsent({ token, guardianEmail });
      await navigate({ to: "/dashboard" });
    } catch (submitError) {
      setError(toUserFacingError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="consent-page">
      <section className="consent-shell">
        <p className="consent-identity">{displayName} wants to publish on Open Rockets Press.</p>
        <div className="handoff-card">
          <strong>Hand device to parent/guardian</strong>
          <p>
            Please ask {displayName}&apos;s parent or legal guardian to review this form before
            proceeding.
          </p>
        </div>

        <h1>Parental / Guardian Consent</h1>
        <p className="consent-lead">
          Your child wants to publish on Open Rockets Press. Please read the following carefully.
        </p>

        <form onSubmit={onSubmit} className="consent-form">
          <label className="field-group">
            <span>Guardian email address *</span>
            <input
              data-testid="guardian-email"
              type="email"
              value={guardianEmail}
              onChange={(event) => setGuardianEmail(event.target.value)}
              placeholder="guardian@example.org"
            />
          </label>

          <label className="checkbox-row">
            <input
              data-testid="consent-check-1"
              type="checkbox"
              checked={check1}
              onChange={(event) => setCheck1(event.target.checked)}
            />
            <span>I confirm that I am the parent or legal guardian of the person registering.</span>
          </label>

          <label className="checkbox-row">
            <input
              data-testid="consent-check-2"
              type="checkbox"
              checked={check2}
              onChange={(event) => setCheck2(event.target.checked)}
            />
            <span>I have read and understood this consent form and the Privacy Policy.</span>
          </label>

          <label className="checkbox-row">
            <input
              data-testid="consent-check-3"
              type="checkbox"
              checked={check3}
              onChange={(event) => setCheck3(event.target.checked)}
            />
            <span>
              I give consent for Open Rockets Press to create and operate an account for my child.
            </span>
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button
            data-testid="consent-submit"
            type="submit"
            className={canSubmit ? "solid-button" : "solid-button disabled-like"}
            aria-disabled={!canSubmit}
            disabled={!canSubmit}
          >
            {submitting ? "Confirming..." : "Confirm and Activate Account"}
          </button>
        </form>
      </section>
    </main>
  );
}
