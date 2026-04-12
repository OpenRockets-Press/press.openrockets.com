export function ParentalConsentFormPage() {
  return (
    <main className="page-wrap legal-wrap">
      <article className="legal-document" aria-label="Parental and guardian consent notice">
        <header className="legal-doc-head">
          <div className="legal-doc-brand" aria-hidden="true">
            <img className="legal-doc-logo" src="/brand/271742354.png" alt="" />
            <img className="legal-doc-mark" src="/brand/9283527.png" alt="" />
          </div>
          <p className="legal-doc-org">Open Rockets Foundation</p>
          <h1>Parental and Guardian Consent Notice</h1>
          <p className="legal-meta">
            Effective date 01 January 2025 · Last revised April 2026 · Document class Legal Notice
          </p>
        </header>

        <section className="legal-section">
          <h2>Section I. Purpose and Authority</h2>
          <p>
            This legal notice governs parental and guardian consent for contributors who are minors.
            Open Rockets Press requires verified authorization before a minor account can become active
            whenever applicable law sets a digital consent threshold that has not yet been reached.
          </p>
          <p>
            By confirming consent, the guardian provides lawful authorization for account use and for
            the limited processing activities that are necessary to operate a protected publishing
            workflow.
          </p>
        </section>

        <section className="legal-section">
          <h2>Section II. Circumstances That Require Consent</h2>
          <p>
            The platform determines a consent tier from contributor age and country of residence.
            Consent is required whenever a contributor falls below the legal digital consent age in the
            relevant jurisdiction. Until consent is verified, account status remains pending and content
            submission remains unavailable.
          </p>
          <ul className="legal-roman-list">
            <li>
              Consent required tiers include jurisdictions that apply child privacy frameworks in which
              parental authorization is mandatory before service activation.
            </li>
            <li>
              Consent not required tiers include contributors who have reached the legal threshold or
              contributors who are adults under the controlling jurisdiction.
            </li>
            <li>
              Every tier decision can be re evaluated when location data changes or when legal rules are
              updated, therefore eligibility remains continuously governed by applicable law.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Section III. Scope of Authorization</h2>
          <p>
            Guardian authorization permits only the operations required for account security,
            moderation, and publication handling. The authorization is narrow, specific, and limited to
            legitimate platform functions.
          </p>
          <ul className="legal-roman-list">
            <li>
              Account identity data may be processed for authentication, consent validation, and lawful
              records management.
            </li>
            <li>
              Submission metadata and files may be reviewed for moderation and editorial compliance.
            </li>
            <li>
              Approved work may be published under the selected license and display name in the public
              catalogue.
            </li>
            <li>
              No commercial advertising profile is created from minor data and no sale of minor data is
              authorized by this notice.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Section IV. Verification Procedure</h2>
          <p>
            Consent verification is completed through a secure email confirmation process that issues a
            unique and time limited token to the guardian contact supplied during registration.
          </p>
          <ul className="legal-roman-list">
            <li>
              The registrant provides a guardian email address and the system issues a secure token.
            </li>
            <li>
              The guardian reviews this notice, affirms legal authority, and confirms informed consent.
            </li>
            <li>
              Once confirmed, the token is invalidated and the account transitions from pending to
              active status.
            </li>
            <li>
              If confirmation is not completed before expiry, the request lapses and a new consent
              request is required.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Section V. Guardian Duties and Revocation</h2>
          <p>
            The guardian accepts an ongoing duty to supervise lawful platform use, to maintain account
            integrity, and to notify the foundation when consent status must change.
          </p>
          <ul className="legal-roman-list">
            <li>
              Revocation requests may be submitted to <strong>privacy@openrockets.com</strong> with
              adequate account identifiers.
            </li>
            <li>
              Upon valid revocation, access is suspended and data handling proceeds according to legal
              retention obligations and deletion policy.
            </li>
            <li>
              Licenses already granted on previously published material remain subject to the governing
              publication license terms.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Section VI. Official Contact</h2>
          <p>
            For guardian inquiries, consent disputes, or record requests, contact
            <strong> privacy@openrockets.com</strong>. For faster processing, include the minor account
            display name and registered email address in the request body.
          </p>
        </section>
      </article>
    </main>
  );
}
