import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserListItem } from "@shared/types";
import { Modal } from "@/components/ui/Modal";
import { AppShell } from "@/components/AppShell";
import {
  getAuditLog,
  getModerationDashboard,
  listUsers,
  manageUser,
  openCase,
  resolveCase,
  reviewPublication,
  toUserFacingError,
} from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

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
  audit_pub_approved: "Approved publication",
  audit_pub_rejected: "Rejected publication",
  audit_pub_retracted: "Retracted publication",
  audit_user_suspended: "Suspended user",
  audit_user_activated: "Activated user",
  audit_user_promoted: "Promoted to moderator",
  audit_user_demoted: "Demoted to contributor",
  audit_case_opened: "Opened case",
  audit_case_resolved: "Resolved case",
};

export function ModerationPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Reject publication modal
  const [rejectModalPublicationId, setRejectModalPublicationId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Open case (tied to a publication)
  const [openCasePublicationId, setOpenCasePublicationId] = useState<string | null>(null);
  const [openCaseSubject, setOpenCaseSubject] = useState("");
  const [openCaseMessage, setOpenCaseMessage] = useState("");

  // Standalone case creation
  const [standaloneCase, setStandaloneCase] = useState(false);
  const [standaloneCaseUserId, setStandaloneCaseUserId] = useState("");
  const [standaloneCaseSubject, setStandaloneCaseSubject] = useState("");
  const [standaloneCaseMessage, setStandaloneCaseMessage] = useState("");

  // Resolve case modal
  const [resolveCaseId, setResolveCaseId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  // Ban/activate modal
  const [manageUserTarget, setManageUserTarget] = useState<UserListItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.moderation.dashboard(),
    queryFn: getModerationDashboard,
    staleTime: 30_000,
  });

  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: queryKeys.moderation.users(),
    queryFn: listUsers,
    staleTime: 60_000,
  });

  const { data: auditEntries = [], isLoading: auditLoading } = useQuery({
    queryKey: queryKeys.moderation.auditLog(),
    queryFn: getAuditLog,
    staleTime: 60_000,
  });

  const selectedPublication = useMemo(() => {
    if (!data || !openCasePublicationId) return null;
    return data.pendingPublications.find((item) => item.id === openCasePublicationId) ?? null;
  }, [data, openCasePublicationId]);

  const approveMutation = useMutation({
    mutationFn: (publicationId: string) => reviewPublication(publicationId, "approved"),
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.auditLog() });
    },
    onError: (e) => setError(toUserFacingError(e)),
  });

  const rejectMutation = useMutation({
    mutationFn: (payload: { publicationId: string; reason: string }) =>
      reviewPublication(payload.publicationId, "rejected", payload.reason),
    onSuccess: () => {
      setError(null);
      setRejectModalPublicationId(null);
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.auditLog() });
    },
    onError: (e) => setError(toUserFacingError(e)),
  });

  const openCaseMutation = useMutation({
    mutationFn: (payload: {
      contributorUserId: string;
      subject: string;
      openingMessage: string;
      relatedPubId?: string;
    }) =>
      openCase({
        contributorUserId: payload.contributorUserId,
        subject: payload.subject,
        openingMessage: payload.openingMessage,
        relatedPubId: payload.relatedPubId,
        labels: ["moderation"],
      }),
    onSuccess: () => {
      setError(null);
      setOpenCasePublicationId(null);
      setOpenCaseSubject("");
      setOpenCaseMessage("");
      setStandaloneCase(false);
      setStandaloneCaseUserId("");
      setStandaloneCaseSubject("");
      setStandaloneCaseMessage("");
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.auditLog() });
    },
    onError: (e) => setError(toUserFacingError(e)),
  });

  const resolveMutation = useMutation({
    mutationFn: (payload: { caseId: string; note: string }) =>
      resolveCase(payload.caseId, payload.note),
    onSuccess: () => {
      setError(null);
      setResolveCaseId(null);
      setResolutionNote("");
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.auditLog() });
    },
    onError: (e) => setError(toUserFacingError(e)),
  });

  const manageUserMutation = useMutation({
    mutationFn: (payload: { userId: string; action: "suspend" | "activate" }) =>
      manageUser(payload.userId, payload.action),
    onSuccess: () => {
      setError(null);
      setManageUserTarget(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.users() });
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.auditLog() });
    },
    onError: (e) => setError(toUserFacingError(e)),
  });

  const submitting =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    openCaseMutation.isPending ||
    resolveMutation.isPending ||
    manageUserMutation.isPending;

  const standaloneTargetUser = users.find((u) => u.userId === standaloneCaseUserId) ?? null;

  return (
    <AppShell>
      <div className="dash-page">
        <header className="dash-page-header">
          <div className="dash-page-header-row">
            <div>
              <p className="eyebrow">Moderation</p>
              <h1>Review Queue &amp; Cases</h1>
              <p className="muted">
                Approve or reject pending submissions, manage contributor accounts, and handle cases.
              </p>
            </div>
            <button
              type="button"
              className="solid-button"
              onClick={() => setStandaloneCase(true)}
            >
              + New Case
            </button>
          </div>
        </header>

        {error && <p className="error-text">{error}</p>}

        {/* ── Pending submissions ─────────────────────────────────── */}
        <div className="dash-section-label">Pending Submissions</div>
        <div className="table-wrap">
          <table className="table" aria-label="Pending publications">
            <thead>
              <tr>
                <th>Submission</th>
                <th>Contributor</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows cols={5} rows={4} />
              ) : (data?.pendingPublications.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">No submissions are waiting for review.</div>
                  </td>
                </tr>
              ) : (
                (data?.pendingPublications ?? []).map((pub) => (
                  <tr key={pub.id}>
                    <td>
                      <strong>{pub.title}</strong>
                      <div className="muted">{new Date(pub.submittedAt).toLocaleDateString()}</div>
                    </td>
                    <td>{pub.authorDisplayName}</td>
                    <td>{pub.type}</td>
                    <td>
                      <span className={`chip status-${pub.status}`}>{pub.status}</span>
                    </td>
                    <td>
                      <div className="actions-row">
                        <button
                          type="button"
                          className="small-button primary"
                          disabled={submitting}
                          onClick={() => approveMutation.mutate(pub.id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="small-button"
                          disabled={submitting}
                          onClick={() => setRejectModalPublicationId(pub.id)}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          className="small-button"
                          disabled={submitting}
                          onClick={() => {
                            setOpenCasePublicationId(pub.id);
                            setOpenCaseSubject(`Follow-up for: ${pub.title}`);
                            setOpenCaseMessage(
                              "Please review the moderator guidance and submit an updated revision.",
                            );
                          }}
                        >
                          Open Case
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Open cases ──────────────────────────────────────────── */}
        <div className="dash-section-label">Open Cases</div>
        <div className="table-wrap">
          <table className="table" aria-label="Open cases">
            <thead>
              <tr>
                <th>Case</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Last Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows cols={5} rows={3} />
              ) : (data?.openCases.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">No active moderation cases.</div>
                  </td>
                </tr>
              ) : (
                (data?.openCases ?? []).map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.caseNumber}</strong>
                      <div className="muted">{c.subject}</div>
                    </td>
                    <td>{c.priority}</td>
                    <td>
                      <span className={`chip status-${c.status}`}>{c.status}</span>
                    </td>
                    <td>{new Date(c.lastActivityAt).toLocaleString()}</td>
                    <td>
                      <button
                        type="button"
                        className="small-button"
                        disabled={submitting}
                        onClick={() => {
                          setResolveCaseId(c.id);
                          setResolutionNote(
                            "Resolved after moderator follow-up and contributor acknowledgement.",
                          );
                        }}
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── User management ─────────────────────────────────────── */}
        <div className="dash-section-label">Contributors</div>
        {usersError && (
          <p className="error-text">
            Could not load contributors: {toUserFacingError(usersError)}
          </p>
        )}
        <div className="table-wrap">
          <table className="table" aria-label="Contributors">
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
                <TableSkeletonRows cols={6} rows={5} />
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
                        <button
                          type="button"
                          className={`small-button${u.accountStatus === "suspended" ? " primary" : " danger"}`}
                          disabled={submitting || u.role === "admin"}
                          onClick={() => setManageUserTarget(u)}
                        >
                          {u.accountStatus === "suspended" ? "Activate" : "Suspend"}
                        </button>
                        <button
                          type="button"
                          className="small-button"
                          disabled={submitting}
                          onClick={() => {
                            setStandaloneCase(true);
                            setStandaloneCaseUserId(u.userId);
                            setStandaloneCaseSubject(`Account notice for ${u.displayName}`);
                            setStandaloneCaseMessage("");
                          }}
                        >
                          Open Case
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Audit log ───────────────────────────────────────────── */}
        <div className="dash-section-label">Recent Activity</div>
        <div className="table-wrap">
          <table className="table" aria-label="Audit log">
            <thead>
              <tr>
                <th>Action</th>
                <th>Moderator</th>
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
                auditEntries.slice(0, 30).map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <span className={`chip audit-action`}>
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

      {/* ── Reject publication modal ────────────────────────────── */}
      <Modal
        open={rejectModalPublicationId !== null}
        title="Reject Publication"
        onClose={() => { setRejectModalPublicationId(null); setRejectionReason(""); }}
      >
        <div className="form-grid">
          <label className="field-group">
            <span>Rejection reason</span>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain what the contributor needs to update."
            />
          </label>
          <div className="button-row">
            <button
              type="button"
              className="solid-button"
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
              onClick={() => {
                if (!rejectModalPublicationId) return;
                rejectMutation.mutate({
                  publicationId: rejectModalPublicationId,
                  reason: rejectionReason.trim(),
                });
              }}
            >
              Confirm Rejection
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => { setRejectModalPublicationId(null); setRejectionReason(""); }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Open case (from publication) modal ─────────────────── */}
      <Modal
        open={openCasePublicationId !== null}
        title="Open Moderation Case"
        onClose={() => {
          setOpenCasePublicationId(null);
          setOpenCaseSubject("");
          setOpenCaseMessage("");
        }}
      >
        <div className="form-grid">
          <label className="field-group">
            <span>Subject</span>
            <input
              value={openCaseSubject}
              onChange={(e) => setOpenCaseSubject(e.target.value)}
            />
          </label>
          <label className="field-group">
            <span>Opening message</span>
            <textarea
              rows={5}
              value={openCaseMessage}
              onChange={(e) => setOpenCaseMessage(e.target.value)}
            />
          </label>
          <div className="button-row">
            <button
              type="button"
              className="solid-button"
              disabled={
                !selectedPublication ||
                !openCaseSubject.trim() ||
                !openCaseMessage.trim() ||
                openCaseMutation.isPending
              }
              onClick={() => {
                if (!selectedPublication) return;
                openCaseMutation.mutate({
                  contributorUserId: selectedPublication.authorUserId,
                  subject: openCaseSubject.trim(),
                  openingMessage: openCaseMessage.trim(),
                  relatedPubId: selectedPublication.pubId ?? selectedPublication.id,
                });
              }}
            >
              Open Case
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setOpenCasePublicationId(null);
                setOpenCaseSubject("");
                setOpenCaseMessage("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Standalone case creation modal ──────────────────────── */}
      <Modal
        open={standaloneCase}
        title="New Moderation Case"
        onClose={() => {
          setStandaloneCase(false);
          setStandaloneCaseUserId("");
          setStandaloneCaseSubject("");
          setStandaloneCaseMessage("");
        }}
      >
        <div className="form-grid">
          <label className="field-group">
            <span>Contributor</span>
            <select
              value={standaloneCaseUserId}
              onChange={(e) => setStandaloneCaseUserId(e.target.value)}
            >
              <option value="" disabled>Select a contributor…</option>
              {users.map((u) => (
                <option key={u.userId} value={u.userId}>
                  {u.displayName} ({u.accountStatus})
                </option>
              ))}
            </select>
          </label>
          <label className="field-group">
            <span>Subject</span>
            <input
              value={standaloneCaseSubject}
              onChange={(e) => setStandaloneCaseSubject(e.target.value)}
            />
          </label>
          <label className="field-group">
            <span>Opening message</span>
            <textarea
              rows={5}
              value={standaloneCaseMessage}
              onChange={(e) => setStandaloneCaseMessage(e.target.value)}
            />
          </label>
          <div className="button-row">
            <button
              type="button"
              className="solid-button"
              disabled={
                !standaloneTargetUser ||
                !standaloneCaseSubject.trim() ||
                !standaloneCaseMessage.trim() ||
                openCaseMutation.isPending
              }
              onClick={() => {
                if (!standaloneTargetUser) return;
                openCaseMutation.mutate({
                  contributorUserId: standaloneTargetUser.userId,
                  subject: standaloneCaseSubject.trim(),
                  openingMessage: standaloneCaseMessage.trim(),
                });
              }}
            >
              Open Case
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setStandaloneCase(false);
                setStandaloneCaseUserId("");
                setStandaloneCaseSubject("");
                setStandaloneCaseMessage("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Resolve case modal ──────────────────────────────────── */}
      <Modal
        open={resolveCaseId !== null}
        title="Resolve Case"
        onClose={() => { setResolveCaseId(null); setResolutionNote(""); }}
      >
        <div className="form-grid">
          <label className="field-group">
            <span>Resolution note</span>
            <textarea
              rows={4}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
            />
          </label>
          <div className="button-row">
            <button
              type="button"
              className="solid-button"
              disabled={!resolutionNote.trim() || resolveMutation.isPending}
              onClick={() => {
                if (!resolveCaseId) return;
                resolveMutation.mutate({ caseId: resolveCaseId, note: resolutionNote.trim() });
              }}
            >
              Confirm Resolve
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => { setResolveCaseId(null); setResolutionNote(""); }}
            >
              Cancel
            </button>
          </div>
        </div>
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
              <>Restore access for <strong>{manageUserTarget?.displayName}</strong>? Their account will be set to active.</>
            ) : (
              <>Suspend <strong>{manageUserTarget?.displayName}</strong>? They will not be able to log in or submit publications until reactivated.</>
            )}
          </p>
          <div className="button-row">
            <button
              type="button"
              className={manageUserTarget?.accountStatus === "suspended" ? "solid-button" : "solid-button danger-button"}
              disabled={manageUserMutation.isPending}
              onClick={() => {
                if (!manageUserTarget) return;
                manageUserMutation.mutate({
                  userId: manageUserTarget.userId,
                  action: manageUserTarget.accountStatus === "suspended" ? "activate" : "suspend",
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
    </AppShell>
  );
}
