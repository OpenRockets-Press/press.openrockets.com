import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminBootstrap,
  getContributorDashboard,
  getCurrentUser,
  logout,
  refreshCurrentUser,
  toUserFacingError,
} from "@/lib/api";
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
  const queryClient = useQueryClient();

  const [claimSecret, setClaimSecret] = useState("");
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

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

  const refreshMutation = useMutation({
    mutationFn: refreshCurrentUser,
    onSuccess: (fresh) => {
      if (fresh) queryClient.setQueryData(queryKeys.auth.currentUser(), fresh);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
    },
  });

  const bootstrapMutation = useMutation({
    mutationFn: () => adminBootstrap(claimSecret.trim()),
    onSuccess: async () => {
      setClaimError(null);
      setClaimSuccess(true);
      setClaimSecret("");
      // Force-refresh session so new role is reflected immediately
      const fresh = await refreshCurrentUser();
      if (fresh) queryClient.setQueryData(queryKeys.auth.currentUser(), fresh);
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
    },
    onError: (err) => {
      setClaimError(toUserFacingError(err));
    },
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
  const openCases = dashboard?.openCaseCount ?? 0;

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
              {" · "}
              <span
                className="dash-sync-link"
                role="button"
                tabIndex={0}
                onClick={() => !refreshMutation.isPending && refreshMutation.mutate()}
                onKeyDown={(e) => e.key === "Enter" && !refreshMutation.isPending && refreshMutation.mutate()}
              >
                {refreshMutation.isPending ? "Syncing…" : "Sync permissions"}
              </span>
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
            <strong className={`stat-value${openCases > 0 ? " stat-value-warn" : ""}`}>
              {openCases}
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

        {/* ── Admin bootstrap (only shown when not admin) ────────────── */}
        {user.role !== "admin" && (
          <div className="admin-claim-box">
            <p className="dash-section-label">Administrator access</p>
            <p className="muted" style={{ fontSize: "0.82rem", marginBottom: "0.75rem" }}>
              If you have an admin claim secret, enter it below to upgrade your account.
            </p>
            {claimSuccess ? (
              <p className="success-text">Admin access granted. Reload to see the admin panel.</p>
            ) : (
              <>
                {claimError ? <p className="error-text">{claimError}</p> : null}
                <div className="admin-claim-row">
                  <input
                    type="password"
                    className="admin-claim-input"
                    placeholder="Admin claim secret"
                    value={claimSecret}
                    onChange={(e) => setClaimSecret(e.target.value)}
                    disabled={bootstrapMutation.isPending}
                  />
                  <button
                    type="button"
                    className="ghost-button"
                    style={{ flexShrink: 0, fontSize: "0.8rem", padding: "0.45rem 0.9rem" }}
                    disabled={!claimSecret.trim() || bootstrapMutation.isPending}
                    onClick={() => bootstrapMutation.mutate()}
                  >
                    {bootstrapMutation.isPending ? "Claiming…" : "Claim admin"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

      </section>
    </main>
  );
}
