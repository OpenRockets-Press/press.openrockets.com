import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell" style={{ display: 'flex', width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <main className="app-main" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="app-content" style={{ flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
