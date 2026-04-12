import { useState } from "react";
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

  return (
    <AppShell>
      <div className="dash-page">
        <header className="dash-page-header">
          <p className="eyebrow">Admin Panel</p>
          <h1>Operations, Consent &amp; Compliance</h1>
          <p className="muted">
            Monitor platform health, manage user roles, handle consent workflows, and review audit activity.
          </p>
        </header>

        {error ? <p className="error-text">{error}</p> : null}
        {success ? <p className="success-text">{success}</p> : null}

        {/* ── KPI grid ────────────────────────────────────────────── */}
        {isLoading ? <KpiSkeleton /> : (
          <div className="kpi-grid">
            <article className="kpi-card">
              <span>Total users</span>
              <strong>{data?.totalUsers ?? 0}</strong>
            </article>
            <article className="kpi-card">
              <span>Active users</span>
              <strong>{data?.activeUsers ?? 0}</strong>
            </article>
            <article className="kpi-card">
              <span>Pending parental</span>
              <strong>{data?.pendingParentalUsers ?? 0}</strong>
            </article>
            <article className="kpi-card">
              <span>Suspended users</span>
              <strong>{data?.suspendedUsers ?? 0}</strong>
            </article>
            <article className="kpi-card">
              <span>Open cases</span>
              <strong>{data?.openCases ?? 0}</strong>
            </article>
            <article className="kpi-card">
              <span>Pending review</span>
              <strong>{data?.pendingReviewPublications ?? 0}</strong>
            </article>
            <article className="kpi-card">
              <span>Consent started</span>
              <strong>{data?.consentStarted ?? 0}</strong>
            </article>
            <article className="kpi-card">
              <span>Consent completed</span>
              <strong>{data?.consentCompleted ?? 0}</strong>
            </article>
            <article className="kpi-card">
              <span>Consent expired</span>
              <strong>{data?.consentExpired ?? 0}</strong>
            </article>
          </div>
        )}

        {/* ── User management ─────────────────────────────────────── */}
        <div className="dash-section-label">User Management</div>
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
                    <td className="muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
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

        {/* ── Top downloads ────────────────────────────────────────── */}
        <div className="dash-section-label">Top Downloads</div>
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

        {/* ── Pending parental accounts ────────────────────────────── */}
        <div className="dash-section-label">Pending Parental Consent</div>
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
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
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

        {/* ── Audit log ────────────────────────────────────────────── */}
        <div className="dash-section-label">Audit Log</div>
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
                    <td>{entry.actorDisplayName || entry.actorUserId.slice(0, 8) + "…"}</td>
                    <td className="muted">{entry.targetLabel || entry.targetId.slice(0, 12) + "…"}</td>
                    <td className="muted">{entry.details || "—"}</td>
                    <td className="muted">
                      {entry.occurredAt ? new Date(entry.occurredAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
