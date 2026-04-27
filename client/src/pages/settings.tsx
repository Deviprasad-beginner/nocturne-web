import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle, Moon, Bell, Shield, User, Globe,
  Download, Trash2, LogOut, Notebook, MessageCircle,
  Brain, Coffee, Lightbulb, Star, Users, Headphones,
  Settings2, ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "profile" | "privacy" | "notifications" | "appearance" | "services" | "account";

// ─── Service definitions ───────────────────────────────────────────────────────
const SERVICES = [
  {
    id: "diaries",
    label: "Night Diaries",
    icon: Notebook,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    description: "Personal journal entries",
    settings: [
      { key: "diariesPrivacy", label: "Default Privacy", type: "select", options: ["Private", "Friends", "Public"] },
      { key: "diariesAllowComments", label: "Allow comments on entries", type: "toggle" },
      { key: "diariesShowInFeed", label: "Show public entries in main feed", type: "toggle" },
    ],
  },
  {
    id: "whispers",
    label: "Whispers",
    icon: MessageCircle,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    description: "Anonymous short messages",
    settings: [
      { key: "whispersAutoAnon", label: "Always post as anonymous", type: "toggle" },
      { key: "whispersReplyNotif", label: "Notify me on replies", type: "toggle" },
      { key: "whispersVisibility", label: "Who can reply", type: "select", options: ["Everyone", "Night Owls", "No one"] },
    ],
  },
  {
    id: "cafe",
    label: "Midnight Cafe",
    icon: Coffee,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    description: "Casual chat discussions",
    settings: [
      { key: "cafeAutoJoin", label: "Auto-join open tables", type: "toggle" },
      { key: "cafeShowInFeed", label: "Show cafe activity in feed", type: "toggle" },
      { key: "cafeTopic", label: "Preferred topic", type: "select", options: ["Anything", "Tech", "Philosophy", "Art", "Music"] },
    ],
  },
  {
    id: "mindmaze",
    label: "Mind Maze",
    icon: Brain,
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10",
    description: "Brain teasers & puzzles",
    settings: [
      { key: "mazeNotif", label: "Notify me of new puzzles", type: "toggle" },
      { key: "mazeDifficulty", label: "Preferred difficulty", type: "select", options: ["Easy", "Medium", "Hard", "Any"] },
      { key: "mazeShowSolved", label: "Show solved puzzles in profile", type: "toggle" },
    ],
  },
  {
    id: "founder",
    label: "3AM Founder",
    icon: Lightbulb,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    description: "Entrepreneur midnight insights",
    settings: [
      { key: "founderAnon", label: "Post anonymously by default", type: "toggle" },
      { key: "founderVisibility", label: "Post visibility", type: "select", options: ["Everyone", "Founders Only", "Private"] },
      { key: "founderNotif", label: "Notify me of new insights", type: "toggle" },
    ],
  },
  {
    id: "speaker",
    label: "Starlit Speaker",
    icon: Headphones,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    description: "Voice rooms under the stars",
    settings: [
      { key: "speakerAutoMic", label: "Join rooms with mic off by default", type: "toggle" },
      { key: "speakerNotif", label: "Notify me when a room goes live", type: "toggle" },
      { key: "speakerDiscoverable", label: "Show me in speaker listings", type: "toggle" },
    ],
  },
  {
    id: "circles",
    label: "Night Circles",
    icon: Users,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    description: "Group conversation rooms",
    settings: [
      { key: "circlesAutoJoin", label: "Allow others to add me to circles", type: "toggle" },
      { key: "circlesNotif", label: "Notify me of circle activity", type: "toggle" },
      { key: "circlesDiscoverable", label: "Make my circles discoverable", type: "toggle" },
    ],
  },
  {
    id: "messenger",
    label: "Moon Messenger",
    icon: Star,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    description: "Private & random paired chats",
    settings: [
      { key: "messengerPairing", label: "Opt into random pairing", type: "toggle" },
      { key: "messengerRequests", label: "Who can message me", type: "select", options: ["Everyone", "Mutuals Only", "No one"] },
      { key: "messengerReadReceipts", label: "Send read receipts", type: "toggle" },
    ],
  },
];

// ─── Tab nav item ──────────────────────────────────────────────────────────────
function NavItem({ id, label, icon: Icon, active, onClick }: {
  id: Tab; label: string; icon: React.ElementType; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left
        ${active ? "bg-indigo-500/20 text-indigo-300" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
      {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
    </button>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export default function Settings() {
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [activeService, setActiveService] = useState<string>("diaries");

  const [settings, setSettings] = useState<Record<string, any>>(() => {
    const prefs = user?.preferences || {};
    return {
      // Profile
      displayName: user?.displayName ?? "Night Wanderer",
      nightPersona: user?.nightPersona ?? "",
      bio: user?.bio ?? "A fellow insomniac exploring the depths of midnight thoughts",
      location: user?.location ?? "Somewhere in the night",
      // Privacy
      profileVisibility: prefs.profileVisibility ?? "public",
      showOnlineStatus: prefs.showOnlineStatus ?? true,
      allowDirectMessages: prefs.allowDirectMessages ?? true,
      showActivity: prefs.showActivity ?? false,
      anonymousPosting: prefs.anonymousPosting ?? true,
      // Notifications
      pushNotifications: prefs.pushNotifications ?? true,
      emailNotifications: prefs.emailNotifications ?? false,
      mentionNotifications: prefs.mentionNotifications ?? true,
      messageNotifications: prefs.messageNotifications ?? true,
      circleUpdates: prefs.circleUpdates ?? true,
      // Appearance
      darkMode: prefs.darkMode ?? true,
      accentColor: prefs.accentColor ?? "purple",
      fontSize: prefs.fontSize ?? "medium",
      compactMode: prefs.compactMode ?? false,
      // Service defaults
      diariesPrivacy: prefs.diariesPrivacy ?? "Private",
      diariesAllowComments: prefs.diariesAllowComments ?? true,
      diariesShowInFeed: prefs.diariesShowInFeed ?? false,
      whispersAutoAnon: prefs.whispersAutoAnon ?? true,
      whispersReplyNotif: prefs.whispersReplyNotif ?? true,
      whispersVisibility: prefs.whispersVisibility ?? "Everyone",
      cafeAutoJoin: prefs.cafeAutoJoin ?? false,
      cafeShowInFeed: prefs.cafeShowInFeed ?? true,
      cafeTopic: prefs.cafeTopic ?? "Anything",
      mazeNotif: prefs.mazeNotif ?? true,
      mazeDifficulty: prefs.mazeDifficulty ?? "Any",
      mazeShowSolved: prefs.mazeShowSolved ?? true,
      founderAnon: prefs.founderAnon ?? true,
      founderVisibility: prefs.founderVisibility ?? "Everyone",
      founderNotif: prefs.founderNotif ?? true,
      speakerAutoMic: prefs.speakerAutoMic ?? true,
      speakerNotif: prefs.speakerNotif ?? true,
      speakerDiscoverable: prefs.speakerDiscoverable ?? true,
      circlesAutoJoin: prefs.circlesAutoJoin ?? true,
      circlesNotif: prefs.circlesNotif ?? true,
      circlesDiscoverable: prefs.circlesDiscoverable ?? false,
      messengerPairing: prefs.messengerPairing ?? true,
      messengerRequests: prefs.messengerRequests ?? "Everyone",
      messengerReadReceipts: prefs.messengerReadReceipts ?? true,
    };
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Record<string, any>) => {
      const res = await apiRequest("PATCH", "/api/v1/users/me/settings", newSettings);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  // Debounced save for text inputs
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const set = (key: string, value: any, instant: boolean = true) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    if (instant) {
      updateSettingsMutation.mutate({ [key]: value });
      toast({ title: "Saved", description: "Preference updated.", duration: 1500 });
    } else {
      // Debounce for text inputs (bio, location, etc.)
      if (saveTimeout) clearTimeout(saveTimeout);
      const timeout = setTimeout(() => {
        updateSettingsMutation.mutate({ [key]: value });
        toast({ title: "Saved", description: "Profile updated.", duration: 1500 });
      }, 1000);
      setSaveTimeout(timeout);
    }
  };

  const card = "bg-white/[0.03] border border-white/[0.07] rounded-2xl";
  const sectionTitle = "text-white font-semibold text-base flex items-center gap-2 mb-1";
  const sectionDesc = "text-gray-500 text-sm mb-5";
  const row = "flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0";
  const rowLabel = "text-gray-300 text-sm font-medium";
  const rowSub = "text-gray-500 text-xs mt-0.5";

  const currentService = SERVICES.find(s => s.id === activeService)!;

  return (
    <div className="min-h-screen bg-[#07070f] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-gray-500 text-sm">Customize your Nocturne experience</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* ── Sidebar nav ── */}
          <aside className="md:w-52 flex-shrink-0 space-y-1">
            <NavItem id="profile" label="Profile" icon={User} active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
            <NavItem id="privacy" label="Privacy" icon={Shield} active={activeTab === "privacy"} onClick={() => setActiveTab("privacy")} />
            <NavItem id="notifications" label="Notifications" icon={Bell} active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")} />
            <NavItem id="appearance" label="Appearance" icon={Moon} active={activeTab === "appearance"} onClick={() => setActiveTab("appearance")} />
            <NavItem id="services" label="Services" icon={Globe} active={activeTab === "services"} onClick={() => setActiveTab("services")} />
            <div className="pt-2 border-t border-white/5 mt-2">
              <NavItem id="account" label="Account" icon={AlertTriangle} active={activeTab === "account"} onClick={() => setActiveTab("account")} />
            </div>
          </aside>

          {/* ── Content ── */}
          <div className="flex-1 min-w-0">

            {/* ════ PROFILE ════ */}
            {activeTab === "profile" && (
              <div className={`${card} p-6`}>
                <p className={sectionTitle}><User className="w-4 h-4 text-indigo-400" /> Profile</p>
                <p className={sectionDesc}>Manage your public identity</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 text-xs mb-1.5 block">Display Name</Label>
                      <Input value={settings.displayName} onChange={e => set("displayName", e.target.value, false)}
                        className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div>
                      <Label className="text-gray-400 text-xs mb-1.5 block">Night Persona <span className="text-indigo-400">(anonymous alias)</span></Label>
                      <Input placeholder="e.g. SleeplessOwl_42" value={settings.nightPersona} onChange={e => set("nightPersona", e.target.value, false)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs mb-1.5 block">Location</Label>
                    <Input value={settings.location} onChange={e => set("location", e.target.value, false)}
                      className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs mb-1.5 block">Bio</Label>
                    <Textarea value={settings.bio} onChange={e => set("bio", e.target.value, false)}
                      className="bg-white/5 border-white/10 text-white" rows={3} />
                  </div>
                </div>
              </div>
            )}

            {/* ════ PRIVACY ════ */}
            {activeTab === "privacy" && (
              <div className={`${card} p-6`}>
                <p className={sectionTitle}><Shield className="w-4 h-4 text-indigo-400" /> Privacy & Security</p>
                <p className={sectionDesc}>Control who sees your activity</p>
                <div>
                  <div className={row}>
                    <div><p className={rowLabel}>Profile Visibility</p><p className={rowSub}>Who can see your profile</p></div>
                    <Select value={settings.profileVisibility} onValueChange={v => set("profileVisibility", v)}>
                      <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#12121f] border-white/10 text-white">
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {[
                    { key: "showOnlineStatus", label: "Show Online Status", sub: "Let others see when you're active" },
                    { key: "allowDirectMessages", label: "Allow Direct Messages", sub: "Receive messages from users" },
                    { key: "anonymousPosting", label: "Anonymous Posting", sub: "Use your Night Persona by default" },
                    { key: "showActivity", label: "Show Activity in Feeds", sub: "Surface your activity publicly" },
                  ].map(({ key, label, sub }) => (
                    <div key={key} className={row}>
                      <div><p className={rowLabel}>{label}</p><p className={rowSub}>{sub}</p></div>
                      <Switch checked={settings[key]} onCheckedChange={v => set(key, v)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════ NOTIFICATIONS ════ */}
            {activeTab === "notifications" && (
              <div className={`${card} p-6`}>
                <p className={sectionTitle}><Bell className="w-4 h-4 text-indigo-400" /> Notifications</p>
                <p className={sectionDesc}>Choose what you hear about</p>
                {[
                  { key: "pushNotifications", label: "Push Notifications", sub: "Browser notifications" },
                  { key: "emailNotifications", label: "Email Notifications", sub: "Email digest updates" },
                  { key: "mentionNotifications", label: "Mentions", sub: "When someone mentions you" },
                  { key: "messageNotifications", label: "Direct Messages", sub: "New message alerts" },
                  { key: "circleUpdates", label: "Night Circle Updates", sub: "Activity in your circles" },
                ].map(({ key, label, sub }) => (
                  <div key={key} className={row}>
                    <div><p className={rowLabel}>{label}</p><p className={rowSub}>{sub}</p></div>
                    <Switch checked={settings[key]} onCheckedChange={v => set(key, v)} />
                  </div>
                ))}
              </div>
            )}

            {/* ════ APPEARANCE ════ */}
            {activeTab === "appearance" && (
              <div className={`${card} p-6`}>
                <p className={sectionTitle}><Moon className="w-4 h-4 text-indigo-400" /> Appearance</p>
                <p className={sectionDesc}>Customize the look of Nocturne</p>
                <div>
                  {[
                    { key: "darkMode", label: "Dark Mode", sub: "Optimized for late-night browsing" },
                    { key: "compactMode", label: "Compact Mode", sub: "Reduce spacing for more content" },
                  ].map(({ key, label, sub }) => (
                    <div key={key} className={row}>
                      <div><p className={rowLabel}>{label}</p><p className={rowSub}>{sub}</p></div>
                      <Switch checked={settings[key]} onCheckedChange={v => set(key, v)} />
                    </div>
                  ))}
                  {[
                    { key: "accentColor", label: "Accent Color", options: ["purple", "blue", "green", "orange"] },
                    { key: "fontSize", label: "Font Size", options: ["small", "medium", "large"] },
                  ].map(({ key, label, options }) => (
                    <div key={key} className={row}>
                      <div><p className={rowLabel}>{label}</p></div>
                      <Select value={settings[key]} onValueChange={v => set(key, v)}>
                        <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white text-sm capitalize">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#12121f] border-white/10 text-white">
                          {options.map(o => <SelectItem key={o} value={o} className="capitalize">{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════ SERVICES ════ */}
            {activeTab === "services" && (
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Service picker */}
                <div className={`${card} p-3 sm:w-44 flex-shrink-0 space-y-1`}>
                  {SERVICES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setActiveService(s.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all text-left
                        ${activeService === s.id ? "bg-indigo-500/20 text-indigo-300" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                    >
                      <div className={`${s.bg} rounded-lg p-1.5`}>
                        <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                      </div>
                      <span className="truncate">{s.label}</span>
                    </button>
                  ))}
                </div>

                {/* Service settings panel */}
                <div className={`${card} p-6 flex-1`}>
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`${currentService.bg} rounded-xl p-2`}>
                      <currentService.icon className={`w-5 h-5 ${currentService.color}`} />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{currentService.label}</p>
                      <p className="text-gray-500 text-xs">{currentService.description}</p>
                    </div>
                  </div>
                  <Separator className="my-4 bg-white/5" />
                  <div>
                    {currentService.settings.map(setting => (
                      <div key={setting.key} className={row}>
                        <p className={rowLabel}>{setting.label}</p>
                        {setting.type === "toggle" ? (
                          <Switch checked={!!settings[setting.key]} onCheckedChange={v => set(setting.key, v)} />
                        ) : (
                          <Select value={settings[setting.key]} onValueChange={v => set(setting.key, v)}>
                            <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#12121f] border-white/10 text-white">
                              {setting.options!.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════ ACCOUNT ════ */}
            {activeTab === "account" && (
              <div className={`${card} p-6 space-y-4`}>
                <p className={sectionTitle}><AlertTriangle className="w-4 h-4 text-yellow-400" /> Account Management</p>
                <p className={sectionDesc}>Manage your account and session</p>

                {/* Sign out */}
                <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                  <div>
                    <p className={rowLabel}>Sign Out</p>
                    <p className={rowSub}>End your current session</p>
                  </div>
                  <Button
                    onClick={() => logoutMutation.mutate()}
                    variant="ghost"
                    className="border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </div>

                {/* Export data */}
                <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                  <div>
                    <p className={rowLabel}>Export Data</p>
                    <p className={rowSub}>Download all your posts, messages & activity</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/10"
                    onClick={() => toast({ title: "Export Started", description: "Your archive will be ready shortly." })}
                  >
                    <Download className="w-4 h-4 mr-2" /> Export
                  </Button>
                </div>

                {/* Delete account */}
                <div className="flex items-center justify-between p-4 bg-red-900/10 rounded-xl border border-red-800/30">
                  <div>
                    <p className="text-red-300 text-sm font-medium">Delete Account</p>
                    <p className={rowSub}>Permanently remove your account and all data</p>
                  </div>
                  <Button
                    variant="destructive"
                    className="bg-red-700/80 hover:bg-red-700"
                    onClick={() => toast({ title: "Contact Support", description: "Email us to request account deletion.", variant: "destructive" })}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}