import { AppShell } from "@/components/AppShell";
import { PublishWizard } from "@/components/publish/PublishWizard";

export function PublishPage() {
  return (
    <AppShell>
      <div className="dash-page" style={{ padding: '2rem 1rem' }}>
        <PublishWizard />
      </div>
    </AppShell>
  );
}
