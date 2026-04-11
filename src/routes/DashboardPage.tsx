import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getContributorDashboard, getCurrentUser, logout } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: user } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => getCurrentUser(),
  });

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: queryKeys.contributor.dashboard(),
    queryFn: getContributorDashboard,
    staleTime: 20_000,
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

  return (
    <main className="page-wrap dashboard-wrap">
      <section className="panel">
        <p className="eyebrow">Contributor dashboard</p>
        <h1>Welcome, {user.displayName}</h1>
        <p className="muted">
          Account status: <strong>{user.accountStatus}</strong>
        </p>

        <div className="stats-grid">
          <article className="stat-card">
            <h2>Publications</h2>
            <p>{dashboard?.publicationCount ?? 0} submitted</p>
          </article>
          <article className="stat-card">
            <h2>Cases</h2>
            <p>{dashboard?.openCaseCount ?? 0} open</p>
          </article>
          <article className="stat-card">
            <h2>Consent tier</h2>
            <p>{user.consentTier}</p>
          </article>
        </div>

        <div className="button-row">
          <Link className="solid-button" to="/publish">
            Start a Submission
          </Link>
          <Link className="ghost-button" to="/cases">
            Open Cases Inbox
          </Link>
          {(user.role === "moderator" || user.role === "admin") && (
            <Link className="ghost-button" to="/moderation">
              Open Moderation
            </Link>
          )}
          {user.role === "admin" && (
            <Link className="ghost-button" to="/admin">
              Open Admin Panel
            </Link>
          )}
          <button className="ghost-button" type="button" onClick={handleLogout}>
            Sign Out
          </button>
        </div>

        <div className="table-wrap">
          <table className="table" aria-label="Recent publications">
            <thead>
              <tr>
                <th>Recent publications</th>
                <th>Status</th>
                <th>Type</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {(dashboard?.recentPublications ?? []).map((publication) => (
                <tr key={publication.id}>
                  <td>
                    <strong>{publication.title}</strong>
                    <div className="muted">{publication.pubId ? `ID: ${publication.pubId}` : "Awaiting publication ID"}</div>
                  </td>
                  <td>
                    <span className={`chip status-${publication.status}`}>{publication.status}</span>
                  </td>
                  <td>{publication.type}</td>
                  <td>{new Date(publication.submittedAt).toLocaleString()}</td>
                </tr>
              ))}
              {!dashboardLoading && (dashboard?.recentPublications.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">No submissions yet. Start by sending your first publication for review.</div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="table-wrap">
          <table className="table" aria-label="Recent cases">
            <thead>
              <tr>
                <th>Recent cases</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Last activity</th>
              </tr>
            </thead>
            <tbody>
              {(dashboard?.recentCases ?? []).map((caseItem) => (
                <tr key={caseItem.id}>
                  <td>
                    <strong>{caseItem.caseNumber}</strong>
                    <div className="muted">{caseItem.subject}</div>
                  </td>
                  <td>{caseItem.priority}</td>
                  <td>
                    <span className={`chip status-${caseItem.status}`}>{caseItem.status}</span>
                  </td>
                  <td>{new Date(caseItem.lastActivityAt).toLocaleString()}</td>
                </tr>
              ))}
              {!dashboardLoading && (dashboard?.recentCases.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">No case activity right now.</div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
