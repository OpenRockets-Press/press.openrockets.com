import { Link } from "@tanstack/react-router";

export type HomeInfoModalKind = "about" | "publish" | "privacy" | "parental";

interface HomeInfoModalContentProps {
  kind: HomeInfoModalKind;
}

export function HomeInfoModalContent({ kind }: HomeInfoModalContentProps) {
  if (kind === "about") {
    return (
      <div className="info-modal-content">
        <p>
          Open Rockets Press is a youth-focused publishing platform that protects intellectual
          property, supports contributors with clear moderation, and provides compliant publishing
          workflows for minors and families.
        </p>
        <p>
          We prioritize safety, legal clarity, and recognition of student-led research, literature,
          and academic artifacts.
        </p>
      </div>
    );
  }

  if (kind === "privacy") {
    return (
      <div className="info-modal-content">
        <p>
          Open Rockets Press collects only the minimum information required to provide publication
          services, including contributor email, display name, publication metadata, and legally
          required consent evidence where applicable.
        </p>
        <p>
          We do not sell data, do not run advertising, and do not use behavioral tracking. Guardians
          may request account correction, export, or deletion at any time.
        </p>
        <Link to="/legal/privacy-policy" className="solid-button inline-action">
          Read Full Policy
        </Link>
      </div>
    );
  }

  if (kind === "parental") {
    return (
      <div className="info-modal-content">
        <p>
          Parent or guardian confirmation is required for contributors in consent tiers governed by
          COPPA or GDPR Article 8 thresholds.
        </p>
        <p>
          Confirmation requires a guardian email and three explicit consent checkboxes before an
          account can be activated.
        </p>
        <Link to="/legal/parental-consent-form" className="solid-button inline-action">
          Open Full Consent Form
        </Link>
      </div>
    );
  }

  return (
    <div className="info-modal-content">
      <p>
        Contributors can submit books, research papers, magazines, and posters through the dashboard
        after account activation.
      </p>
      <p>
        Every submission goes through moderation review, legally-safe metadata handling, and receives
        a permanent publication identifier after approval.
      </p>
      <Link to="/register" className="solid-button inline-action">
        Create Contributor Account
      </Link>
    </div>
  );
}
