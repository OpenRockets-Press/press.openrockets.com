import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { createDsarRequest, getAdminDashboard, toUserFacingError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function AdminPanelPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dsarTargetUserId, setDsarTargetUserId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: getAdminDashboard,
    staleTime: 30_000,
  });

  const dsarMutation = useMutation({
    mutationFn: (payload: { userId: string; action: "export" | "delete" }) =>
      createDsarRequest(payload.userId, payload.action),
    onSuccess: (result) => {
      setError(null);
      setSuccess(`DSAR case created: ${result.case_id}`);
      setDsarTargetUserId(null);
      refetch();
    },
    onError: (mutationError) => {
      setSuccess(null);
      setError(toUserFacingError(mutationError));
    },
  });

  const pendingTarget = data?.pendingParentalAccounts.find((item) => item.userId === dsarTargetUserId) ?? null;

  return (
    <main className="page-wrap">
      <section className="panel">
        <p className="eyebrow">Admin Panel</p>
        <h1>Operations, Consent, And Compliance</h1>
        <p className="muted">
          Monitor user state, consent funnel health, moderation load, and trigger DSAR workflows.
        </p>

        {error ? <p className="error-text">{error}</p> : null}
        {success ? <p className="muted">{success}</p> : null}

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
            <span>Pending review publications</span>
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

        <div className="table-wrap">
          <table className="table" aria-label="Top downloads">
            <thead>
              <tr>
                <th>Top downloads</th>
                <th>Type</th>
                <th>License</th>
              </tr>
            </thead>
            <tbody>
              {(data?.topDownloads ?? []).map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.type}</td>
                  <td>{item.license ?? "-"}</td>
                </tr>
              ))}
              {!isLoading && (data?.topDownloads.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className="empty-state">No approved publications with downloads yet.</div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="table-wrap">
          <table className="table" aria-label="Pending parental accounts">
            <thead>
              <tr>
                <th>Pending parental accounts</th>
                <th>Tier</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.pendingParentalAccounts ?? []).map((item) => (
                <tr key={item.userId}>
                  <td>{item.displayName}</td>
                  <td>
                    <span className={`chip status-${item.consentTier}`}>{item.consentTier}</span>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="actions-row">
                      <button
                        type="button"
                        className="small-button"
                        disabled={dsarMutation.isPending}
                        onClick={() => setDsarTargetUserId(item.userId)}
                      >
                        DSAR Actions
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && (data?.pendingParentalAccounts.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">No accounts are currently waiting for guardian confirmation.</div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={pendingTarget !== null}
        title="DSAR Actions"
        onClose={() => setDsarTargetUserId(null)}
      >
        {pendingTarget ? (
          <div className="form-grid">
            <p>
              Open a DSAR case for <strong>{pendingTarget.displayName}</strong>. This creates a compliance
              case in the moderation system.
            </p>
            <div className="button-row">
              <button
                type="button"
                className="solid-button"
                disabled={dsarMutation.isPending}
                onClick={() => dsarMutation.mutate({ userId: pendingTarget.userId, action: "export" })}
              >
                Request Export
              </button>
              <button
                type="button"
                className="ghost-button"
                disabled={dsarMutation.isPending}
                onClick={() => dsarMutation.mutate({ userId: pendingTarget.userId, action: "delete" })}
              >
                Request Deletion
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </main>
  );
}
