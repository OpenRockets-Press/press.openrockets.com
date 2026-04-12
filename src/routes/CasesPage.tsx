import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { AppShell } from "@/components/AppShell";
import {
  getCaseMessages,
  getContributorCases,
  getCurrentUser,
  replyToCase,
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

function MessageSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="case-message" style={{ opacity: 0.7 }}>
          <div className="case-message-head">
            <div className="skeleton-bar" style={{ height: "10px", width: "80px" }} />
            <div className="skeleton-bar" style={{ height: "10px", width: "100px" }} />
          </div>
          <div className="skeleton-bar" style={{ height: "13px", width: "90%", marginTop: "0.375rem" }} />
          <div className="skeleton-bar" style={{ height: "13px", width: "60%", marginTop: "0.25rem" }} />
        </div>
      ))}
    </div>
  );
}

export function CasesPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  const { data: user } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => getCurrentUser(),
  });

  const { data: cases, isLoading } = useQuery({
    queryKey: queryKeys.contributor.cases(),
    queryFn: () => getContributorCases(),
    staleTime: 45_000,
    enabled: Boolean(user),
  });

  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: queryKeys.contributor.caseMessages(activeCaseId ?? "none"),
    queryFn: () => {
      if (!activeCaseId) {
        return Promise.resolve([]);
      }

      return getCaseMessages(activeCaseId);
    },
    enabled: Boolean(activeCaseId),
  });

  const activeCase = useMemo(() => {
    if (!cases || !activeCaseId) {
      return null;
    }

    return cases.find((item) => item.id === activeCaseId) ?? null;
  }, [cases, activeCaseId]);

  const replyMutation = useMutation({
    mutationFn: (payload: { caseId: string; body: string }) => replyToCase(payload.caseId, payload.body),
    onSuccess: () => {
      setError(null);
      setReplyBody("");
      queryClient.invalidateQueries({ queryKey: queryKeys.contributor.cases() });
      if (activeCaseId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.contributor.caseMessages(activeCaseId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.contributor.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.dashboard() });
    },
    onError: (mutationError) => {
      setError(toUserFacingError(mutationError));
    },
  });

  if (!user) {
    return (
      <main className="page-wrap legal-wrap">
        <h1>Cases Inbox</h1>
        <p>Sign in to review your moderation conversations and reply to active cases.</p>
        <Link className="solid-button" to="/login">
          Go to Sign In
        </Link>
      </main>
    );
  }

  return (
    <AppShell>
      <div className="dash-page">
        <header className="dash-page-header">
          <p className="eyebrow">Contributor Support</p>
          <h1>Cases Inbox</h1>
          <p className="muted">Track moderator conversations and send updates for each case thread.</p>
        </header>

        {error ? <p className="error-text">{error}</p> : null}

        <div className="table-wrap">
          <table className="table" aria-label="Contributor cases">
            <thead>
              <tr>
                <th>Case</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Last activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows cols={5} rows={4} />
              ) : (cases?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">No cases yet. Moderators will open one if a submission needs follow-up.</div>
                  </td>
                </tr>
              ) : (
                (cases ?? []).map((caseItem) => (
                  <tr key={caseItem.id}>
                    <td>
                      <strong>{caseItem.caseNumber}</strong>
                      <div className="muted">{caseItem.subject}</div>
                    </td>
                    <td>{caseItem.priority}</td>
                    <td>
                      <span className={`chip status-${caseItem.status}`}>{caseItem.status}</span>
                    </td>
                    <td>{new Date(caseItem.lastActivityAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        type="button"
                        className="small-button"
                        onClick={() => {
                          setError(null);
                          setActiveCaseId(caseItem.id);
                        }}
                      >
                        Open Thread
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={activeCase !== null}
        width="lg"
        title={activeCase ? `${activeCase.caseNumber} - ${activeCase.subject}` : "Case Thread"}
        onClose={() => {
          setActiveCaseId(null);
          setReplyBody("");
        }}
      >
        {activeCase ? (
          <div className="form-grid">
            <div className="case-thread" aria-live="polite">
              {isLoadingMessages ? <MessageSkeleton /> : null}
              {(messages ?? []).map((message) => (
                <article key={message.id} className="case-message">
                  <div className="case-message-head">
                    <strong className="case-message-role">{message.senderRole}</strong>
                    <span className="muted">{new Date(message.sentAt).toLocaleString()}</span>
                  </div>
                  <p>{message.body}</p>
                </article>
              ))}
              {!isLoadingMessages && (messages?.length ?? 0) === 0 ? (
                <div className="empty-state">No messages in this thread yet.</div>
              ) : null}
            </div>

            <label className="field-group">
              <span>Reply to moderator</span>
              <textarea
                rows={4}
                value={replyBody}
                onChange={(event) => setReplyBody(event.target.value)}
                placeholder="Share your update, evidence, or revised plan."
              />
            </label>

            <div className="button-row">
              <button
                type="button"
                className="solid-button"
                disabled={!replyBody.trim() || replyMutation.isPending}
                onClick={() => {
                  if (!activeCase) return;
                  replyMutation.mutate({ caseId: activeCase.id, body: replyBody.trim() });
                }}
              >
                {replyMutation.isPending ? "Sending..." : "Send Reply"}
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setActiveCaseId(null);
                  setReplyBody("");
                }}
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </AppShell>
  );
}
