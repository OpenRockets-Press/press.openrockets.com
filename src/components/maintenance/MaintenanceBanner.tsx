export function MaintenanceBanner() {
  return (
    <aside className="maintenance-banner" role="status" aria-live="polite" data-testid="maintenance-banner">
      <div className="maintenance-banner-shell">
        <div className="maintenance-banner-card">
          <div className="maintenance-banner-brand" aria-hidden="true">
            <img className="maintenance-banner-brand-main" src="/brand/271742354.png" alt="" />
            <img className="maintenance-banner-brand-mark" src="/brand/9283527.png" alt="" />
          </div>

          <div className="maintenance-banner-copy">
            <p className="maintenance-banner-kicker">Mandatory service notice</p>
            <h2 className="maintenance-banner-title">Open Rockets Press is in a controlled reconstruction phase.</h2>
            <p className="maintenance-banner-body">
              We apologize for the inconvenience. The publication platform is temporarily paused while we complete
              server reconstruction and development work. Open Rockets Press will be back online shortly.
            </p>
            <p className="maintenance-banner-contact">
              For concerns, contact <a href="mailto:press@openrockets.com">press@openrockets.com</a>.
            </p>
          </div>

          <div className="maintenance-banner-status" aria-hidden="true">
            <span className="maintenance-banner-status-pill">Service locked</span>
            <span className="maintenance-banner-status-note">No dismiss button available</span>
          </div>
        </div>
      </div>
    </aside>
  );
}