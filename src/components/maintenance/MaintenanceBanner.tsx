export function MaintenanceBanner() {
  return (
    <aside className="maintenance-banner" role="status" aria-live="polite" data-testid="maintenance-banner">
      <div className="maintenance-banner-shell">
        <div className="maintenance-banner-card">
          <div className="maintenance-banner-brand" aria-hidden="true">
            <img className="maintenance-banner-brand-main" src="/brand/271742354.png" alt="" />
          </div>

          <div className="maintenance-banner-copy">
           
            <h2 className="maintenance-banner-title">OpenRockets® Press is in a reconstruction phase.</h2>
            <p className="maintenance-banner-body">
              We apologize for the inconvenience. 
            </p>
            <p className="maintenance-banner-contact">
              For concerns, contact <a href="mailto:press@openrockets.com">press@openrockets.com</a>.
            </p>
          </div>

     
        </div>
      </div>
    </aside>
  );
}