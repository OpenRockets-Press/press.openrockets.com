export function PrivacyPolicyPage() {
  return (
    <main className="page-wrap legal-wrap">
      <article className="legal-document" aria-label="Privacy policy legal notice">
        <header className="legal-doc-head">
          <div className="legal-doc-brand" aria-hidden="true">
            <img className="legal-doc-logo" src="/brand/271742354.png" alt="" />
            <img className="legal-doc-mark" src="/brand/9283527.png" alt="" />
          </div>
          <p className="legal-doc-org">Open Rockets Foundation</p>
          <h1>Privacy Policy</h1>
          <p className="legal-meta">
            <strong>Open Rockets Press</strong> · Effective 1 January 2025 · Last updated April 2026
          </p>
        </header>

      <section className="legal-section">
        <h2>1. Overview</h2>
        <p>
          Open Rockets Press ("ORP", "we", "us") is committed to handling personal data responsibly and in
          accordance with applicable data protection law, including the General Data Protection Regulation
          (GDPR) and the Children's Online Privacy Protection Act (COPPA) where applicable. This Privacy
          Policy describes what data we collect, why we collect it, how it is used, and what rights you have.
        </p>
        <p>
          This policy applies to all users of the Open Rockets Press platform, including registered
          contributors, moderators, and anonymous visitors.
        </p>
      </section>

      <section className="legal-section">
        <h2>2. Data We Collect</h2>
        <h3>2.1 Account Data</h3>
        <p>
          When you register a contributor account, we collect: your display name (pseudonymous — not required
          to be your legal name), email address, hashed password, date of birth (for consent tier
          determination only), and optionally a guardian email address where required by law. We do not
          collect government-issued identifiers, payment information, or biometric data.
        </p>
        <h3>2.2 Submission Data</h3>
        <p>
          Publications you submit are stored together with associated metadata: title, abstract, type,
          license selection, tags, submission timestamp, and review history. Uploaded files (manuscripts
          and cover images) are stored in secure cloud storage.
        </p>
        <h3>2.3 Activity Data</h3>
        <p>
          We record events such as publication views, downloads, and submission actions for the purpose of
          platform analytics and moderation audit trails. This data is pseudonymous (linked to an internal
          user ID, not directly to identifying information).
        </p>
        <h3>2.4 Technical Data</h3>
        <p>
          Standard server logs may capture IP addresses and user-agent strings in connection with API
          requests. These logs are retained for security and abuse-prevention purposes and are not used for
          behavioural profiling.
        </p>
        <h3>2.5 Consent Evidence</h3>
        <p>
          Where parental or guardian consent is required, we retain a consent record including the guardian
          email, confirmation timestamp, and a token hash. This record is kept for our legal compliance
          obligations and cannot be deleted independently of the underlying account.
        </p>
      </section>

      <section className="legal-section">
        <h2>3. Legal Basis for Processing</h2>
        <p>We process personal data on the following legal bases:</p>
        <ul className="legal-list">
          <li>
            <strong>Contract performance</strong> — to operate your account, process submissions, and
            deliver the core Service;
          </li>
          <li>
            <strong>Legal obligation</strong> — to maintain consent records, respond to data subject
            requests, and comply with applicable law;
          </li>
          <li>
            <strong>Legitimate interests</strong> — to detect and prevent fraud, abuse, and unauthorized
            access; to generate aggregate, anonymized analytics about platform usage.
          </li>
        </ul>
        <p>
          For users under 16 (or the applicable age in their jurisdiction), we rely on verified parental
          consent as the legal basis for processing.
        </p>
      </section>

      <section className="legal-section">
        <h2>4. How We Use Your Data</h2>
        <p>We use collected data exclusively to:</p>
        <ul className="legal-list">
          <li>Operate and provide the Service, including authentication and submission workflows;</li>
          <li>
            Display your submitted publications under your display name in the public catalogue (if
            approved);
          </li>
          <li>Send transactional communications (account activation, consent confirmation, case updates);</li>
          <li>
            Enforce our Terms of Service, detect abuse, and maintain the integrity of the moderation
            system;
          </li>
          <li>
            Comply with legal obligations, respond to lawful requests from authorities, and maintain audit
            records.
          </li>
        </ul>
        <p>
          We do not sell personal data. We do not run advertising. We do not use personal data to train
          machine-learning models or build behavioural profiles for commercial purposes.
        </p>
      </section>

      <section className="legal-section">
        <h2>5. Data Sharing and Third Parties</h2>
        <p>
          We share personal data only to the extent necessary to operate the Service:
        </p>
        <ul className="legal-list">
          <li>
            <strong>Appwrite</strong> (authentication and database infrastructure) — acting as a data
            processor under contract, storing account credentials and platform records;
          </li>
          <li>
            <strong>Cloudflare</strong> (hosting and CDN) — processing requests and serving the
            application under standard data processing terms;
          </li>
          <li>
            <strong>Law enforcement or regulators</strong> — where required by a valid legal order,
            warrant, or regulatory obligation.
          </li>
        </ul>
        <p>
          We do not share personal data with advertisers, data brokers, analytics platforms that build
          individual profiles, or any third party for commercial purposes.
        </p>
      </section>

      <section className="legal-section">
        <h2>6. Data Retention</h2>
        <p>
          We retain account data for as long as your account is active. If you request deletion, we will
          delete or anonymize personal data within 30 days, subject to:
        </p>
        <ul className="legal-list">
          <li>
            Legal retention obligations (e.g., consent evidence records required to demonstrate compliance
            with COPPA/GDPR);
          </li>
          <li>
            Published content that has been cached or cited by third parties and cannot be unilaterally
            removed from external systems;
          </li>
          <li>
            Active moderation cases or legal proceedings that require retention of relevant records.
          </li>
        </ul>
        <p>
          Server logs are retained for a maximum of 90 days. Analytics event data is anonymized after 12 months.
        </p>
      </section>

      <section className="legal-section">
        <h2>7. Children's Privacy</h2>
        <p>
          We take the protection of minors' data seriously. Accounts for users under 13 (US/COPPA) or
          under 14–16 (EU/GDPR, depending on member state) require verified parental or guardian consent
          before activation. We assign consent tiers at registration to determine the applicable threshold
          for each user.
        </p>
        <p>
          If we discover that a child account was created without required parental consent, we will
          immediately suspend the account, notify the registered guardian email if available, and begin
          deletion procedures. Parents and guardians may contact us at <strong>privacy@openrockets.com</strong>{" "}
          to review, correct, or request deletion of a child's account data.
        </p>
        <p>
          We do not knowingly allow minors to publish content under their own name without guardian
          acknowledgment of the associated data processing.
        </p>
      </section>

      <section className="legal-section">
        <h2>8. Your Rights</h2>
        <p>
          Subject to applicable law, you have the right to: access a copy of personal data we hold about
          you; request correction of inaccurate data; request erasure of your data (subject to legal
          retention requirements); restrict or object to certain processing; and data portability.
        </p>
        <p>
          To exercise these rights, submit a Data Subject Access Request (DSAR) by emailing
          <strong> privacy@openrockets.com</strong> with the subject line "DSAR Request". We will respond
          within 30 days. If you are a minor or the guardian of a minor, you may exercise these rights on
          the account's behalf.
        </p>
        <p>
          You also have the right to lodge a complaint with the relevant supervisory authority in your
          jurisdiction (e.g., your national Data Protection Authority under GDPR).
        </p>
      </section>

      <section className="legal-section">
        <h2>9. Security</h2>
        <p>
          We implement industry-standard security measures including TLS encryption in transit, access
          controls, credential hashing, and server-side JWT authentication. However, no system is
          completely secure. We cannot guarantee absolute security of data transmitted over the internet.
          You are responsible for maintaining the confidentiality of your account credentials.
        </p>
        <p>
          In the event of a data breach that is likely to result in a high risk to your rights and
          freedoms, we will notify you and any relevant supervisory authority within the timeframe required
          by applicable law.
        </p>
      </section>

      <section className="legal-section">
        <h2>10. Cookies and Tracking</h2>
        <p>
          Open Rockets Press does not use third-party advertising or tracking cookies. Session state is
          maintained via secure, HTTP-only session tokens issued by our unified SSO system at accounts.openrockets.com
          and stored securely. We do not use fingerprinting, cross-site tracking, or behavioural advertising
          technology.
        </p>
      </section>

      <section className="legal-section">
        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be communicated by
          updating the "Last updated" date and, where appropriate, by notifying registered users. Continued
          use of the Service after changes take effect constitutes acceptance of the revised policy.
        </p>
      </section>

      <section className="legal-section">
        <h2>12. Contact</h2>
        <p>
          For privacy-related questions, requests, or concerns, contact us at:{" "}
          <strong>privacy@openrockets.com</strong>
        </p>
      </section>
      </article>
    </main>
  );
}
