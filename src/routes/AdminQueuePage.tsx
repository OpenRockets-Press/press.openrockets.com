import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { 
  FileCode2, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ArrowUpDown,
  MoreVertical,
  CheckSquare,
  Square
} from "lucide-react";
import { getModerationDashboard, getCurrentUser } from "@/lib/api";
import { getSessionUser } from "@/lib/authStore";
import { queryKeys } from "@/lib/queryKeys";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/lib/toast";

type SortField = "date" | "title" | "type" | "contributor";
type SortOrder = "asc" | "desc";

export function AdminQueuePage() {
  const { success } = useToast();
  
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

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const publications = dashboardData?.pendingPublications || [];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const toggleAll = () => {
    if (selectedIds.size === publications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(publications.map(p => p.id)));
    }
  };

  const handleBatchAction = (action: "approve" | "decline") => {
    if (selectedIds.size === 0) return;
    success(`Successfully ${action === "approve" ? "approved" : "declined"} ${selectedIds.size} submissions.`);
    setSelectedIds(new Set());
  };

  const getWaitTimeDetails = (dateString: string) => {
    const submitDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - submitDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 5) return { text: `${diffDays} days`, color: "text-error bg-error/10 border-error/20" };
    if (diffDays > 2) return { text: `${diffDays} days`, color: "text-amber-700 bg-amber-100 border-amber-200" };
    return { text: `${diffDays} days`, color: "text-emerald-700 bg-emerald-100 border-emerald-200" };
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...publications];
    
    // Filter
    if (typeFilter !== "all") {
      result = result.filter(p => p.type === typeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.authorDisplayName.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "contributor":
          comparison = a.authorDisplayName.localeCompare(b.authorDisplayName);
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [publications, typeFilter, searchQuery, sortField, sortOrder]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-ink-light/40 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return <ArrowUpDown size={14} className={`text-gold ml-1 ${sortOrder === 'desc' ? 'transform rotate-180' : ''} transition-transform`} />;
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

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Admin Header Context */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-error font-medium mb-2 uppercase tracking-wider text-sm">
            <Shield size={18} /> Moderation Queue
          </div>
          <h1 className="text-3xl font-serif text-ink mb-2">Review Submissions</h1>
          <p className="text-ink-light">Process incoming publications, verify licenses, and approve content for the public showcase.</p>
        </div>

        {/* Top Stat Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface-0 border border-cream-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-ink-light uppercase tracking-wider">Pending</h3>
              <Clock size={18} className="text-amber-500" />
            </div>
            <p className="text-3xl font-serif text-ink">{publications.length}</p>
          </div>
          
          <div className="bg-surface-0 border border-error/20 rounded-xl p-5 shadow-sm bg-error/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-error uppercase tracking-wider">Flagged</h3>
              <AlertTriangle size={18} className="text-error" />
            </div>
            <p className="text-3xl font-serif text-error">2</p>
          </div>

          <div className="bg-surface-0 border border-cream-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-ink-light uppercase tracking-wider">Accepted Today</h3>
              <CheckCircle size={18} className="text-emerald-500" />
            </div>
            <p className="text-3xl font-serif text-ink">14</p>
          </div>

          <div className="bg-surface-0 border border-cream-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-ink-light uppercase tracking-wider">Declined Today</h3>
              <XCircle size={18} className="text-rust" />
            </div>
            <p className="text-3xl font-serif text-ink">3</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-surface-0 p-4 rounded-xl border border-cream-border shadow-sm">
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light/60" size={16} />
              <input
                type="text"
                placeholder="Search queue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-1 border border-cream-border rounded-lg text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
              />
            </div>
            <div className="relative">
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-4 pr-10 py-2 bg-surface-1 border border-cream-border rounded-lg text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 appearance-none font-medium cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="3d">3D Models</option>
                <option value="artifacts">Artifacts</option>
                <option value="code">Code</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light/60 pointer-events-none" size={14} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                <span className="text-sm font-medium text-ink-light px-2">{selectedIds.size} selected</span>
                <button 
                  onClick={() => handleBatchAction("approve")}
                  className="btn-primary px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                >
                  Approve All
                </button>
                <button 
                  onClick={() => handleBatchAction("decline")}
                  className="btn-secondary px-3 py-1.5 text-xs text-error border-error/20 hover:bg-error/10"
                >
                  Decline All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface-0 border border-cream-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-surface-1 border-b border-cream-border text-xs uppercase tracking-wider text-ink-light font-bold">
                  <th className="p-4 w-12 text-center">
                    <button onClick={toggleAll} className="text-ink-light hover:text-ink transition-colors">
                      {selectedIds.size > 0 && selectedIds.size === publications.length ? <CheckSquare size={18} className="text-gold" /> : <Square size={18} />}
                    </button>
                  </th>
                  <th className="p-4 w-16"></th>
                  <th className="p-4 cursor-pointer group" onClick={() => handleSort("title")}>
                    <div className="flex items-center">Submission <SortIcon field="title" /></div>
                  </th>
                  <th className="p-4 cursor-pointer group" onClick={() => handleSort("contributor")}>
                    <div className="flex items-center">Contributor <SortIcon field="contributor" /></div>
                  </th>
                  <th className="p-4 cursor-pointer group" onClick={() => handleSort("type")}>
                    <div className="flex items-center">Type <SortIcon field="type" /></div>
                  </th>
                  <th className="p-4 cursor-pointer group" onClick={() => handleSort("date")}>
                    <div className="flex items-center">Wait Time <SortIcon field="date" /></div>
                  </th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-border">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4"></td>
                      <td className="p-4"><div className="w-10 h-10 bg-surface-2 rounded-lg" /></td>
                      <td className="p-4"><div className="h-4 bg-surface-2 rounded w-3/4 mb-2"/></td>
                      <td className="p-4"><div className="h-4 bg-surface-2 rounded w-32"/></td>
                      <td className="p-4"><div className="h-4 bg-surface-2 rounded w-20"/></td>
                      <td className="p-4"><div className="h-6 bg-surface-2 rounded-full w-20"/></td>
                      <td className="p-4 text-right"><div className="h-8 bg-surface-2 rounded w-24 ml-auto"/></td>
                    </tr>
                  ))
                ) : filteredAndSorted.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-16 text-center">
                      <CheckCircle size={48} className="mx-auto text-emerald-500/30 mb-4" />
                      <h3 className="text-lg font-serif text-ink mb-2">Queue is clear!</h3>
                      <p className="text-ink-light max-w-sm mx-auto">
                        There are no pending submissions matching your current filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAndSorted.map((pub) => {
                    const isSelected = selectedIds.has(pub.id);
                    const waitTime = getWaitTimeDetails(pub.submittedAt);
                    
                    return (
                      <tr key={pub.id} className={`hover:bg-surface-1/50 transition-colors ${isSelected ? 'bg-gold/5' : ''}`}>
                        <td className="p-4 text-center">
                          <button onClick={() => toggleSelection(pub.id)} className="text-ink-light hover:text-ink transition-colors">
                            {isSelected ? <CheckSquare size={18} className="text-gold" /> : <Square size={18} />}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="w-10 h-10 bg-surface-2 rounded border border-cream-border flex items-center justify-center overflow-hidden">
                             {pub.coverStorageId ? (
                               <img src={`https://placehold.co/80x80?text=${encodeURIComponent(pub.title.substring(0,2))}`} alt={pub.title} className="w-full h-full object-cover" />
                             ) : (
                               <FileCode2 size={16} className="text-ink-light/50" />
                             )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col max-w-xs xl:max-w-sm">
                            <span className="font-medium text-ink truncate">{pub.title}</span>
                            <span className="text-xs text-ink-light font-mono mt-0.5">{pub.id.substring(0,8)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center text-[10px] font-bold text-ink-light shrink-0">
                              {pub.authorDisplayName.substring(0,2).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-ink truncate max-w-[150px]">{pub.authorDisplayName}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-ink-light capitalize">
                          {pub.type}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${waitTime.color}`}>
                            <Clock size={12} className="mr-1.5" /> {waitTime.text}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link 
                            to={`/admin/review/${pub.id}`}
                            className="btn-primary px-4 py-1.5 text-xs inline-flex items-center gap-2"
                          >
                            <Eye size={14} /> Review
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppShell>
  );
}

// Add Shield icon since it was missing
function Shield(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  )
}
