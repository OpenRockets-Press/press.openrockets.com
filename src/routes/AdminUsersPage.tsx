import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical,
  Shield,
  ShieldAlert,
  Ban,
  CheckCircle,
  AlertTriangle,
  UserX
} from "lucide-react";
import { listUsers, manageUser, promoteUser, getCurrentUser } from "@/lib/api";
import { getSessionUser } from "@/lib/authStore";
import { queryKeys } from "@/lib/queryKeys";
import { AppShell } from "@/components/AppShell";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/lib/toast";

type FilterStatus = "all" | "active" | "suspended" | "pending_parental";

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  const { data: currentUser } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => getCurrentUser(),
    initialData: () => getSessionUser() ?? undefined,
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: queryKeys.moderation.users(),
    queryFn: listUsers,
    staleTime: 60_000,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  
  // Modal states
  const [deleteModalUser, setDeleteModalUser] = useState<{ id: string; name: string } | null>(null);

  const manageMutation = useMutation({
    mutationFn: (payload: { userId: string; action: "suspend" | "activate" }) => manageUser(payload.userId, payload.action),
    onSuccess: (_, variables) => {
      success(`User successfully ${variables.action === "suspend" ? "suspended" : "activated"}.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.users() });
    },
    onError: () => showError("Failed to update user status.")
  });

  const roleMutation = useMutation({
    mutationFn: (payload: { userId: string; action: "promote" | "demote" }) => promoteUser(payload.userId, payload.action),
    onSuccess: (_, variables) => {
      success(`User role updated to ${variables.action === "promote" ? "moderator" : "contributor"}.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.users() });
    },
    onError: () => showError("Failed to update user role.")
  });

  // Mock deletion
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return userId;
    },
    onSuccess: () => {
      success("User account and all associated data have been permanently deleted.");
      setDeleteModalUser(null);
      // In a real app, we'd invalidate queries. Here we just pretend it worked since our mock API doesn't actually delete from the hardcoded list.
    },
    onError: () => showError("Failed to process deletion request.")
  });

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteModalUser) return;
    deleteMutation.mutate(deleteModalUser.id);
  };

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (statusFilter !== "all") {
      result = result.filter(u => u.status === statusFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u => 
        u.displayName.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q)
      );
    }

    // Sort by joined date desc
    result.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());

    return result;
  }, [users, statusFilter, searchQuery]);

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p>Access Denied. Admins only.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-cream-border">
          <div>
            <div className="flex items-center gap-2 text-error font-medium mb-2 uppercase tracking-wider text-sm">
              <Users size={18} /> User Management
            </div>
            <h1 className="text-3xl font-serif text-ink mb-2">Directory & Compliance</h1>
            <p className="text-ink-light max-w-2xl">
              Manage platform contributors, handle consent tiers, and execute moderation actions across the user base.
            </p>
          </div>
          <Link to="/admin" className="btn-secondary px-4 py-2 shrink-0">
            Back to Control Center
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-surface-0 p-4 rounded-xl border border-cream-border shadow-sm">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light/60" size={16} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-1 border border-cream-border rounded-lg text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
              />
            </div>
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                className="pl-4 pr-10 py-2 bg-surface-1 border border-cream-border rounded-lg text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 appearance-none font-medium cursor-pointer min-w-[140px]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending_parental">Pending Consent</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light/60 pointer-events-none" size={14} />
            </div>
          </div>
          <div className="text-sm font-medium text-ink-light">
            {filteredUsers.length} users found
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-surface-0 border border-cream-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-surface-1 border-b border-cream-border text-xs uppercase tracking-wider text-ink-light font-bold">
                  <th className="p-4 pl-6">User</th>
                  <th className="p-4">Status & Role</th>
                  <th className="p-4">Compliance Tier</th>
                  <th className="p-4">Submissions</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-border">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4 pl-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-surface-2"/><div className="h-4 bg-surface-2 rounded w-32"/></div></td>
                      <td className="p-4"><div className="h-4 bg-surface-2 rounded w-20"/></td>
                      <td className="p-4"><div className="h-4 bg-surface-2 rounded w-24"/></td>
                      <td className="p-4"><div className="h-4 bg-surface-2 rounded w-16"/></td>
                      <td className="p-4"><div className="h-4 bg-surface-2 rounded w-24"/></td>
                      <td className="p-4 pr-6"><div className="h-8 bg-surface-2 rounded w-8 ml-auto"/></td>
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-16 text-center">
                      <Users size={48} className="mx-auto text-ink-light/30 mb-4" />
                      <h3 className="text-lg font-serif text-ink mb-2">No users found</h3>
                      <p className="text-ink-light max-w-sm mx-auto">Try adjusting your search query or filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.userId} className="hover:bg-surface-1/50 transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-2 border border-cream-border flex items-center justify-center font-bold text-sm text-ink shrink-0">
                            {u.displayName.substring(0,2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-ink">{u.displayName}</span>
                            <span className="text-xs text-ink-light">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          {u.status === "active" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              <CheckCircle size={10} /> Active
                            </span>
                          ) : u.status === "suspended" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-error/10 text-error">
                              <Ban size={10} /> Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                              <AlertTriangle size={10} /> Pending
                            </span>
                          )}
                          
                          {u.role === "moderator" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-ink text-surface-0">
                              <Shield size={10} /> Mod
                            </span>
                          )}
                          {u.role === "admin" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gold text-surface-0">
                              <ShieldAlert size={10} /> Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-ink-light bg-surface-1 px-2 py-1 rounded border border-cream-border">
                          {u.consentTier === "adult" ? "Standard (18+)" : u.consentTier === "verified_minor" ? "Verified Minor" : "Unverified"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4 text-sm text-ink-light">
                          <div className="flex flex-col" title="Published">
                            <span className="font-bold text-ink">{u.metrics.publishedCount}</span>
                            <span className="text-[10px] uppercase">Pub</span>
                          </div>
                          <div className="w-px h-6 bg-cream-border" />
                          <div className="flex flex-col" title="Pending">
                            <span className="font-bold text-ink">{u.metrics.pendingCount}</span>
                            <span className="text-[10px] uppercase">Pend</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-ink-light">
                        {new Date(u.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="relative inline-block text-left group/menu">
                          <button className="p-2 text-ink-light hover:text-ink hover:bg-surface-2 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                            <MoreVertical size={18} />
                          </button>
                          
                          {/* Dropdown Menu - Simple hover implementation for admin panel */}
                          <div className="absolute right-0 top-full mt-1 w-48 bg-surface-0 border border-cream-border rounded-lg shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 origin-top-right">
                            <div className="py-1 flex flex-col">
                              {u.status === "active" ? (
                                <button 
                                  onClick={() => manageMutation.mutate({ userId: u.userId, action: "suspend" })}
                                  disabled={manageMutation.isPending || u.role === "admin"}
                                  className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-surface-1 flex items-center gap-2 disabled:opacity-50"
                                >
                                  <Ban size={14} className="text-error" /> Suspend User
                                </button>
                              ) : (
                                <button 
                                  onClick={() => manageMutation.mutate({ userId: u.userId, action: "activate" })}
                                  disabled={manageMutation.isPending}
                                  className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-surface-1 flex items-center gap-2 disabled:opacity-50"
                                >
                                  <CheckCircle size={14} className="text-emerald-500" /> Activate User
                                </button>
                              )}

                              {u.role === "contributor" ? (
                                <button 
                                  onClick={() => roleMutation.mutate({ userId: u.userId, action: "promote" })}
                                  disabled={roleMutation.isPending || u.status !== "active"}
                                  className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-surface-1 flex items-center gap-2 disabled:opacity-50"
                                >
                                  <Shield size={14} className="text-gold" /> Promote to Mod
                                </button>
                              ) : u.role === "moderator" ? (
                                <button 
                                  onClick={() => roleMutation.mutate({ userId: u.userId, action: "demote" })}
                                  disabled={roleMutation.isPending}
                                  className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-surface-1 flex items-center gap-2 disabled:opacity-50"
                                >
                                  <Users size={14} /> Demote to Contrib
                                </button>
                              ) : null}

                              <div className="h-px bg-cream-border my-1" />
                              
                              <button 
                                onClick={() => setDeleteModalUser({ id: u.userId, name: u.displayName })}
                                disabled={u.role === "admin"}
                                className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/5 flex items-center gap-2 disabled:opacity-50"
                              >
                                <UserX size={14} /> Delete Account
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModalUser}
        onClose={() => !deleteMutation.isPending && setDeleteModalUser(null)}
        title="Confirm Account Deletion"
      >
        <form onSubmit={handleDeleteSubmit} className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Warning: Irreversible Action</p>
              <p>
                You are about to permanently delete the account for <strong className="font-semibold">{deleteModalUser?.name}</strong>. 
                This action is taken under GDPR/CCPA data subject access requests and will completely purge all user data, including their publications.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-cream-border">
            <button 
              type="button" 
              onClick={() => setDeleteModalUser(null)}
              className="btn-secondary px-6 py-2"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={deleteMutation.isPending}
              className="px-6 py-2 bg-error text-white font-medium rounded-md hover:bg-error/90 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {deleteMutation.isPending ? "Processing..." : "Permanently Delete"}
            </button>
          </div>
        </form>
      </Modal>

    </AppShell>
  );
}
