import { useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  ArrowRight,
  Eye,
  FileCode2,
  Clock,
  MessageSquareWarning,
  Star
} from "lucide-react";
import { getModerationDashboard, reviewPublication, getCurrentUser } from "@/lib/api";
import { getSessionUser } from "@/lib/authStore";
import { queryKeys } from "@/lib/queryKeys";
import { AppShell } from "@/components/AppShell";
import { FloatTextarea } from "@/components/ui/FloatTextarea";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/lib/toast";

export function AdminReviewPage() {
  const { pubId } = useParams({ from: "/admin/review/$pubId" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  const { data: user } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => getCurrentUser(),
    initialData: () => getSessionUser() ?? undefined,
  });

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: queryKeys.moderation.dashboard(),
    queryFn: getModerationDashboard,
    staleTime: 30_000,
  });

  const publications = dashboardData?.pendingPublications || [];
  const currentIndex = publications.findIndex(p => p.id === pubId);
  const publication = publications[currentIndex];

  const prevPubId = currentIndex > 0 ? publications[currentIndex - 1].id : null;
  const nextPubId = currentIndex < publications.length - 1 && currentIndex !== -1 ? publications[currentIndex + 1].id : null;

  // Rating state
  const [accuracy, setAccuracy] = useState(0);
  const [quality, setQuality] = useState(0);
  const [completeness, setCompleteness] = useState(0);

  // Decline Modal state
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const approveMutation = useMutation({
    mutationFn: (id: string) => reviewPublication(id, "approved"),
    onSuccess: () => {
      success("Publication approved successfully! Webhook triggered.");
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.dashboard() });
      if (nextPubId) {
        navigate({ to: `/admin/review/${nextPubId}` });
      } else {
        navigate({ to: "/admin/queue" });
      }
    },
    onError: () => showError("Failed to approve publication.")
  });

  const rejectMutation = useMutation({
    mutationFn: (payload: { id: string; reason: string }) => reviewPublication(payload.id, "rejected", payload.reason),
    onSuccess: () => {
      success("Publication declined and case thread opened.");
      setIsDeclineModalOpen(false);
      setDeclineReason("");
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.dashboard() });
      if (nextPubId) {
        navigate({ to: `/admin/review/${nextPubId}` });
      } else {
        navigate({ to: "/admin/queue" });
      }
    },
    onError: () => showError("Failed to decline publication.")
  });

  const handleApprove = () => {
    if (!publication) return;
    approveMutation.mutate(publication.id);
  };

  const handleDeclineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publication || !declineReason.trim()) return;
    rejectMutation.mutate({ id: publication.id, reason: declineReason });
  };

  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p>Access Denied.</p>
        </div>
      </AppShell>
    );
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-8 flex justify-center"><div className="animate-pulse w-8 h-8 rounded-full bg-surface-2" /></div>
      </AppShell>
    );
  }

  if (!publication) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto p-8 text-center">
          <h2 className="text-2xl font-serif mb-4">Submission Not Found</h2>
          <p className="text-ink-light mb-8">This submission may have already been reviewed or does not exist.</p>
          <Link to="/admin/queue" className="btn-primary px-6 py-2">Back to Queue</Link>
        </div>
      </AppShell>
    );
  }

  const RatingStars = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold uppercase tracking-wider text-ink-light">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 focus:outline-none transition-transform hover:scale-110"
          >
            <Star 
              size={24} 
              className={star <= value ? "fill-gold text-gold" : "text-surface-2 fill-surface-2"} 
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col min-h-[calc(100vh-80px)]">
        
        {/* Header & Nav */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-cream-border">
          <Link to="/admin/queue" className="flex items-center gap-2 text-ink-light hover:text-ink transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Queue
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-light font-medium">
              {currentIndex + 1} of {publications.length} in Queue
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => prevPubId && navigate({ to: `/admin/review/${prevPubId}` })}
                disabled={!prevPubId}
                className="p-2 border border-cream-border rounded-md text-ink hover:bg-surface-0 disabled:opacity-30 transition-colors"
                title="Previous"
              >
                <ArrowLeft size={18} />
              </button>
              <button 
                onClick={() => nextPubId && navigate({ to: `/admin/review/${nextPubId}` })}
                disabled={!nextPubId}
                className="p-2 border border-cream-border rounded-md text-ink hover:bg-surface-0 disabled:opacity-30 transition-colors"
                title="Next"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Two Panel Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-8">
          
          {/* Left Panel: Content Preview */}
          <div className="flex-1 bg-surface-0 border border-cream-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="aspect-video bg-surface-2 relative flex items-center justify-center">
              {publication.coverStorageId ? (
                <img src={`https://placehold.co/800x450?text=${encodeURIComponent(publication.title)}`} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <FileCode2 size={64} className="text-ink-light/20" />
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 bg-surface-0/90 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  {publication.type}
                </span>
                <span className="px-3 py-1 bg-gold text-cream rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  {publication.license}
                </span>
              </div>
            </div>
            
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
              <h1 className="text-3xl font-serif text-ink mb-4">{publication.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-ink-light mb-8 pb-6 border-b border-cream-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-xs font-bold text-ink">
                    {publication.authorDisplayName.substring(0,2).toUpperCase()}
                  </div>
                  <span className="font-medium text-ink">{publication.authorDisplayName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={16} />
                  Submitted {new Date(publication.submittedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  ID: {publication.id}
                </div>
              </div>

              <div className="prose prose-sm sm:prose-base prose-headings:font-serif prose-a:text-gold max-w-none mb-8">
                <h3>Abstract</h3>
                <p>{publication.abstract || "No abstract provided."}</p>
                <p className="text-ink-light italic">
                  Note: A full preview of files/assets would be integrated here, rendering 3D models or code snippets.
                </p>
              </div>

              {publication.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {publication.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-surface-1 border border-cream-border rounded-full text-xs text-ink-light">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Controls */}
          <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
            
            <div className="bg-surface-0 border border-cream-border rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-serif text-ink border-b border-cream-border pb-3 mb-5">Quality Assessment</h3>
              
              <div className="space-y-5 mb-8">
                <RatingStars label="Historical Accuracy" value={accuracy} onChange={setAccuracy} />
                <RatingStars label="Asset Quality" value={quality} onChange={setQuality} />
                <RatingStars label="Completeness" value={completeness} onChange={setCompleteness} />
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleApprove}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={18} /> {approveMutation.isPending ? "Approving..." : "Accept Publication"}
                </button>
                
                <button 
                  onClick={() => setIsDeclineModalOpen(true)}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-surface-0 border-2 border-error/20 text-error hover:bg-error/5 font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  <XCircle size={18} /> Request Revision
                </button>
              </div>
            </div>

            <div className="bg-surface-0 border border-cream-border rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-serif text-ink border-b border-cream-border pb-3 mb-4">Moderator Notes</h3>
              <p className="text-sm text-ink-light mb-4">Internal notes are visible only to other moderators and admins.</p>
              <textarea 
                className="w-full p-3 bg-surface-1 border border-cream-border rounded-lg text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 resize-none h-32"
                placeholder="Add internal note..."
              />
              <button className="w-full mt-3 btn-secondary py-2 text-sm">Save Note</button>
            </div>

          </div>

        </div>
      </div>

      <Modal 
        isOpen={isDeclineModalOpen} 
        onClose={() => !rejectMutation.isPending && setIsDeclineModalOpen(false)}
        title="Request Revision"
      >
        <form onSubmit={handleDeclineSubmit} className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg text-amber-800 text-sm">
            <MessageSquareWarning size={20} className="shrink-0 mt-0.5" />
            <p>
              Declining will change the status to <strong className="font-semibold">Rejected</strong> and automatically open a support case with the contributor so they can provide revisions.
            </p>
          </div>
          
          <FloatTextarea 
            label="Reason for Revision / Rejection"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            rows={4}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-border">
            <button 
              type="button" 
              onClick={() => setIsDeclineModalOpen(false)}
              className="btn-secondary px-6 py-2"
              disabled={rejectMutation.isPending}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={rejectMutation.isPending || !declineReason.trim()}
              className="px-6 py-2 bg-error text-white font-medium rounded-md hover:bg-error/90 disabled:opacity-50 transition-colors"
            >
              {rejectMutation.isPending ? "Declining..." : "Confirm Decline"}
            </button>
          </div>
        </form>
      </Modal>

    </AppShell>
  );
}
