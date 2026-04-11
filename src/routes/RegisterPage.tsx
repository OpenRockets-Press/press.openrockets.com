import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { REQUIRES_GUARDIAN, createDob, getConsentTier } from "@/lib/consent";
import { registerAccount, toUserFacingError } from "@/lib/api";
import { COUNTRIES, MONTHS, registerSchema } from "@/lib/schemas";

interface RegisterFormState {
  displayName: string;
  email: string;
  password: string;
  day: string;
  month: string;
  year: string;
  country: string;
  guardianEmail: string;
}

const initialState: RegisterFormState = {
  displayName: "",
  email: "",
  password: "",
  day: "",
  month: "",
  year: "",
  country: "US",
  guardianEmail: "",
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dob = useMemo(() => createDob(form.day, form.month, form.year), [form.day, form.month, form.year]);

  const consentTier = useMemo(() => {
    if (!dob) return null;
    return getConsentTier(dob, form.country);
  }, [dob, form.country]);

  const needsGuardian = consentTier ? REQUIRES_GUARDIAN.has(consentTier) : false;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please review the highlighted fields.");
      return;
    }

    if (!dob || !consentTier) {
      setError("Please provide a valid date of birth.");
      return;
    }

    if (needsGuardian && !form.guardianEmail.trim()) {
      setError("Guardian email is required for this age and country combination.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await registerAccount({
        displayName: form.displayName.trim(),
        email: form.email.trim(),
        password: form.password,
        consentTier,
        guardianEmail: needsGuardian ? form.guardianEmail.trim() : undefined,
      });

      if (result.status === "pending_parental") {
        if (!result.consentToken) {
          throw new Error("Consent token was not returned. Please try again.");
        }

        const params = new URLSearchParams({
          displayName: form.displayName.trim(),
          token: result.consentToken,
        });
        window.location.assign(`/consent/in-session?${params.toString()}`);
        return;
      }

      await navigate({ to: "/dashboard" });
    } catch (submitError) {
      setError(toUserFacingError(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  const years = Array.from({ length: 90 }, (_, idx) => String(new Date().getFullYear() - idx));

  return (
    <main className="page-wrap">
      <section className="panel">
        <p className="eyebrow">Step 1 of 3</p>
        <h1>Create Contributor Account</h1>
        <p className="muted">
          Fields marked * are required. We only collect the minimum data required to protect your
          publication rights.
        </p>

        <div className="progress-track" aria-hidden="true">
          <span className="progress-fill" style={{ width: "33%" }} />
        </div>

        <form onSubmit={onSubmit} className="form-grid" noValidate>
          <label className="field-group">
            <span>Display name *</span>
            <input
              value={form.displayName}
              onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
              placeholder="Astronomy Club"
            />
            <small>This is the name readers will see. A pseudonym is recommended.</small>
          </label>

          <label className="field-group">
            <span>Email *</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="contributor@example.org"
            />
          </label>

          <label className="field-group">
            <span>Password *</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="At least 10 characters"
            />
          </label>

          <fieldset className="field-group">
            <legend>Date of birth *</legend>
            <div className="dob-grid">
              <select value={form.day} onChange={(event) => setForm((prev) => ({ ...prev, day: event.target.value }))}>
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, idx) => (
                  <option key={idx + 1} value={String(idx + 1)}>
                    {idx + 1}
                  </option>
                ))}
              </select>
              <select
                value={form.month}
                onChange={(event) => setForm((prev) => ({ ...prev, month: event.target.value }))}
              >
                <option value="">Month</option>
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <select value={form.year} onChange={(event) => setForm((prev) => ({ ...prev, year: event.target.value }))}>
                <option value="">Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          <label className="field-group">
            <span>Country *</span>
            <select
              value={form.country}
              onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.label}
                </option>
              ))}
            </select>
          </label>

          <div className="tier-banner" role="status">
            <strong>Calculated consent tier:</strong> {consentTier ?? "Pending date of birth"}
          </div>

          <div className={needsGuardian ? "guardian-field visible" : "guardian-field"}>
            <label className="field-group">
              <span>Parent/Guardian email *</span>
              <input
                type="email"
                value={form.guardianEmail}
                onChange={(event) => setForm((prev) => ({ ...prev, guardianEmail: event.target.value }))}
                placeholder="guardian@example.org"
              />
              <small>We will request parent or guardian confirmation before account activation.</small>
            </label>
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <div className="button-row">
            <button type="submit" className="solid-button" disabled={submitting}>
              {submitting ? "Creating account..." : "Continue"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
