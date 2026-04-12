export function ParentalConsentFormPage() {
  return (
    <main className="page-wrap legal-wrap">
      <h1>Parental &amp; Guardian Consent Guidelines</h1>
      <p className="legal-meta">
        <strong>Open Rockets Press</strong> · Effective: 1 January 2025 · Last updated: April 2026
      </p>

      <section className="legal-section">
        <h2>1. Purpose and Scope</h2>
        <p>
          Open Rockets Press requires verified parental or guardian consent before activating contributor
          accounts for individuals who fall below the applicable digital-consent age in their jurisdiction.
          This document describes when consent is required, what it covers, how it is verified, and the
          obligations that consent entails for the authorizing guardian.
        </p>
        <p>
          These guidelines are binding on the guardian who provides consent and constitute a legal
          authorization for the minor's use of the Service under the conditions described herein.
        </p>
      </section>

      <section className="legal-section">
        <h2>2. Consent Tiers and When Consent Is Required</h2>
        <p>
          During registration, every contributor is assigned a consent tier based on their age and
          country of residence. The tier determines whether guardian confirmation is required before
          the account is activated.
        </p>

        <h3>Tiers that require guardian consent</h3>
        <ul className="legal-list">
          <li>
            <strong>COPPA tier</strong> — Applied in the United States and other jurisdictions that
            follow a COPPA-equivalent framework (e.g. Brazil, South Korea, Turkey, India). The
            guardian-consent threshold varies by country: age 13 in the US and Brazil, age 14 in
            South Korea, age 18 in India and Turkey. Any contributor below the applicable threshold
            is assigned this tier and cannot activate their account without guardian confirmation.
          </li>
          <li>
            <strong>GDPR-EU tier</strong> — Applied in EU member states, the EEA, the United
            Kingdom, Switzerland, and GDPR-adjacent jurisdictions. The digital-consent age varies
            by country: age 13 in Denmark, Finland, Ireland, Lithuania, and the UK; age 14 in
            Austria, Bulgaria, Hungary, Italy, Latvia, Portugal, Romania, and Spain; age 15 in
            Czech Republic, France, and Slovakia; age 16 in Germany, Luxembourg, the Netherlands,
            Poland, Sweden, and many others. Any contributor under their country's specific
            threshold is assigned this tier and requires guardian consent.
          </li>
        </ul>

        <h3>Tiers that do not require guardian consent</h3>
        <ul className="legal-list">
          <li>
            <strong>GDPR teen tier</strong> — Applied to contributors who are above their country's
            digital-consent age but are still under 18, in GDPR-framework jurisdictions. These
            accounts are activated without guardian sign-off, but data-protection notices and
            reduced-data-processing obligations continue to apply until the contributor turns 18.
          </li>
          <li>
            <strong>General tier</strong> — Applied to contributors who are 18 or older, or who
            are above the applicable threshold in a non-GDPR jurisdiction. No parental consent
            restrictions apply.
          </li>
        </ul>

        <p>
          Accounts in a consent-required tier cannot upload content, access the submission workflow,
          or appear in the public catalogue until consent is confirmed by a verified guardian.
        </p>
      </section>

      <section className="legal-section">
        <h2>3. What Guardian Consent Authorizes</h2>
        <p>
          By providing consent, the authorizing guardian acknowledges and authorizes the following on
          behalf of the minor:
        </p>
        <ul className="legal-list">
          <li>
            Collection and processing of the minor's display name, email address, date of birth, and
            submitted publication metadata as described in the Privacy Policy;
          </li>
          <li>
            Publication of approved submissions in the Open Rockets Press public catalogue under the
            minor's chosen display name and selected Creative Commons or ORP license;
          </li>
          <li>
            Retention of a consent record (including the guardian email hash and confirmation
            timestamp) for the duration required by applicable law;
          </li>
          <li>
            Moderation review of all submitted content, including moderator access to submission
            files, abstracts, and account metadata as necessary for editorial review;
          </li>
          <li>
            Communication with the minor's registered account email regarding submission status,
            moderation cases, and platform updates.
          </li>
        </ul>
        <p>
          Consent does not authorize the sharing of personal data with third parties for commercial
          purposes, advertising, or behavioural profiling. See our Privacy Policy for full details.
        </p>
      </section>

      <section className="legal-section">
        <h2>4. How Consent Is Obtained and Verified</h2>
        <p>
          When a minor registers and is assigned a consent-required tier, the following process occurs:
        </p>
        <ol className="legal-list">
          <li>
            The registrant provides a guardian email address during account creation. A unique,
            time-limited consent token is generated and sent to that address.
          </li>
          <li>
            The guardian accesses the consent confirmation page using the token link provided in the
            email. The link expires after 72 hours.
          </li>
          <li>
            On the consent page, the guardian must: confirm their identity as the legal guardian of
            the minor; acknowledge the data processing described in this document and the Privacy
            Policy; and confirm they consent to the minor's participation in the Service.
          </li>
          <li>
            Upon successful confirmation, the account is activated and the consent record is stored
            with timestamp and a hash of the guardian's email address. The consent token is
            invalidated immediately.
          </li>
        </ol>
        <p>
          If the guardian does not complete consent within 72 hours, the token expires and the account
          remains in a pending state. The minor may re-initiate the consent process from the
          activation page.
        </p>
        <p>
          We reserve the right to require additional verification if there is reason to doubt the
          authenticity of a consent submission. Fraudulent consent submissions — for example, a minor
          using a disposable or fake guardian email — are a violation of our Terms of Service and will
          result in immediate account suspension and data deletion.
        </p>
      </section>

      <section className="legal-section">
        <h2>5. Guardian Obligations</h2>
        <p>
          By confirming consent, the authorizing guardian agrees to:
        </p>
        <ul className="legal-list">
          <li>
            Supervise the minor's use of the Service and ensure it complies with our Terms of Service
            and content submission standards;
          </li>
          <li>
            Take responsibility for any content submitted by the minor account under their
            guardianship;
          </li>
          <li>
            Promptly notify Open Rockets Press at <strong>privacy@openrockets.com</strong> if the
            minor's circumstances change in a way that affects their eligibility — such as a change
            of jurisdiction — or if the guardian wishes to revoke consent;
          </li>
          <li>
            Ensure that the minor does not share their account credentials with others and maintains
            the security of the account.
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>6. Revoking Consent and Account Deletion</h2>
        <p>
          A guardian may revoke consent at any time by contacting us at{" "}
          <strong>privacy@openrockets.com</strong> with the subject line "Revoke Consent" and the
          minor's registered email address. Upon receiving a valid revocation request, we will:
        </p>
        <ol className="legal-list">
          <li>Suspend the minor's account immediately;</li>
          <li>
            Initiate deletion of personal data associated with the account within 30 days, subject
            to legal retention requirements;
          </li>
          <li>
            Remove pending or unpublished submissions from the review queue. Already-published content
            may remain in the catalogue if it was published under a CC0 or CC BY license, as removal
            cannot guarantee retraction from third-party caches or citations.
          </li>
        </ol>
        <p>
          Revocation of consent does not retroactively invalidate any license granted over previously
          published content.
        </p>
      </section>

      <section className="legal-section">
        <h2>7. Data Collected About Minors</h2>
        <p>
          For accounts in consent-required tiers, we collect only the minimum data necessary: display
          name (pseudonymous), email address, hashed date of birth (used solely for tier
          determination), and submission metadata. We do not collect school affiliation, physical
          address, phone number, social media identifiers, or any other unnecessary personal
          information about minors.
        </p>
        <p>
          Minor account data is handled with additional safeguards: access is restricted to
          authorized ORP operators, it is not used for any form of advertising or profiling, and
          retention periods are aligned with minimum legal requirements for each jurisdiction.
        </p>
      </section>

      <section className="legal-section">
        <h2>8. Contact for Guardian Inquiries</h2>
        <p>
          Guardians with questions about their minor's account, the consent process, or data handling
          may contact us at: <strong>privacy@openrockets.com</strong>
        </p>
        <p>
          Please include "Guardian Inquiry" in the subject line and provide the minor's registered
          display name or email address to help us locate the relevant account.
        </p>
      </section>
    </main>
  );
}
