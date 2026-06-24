import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserListItem } from "@shared/types";
import { Modal } from "@/components/ui/Modal";
import { AppShell } from "@/components/AppShell";
import {
  createDsarRequest,
  getAdminDashboard,
  getAuditLog,
  listUsers,
  manageUser,
  promoteUser,
  toUserFacingError,
} from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

function KpiSkeleton() {
  return (
    <div className="kpi-grid" aria-hidden="true" style={{ marginTop: "1.25rem" }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="kpi-card">
          <div className="skeleton-bar" style={{ height: "10px", width: "60%" }} />
          <div className="skeleton-bar" style={{ height: "28px", width: "35%", marginTop: "0.5rem" }} />
        </div>
      ))}
    </div>
  );
}

function TableSkeletonRows({ cols, rows = 3 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="skeleton-tr">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j}>
              <div className="skeleton-bar" style={{ height: "13px", width: j === 0 ? "65%" : "45%" }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  suspended: "Suspended",
  pending_parental: "Pending consent",
  deletion_requested: "Deletion req.",
};

const AUDIT_ACTION_LABELS: Record<string, string> = {
  audit_pub_approved: "Approved pub",
  audit_pub_rejected: "Rejected pub",
  audit_pub_retracted: "Retracted pub",
  audit_user_suspended: "Suspended user",
  audit_user_activated: "Activated user",
  audit_user_promoted: "Promoted to mod",
  audit_user_demoted: "Demoted to contributor",
  audit_case_opened: "Opened case",
  audit_case_resolved: "Resolved case",
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

export function AdminPanelPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // DSAR modal — can target any user
  const [dsarTarget, setDsarTarget] = useState<{ userId: string; displayName: string } | null>(null);

  // User management modals
  const [manageUserTarget, setManageUserTarget] = useState<UserListItem | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<UserListItem | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: getAdminDashboard,
    staleTime: 30_000,
  });

  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: queryKeys.moderation.users(),
    queryFn: listUsers,
    staleTime: 60_000,
  });

  const { data: auditEntries = [], isLoading: auditLoading } = useQuery({
    queryKey: queryKeys.admin.auditLog(),
    queryFn: getAuditLog,
    staleTime: 60_000,
  });

  const dsarMutation = useMutation({
    mutationFn: (payload: { userId: string; action: "export" | "delete" }) =>
      createDsarRequest(payload.userId, payload.action),
    onSuccess: (result) => {
      setError(null);
      setSuccess(`DSAR case created: ${result.case_id}`);
      setDsarTarget(null);
      refetch();
    },
    onError: (mutationError) => {
      setSuccess(null);
      setError(toUserFacingError(mutationError));
    },
  });

  const manageUserMutation = useMutation({
    mutationFn: (payload: { userId: string; action: "suspend" | "activate" }) =>
      manageUser(payload.userId, payload.action),
    onSuccess: () => {
      setError(null);
      setManageUserTarget(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.users() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.auditLog() });
      refetch();
    },
    onError: (e) => setError(toUserFacingError(e)),
  });

  const promoteUserMutation = useMutation({
    mutationFn: (payload: { userId: string; action: "promote" | "demote" }) =>
      promoteUser(payload.userId, payload.action),
    onSuccess: (result) => {
      setError(null);
      setPromoteTarget(null);
      setSuccess(
        `User ${result.role === "moderator" ? "promoted to moderator" : "demoted to contributor"}.`,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.users() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.auditLog() });
    },
    onError: (e) => setError(toUserFacingError(e)),
  });

  const anyPending =
    manageUserMutation.isPending ||
    promoteUserMutation.isPending ||
    dsarMutation.isPending;

  const kpiCards = [
    {
      label: "Total users",
      value: data?.totalUsers ?? 0,
      detail: "registered accounts",
      tone: "slate",
    },
    {
      label: "Active users",
      value: data?.activeUsers ?? 0,
      detail: "can currently log in",
      tone: "forest",
    },
    {
      label: "Pending parental",
      value: data?.pendingParentalUsers ?? 0,
      detail: "awaiting guardian consent",
      tone: "amber",
    },
    {
      label: "Suspended users",
      value: data?.suspendedUsers ?? 0,
      detail: "restricted access",
      tone: "rust",
    },
    {
      label: "Open cases",
      value: data?.openCases ?? 0,
      detail: "active moderation threads",
      tone: "navy",
    },
    {
      label: "Pending review",
      value: data?.pendingReviewPublications ?? 0,
      detail: "publications in queue",
      tone: "ink",
    },
    {
      label: "Consent started",
      value: data?.consentStarted ?? 0,
      detail: "events tracked",
      tone: "sky",
    },
    {
      label: "Consent completed",
      value: data?.consentCompleted ?? 0,
      detail: "successful completions",
      tone: "forest",
    },
    {
      label: "Consent expired",
      value: data?.consentExpired ?? 0,
      detail: "expired consent tokens",
      tone: "rust",
    },
  ];

  return (
    <AppShell>
      <div className="dash-page admin-page">
        <header className="admin-hero">
          <div className="admin-hero-copy">
            <p className="eyebrow">Admin Control Center</p>
            <h1>Governance, Moderation and Compliance</h1>
            <p className="muted">
              A command view for role management, consent flows and policy enforcement with one-click moderator handoff.
            </p>
          </div>

          <aside className="admin-hero-side" aria-label="Quick actions">
            <div className="admin-live-pill">
              <span className="admin-live-dot" aria-hidden="true" />
              Live operations board
            </div>
            <p className="muted">
              Move between moderation queue and case inbox without leaving governance context.
            </p>
            <div className="admin-hero-actions">
              <Link className="admin-quick-link" to="/moderation">
                Open Moderator Queue
              </Link>
              <Link className="admin-quick-link" to="/cases">
                Open Cases Inbox
              </Link>
            </div>
          </aside>
        </header>

        {error ? <p className="error-text admin-feedback">{error}</p> : null}
        {success ? <p className="success-text admin-feedback">{success}</p> : null}

        <section className="admin-block">
          <div className="admin-block-head">
            <p className="admin-block-tag">Operational Pulse</p>
            <h2>Platform health snapshot</h2>
          </div>
          {isLoading ? <KpiSkeleton /> : (
            <div className="kpi-grid admin-kpi-grid">
              {kpiCards.map((card) => (
                <article key={card.label} className={`kpi-card admin-kpi-card tone-${card.tone}`}>
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                  <p>{card.detail}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="admin-layout-grid admin-layout-grid-major">
          <section className="admin-panel-card admin-panel-card-wide">
            <div className="admin-panel-head">
              <p className="admin-block-tag">Identity and Access</p>
              <h2>User management</h2>
              <p className="muted">Promote, demote, suspend and trigger DSAR workflows from one table.</p>
            </div>

            {usersError && (
              <p className="error-text">
                Could not load users: {toUserFacingError(usersError)}
              </p>
            )}

            <div className="table-wrap">
              <table className="table" aria-label="All users">
                <thead>
                  <tr>
                    <th>Display Name</th>
                    <th>Role</th>
                    <th>Consent Tier</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <TableSkeletonRows cols={6} rows={6} />
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">No users found.</div>
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.userId}>
                        <td><strong>{u.displayName}</strong></td>
                        <td>
                          <span className={`chip role-${u.role}`}>{u.role}</span>
                        </td>
                        <td>{u.consentTier}</td>
                        <td>
                          <span className={`chip status-${u.accountStatus}`}>
                            {STATUS_LABELS[u.accountStatus] ?? u.accountStatus}
                          </span>
                        </td>
                        <td className="muted">{formatDate(u.createdAt)}</td>
                        <td>
                          <div className="actions-row">
                            {u.role !== "admin" && (
                              <button
                                type="button"
                                className="small-button"
                                disabled={anyPending}
                                onClick={() => setPromoteTarget(u)}
                              >
                                {u.role === "moderator" ? "Demote" : "Promote"}
                              </button>
                            )}
                            <button
                              type="button"
                              className={`small-button${u.accountStatus === "suspended" ? " primary" : " danger"}`}
                              disabled={anyPending || u.role === "admin"}
                              onClick={() => setManageUserTarget(u)}
                            >
                              {u.accountStatus === "suspended" ? "Activate" : "Suspend"}
                            </button>
                            <button
                              type="button"
                              className="small-button"
                              disabled={anyPending}
                              onClick={() =>
                                setDsarTarget({ userId: u.userId, displayName: u.displayName })
                              }
                            >
                              DSAR
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-panel-card">
            <div className="admin-panel-head">
              <p className="admin-block-tag">Consent Workflows</p>
              <h2>Pending parental consent</h2>
              <p className="muted">Accounts currently waiting for guardian confirmation.</p>
            </div>

            <div className="table-wrap">
              <table className="table" aria-label="Pending parental accounts">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Tier</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <TableSkeletonRows cols={4} rows={4} />
                  ) : (data?.pendingParentalAccounts.length ?? 0) === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="empty-state">No accounts are currently waiting for guardian confirmation.</div>
                      </td>
                    </tr>
                  ) : (
                    (data?.pendingParentalAccounts ?? []).map((item) => (
                      <tr key={item.userId}>
                        <td>{item.displayName}</td>
                        <td>
                          <span className={`chip status-${item.consentTier}`}>{item.consentTier}</span>
                        </td>
                        <td>{formatDate(item.createdAt)}</td>
                        <td>
                          <button
                            type="button"
                            className="small-button"
                            disabled={anyPending}
                            onClick={() =>
                              setDsarTarget({ userId: item.userId, displayName: item.displayName })
                            }
                          >
                            DSAR Actions
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="admin-layout-grid">
          <section className="admin-panel-card">
            <div className="admin-panel-head">
              <p className="admin-block-tag">Reach</p>
              <h2>Top downloads</h2>
              <p className="muted">Most requested approved publications.</p>
            </div>

            <div className="table-wrap">
              <table className="table" aria-label="Top downloads">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>License</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <TableSkeletonRows cols={3} rows={3} />
                  ) : (data?.topDownloads.length ?? 0) === 0 ? (
                    <tr>
                      <td colSpan={3}>
                        <div className="empty-state">No approved publications with downloads yet.</div>
                      </td>
                    </tr>
                  ) : (
                    (data?.topDownloads ?? []).map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.type}</td>
                        <td>{item.license ?? "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-panel-card admin-panel-card-tall">
            <div className="admin-panel-head">
              <p className="admin-block-tag">Accountability</p>
              <h2>Audit log</h2>
              <p className="muted">Recent moderation and role actions with actor context.</p>
            </div>

            <div className="table-wrap">
              <table className="table" aria-label="Audit log">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Actor</th>
                    <th>Target</th>
                    <th>Details</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLoading ? (
                    <TableSkeletonRows cols={5} rows={5} />
                  ) : auditEntries.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-state">No audit entries yet.</div>
                      </td>
                    </tr>
                  ) : (
                    auditEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td>
                          <span className="chip audit-action">
                            {AUDIT_ACTION_LABELS[entry.action] ?? entry.action}
                          </span>
                        </td>
                        <td>{entry.actorDisplayName || entry.actorUserId.slice(0, 8) + "..."}</td>
                        <td className="muted">{entry.targetLabel || entry.targetId.slice(0, 12) + "..."}</td>
                        <td className="muted">{entry.details || "—"}</td>
                        <td className="muted">{formatDateTime(entry.occurredAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* ── DSAR modal ───────────────────────────────────────────── */}
      <Modal
        open={dsarTarget !== null}
        title="DSAR Actions"
        onClose={() => setDsarTarget(null)}
      >
        {dsarTarget ? (
          <div className="form-grid">
            <p>
              Open a DSAR case for <strong>{dsarTarget.displayName}</strong>. This creates a
              compliance case in the moderation system.
            </p>
            <div className="button-row">
              <button
                type="button"
                className="solid-button"
                disabled={dsarMutation.isPending}
                onClick={() => dsarMutation.mutate({ userId: dsarTarget.userId, action: "export" })}
              >
                Request Export
              </button>
              <button
                type="button"
                className="ghost-button"
                disabled={dsarMutation.isPending}
                onClick={() => dsarMutation.mutate({ userId: dsarTarget.userId, action: "delete" })}
              >
                Request Deletion
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ── Suspend / activate user modal ───────────────────────── */}
      <Modal
        open={manageUserTarget !== null}
        title={manageUserTarget?.accountStatus === "suspended" ? "Activate Account" : "Suspend Account"}
        onClose={() => setManageUserTarget(null)}
      >
        <div className="form-grid">
          <p>
            {manageUserTarget?.accountStatus === "suspended" ? (
              <>
                Restore access for <strong>{manageUserTarget?.displayName}</strong>? Their account
                will be set to active.
              </>
            ) : (
              <>
                Suspend <strong>{manageUserTarget?.displayName}</strong>? They will not be able to
                log in or submit publications until reactivated.
              </>
            )}
          </p>
          <div className="button-row">
            <button
              type="button"
              className={
                manageUserTarget?.accountStatus === "suspended"
                  ? "solid-button"
                  : "solid-button danger-button"
              }
              disabled={manageUserMutation.isPending}
              onClick={() => {
                if (!manageUserTarget) return;
                manageUserMutation.mutate({
                  userId: manageUserTarget.userId,
                  action:
                    manageUserTarget.accountStatus === "suspended" ? "activate" : "suspend",
                });
              }}
            >
              {manageUserTarget?.accountStatus === "suspended" ? "Activate" : "Suspend"}
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => setManageUserTarget(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Promote / demote modal ───────────────────────────────── */}
      <Modal
        open={promoteTarget !== null}
        title={promoteTarget?.role === "moderator" ? "Demote User" : "Promote to Moderator"}
        onClose={() => setPromoteTarget(null)}
      >
        <div className="form-grid">
          <p>
            {promoteTarget?.role === "moderator" ? (
              <>
                Remove moderator access for <strong>{promoteTarget?.displayName}</strong>? They
                will revert to the contributor role.
              </>
            ) : (
              <>
                Grant moderator access to <strong>{promoteTarget?.displayName}</strong>? They will
                be able to review submissions and manage cases.
              </>
            )}
          </p>
          <div className="button-row">
            <button
              type="button"
              className={
                promoteTarget?.role === "moderator"
                  ? "solid-button danger-button"
                  : "solid-button"
              }
              disabled={promoteUserMutation.isPending}
              onClick={() => {
                if (!promoteTarget) return;
                promoteUserMutation.mutate({
                  userId: promoteTarget.userId,
                  action: promoteTarget.role === "moderator" ? "demote" : "promote",
                });
              }}
            >
              {promoteTarget?.role === "moderator" ? "Demote" : "Promote"}
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => setPromoteTarget(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
