import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { AppShell } from "@/components/AppShell";
import { FloatTextarea } from "@/components/ui/FloatTextarea";
import {
  getCaseMessages,
  getContributorCases,
  getCurrentUser,
  replyToCase,
  toUserFacingError,
} from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { MessageSquare, AlertTriangle, CheckCircle, Clock, ExternalLink, Send, ArrowLeft, MoreHorizontal, User, ShieldCheck } from "lucide-react";

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
      <AppShell>
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <MessageSquare size={48} className="mx-auto text-ink-light mb-6 opacity-50" />
          <h1 className="text-4xl font-serif text-ink mb-4">Cases Inbox</h1>
          <p className="text-ink-light mb-8">Sign in to review your moderation conversations and reply to active cases.</p>
          <Link className="btn-primary px-8 py-3" to="/login">
            Go to Sign In
          </Link>
        </main>
      </AppShell>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'resolved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'closed': return 'bg-surface-2 text-ink-light border-cream-border';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'high': return <AlertTriangle size={14} className="text-red-500" />;
      case 'normal': return <Clock size={14} className="text-blue-500" />;
      case 'low': return <CheckCircle size={14} className="text-emerald-500" />;
      default: return null;
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 text-gold font-medium mb-2 uppercase tracking-wider text-sm">
            <MessageSquare size={18} /> Contributor Support
          </div>
          <h1 className="text-4xl font-serif text-ink mb-4">Cases Inbox</h1>
          <p className="text-ink-light text-lg max-w-2xl">
            Track moderator conversations and provide necessary updates to expedite the review process of your submissions.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-3">
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        {/* Data Table */}
        <div className="bg-surface-0 border border-cream-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-1/50 border-b border-cream-border text-xs uppercase tracking-wider text-ink-light">
                  <th className="p-4 font-medium">Case details</th>
                  <th className="p-4 font-medium">Priority</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Last activity</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-border">
                {isLoading ? (
                  [1,2,3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4"><div className="h-4 bg-surface-2 rounded w-3/4 mb-2"/><div className="h-3 bg-surface-2 rounded w-1/2"/></td>
                      <td className="p-4"><div className="h-4 bg-surface-2 rounded w-16"/></td>
                      <td className="p-4"><div className="h-6 bg-surface-2 rounded-full w-20"/></td>
                      <td className="p-4"><div className="h-4 bg-surface-2 rounded w-24"/></td>
                      <td className="p-4 text-right"><div className="h-8 bg-surface-2 rounded w-24 ml-auto"/></td>
                    </tr>
                  ))
                ) : (cases?.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-16 text-center">
                      <MessageSquare size={48} className="mx-auto text-ink-light/30 mb-4" />
                      <h3 className="text-lg font-serif text-ink mb-2">No active cases</h3>
                      <p className="text-ink-light max-w-sm mx-auto">
                        Moderators will open a case here if a submission requires additional information or follow-up.
                      </p>
                    </td>
                  </tr>
                ) : (
                  (cases ?? []).map((caseItem) => (
                    <tr key={caseItem.id} className="hover:bg-surface-1/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <strong className="text-ink text-sm font-medium">{caseItem.caseNumber}</strong>
                          <span className="text-ink-light text-sm line-clamp-1">{caseItem.subject}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm capitalize text-ink">
                          {getPriorityIcon(caseItem.priority)}
                          {caseItem.priority}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(caseItem.status)}`}>
                          {caseItem.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-ink-light">
                        {new Date(caseItem.lastActivityAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setError(null);
                            setActiveCaseId(caseItem.id);
                          }}
                          className="btn-secondary px-4 py-1.5 text-sm inline-flex items-center gap-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        >
                          Open Thread <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Case Thread Modal / Drawer */}
      {activeCase && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-0 w-full sm:w-[800px] h-[90vh] sm:max-h-[800px] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300">
            
            {/* Thread Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-cream-border bg-surface-0 shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setActiveCaseId(null); setReplyBody(""); }}
                  className="sm:hidden p-2 -ml-2 text-ink-light hover:text-ink transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-bold text-ink">{activeCase.caseNumber}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(activeCase.status)}`}>
                      {activeCase.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-serif text-ink line-clamp-1">{activeCase.subject}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-ink-light hover:bg-surface-2 rounded-lg transition-colors hidden sm:block">
                  <MoreHorizontal size={20} />
                </button>
                <button 
                  onClick={() => { setActiveCaseId(null); setReplyBody(""); }}
                  className="p-2 text-ink-light hover:bg-surface-2 rounded-lg transition-colors hidden sm:block"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Thread Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface-1 flex flex-col gap-6">
              
              <div className="text-center text-xs text-ink-light font-medium uppercase tracking-widest my-4">
                Thread Started on {new Date(activeCase.openedAt).toLocaleDateString()}
              </div>

              {isLoadingMessages ? (
                <div className="space-y-6">
                  {[1,2].map(i => (
                    <div key={i} className="flex flex-col gap-2 max-w-[80%] animate-pulse">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-surface-2" />
                        <div className="h-3 w-24 bg-surface-2 rounded" />
                      </div>
                      <div className="h-20 bg-surface-2 rounded-2xl rounded-tl-sm ml-8" />
                    </div>
                  ))}
                </div>
              ) : (messages?.length ?? 0) === 0 ? (
                <div className="flex-1 flex items-center justify-center text-ink-light">
                  No messages found.
                </div>
              ) : (
                messages?.map((msg) => {
                  const isModerator = msg.senderRole === "moderator" || msg.senderRole === "system";
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col gap-1 max-w-[85%] ${isModerator ? 'self-start' : 'self-end'}`}
                    >
                      <div className={`flex items-center gap-2 text-xs text-ink-light mb-1 ${isModerator ? 'flex-row' : 'flex-row-reverse'}`}>
                        {isModerator ? <ShieldCheck size={14} className="text-gold" /> : <User size={14} />}
                        <span className="font-bold uppercase tracking-wider">{isModerator ? "Moderator" : "You"}</span>
                        <span>•</span>
                        <span>{new Date(msg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      
                      <div 
                        className={`p-4 text-sm leading-relaxed ${
                          isModerator 
                            ? 'bg-surface-0 border border-cream-border text-ink rounded-2xl rounded-tl-sm shadow-sm' 
                            : 'bg-ink text-surface-0 rounded-2xl rounded-tr-sm shadow-sm'
                        }`}
                      >
                        {msg.body}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Input Area */}
            <div className="p-4 sm:p-6 bg-surface-0 border-t border-cream-border shrink-0">
              {activeCase.status === "closed" || activeCase.status === "resolved" ? (
                <div className="text-center p-4 bg-surface-1 rounded-xl border border-cream-border text-sm text-ink-light">
                  This case is {activeCase.status}. You cannot reply to this thread.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <FloatTextarea 
                    label="Type your reply to the moderator..."
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-ink-light">
                      Moderators typically respond within 24-48 hours.
                    </span>
                    <button
                      disabled={!replyBody.trim() || replyMutation.isPending}
                      onClick={() => replyMutation.mutate({ caseId: activeCase.id, body: replyBody.trim() })}
                      className="btn-primary px-6 py-2 flex items-center gap-2 disabled:opacity-50"
                    >
                      {replyMutation.isPending ? "Sending..." : "Send Reply"} <Send size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </AppShell>
  );
}

// Quick fallback for chevron
function ChevronRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
function X(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
