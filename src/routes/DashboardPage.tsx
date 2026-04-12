import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getContributorDashboard, getCurrentUser, logout } from "@/lib/api";
import { getSessionUser } from "@/lib/authStore";
import { queryKeys } from "@/lib/queryKeys";

function TableSkeletonRows({ cols, rows = 3 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="skeleton-tr">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j}>
              <div
                className="skeleton-bar"
                style={{ height: "13px", width: j === 0 ? "70%" : j === cols - 1 ? "45%" : "55%" }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => getCurrentUser(),
    initialData: () => getSessionUser() ?? undefined,
  });

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: queryKeys.contributor.dashboard(),
    queryFn: getContributorDashboard,
    staleTime: 60_000,
    enabled: Boolean(user),
  });

  async function handleLogout() {
    await logout();
    await navigate({ to: "/" });
  }

  if (!user) {
    return (
      <main className="page-wrap legal-wrap">
        <h1>No Active Session</h1>
        <p>Please sign in to continue.</p>
        <Link className="solid-button" to="/login">
          Go to Sign In
        </Link>
      </main>
    );
  }

  const isActive = user.accountStatus === "active";

  return (
    <main className="page-wrap dashboard-wrap">
      <section className="panel">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="dash-header">
          <div className="dash-identity">
            <p className="eyebrow">Contributor dashboard</p>
            <h1>Hi, {user.displayName}</h1>
            <p className="muted">
              <span className={`dash-status-dot ${isActive ? "dot-active" : "dot-warn"}`} />
              {user.accountStatus.replace(/_/g, " ")}
            </p>
          </div>
          <button className="ghost-button dash-signout" type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────── */}
        <div className="stats-grid">
          <article className="stat-card">
            <h2>Publications</h2>
            <strong className="stat-value">{dashboard?.publicationCount ?? 0}</strong>
            <span className="stat-sub">submitted</span>
          </article>
          <article className="stat-card">
            <h2>Cases</h2>
            <strong className="stat-value stat-value-warn">
              {dashboard?.openCaseCount ?? 0}
            </strong>
            <span className="stat-sub">open</span>
          </article>
          <article className="stat-card">
            <h2>Consent tier</h2>
            <strong className="stat-value stat-value-sm">{user.consentTier}</strong>
            <span className="stat-sub">assigned tier</span>
          </article>
        </div>

        {/* ── Actions ────────────────────────────────────────────────── */}
        <div className="dash-actions">
          <Link className="solid-button" to="/publish">
            + New submission
          </Link>
          <Link className="ghost-button" to="/cases">
            Cases inbox
          </Link>
          {(user.role === "moderator" || user.role === "admin") && (
            <Link className="ghost-button dash-role-link" to="/moderation">
              Moderation
            </Link>
          )}
          {user.role === "admin" && (
            <Link className="ghost-button dash-role-link" to="/admin">
              Admin panel
            </Link>
          )}
        </div>

        {/* ── Submissions table ──────────────────────────────────────── */}
        <div className="dash-section">
          <p className="dash-section-label">Recent submissions</p>
          <div className="table-wrap">
            <table className="table" aria-label="Recent publications">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {dashboardLoading ? (
                  <TableSkeletonRows cols={4} />
                ) : (dashboard?.recentPublications.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">
                        No submissions yet. Start by sending your first publication for review.
                      </div>
                    </td>
                  </tr>
                ) : (
                  (dashboard?.recentPublications ?? []).map((pub) => (
                    <tr key={pub.id}>
                      <td>
                        <strong>{pub.title}</strong>
                        {pub.pubId && <div className="muted">ID: {pub.pubId}</div>}
                      </td>
                      <td>
                        <span className={`chip status-${pub.status}`}>{pub.status}</span>
                      </td>
                      <td>{pub.type}</td>
                      <td>{new Date(pub.submittedAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Cases table ────────────────────────────────────────────── */}
        <div className="dash-section">
          <p className="dash-section-label">Recent cases</p>
          <div className="table-wrap">
            <table className="table" aria-label="Recent cases">
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Last activity</th>
                </tr>
              </thead>
              <tbody>
                {dashboardLoading ? (
                  <TableSkeletonRows cols={4} rows={2} />
                ) : (dashboard?.recentCases.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">No case activity right now.</div>
                    </td>
                  </tr>
                ) : (
                  (dashboard?.recentCases ?? []).map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.caseNumber}</strong>
                        <div className="muted">{c.subject}</div>
                      </td>
                      <td>{c.priority}</td>
                      <td>
                        <span className={`chip status-${c.status}`}>{c.status}</span>
                      </td>
                      <td>{new Date(c.lastActivityAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </section>
    </main>
  );
}
