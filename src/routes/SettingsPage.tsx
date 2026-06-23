import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Save, User, MapPin, Link as LinkIcon, Bell, Shield, Sliders } from "lucide-react";
import { getCurrentUser } from "@/lib/api";
import { getSessionUser } from "@/lib/authStore";
import { queryKeys } from "@/lib/queryKeys";
import { AppShell } from "@/components/AppShell";
import { FloatTextarea } from "@/components/ui/FloatTextarea";
import { useToast } from "@/lib/toast";

export function SettingsPage() {
  const { success } = useToast();
  
  const { data: user } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => getCurrentUser(),
    initialData: () => getSessionUser() ?? undefined,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "defaults">("profile");

  // Form State - Pre-populated for simulation
  const [bio, setBio] = useState("Space exploration enthusiast and 3D modeling hobbyist. I love digitizing historical rocket artifacts.");
  const [location, setLocation] = useState("Houston, TX");
  const [github, setGithub] = useState("github.com/space-creator");
  const [twitter, setTwitter] = useState("");
  const [portfolio, setPortfolio] = useState("myportfolio.space");
  
  // Defaults State
  const [defaultLicense, setDefaultLicense] = useState("CC_BY");
  const [defaultDivision, setDefaultDivision] = useState("3d");
  
  // Preferences State
  const [notifyReviews, setNotifyReviews] = useState(true);
  const [notifyCases, setNotifyCases] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsSaving(false);
      success("Profile settings updated successfully!");
    }, 1500);
  };

  if (!user) {
    return (
      <AppShell>
        <main className="min-h-screen bg-surface-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-4xl font-serif mb-4">No Active Session</h1>
          <p className="text-ink-light mb-8">Please sign in to access your settings.</p>
          <Link className="btn-primary px-6 py-3" to="/login">
            Go to Sign In
          </Link>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-gold font-medium mb-2 uppercase tracking-wider text-sm">
            <Sliders size={18} /> Workspace
          </div>
          <h1 className="text-4xl font-serif text-ink mb-2">Profile & Settings</h1>
          <p className="text-ink-light">Manage your public presence and account preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "profile" 
                    ? "bg-surface-0 text-ink shadow-sm border border-cream-border" 
                    : "text-ink-light hover:bg-surface-1 hover:text-ink border border-transparent"
                }`}
              >
                <User size={18} /> Public Profile
              </button>
              <button
                onClick={() => setActiveTab("defaults")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "defaults" 
                    ? "bg-surface-0 text-ink shadow-sm border border-cream-border" 
                    : "text-ink-light hover:bg-surface-1 hover:text-ink border border-transparent"
                }`}
              >
                <Sliders size={18} /> Submission Defaults
              </button>
              <button
                onClick={() => setActiveTab("preferences")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "preferences" 
                    ? "bg-surface-0 text-ink shadow-sm border border-cream-border" 
                    : "text-ink-light hover:bg-surface-1 hover:text-ink border border-transparent"
                }`}
              >
                <Bell size={18} /> Preferences
              </button>
            </nav>
          </aside>

          {/* Form Content */}
          <div className="flex-1">
            <form onSubmit={handleSave} className="bg-surface-0 border border-cream-border rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                
                {activeTab === "profile" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <h2 className="text-xl font-serif text-ink border-b border-cream-border pb-4 mb-6">Public Information</h2>
                    
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-24 h-24 rounded-full bg-gold/10 text-gold flex items-center justify-center text-3xl font-serif uppercase shrink-0">
                        {user.displayName.substring(0,2)}
                      </div>
                      <div>
                        <h3 className="font-medium text-ink text-lg">{user.displayName}</h3>
                        <p className="text-sm text-ink-light mb-3">{user.email}</p>
                        <button type="button" className="btn-secondary px-4 py-1.5 text-xs">Change Avatar</button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <FloatTextarea 
                        label="Bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                      />
                      <p className="text-xs text-ink-light px-1">A brief description of yourself shown on your creator page.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-ink-light px-1 flex items-center gap-2">
                          <MapPin size={14} /> Location
                        </label>
                        <input 
                          type="text" 
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. London, UK"
                          className="w-full px-4 py-3 bg-surface-1 border border-cream-border rounded-lg text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-ink-light px-1 flex items-center gap-2">
                          <LinkIcon size={14} /> GitHub
                        </label>
                        <input 
                          type="text" 
                          value={github}
                          onChange={(e) => setGithub(e.target.value)}
                          placeholder="github.com/username"
                          className="w-full px-4 py-3 bg-surface-1 border border-cream-border rounded-lg text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-ink-light px-1 flex items-center gap-2">
                          <LinkIcon size={14} /> Twitter / X
                        </label>
                        <input 
                          type="text" 
                          value={twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                          placeholder="twitter.com/username"
                          className="w-full px-4 py-3 bg-surface-1 border border-cream-border rounded-lg text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold uppercase tracking-wider text-ink-light px-1 flex items-center gap-2">
                          <LinkIcon size={14} /> Portfolio
                        </label>
                        <input 
                          type="url" 
                          value={portfolio}
                          onChange={(e) => setPortfolio(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-4 py-3 bg-surface-1 border border-cream-border rounded-lg text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "defaults" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <h2 className="text-xl font-serif text-ink border-b border-cream-border pb-4 mb-6">Submission Defaults</h2>
                    <p className="text-sm text-ink-light mb-6">
                      Set default values for the submission wizard to speed up your publishing workflow.
                    </p>

                    <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-ink">Default License</label>
                        <select 
                          value={defaultLicense}
                          onChange={(e) => setDefaultLicense(e.target.value)}
                          className="w-full p-4 bg-surface-1 border border-cream-border rounded-lg text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 appearance-none cursor-pointer"
                        >
                          <option value="CC_BY">Creative Commons Attribution 4.0 (CC-BY)</option>
                          <option value="CC0">Public Domain (CC0)</option>
                          <option value="ORP_ND">ORP Standard Non-Derivative</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-bold text-ink">Primary Division</label>
                        <select 
                          value={defaultDivision}
                          onChange={(e) => setDefaultDivision(e.target.value)}
                          className="w-full p-4 bg-surface-1 border border-cream-border rounded-lg text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 appearance-none cursor-pointer"
                        >
                          <option value="artifacts">Artifacts (Historical Documents, Physical Items)</option>
                          <option value="3d">3D & Photogrammetry</option>
                          <option value="code">Code & Software</option>
                          <option value="audio">Audio & Telemetry</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "preferences" && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    
                    <div>
                      <h2 className="text-xl font-serif text-ink border-b border-cream-border pb-4 mb-6 flex items-center gap-2">
                        <Shield size={20} /> Privacy
                      </h2>
                      <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-surface-1 border border-cream-border">
                        <div>
                          <h4 className="font-medium text-ink mb-1">Public Profile</h4>
                          <p className="text-sm text-ink-light">Allow others to view your profile page at `/creator/{user.username || user.userId}`</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                          <input type="checkbox" checked={isPublic} onChange={() => setIsPublic(!isPublic)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-xl font-serif text-ink border-b border-cream-border pb-4 mb-6 flex items-center gap-2">
                        <Bell size={20} /> Email Notifications
                      </h2>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-cream-border hover:bg-surface-1/50 transition-colors">
                          <div>
                            <h4 className="font-medium text-ink mb-1">Review Updates</h4>
                            <p className="text-sm text-ink-light">Get notified when a submission is approved or declined.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                            <input type="checkbox" checked={notifyReviews} onChange={() => setNotifyReviews(!notifyReviews)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-cream-border hover:bg-surface-1/50 transition-colors">
                          <div>
                            <h4 className="font-medium text-ink mb-1">Moderator Cases</h4>
                            <p className="text-sm text-ink-light">Get notified when a moderator replies to your case.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                            <input type="checkbox" checked={notifyCases} onChange={() => setNotifyCases(!notifyCases)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                          </label>
                        </div>

                        <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-cream-border hover:bg-surface-1/50 transition-colors">
                          <div>
                            <h4 className="font-medium text-ink mb-1">Marketing & News</h4>
                            <p className="text-sm text-ink-light">Occasional updates about Open Rockets Press features.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                            <input type="checkbox" checked={notifyMarketing} onChange={() => setNotifyMarketing(!notifyMarketing)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
              
              <div className="px-6 py-4 md:px-8 bg-surface-1 border-t border-cream-border flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary px-8 py-2.5 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"} <Save size={18} />
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
