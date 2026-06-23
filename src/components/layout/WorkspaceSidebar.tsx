import { Link, useRouterState } from '@tanstack/react-router';
import { 
  LayoutDashboard, 
  Inbox, 
  UploadCloud, 
  ShieldAlert, 
  Settings,
  User as UserIcon,
  LogOut,
  Box
} from 'lucide-react';
import type { SessionUser } from '@/lib/authStore';

interface WorkspaceSidebarProps {
  user?: SessionUser;
  onLogout: () => void;
}

export function WorkspaceSidebar({ user, onLogout }: WorkspaceSidebarProps) {
  const { location } = useRouterState();
  const currentPath = location.pathname;

  const isMod = user?.role === "moderator" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const navItems = [
    { to: "/dashboard", label: "Overview", subtitle: "Contributor metrics", icon: LayoutDashboard, section: "workspace" },
    { to: "/artifacts", label: "Your Artifacts", subtitle: "Manage your submissions", icon: Box, section: "workspace" },
    { to: "/cases", label: "Cases Inbox", subtitle: "Active support threads", icon: Inbox, section: "workspace" },
    { to: "/publish", label: "New Submission", subtitle: "Upload artifacts", icon: UploadCloud, section: "workspace" },
    { to: "/profile", label: "Profile & Settings", subtitle: "Account preferences", icon: UserIcon, section: "workspace" },
  ];

  if (isMod) {
    navItems.push({ to: "/admin/queue", label: "Moderation Queue", subtitle: "Review publications", icon: ShieldAlert, section: "moderator" });
  }

  if (isAdmin) {
    navItems.push({ to: "/admin", label: "Control Center", subtitle: "Governance & DSAR", icon: Settings, section: "admin" });
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen fixed top-0 left-0 bg-surface-0 border-r border-cream-border z-40 overflow-y-auto">
        
        {/* User Identity Block */}
        {user && (
          <div className="p-6 flex items-center gap-4 border-b border-cream-border bg-surface-1">
            <div className="w-12 h-12 rounded-full bg-ink text-cream flex items-center justify-center flex-shrink-0">
              <span className="t-label text-cream">{getInitials(user.displayName)}</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <strong className="t-body-lead text-ink truncate">{user.displayName}</strong>
              <span className="t-label text-gold uppercase tracking-wider text-xs">{user.role}</span>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="flex-1 py-6 px-4 space-y-8">
          
          {/* Workspace Section */}
          <div className="space-y-2">
            <h3 className="t-eyebrow text-ink-light px-3 mb-4">Workspace</h3>
            {navItems.filter(i => i.section === "workspace").map((item) => {
              const active = currentPath === item.to || currentPath.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                    active ? "bg-surface-2 border-l-2 border-gold" : "hover:bg-surface-1 border-l-2 border-transparent"
                  }`}
                >
                  <item.icon size={20} className={active ? "text-gold" : "text-ink-light"} />
                  <div className="flex flex-col">
                    <span className={`t-body-sm ${active ? "text-ink font-medium" : "text-ink-light"}`}>{item.label}</span>
                    <span className="text-xs text-ink-light opacity-80">{item.subtitle}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Moderator Section */}
          {isMod && (
            <div className="space-y-2">
              <h3 className="t-eyebrow text-ink-light px-3 mb-4">Moderator</h3>
              {navItems.filter(i => i.section === "moderator").map((item) => {
                const active = currentPath === item.to || currentPath.startsWith(`${item.to}/`);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                      active ? "bg-surface-2 border-l-2 border-gold" : "hover:bg-surface-1 border-l-2 border-transparent"
                    }`}
                  >
                    <item.icon size={20} className={active ? "text-gold" : "text-ink-light"} />
                    <div className="flex flex-col">
                      <span className={`t-body-sm ${active ? "text-ink font-medium" : "text-ink-light"}`}>{item.label}</span>
                      <span className="text-xs text-ink-light opacity-80">{item.subtitle}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Admin Section */}
          {isAdmin && (
            <div className="space-y-2">
              <h3 className="t-eyebrow text-ink-light px-3 mb-4">Admin</h3>
              {navItems.filter(i => i.section === "admin").map((item) => {
                const active = currentPath === item.to || currentPath.startsWith(`${item.to}/`);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                      active ? "bg-surface-2 border-l-2 border-gold" : "hover:bg-surface-1 border-l-2 border-transparent"
                    }`}
                  >
                    <item.icon size={20} className={active ? "text-gold" : "text-ink-light"} />
                    <div className="flex flex-col">
                      <span className={`t-body-sm ${active ? "text-ink font-medium" : "text-ink-light"}`}>{item.label}</span>
                      <span className="text-xs text-ink-light opacity-80">{item.subtitle}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-cream-border">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-md hover:bg-surface-1 transition-colors text-error"
          >
            <LogOut size={20} />
            <span className="t-body-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-0 border-t border-cream-border z-50 px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.slice(0, 4).map((item) => {
            const active = currentPath === item.to || currentPath.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  active ? "text-gold" : "text-ink-light hover:text-ink"
                }`}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
          {/* User profile mobile button */}
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              currentPath === "/profile" ? "text-gold" : "text-ink-light hover:text-ink"
            }`}
          >
            <UserIcon size={20} />
            <span className="text-[10px] font-medium leading-none">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
