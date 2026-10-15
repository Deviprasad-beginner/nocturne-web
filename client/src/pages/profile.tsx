import React, { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Redirect, useLocation } from "wouter";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import {
  ChevronLeft, Flame, Shield, Music, Moon,
  MessageSquare, Heart, Coffee, Star, Zap, Clock, Activity, Trophy, BarChart3
} from "lucide-react";
import type { NightThought } from "@shared/schema";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const initial = (u: { displayName?: string | null; username: string }) =>
  (u.displayName || u.username).charAt(0).toUpperCase();

const fmtDate = (d: string | Date | null | undefined) => {
  if (!d) return "—";
  try { return format(new Date(d), "MMM d, yyyy"); } catch { return "—"; }
};
const fmtRelative = (d: string | Date | null | undefined) => {
  if (!d) return "—";
  try { return formatDistanceToNow(new Date(d), { addSuffix: true }); } catch { return "—"; }
};

const EMOTION_COLORS: Record<string, string> = {
  joy: "#fbbf24", happy: "#fbbf24", excited: "#f97316",
  nostalgia: "#a78bfa", reflective: "#818cf8", calm: "#60a5fa",
  longing: "#c084fc", sad: "#6b7280", anxious: "#f87171",
  lonely: "#94a3b8", ambition: "#34d399", curious: "#2dd4bf",
};
const emotionColor = (e: string) => EMOTION_COLORS[e.toLowerCase()] ?? "#c084fc";

type Tab = "overview" | "whispers" | "cafe" | "music";

const ICONS: Record<string, React.ReactNode> = {
  moon: <Moon className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
  coffee: <Coffee className="w-5 h-5" />,
  message: <MessageSquare className="w-5 h-5" />,
  flame: <Flame className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
};
const getAchievementIcon = (iconName: string) => ICONS[iconName] || <Star className="w-5 h-5" />;

// ─── Main component ───────────────────────────────────────────────────────────
export default function Profile() {
  const [, navigate] = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");

  // Core content queries
  const { data: _whispers } = useQuery<NightThought[] | null>({
    queryKey: [`/api/v1/thoughts?authorId=${user?.id}&thoughtType=whisper`],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
  const { data: _cafePosts } = useQuery<NightThought[] | null>({
    queryKey: [`/api/v1/thoughts?authorId=${user?.id}&thoughtType=discussion`],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
  const { data: _savedStations } = useQuery<string[] | null>({
    queryKey: ["/api/v1/users/me/favorites"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Analysis / Stats queries
  const { data: statsRes } = useQuery<{ success: boolean; data: any }>({
    queryKey: ["/api/v1/profile/stats"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: achievementsRes } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ["/api/v1/profile/achievements"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const whispers = _whispers ?? [];
  const cafePosts = _cafePosts ?? [];
  const savedStations = _savedStations ?? [];
  
  const stats = statsRes?.data;
  const achievements = achievementsRes?.data || [];

  // ── Derived data ────────────────────────────────────────────────────────────
  const accountAgeDays = useMemo(() =>
    user?.createdAt ? differenceInDays(new Date(), new Date(user.createdAt)) : 0,
  [user?.createdAt]);

  const moodData = useMemo(() => {
    const counts: Record<string, number> = {};
    whispers.forEach(w => {
      if (w.mood) counts[w.mood] = (counts[w.mood] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [whispers]);

  const dominantMood = moodData[0]?.emotion ?? null;
  const maxMoodCount = moodData[0]?.count ?? 1;

  // Recent activity feed (overview tab)
  const recentActivity = useMemo(() => {
    const items: { type: "whisper" | "cafe"; date: Date | null; label: string; sub: string }[] = [
      ...whispers.slice(0, 5).map(w => ({
        type: "whisper" as const,
        date: w.createdAt ? new Date(w.createdAt) : null,
        label: w.content.length > 80 ? w.content.slice(0, 80) + "…" : w.content,
        sub: w.mood ? `Emotion: ${w.mood}` : `${w.hearts ?? 0} hearts`,
      })),
      ...cafePosts.slice(0, 5).map(p => ({
        type: "cafe" as const,
        date: p.createdAt ? new Date(p.createdAt) : null,
        label: p.topic || "Discussion",
        sub: p.mood ?? "Discussion",
      })),
    ]
      .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
      .slice(0, 6);
    return items;
  }, [whispers, cafePosts]);

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#05050a]">
        <div className="pf-spinner" />
      </div>
    );
  }
  if (!user) return <Redirect to="/auth" />;

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Analysis", icon: <BarChart3 size={14} /> },
    { id: "whispers", label: `Whispers${whispers.length ? ` (${whispers.length})` : ""}`, icon: <MessageSquare size={14} /> },
    { id: "cafe",     label: `Café${cafePosts.length ? ` (${cafePosts.length})` : ""}`, icon: <Coffee size={14} /> },
    { id: "music",    label: `Music${savedStations.length ? ` (${savedStations.length})` : ""}`, icon: <Music size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-[#030308] text-slate-200 font-sans pf-container">
      <style>{CSS}</style>

      {/* Back */}
      <button className="pf-back group" onClick={() => navigate("/")}>
        <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        <span>Back to Home</span>
      </button>

      <div className="max-w-[800px] mx-auto pt-24 pb-20 px-4 sm:px-6 flex flex-col gap-8">
        
        {/* ── Hero Profile Card ────────────────────────────────────────────────────────── */}
        <div className="pf-hero-card">
          <div className="pf-hero-bg-glow" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Avatar */}
            <div className="pf-avatar-container">
              <div className="pf-avatar-ring"></div>
              <div className="pf-avatar-ring-2"></div>
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} className="pf-avatar-img" alt="avatar" />
              ) : (
                <div className="pf-avatar-init">{initial({ ...user, username: user.username || "" })}</div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4 w-full">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-1 drop-shadow-md">
                  {user.displayName || user.username}
                </h1>
                <span className="text-sm font-medium text-purple-300/80 tracking-wide">
                  @{user.username}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="pf-meta-badge">
                  <Clock size={12} className="text-indigo-400" />
                  Joined {fmtDate(user.createdAt)}
                </span>
                {user.lastActiveTime && (
                  <span className="pf-meta-badge">
                    <Activity size={12} className="text-emerald-400" />
                    Active {fmtRelative(user.lastActiveTime)}
                  </span>
                )}
                {stats && (
                  <span className="pf-meta-badge bg-amber-500/10 border-amber-500/20 text-amber-200">
                    <Trophy size={12} className="text-amber-400" />
                    Lvl {stats.nightOwlLevel} Night Owl
                  </span>
                )}
              </div>

              {/* Dynamic Stats Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 w-full mt-2">
                {[
                  { icon: <MessageSquare size={16} />, value: stats?.postsShared ?? whispers.length, label: "Posts", color: "#c084fc" },
                  { icon: <Coffee size={16} />, value: stats?.conversationsJoined ?? cafePosts.length, label: "Joined", color: "#fbbf24" },
                  { icon: <Heart size={16} />, value: stats?.totalHearts ?? 0, label: "Hearts", color: "#f472b6" },
                  { icon: <Flame size={16} />, value: stats?.streakDays ?? user.currentStreak ?? 0, label: "Streak", color: "#f97316" },
                  { icon: <Zap size={16} />, value: stats?.experiencePoints ?? 0, label: "XP", color: "#34d399" },
                ].map((s, i) => (
                  <div key={i} className="pf-stat-box" style={{ "--stat-color": s.color } as React.CSSProperties}>
                    <div className="pf-stat-icon" style={{ color: s.color }}>{s.icon}</div>
                    <div className="pf-stat-val">{s.value}</div>
                    <div className="pf-stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Navigation ────────────────────────────────────────────────────────── */}
        <div className="pf-tabs-container">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`pf-tab-btn ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Content Sections ────────────────────────────────────────────────────── */}
        <div className="relative">
          {/* ── Overview / Analytics ── */}
          {tab === "overview" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              
              {/* Analytics Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Mood Analytics */}
                <div className="pf-card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                      <Activity size={16} className="text-purple-400" />
                      Emotional Fingerprint
                    </h3>
                    {dominantMood && (
                      <span className="text-xs px-3 py-1 rounded-full font-semibold border" style={{ 
                        color: emotionColor(dominantMood), 
                        backgroundColor: `${emotionColor(dominantMood)}15`,
                        borderColor: `${emotionColor(dominantMood)}30` 
                      }}>
                        Dominant: {dominantMood}
                      </span>
                    )}
                  </div>
                  
                  {moodData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-sm">
                      <BarChart3 size={32} className="mb-3 opacity-20" />
                      <p>No emotional data available yet.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {moodData.map((m, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                          <span className="text-xs font-medium w-16 text-slate-400 capitalize group-hover:text-slate-200 transition-colors">{m.emotion}</span>
                          <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${(m.count / maxMoodCount) * 100}%`,
                                backgroundColor: emotionColor(m.emotion),
                                boxShadow: `0 0 10px ${emotionColor(m.emotion)}80`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold w-6 text-right text-slate-400">{m.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Achievements Showcase */}
                <div className="pf-card flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                      <Trophy size={16} className="text-amber-400" />
                      Trophies & Milestones
                    </h3>
                    <span className="text-xs font-medium text-slate-500">{achievements.length} unlocked</span>
                  </div>
                  
                  {achievements.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-500 text-sm">
                      <Star size={32} className="mb-3 opacity-20" />
                      <p>Your journey is just beginning.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[240px] pr-2 custom-scrollbar">
                      {achievements.map((a, i) => {
                        const clr = a.color === 'purple' ? '#a855f7' : a.color === 'amber' ? '#fbbf24' : a.color === 'blue' ? '#60a5fa' : '#34d399';
                        return (
                          <div key={i} className="pf-achievement-item group">
                            <div className="pf-achievement-icon" style={{ color: clr, backgroundColor: `${clr}15`, borderColor: `${clr}30` }}>
                              {getAchievementIcon(a.icon)}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{a.title}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{a.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="pf-card">
                <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2 mb-6">
                  <Clock size={16} className="text-blue-400" />
                  Recent Footprints
                </h3>
                {recentActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm">
                    <Zap size={32} className="mb-3 opacity-20" />
                    <p>The night is still. No recent activity.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0 relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-5 top-2 bottom-4 w-px bg-white/10 z-0"></div>
                    
                    {recentActivity.map((item, i) => (
                      <div key={i} className="flex gap-4 p-3 relative z-10 hover:bg-white/[0.03] rounded-xl transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-[#0d0d16] border border-white/10 flex flex-shrink-0 items-center justify-center group-hover:border-white/20 transition-colors shadow-lg">
                          {item.type === "whisper"
                            ? <MessageSquare size={16} className="text-purple-400" />
                            : <Coffee size={16} className="text-amber-400" />}
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="text-sm text-slate-200 font-medium leading-relaxed">{item.label}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-slate-500">{item.sub}</span>
                            <span className="text-[10px] text-slate-600">• {fmtRelative(item.date)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Whispers ── */}
          {tab === "whispers" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              {whispers.length === 0 ? (
                <div className="pf-empty-state">
                  <MessageSquare size={48} className="opacity-20 mb-4" />
                  <p className="text-lg font-medium text-slate-300">No whispers yet</p>
                  <p className="text-sm text-slate-500 mt-2 mb-6">Speak into the void and see your whispers here.</p>
                  <button className="pf-btn-primary" onClick={() => navigate("/whispers")}>Go whisper something</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {whispers.map(w => (
                    <div key={w.id} className="pf-content-card">
                      <p className="text-slate-200 italic mb-6 leading-relaxed">"{w.content}"</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        {w.mood ? (
                          <span className="text-xs font-bold capitalize px-3 py-1 rounded-full border" style={{
                            color: emotionColor(w.mood),
                            backgroundColor: `${emotionColor(w.mood)}10`,
                            borderColor: `${emotionColor(w.mood)}20`
                          }}>
                            {w.mood}
                          </span>
                        ) : <div />}
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5 font-medium"><Heart size={14} className="text-pink-500" /> {w.hearts ?? 0}</span>
                          <span>{fmtRelative(w.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Café ── */}
          {tab === "cafe" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              {cafePosts.length === 0 ? (
                <div className="pf-empty-state">
                  <Coffee size={48} className="opacity-20 mb-4" />
                  <p className="text-lg font-medium text-slate-300">No café posts yet</p>
                  <p className="text-sm text-slate-500 mt-2 mb-6">Join the midnight discussions and connect with others.</p>
                  <button className="pf-btn-primary" onClick={() => navigate("/midnight-cafe")}>Visit the Café</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {cafePosts.map(p => (
                    <div key={p.id} className="pf-content-card">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-base font-bold text-amber-200">{p.topic}</h4>
                        {p.mood && <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">{p.mood}</span>}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed mb-6">{p.content}</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {p.replies ?? 0} {p.replies === 1 ? "reply" : "replies"}</span>
                        <span>{fmtRelative(p.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Music ── */}
          {tab === "music" && (
            <div className="flex flex-col gap-4 animate-fade-in">
              {savedStations.length === 0 ? (
                <div className="pf-empty-state">
                  <Music size={48} className="opacity-20 mb-4" />
                  <p className="text-lg font-medium text-slate-300">No saved stations</p>
                  <p className="text-sm text-slate-500 mt-2 mb-6">Discover the perfect soundtrack for your night.</p>
                  <button className="pf-btn-primary" onClick={() => navigate("/music-mood")}>Explore Music</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {savedStations.map(id => (
                    <div key={id} className="pf-station-card group">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                        <Music size={18} className="text-blue-400" />
                      </div>
                      <span className="text-sm font-bold text-blue-100 capitalize">{id.replace(/-/g, " ")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
.pf-container {
  background-image: 
    radial-gradient(circle at 15% 50%, rgba(124, 58, 237, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 85% 30%, rgba(59, 130, 246, 0.03) 0%, transparent 50%);
  background-attachment: fixed;
}

.pf-spinner {
  width: 40px; height: 40px; border-radius: 50%;
  border: 3px solid rgba(167,139,250,0.1);
  border-top-color: #a855f7;
  animation: pf-spin 0.8s linear infinite;
}
@keyframes pf-spin { to { transform: rotate(360deg); } }

.pf-back {
  position: fixed; top: 24px; left: 24px; z-index: 50;
  display: flex; align-items: center; gap: 6px;
  background: rgba(20, 20, 30, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 100px; padding: 8px 16px;
  color: #94a3b8; font-size: 13px; font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}
.pf-back:hover { 
  background: rgba(255,255,255,0.1); 
  color: #fff; 
  border-color: rgba(255,255,255,0.15);
  box-shadow: 0 4px 25px rgba(0,0,0,0.4);
}

.pf-hero-card {
  position: relative;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.6), rgba(20, 20, 30, 0.8));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 32px; 
  padding: 40px; 
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
}
.pf-hero-bg-glow {
  position: absolute; top: -50%; left: -20%;
  width: 140%; height: 140%;
  background: radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.15), transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.pf-avatar-container {
  position: relative;
  width: 120px; height: 120px;
  flex-shrink: 0;
}
.pf-avatar-ring {
  position: absolute; inset: -4px; border-radius: 50%;
  background: linear-gradient(135deg, #a855f7, #3b82f6, #10b981);
  animation: pf-spin-slow 10s linear infinite;
  z-index: 1;
}
.pf-avatar-ring-2 {
  position: absolute; inset: 0px; border-radius: 50%;
  background: #000;
  z-index: 2;
}
.pf-avatar-img, .pf-avatar-init {
  position: relative;
  width: 100%; height: 100%; 
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  z-index: 3;
  border: 4px solid transparent;
  background-clip: padding-box;
}
.pf-avatar-img { object-fit: cover; }
.pf-avatar-init {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  font-size: 42px; font-weight: 900; color: white;
}
@keyframes pf-spin-slow { to { transform: rotate(360deg); } }

.pf-meta-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 100px; padding: 4px 12px;
  color: #cbd5e1;
}

.pf-stat-box {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.03);
  border-radius: 20px; 
  padding: 14px 8px; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
.pf-stat-box::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at top, var(--stat-color), transparent 70%);
  opacity: 0; transition: opacity 0.3s;
}
.pf-stat-box:hover { 
  border-color: rgba(255,255,255,0.1); 
  transform: translateY(-2px);
  background: rgba(255,255,255,0.02);
}
.pf-stat-box:hover::before { opacity: 0.15; }
.pf-stat-icon { margin-bottom: 2px; position: relative; z-index: 2; }
.pf-stat-val { font-size: 20px; font-weight: 800; color: #fff; line-height: 1; position: relative; z-index: 2; }
.pf-stat-lbl { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; position: relative; z-index: 2; }

.pf-tabs-container {
  display: flex; gap: 8px;
  background: rgba(20, 20, 30, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 20px; padding: 6px;
  overflow-x: auto;
  scrollbar-width: none;
}
.pf-tabs-container::-webkit-scrollbar { display: none; }
.pf-tab-btn {
  flex: 1; min-width: max-content;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 12px 20px;
  border-radius: 14px; border: none; background: transparent;
  color: #64748b; font-size: 14px; font-weight: 700;
  transition: all 0.3s; cursor: pointer;
}
.pf-tab-btn:hover { color: #cbd5e1; background: rgba(255,255,255,0.02); }
.pf-tab-btn.active {
  background: #a855f7;
  color: #fff;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
}

.pf-card {
  background: rgba(20, 20, 30, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 24px; padding: 28px;
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
}

.pf-achievement-item {
  display: flex; align-items: center; gap: 14px;
  padding: 12px; border-radius: 16px;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.pf-achievement-item:hover {
  background: rgba(255,255,255,0.03);
  border-color: rgba(255,255,255,0.05);
}
.pf-achievement-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid;
  flex-shrink: 0;
}

.pf-content-card {
  display: flex; flex-direction: column;
  background: rgba(20, 20, 30, 0.4);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 20px; padding: 24px;
  transition: all 0.3s;
}
.pf-content-card:hover {
  background: rgba(30, 30, 45, 0.6);
  border-color: rgba(255,255,255,0.1);
  transform: translateY(-2px);
}

.pf-station-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
  background: rgba(20, 20, 30, 0.4);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 20px; padding: 24px 16px;
  transition: all 0.3s; cursor: pointer;
}
.pf-station-card:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
  transform: translateY(-4px);
}

.pf-empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 60px 20px;
  background: rgba(20, 20, 30, 0.3);
  border: 1px dashed rgba(255,255,255,0.1);
  border-radius: 24px;
}
.pf-btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  color: white; font-weight: 700; font-size: 14px;
  padding: 12px 24px; border-radius: 100px;
  border: none; cursor: pointer;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
  transition: all 0.3s;
}
.pf-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
`;