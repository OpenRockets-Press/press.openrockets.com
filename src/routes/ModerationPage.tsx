import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { getModerationDashboard, openCase, resolveCase, reviewPublication, toUserFacingError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function ModerationPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [rejectModalPublicationId, setRejectModalPublicationId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [openCasePublicationId, setOpenCasePublicationId] = useState<string | null>(null);
  const [openCaseSubject, setOpenCaseSubject] = useState("");
  const [openCaseMessage, setOpenCaseMessage] = useState("");

  const [resolveCaseId, setResolveCaseId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.moderation.dashboard(),
    queryFn: getModerationDashboard,
    staleTime: 30_000,
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
    },
    onError: (mutationError) => setError(toUserFacingError(mutationError)),
  });

  const rejectMutation = useMutation({
    mutationFn: (payload: { publicationId: string; reason: string }) =>
      reviewPublication(payload.publicationId, "rejected", payload.reason),
    onSuccess: () => {
      setError(null);
      setRejectModalPublicationId(null);
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.dashboard() });
    },
    onError: (mutationError) => setError(toUserFacingError(mutationError)),
  });

  const openCaseMutation = useMutation({
    mutationFn: (payload: {
      contributorUserId: string;
      subject: string;
      openingMessage: string;
      relatedPubId: string;
    }) =>
      openCase({
        contributorUserId: payload.contributorUserId,
        subject: payload.subject,
        openingMessage: payload.openingMessage,
        relatedPubId: payload.relatedPubId,
        labels: ["rejection"],
      }),
    onSuccess: () => {
      setError(null);
      setOpenCasePublicationId(null);
      setOpenCaseSubject("");
      setOpenCaseMessage("");
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.dashboard() });
    },
    onError: (mutationError) => setError(toUserFacingError(mutationError)),
  });

  const resolveMutation = useMutation({
    mutationFn: (payload: { caseId: string; note: string }) => resolveCase(payload.caseId, payload.note),
    onSuccess: () => {
      setError(null);
      setResolveCaseId(null);
      setResolutionNote("");
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.dashboard() });
    },
    onError: (mutationError) => setError(toUserFacingError(mutationError)),
  });

  const submitting =
    approveMutation.isPending || rejectMutation.isPending || openCaseMutation.isPending || resolveMutation.isPending;

  return (
    <main className="page-wrap">
      <section className="panel">
        <p className="eyebrow">Moderation</p>
        <h1>Review Queue And Cases</h1>
        <p className="muted">Approve or reject pending submissions, then open and resolve contributor cases.</p>

        {error ? <p className="error-text">{error}</p> : null}

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
              {(data?.pendingPublications ?? []).map((publication) => (
                <tr key={publication.id}>
                  <td>
                    <strong>{publication.title}</strong>
                    <div className="muted">Submitted: {new Date(publication.submittedAt).toLocaleDateString()}</div>
                  </td>
                  <td>{publication.authorDisplayName}</td>
                  <td>{publication.type}</td>
                  <td>
                    <span className={`chip status-${publication.status}`}>{publication.status}</span>
                  </td>
                  <td>
                    <div className="actions-row">
                      <button
                        type="button"
                        className="small-button primary"
                        disabled={submitting}
                        onClick={() => approveMutation.mutate(publication.id)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="small-button"
                        disabled={submitting}
                        onClick={() => setRejectModalPublicationId(publication.id)}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="small-button"
                        disabled={submitting}
                        onClick={() => {
                          setOpenCasePublicationId(publication.id);
                          setOpenCaseSubject(`Follow-up for ${publication.title}`);
                          setOpenCaseMessage("Please review moderator guidance and submit an updated revision.");
                        }}
                      >
                        Open Case
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && (data?.pendingPublications.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">No submissions are waiting for moderation review.</div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

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
              {(data?.openCases ?? []).map((caseItem) => (
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
                  <td>
                    <button
                      type="button"
                      className="small-button"
                      disabled={submitting}
                      onClick={() => {
                        setResolveCaseId(caseItem.id);
                        setResolutionNote("Resolved after moderator follow-up and contributor acknowledgement.");
                      }}
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && (data?.openCases.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">No active moderation cases right now.</div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={rejectModalPublicationId !== null}
        title="Reject Publication"
        onClose={() => {
          setRejectModalPublicationId(null);
          setRejectionReason("");
        }}
      >
        <div className="form-grid">
          <label className="field-group">
            <span>Rejection reason</span>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Explain what the contributor needs to update."
            />
          </label>

          <div className="button-row">
            <button
              type="button"
              className="solid-button"
              disabled={!rejectModalPublicationId || !rejectionReason.trim() || rejectMutation.isPending}
              onClick={() => {
                if (!rejectModalPublicationId) return;
                rejectMutation.mutate({ publicationId: rejectModalPublicationId, reason: rejectionReason.trim() });
              }}
            >
              Confirm Rejection
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setRejectModalPublicationId(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

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
            <input value={openCaseSubject} onChange={(event) => setOpenCaseSubject(event.target.value)} />
          </label>
          <label className="field-group">
            <span>Opening message</span>
            <textarea rows={5} value={openCaseMessage} onChange={(event) => setOpenCaseMessage(event.target.value)} />
          </label>
          <div className="button-row">
            <button
              type="button"
              className="solid-button"
              disabled={!selectedPublication || !openCaseSubject.trim() || !openCaseMessage.trim() || openCaseMutation.isPending}
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

      <Modal
        open={resolveCaseId !== null}
        title="Resolve Case"
        onClose={() => {
          setResolveCaseId(null);
          setResolutionNote("");
        }}
      >
        <div className="form-grid">
          <label className="field-group">
            <span>Resolution note</span>
            <textarea rows={4} value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} />
          </label>
          <div className="button-row">
            <button
              type="button"
              className="solid-button"
              disabled={!resolveCaseId || !resolutionNote.trim() || resolveMutation.isPending}
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
              onClick={() => {
                setResolveCaseId(null);
                setResolutionNote("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
