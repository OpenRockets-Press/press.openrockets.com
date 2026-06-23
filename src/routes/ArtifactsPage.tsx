import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileCode2, Search, Filter, Eye, Star, MoreHorizontal, ArrowRight, Clock, Plus, Inbox, Box } from "lucide-react";
import { getContributorPublications, getCurrentUser } from "@/lib/api";
import { getSessionUser } from "@/lib/authStore";
import { queryKeys } from "@/lib/queryKeys";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/lib/toast";

type TabStatus = "all" | "published" | "under review" | "declined" | "draft";

const STATUS_STYLES: Record<string, string> = {
  "published": "bg-emerald-100 text-emerald-800 border border-emerald-200",
  "review": "bg-amber-100 text-amber-800 border border-amber-200",
  "declined": "bg-red-100 text-red-800 border border-red-200",
  "draft": "bg-surface-2 text-ink-light border border-cream-border",
};

export function ArtifactsPage() {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<TabStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: user } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => getCurrentUser(),
    initialData: () => getSessionUser() ?? undefined,
  });

  const { data: publications, isLoading } = useQuery({
    queryKey: ["contributor-publications-all"],
    queryFn: () => getContributorPublications(100),
    staleTime: 60_000,
    enabled: Boolean(user),
  });

  const filteredArtifacts = useMemo(() => {
    if (!publications) return [];
    
    return publications.filter(pub => {
      // Search filter
      if (searchQuery && !pub.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Tab filter
      if (activeTab === "all") return true;
      if (activeTab === "published" && pub.status === "published") return true;
      if (activeTab === "under review" && pub.status === "review") return true;
      if (activeTab === "declined" && pub.status === "declined") return true;
      if (activeTab === "draft" && pub.status === "draft") return true;
      
      return false;
    });
  }, [publications, activeTab, searchQuery]);

  const handleArchive = (id: string) => {
    // Simulated archive action
    success("Artifact archived successfully.");
  };

  if (!user) {
    return (
      <AppShell>
        <main className="min-h-screen bg-surface-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl font-serif mb-4">No Active Session</h1>
          <p className="text-ink-light mb-8">Please sign in to manage your artifacts.</p>
          <Link className="btn-primary px-6 py-3" to="/login">
            Go to Sign In
          </Link>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-gold font-medium mb-2 uppercase tracking-wider text-sm">
              <Box size={18} /> Workspace
            </div>
            <h1 className="text-4xl font-serif text-ink mb-2">Your Artifacts</h1>
            <p className="text-ink-light">Manage, track, and review all your submissions to Open Rockets Press.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/publish" className="btn-primary px-4 py-2 flex items-center gap-2">
              <Plus size={18} /> New Artifact
            </Link>
          </div>
        </div>

        {/* Tab Navigation & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex overflow-x-auto hide-scrollbar border-b border-cream-border w-full md:w-auto">
            {(["all", "published", "under review", "declined", "draft"] as TabStatus[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-gold text-ink"
                    : "border-transparent text-ink-light hover:text-ink"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light/60" size={16} />
            <input
              type="text"
              placeholder="Search artifacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-0 border border-cream-border rounded-lg text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface-0 border border-cream-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-1/50 border-b border-cream-border text-xs uppercase tracking-wider text-ink-light font-medium">
                  <th className="p-4 w-12"></th>
                  <th className="p-4 min-w-[200px]">Artifact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Division</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Metrics</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-border">
                {isLoading ? (
                  [1, 2, 3, 4].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4"><div className="w-12 h-12 bg-surface-2 rounded-lg" /></td>
                      <td className="p-4"><div className="h-4 bg-surface-2 rounded w-3/4 mb-2"/><div className="h-3 bg-surface-2 rounded w-1/2"/></td>
                      <td className="p-4"><div className="h-6 bg-surface-2 rounded-full w-20"/></td>
                      <td className="p-4"><div className="h-4 bg-surface-2 rounded w-16"/></td>
                      <td className="p-4"><div className="h-4 bg-surface-2 rounded w-24"/></td>
                      <td className="p-4"><div className="h-4 bg-surface-2 rounded w-20"/></td>
                      <td className="p-4 text-right"><div className="h-8 bg-surface-2 rounded w-8 ml-auto"/></td>
                    </tr>
                  ))
                ) : filteredArtifacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-16 text-center">
                      <Box size={48} className="mx-auto text-ink-light/30 mb-4" />
                      <h3 className="text-lg font-serif text-ink mb-2">No artifacts found</h3>
                      <p className="text-ink-light max-w-sm mx-auto mb-6">
                        {searchQuery 
                          ? "We couldn't find any artifacts matching your search criteria."
                          : "You haven't submitted any artifacts in this category yet."}
                      </p>
                      {!searchQuery && activeTab === "all" && (
                        <Link to="/publish" className="btn-secondary px-6 py-2">
                          Create Your First Artifact
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredArtifacts.map((pub) => (
                    <tr key={pub.id} className="hover:bg-surface-1/50 transition-colors group">
                      <td className="p-4">
                        <div className="w-12 h-12 bg-surface-2 rounded-lg flex items-center justify-center border border-cream-border shrink-0 overflow-hidden">
                          {pub.coverStorageId ? (
                             <img src={`https://placehold.co/100x100?text=${encodeURIComponent(pub.title.substring(0,2))}`} alt={pub.title} className="w-full h-full object-cover" />
                          ) : (
                            <FileCode2 size={20} className="text-ink-light/50" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <Link 
                            to={pub.status === "published" ? `/p/${pub.pubId || pub.id}` : "#"} 
                            className={`font-medium text-sm ${pub.status === "published" ? "text-ink hover:text-gold hover:underline" : "text-ink"}`}
                          >
                            {pub.title}
                          </Link>
                          <span className="text-xs text-ink-light uppercase tracking-wider mt-0.5">{pub.type}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[pub.status] || STATUS_STYLES.draft}`}>
                          {pub.status === "review" ? "Under Review" : pub.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-ink capitalize">
                        {pub.type}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm text-ink-light">
                          <Clock size={14} />
                          {new Date(pub.submittedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        {pub.status === "published" ? (
                          <div className="flex items-center gap-4 text-xs text-ink-light">
                            <span className="flex items-center gap-1"><Eye size={14} /> {pub.viewCount}</span>
                            <span className="flex items-center gap-1"><Star size={14} className="text-gold" /> -</span>
                          </div>
                        ) : (
                          <span className="text-xs text-ink-light/50">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {pub.status === "published" && (
                            <Link 
                              to={`/p/${pub.pubId || pub.id}`}
                              className="p-2 text-ink-light hover:text-ink hover:bg-surface-2 rounded-lg transition-colors"
                              title="View Public Page"
                            >
                              <ArrowRight size={18} />
                            </Link>
                          )}
                          <div className="relative group/menu">
                            <button className="p-2 text-ink-light hover:text-ink hover:bg-surface-2 rounded-lg transition-colors">
                              <MoreHorizontal size={18} />
                            </button>
                            {/* Simple Dropdown simulation using group-hover */}
                            <div className="absolute right-0 top-full mt-1 w-32 bg-surface-0 border border-cream-border rounded-lg shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 py-1 flex flex-col">
                              {pub.status === "published" && (
                                <Link to={`/p/${pub.pubId || pub.id}`} className="px-3 py-2 text-sm text-left text-ink hover:bg-surface-1">
                                  View Page
                                </Link>
                              )}
                              <button 
                                onClick={() => handleArchive(pub.id)}
                                className="px-3 py-2 text-sm text-left text-red-600 hover:bg-surface-1"
                              >
                                Archive
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
