import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { REQUIRES_GUARDIAN, createDob, getConsentTier } from "@/lib/consent";
import { registerAccount, toUserFacingError } from "@/lib/api";
import { registerSchema } from "@/lib/schemas";
import { FloatInput } from "@/components/ui/FloatInput";
import { DobInput } from "@/components/ui/DobInput";
import { CountryCombobox } from "@/components/ui/CountryCombobox";

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

const TIER_LABELS: Record<string, string> = {
  coppa:   "COPPA — guardian confirmation required",
  gdpr_eu: "GDPR — guardian confirmation required",
  gdpr_es: "GDPR teen — no guardian required",
  general: "General — no consent restrictions",
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof RegisterFormState>(key: K, val: RegisterFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  const dob = useMemo(
    () => createDob(form.day, form.month, form.year),
    [form.day, form.month, form.year],
  );

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

  return (
    <main className="page-wrap register-wrap">
      <section className="panel">

        {/* ── Progress & heading ──────────────────────────────────── */}
        <div className="register-head">
          <p className="eyebrow">New contributor</p>
          <h1>Create your account</h1>
          <p className="muted register-sub">
            We only collect the minimum data required to protect your publication rights.
            A pseudonym is recommended as your display name.
          </p>
        </div>

        <div className="progress-track" aria-label="Step 1 of 3">
          <span className="progress-fill" style={{ width: "33%" }} />
        </div>

        <form onSubmit={onSubmit} className="register-form" noValidate>

          {/* ── Identity ────────────────────────────────────────── */}
          <div className="register-section">
            <p className="register-section-label">Identity</p>
            <FloatInput
              label="Display name"
              value={form.displayName}
              onChange={(e) => set("displayName", e.target.value)}
              placeholder=" "
              autoComplete="nickname"
              hint="Readers will see this name. A pseudonym is fine."
            />
            <FloatInput
              label="Email address"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder=" "
              autoComplete="email"
            />
            <FloatInput
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder=" "
              autoComplete="new-password"
              hint="At least 10 characters."
            />
          </div>

          {/* ── Date of birth ───────────────────────────────────── */}
          <div className="register-section">
            <p className="register-section-label">Date of birth</p>
            <p className="register-section-hint">
              Used only to assign the applicable data-consent tier for your jurisdiction.
              Not stored in identifiable form.
            </p>
            <DobInput
              day={form.day}
              month={form.month}
              year={form.year}
              onDayChange={(v) => set("day", v)}
              onMonthChange={(v) => set("month", v)}
              onYearChange={(v) => set("year", v)}
            />
          </div>

          {/* ── Country ─────────────────────────────────────────── */}
          <div className="register-section">
            <p className="register-section-label">Country of residence</p>
            <p className="register-section-hint">
              Determines the applicable privacy-consent legal framework for your account.
            </p>
            <div className="float-field float-combobox-wrap float-filled">
              <label className="float-label float-label-up">Country</label>
              <CountryCombobox
                value={form.country}
                onChange={(code) => set("country", code)}
              />
              <span className="float-accent" aria-hidden="true" />
            </div>
          </div>

          {/* ── Consent tier indicator ──────────────────────────── */}
          {consentTier && (
            <div className={`consent-tier-badge tier-${consentTier}`} role="status">
              <span className="consent-tier-dot" aria-hidden="true" />
              <div>
                <strong>{TIER_LABELS[consentTier]}</strong>
                {consentTier === "coppa" && (
                  <p>You will need to provide a parent or guardian email. They must confirm consent before your account is activated.</p>
                )}
                {consentTier === "gdpr_eu" && (
                  <p>Your country requires parental or guardian consent for your age group. A confirmation email will be sent to your guardian.</p>
                )}
                {consentTier === "gdpr_es" && (
                  <p>You are above the digital consent age in your jurisdiction but still a legal minor. Your account will be activated without guardian sign-off, but data-protection notices apply.</p>
                )}
                {consentTier === "general" && (
                  <p>No parental consent restrictions apply in your jurisdiction for your age group.</p>
                )}
              </div>
            </div>
          )}

          {/* ── Guardian email (conditional) ────────────────────── */}
          <div className={`guardian-field${needsGuardian ? " visible" : ""}`}>
            <FloatInput
              label="Parent / guardian email"
              type="email"
              value={form.guardianEmail}
              onChange={(e) => set("guardianEmail", e.target.value)}
              placeholder=" "
              autoComplete="off"
              hint="A confirmation link will be sent to this address before your account is activated."
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          {/* ── Submit ──────────────────────────────────────────── */}
          <div className="register-actions">
            <button
              type="submit"
              className="solid-button register-submit"
              disabled={submitting}
            >
              {submitting ? "Creating account…" : "Continue →"}
            </button>
            <p className="register-login-hint">
              Already have an account?{" "}
              <Link to="/login" className="register-login-link">Sign in</Link>
            </p>
          </div>

        </form>
      </section>
    </main>
  );
}
