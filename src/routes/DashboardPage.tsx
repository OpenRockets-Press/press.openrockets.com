import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, MessageSquare, Shield, UploadCloud, Plus, Inbox, FileCode2 } from "lucide-react";
import { getContributorDashboard, getCurrentUser } from "@/lib/api";
import { getSessionUser } from "@/lib/authStore";
import { queryKeys } from "@/lib/queryKeys";
import { AppShell } from "@/components/AppShell";

function TableSkeletonRows({ cols, rows = 3 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-cream-border">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className="p-4">
              <div
                className="h-4 bg-cream-border animate-pulse rounded"
                style={{ width: j === 0 ? "70%" : j === cols - 1 ? "45%" : "55%" }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

const STATUS_STYLES: Record<string, string> = {
  "PENDING REVIEW": "bg-amber-100 text-amber-800 border border-amber-200",
  "UNDER REVIEW": "bg-blue-100 text-blue-800 border border-blue-200",
  "ACCEPTED": "bg-green-100 text-green-800 border border-green-200",
  "DECLINED": "bg-red-100 text-red-800 border border-red-200",
  "NEEDS REVISION": "bg-orange-100 text-orange-800 border border-orange-200",
};

const PRIORITY_STYLES: Record<string, string> = {
  "HIGH": "text-red-600 font-bold",
  "NORMAL": "text-blue-600 font-medium",
  "LOW": "text-ink-light",
};

export function DashboardPage() {
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

  if (!user) {
    return (
      <main className="min-h-screen bg-surface-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-serif mb-4">No Active Session</h1>
        <p className="text-ink-light mb-8">Please sign in to continue.</p>
        <Link className="btn-primary px-6 py-3" to="/login">
          Go to Sign In
        </Link>
      </main>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-serif text-ink mb-2">Hi, {user.firstName}</h1>
            <p className="t-body text-ink-light">Welcome back to your contributor workspace.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/publish" className="btn-primary px-4 py-2 flex items-center gap-2">
              <Plus size={18} /> New Submission
            </Link>
            <Link to="/artifacts" className="btn-secondary px-4 py-2 flex items-center gap-2">
              <FileCode2 size={18} /> View All Artifacts
            </Link>
            <Link to="/cases" className="text-gold font-medium hover:underline flex items-center gap-1 px-2">
              <Inbox size={18} /> Open Cases Inbox
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <div className="bg-surface-0 border border-cream-border rounded-xl border-l-4 border-l-gold p-6 shadow-sm flex items-start justify-between">
            <div>
              <div className="text-5xl font-serif font-bold text-ink mb-1">
                {dashboardLoading ? '-' : dashboard?.recentSubmissions.length ?? 0}
              </div>
              <div className="text-sm font-medium text-ink-light">Publications</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
              <FileText size={24} className="text-gold" />
            </div>
          </div>

          <div className="bg-surface-0 border border-cream-border rounded-xl border-l-4 border-l-gold p-6 shadow-sm flex items-start justify-between">
            <div>
              <div className="text-5xl font-serif font-bold text-ink mb-1">
                {dashboardLoading ? '-' : dashboard?.recentCases.length ?? 0}
              </div>
              <div className="text-sm font-medium text-ink-light">Open Cases</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageSquare size={24} className="text-blue-600" />
            </div>
          </div>

          <div className="bg-surface-0 border border-cream-border rounded-xl border-l-4 border-l-gold p-6 shadow-sm flex items-start justify-between">
            <div>
              <div className="text-4xl font-serif font-bold text-ink mb-1 mt-1 capitalize">
                {dashboardLoading ? '-' : 'General'}
              </div>
              <div className="text-sm font-medium text-ink-light mt-2">Consent Tier</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <Shield size={24} className="text-emerald-600" />
            </div>
          </div>

        </div>

        {/* Recent Submissions Table */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif text-ink mb-6">Recent Submissions</h2>
          <div className="bg-surface-0 border border-cream-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-surface-1 border-b border-cream-border">
                    <th className="p-4 t-label text-ink">TITLE</th>
                    <th className="p-4 t-label text-ink">STATUS</th>
                    <th className="p-4 t-label text-ink">TYPE</th>
                    <th className="p-4 t-label text-ink text-right">SUBMITTED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-border">
                  {dashboardLoading ? (
                    <TableSkeletonRows cols={4} rows={3} />
                  ) : (dashboard?.recentSubmissions.length ?? 0) === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center">
                        <UploadCloud size={48} className="mx-auto text-ink-light/50 mb-4" />
                        <p className="text-ink-light italic mb-6">No submissions yet.</p>
                        <Link to="/publish" className="btn-primary px-6 py-2 inline-flex">
                          Make Your First Submission
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    (dashboard?.recentSubmissions ?? []).map((sub) => (
                      <tr key={sub.id} className="hover:bg-surface-1 transition-colors">
                        <td className="p-4 font-medium text-ink">{sub.title}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_STYLES[sub.status] || 'bg-gray-100 text-gray-800'}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="p-4 text-ink-light">{sub.type}</td>
                        <td className="p-4 text-ink-light text-right">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Cases Table */}
        <div>
          <h2 className="text-2xl font-serif text-ink mb-6">Recent Cases</h2>
          <div className="bg-surface-0 border border-cream-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-surface-1 border-b border-cream-border">
                    <th className="p-4 t-label text-ink">CASE</th>
                    <th className="p-4 t-label text-ink">PRIORITY</th>
                    <th className="p-4 t-label text-ink">STATUS</th>
                    <th className="p-4 t-label text-ink text-right">LAST ACTIVITY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-border">
                  {dashboardLoading ? (
                    <TableSkeletonRows cols={4} rows={2} />
                  ) : (dashboard?.recentCases.length ?? 0) === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-ink-light italic">
                        No case activity right now.
                      </td>
                    </tr>
                  ) : (
                    (dashboard?.recentCases ?? []).map((c) => (
                      <tr key={c.id} className="hover:bg-surface-1 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-ink">{c.caseNumber}</div>
                          <div className="text-sm text-ink-light mt-0.5">{c.subject}</div>
                        </td>
                        <td className={`p-4 text-sm ${PRIORITY_STYLES[c.priority] || 'text-ink-light'}`}>
                          {c.priority}
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-medium px-2 py-1 bg-surface-1 border border-cream-border rounded text-ink">
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-ink-light text-right">
                          {new Date(c.lastActivityAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
