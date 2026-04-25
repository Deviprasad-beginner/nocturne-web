import React, { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Redirect, useLocation } from "wouter";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import {
  ChevronLeft, Flame, Shield, Music, Moon,
  MessageSquare, Heart, Coffee, Star, Zap, Clock, Hash
} from "lucide-react";
import type { Whisper, MidnightCafe } from "@shared/schema";

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

// ─── Main component ───────────────────────────────────────────────────────────
export default function Profile() {
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");

  const { data: whispers = [] } = useQuery<Whisper[]>({
    queryKey: ["/api/v1/users/me/whispers"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
  const { data: cafePosts = [] } = useQuery<MidnightCafe[]>({
    queryKey: ["/api/v1/users/me/cafe"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
  const { data: savedStations = [] } = useQuery<string[]>({
    queryKey: ["/api/v1/users/me/favorites"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // ── Derived data ────────────────────────────────────────────────────────────
  const accountAgeDays = useMemo(() =>
    user?.createdAt ? differenceInDays(new Date(), new Date(user.createdAt)) : 0,
    [user?.createdAt]);

  const moodData = useMemo(() => {
    const counts: Record<string, number> = {};
    whispers.forEach(w => {
      if (w.detectedEmotion) counts[w.detectedEmotion] = (counts[w.detectedEmotion] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [whispers]);

  const dominantMood = moodData[0]?.emotion ?? null;
  const maxMoodCount = moodData[0]?.count ?? 1;

  const achievements = useMemo(() => {
    const list: { icon: string; title: string; desc: string; color: string }[] = [];
    if ((user?.nightStreak ?? 0) > 0 || (user?.currentStreak ?? 0) > 0)
      list.push({ icon: "🦉", title: "Night Owl", desc: "Active after midnight", color: "#a78bfa" });
    if (whispers.length > 0)
      list.push({ icon: "💭", title: "Whisperer", desc: `${whispers.length} whisper${whispers.length > 1 ? "s" : ""} shared`, color: "#818cf8" });
    if ((user?.currentStreak ?? 0) >= 3)
      list.push({ icon: "🔥", title: "Streak Keeper", desc: `${user?.currentStreak}-day streak`, color: "#f97316" });
    if ((user?.trustScore ?? 0) >= 80)
      list.push({ icon: "🛡️", title: "Trusted Voice", desc: `Trust score ${user?.trustScore}`, color: "#34d399" });
    if (cafePosts.length > 0)
      list.push({ icon: "☕", title: "Conversationalist", desc: `${cafePosts.length} post${cafePosts.length > 1 ? "s" : ""} in the café`, color: "#fbbf24" });
    if (savedStations.length > 0)
      list.push({ icon: "🎵", title: "Music Soul", desc: `${savedStations.length} station${savedStations.length > 1 ? "s" : ""} saved`, color: "#60a5fa" });
    if (accountAgeDays >= 30)
      list.push({ icon: "🌙", title: "Night Veteran", desc: `${accountAgeDays} nights on Nocturne`, color: "#c084fc" });
    return list;
  }, [user, whispers, cafePosts, savedStations, accountAgeDays]);

  // Recent activity feed (overview tab)
  const recentActivity = useMemo(() => {
    const items: { type: "whisper" | "cafe"; date: Date | null; label: string; sub: string }[] = [
      ...whispers.slice(0, 5).map(w => ({
        type: "whisper" as const,
        date: w.createdAt ? new Date(w.createdAt) : null,
        label: w.content.length > 80 ? w.content.slice(0, 80) + "…" : w.content,
        sub: w.detectedEmotion ? `Emotion: ${w.detectedEmotion}` : `${w.hearts ?? 0} hearts`,
      })),
      ...cafePosts.slice(0, 5).map(p => ({
        type: "cafe" as const,
        date: p.createdAt ? new Date(p.createdAt) : null,
        label: p.topic,
        sub: p.category ?? "Discussion",
      })),
    ]
      .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
      .slice(0, 6);
    return items;
  }, [whispers, cafePosts]);

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#05050a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="pf-spinner" />
      </div>
    );
  }
  if (!user) return <Redirect to="/auth" />;

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "whispers", label: `Whispers${whispers.length ? ` (${whispers.length})` : ""}` },
    { id: "cafe",     label: `Café${cafePosts.length ? ` (${cafePosts.length})` : ""}` },
    { id: "music",    label: `Music${savedStations.length ? ` (${savedStations.length})` : ""}` },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#05050a", color: "#e2e8f0", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{CSS}</style>

      {/* Back */}
      <button className="pf-back" onClick={() => navigate("/")}>
        <ChevronLeft style={{ width: 15, height: 15 }} /> Back
      </button>

      <div className="pf-shell">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div className="pf-hero">
          {/* Ambient glow */}
          <div className="pf-hero-glow" />

          <div className="pf-hero-content">
            {/* Avatar */}
            <div className="pf-avatar-wrap">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} className="pf-avatar-img" alt="avatar" />
              ) : (
                <div className="pf-avatar-init">{initial(user)}</div>
              )}
              <div className="pf-avatar-ring" />
            </div>

            {/* Info */}
            <div className="pf-hero-info">
              <div className="pf-name-row">
                <h1 className="pf-name">{user.displayName || user.username}</h1>
                <span className="pf-handle">@{user.username}</span>
              </div>

              {/* Meta row */}
              <div className="pf-meta-row">
                <span className="pf-meta-pill">
                  <Clock style={{ width: 12, height: 12 }} />
                  Joined {fmtDate(user.createdAt)}
                </span>
                {user.lastActiveTime && (
                  <span className="pf-meta-pill">
                    <Moon style={{ width: 12, height: 12 }} />
                    Active {fmtRelative(user.lastActiveTime)}
                  </span>
                )}
              </div>

              {/* Stats row */}
              <div className="pf-stats-row">
                {[
                  { icon: <MessageSquare style={{ width: 15, height: 15 }} />, value: whispers.length,       label: "Whispers",  color: "#c084fc" },
                  { icon: <Coffee       style={{ width: 15, height: 15 }} />, value: cafePosts.length,      label: "Café posts", color: "#fbbf24" },
                  { icon: <Music        style={{ width: 15, height: 15 }} />, value: savedStations.length,  label: "Stations",  color: "#60a5fa" },
                  { icon: <Flame        style={{ width: 15, height: 15 }} />, value: user.currentStreak ?? 0, label: "Streak",  color: "#f97316" },
                  { icon: <Shield       style={{ width: 15, height: 15 }} />, value: user.trustScore ?? 100, label: "Trust",   color: "#34d399" },
                ].map((s, i) => (
                  <div key={i} className="pf-stat" style={{ "--sc": s.color } as React.CSSProperties}>
                    <span className="pf-stat-icon" style={{ color: s.color }}>{s.icon}</span>
                    <span className="pf-stat-val">{s.value}</span>
                    <span className="pf-stat-lbl">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="pf-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`pf-tab ${tab === t.id ? "is-active" : ""}`}
              onClick={() => setTab(t.id)}
            >{t.label}</button>
          ))}
        </div>

        {/* ── Overview ────────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="pf-section">

            {/* Achievements */}
            <div className="pf-card">
              <p className="pf-card-title">Achievements</p>
              {achievements.length === 0 ? (
                <div className="pf-empty">
                  <Star style={{ width: 28, height: 28, opacity: 0.25 }} />
                  <span>Keep exploring Nocturne — your achievements will appear here.</span>
                </div>
              ) : (
                <div className="pf-achievements">
                  {achievements.map((a, i) => (
                    <div key={i} className="pf-badge" style={{ "--bc": a.color } as React.CSSProperties}>
                      <span className="pf-badge-icon">{a.icon}</span>
                      <span className="pf-badge-title">{a.title}</span>
                      <span className="pf-badge-desc">{a.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mood analytics — only shown if real emotion data exists */}
            {moodData.length > 0 && (
              <div className="pf-card">
                <div className="pf-card-header-row">
                  <p className="pf-card-title">Emotional Fingerprint</p>
                  {dominantMood && (
                    <span className="pf-mood-dominant" style={{ color: emotionColor(dominantMood) }}>
                      {dominantMood}
                    </span>
                  )}
                </div>
                <div className="pf-mood-bars">
                  {moodData.map((m, i) => (
                    <div key={i} className="pf-mood-row">
                      <span className="pf-mood-label">{m.emotion}</span>
                      <div className="pf-mood-track">
                        <div
                          className="pf-mood-fill"
                          style={{
                            width: `${(m.count / maxMoodCount) * 100}%`,
                            background: emotionColor(m.emotion),
                            boxShadow: `0 0 8px ${emotionColor(m.emotion)}60`,
                          }}
                        />
                      </div>
                      <span className="pf-mood-count">{m.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent activity */}
            <div className="pf-card">
              <p className="pf-card-title">Recent Activity</p>
              {recentActivity.length === 0 ? (
                <div className="pf-empty">
                  <Zap style={{ width: 28, height: 28, opacity: 0.25 }} />
                  <span>Nothing yet. Start writing, whispering, or listening.</span>
                </div>
              ) : (
                <div className="pf-activity">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="pf-activity-item">
                      <div className="pf-activity-icon-wrap">
                        {item.type === "whisper"
                          ? <MessageSquare style={{ width: 14, height: 14, color: "#c084fc" }} />
                          : <Coffee style={{ width: 14, height: 14, color: "#fbbf24" }} />}
                      </div>
                      <div className="pf-activity-body">
                        <span className="pf-activity-label">{item.label}</span>
                        <span className="pf-activity-sub">{item.sub} · {fmtRelative(item.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Whispers ────────────────────────────────────────────────────── */}
        {tab === "whispers" && (
          <div className="pf-section">
            {whispers.length === 0 ? (
              <div className="pf-card pf-empty-lg">
                <MessageSquare style={{ width: 36, height: 36, opacity: 0.2 }} />
                <p>You haven't whispered anything into the night yet.</p>
                <button className="pf-cta-link" onClick={() => navigate("/whispers")}>Go whisper something →</button>
              </div>
            ) : (
              whispers.map(w => (
                <div key={w.id} className="pf-card pf-whisper-card">
                  <p className="pf-whisper-text">"{w.content}"</p>
                  <div className="pf-whisper-meta">
                    <div className="pf-whisper-meta-left">
                      {w.detectedEmotion && (
                        <span className="pf-emotion-tag" style={{
                          background: `${emotionColor(w.detectedEmotion)}18`,
                          color: emotionColor(w.detectedEmotion),
                          borderColor: `${emotionColor(w.detectedEmotion)}35`,
                        }}>
                          {w.detectedEmotion}
                        </span>
                      )}
                    </div>
                    <div className="pf-whisper-meta-right">
                      <span className="pf-whisper-hearts">
                        <Heart style={{ width: 12, height: 12, color: "#f472b6" }} />
                        {w.hearts ?? 0}
                      </span>
                      <span className="pf-whisper-date">{fmtRelative(w.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Café ────────────────────────────────────────────────────────── */}
        {tab === "cafe" && (
          <div className="pf-section">
            {cafePosts.length === 0 ? (
              <div className="pf-card pf-empty-lg">
                <Coffee style={{ width: 36, height: 36, opacity: 0.2 }} />
                <p>The café is quiet on your end. Start a conversation.</p>
                <button className="pf-cta-link" onClick={() => navigate("/midnight-cafe")}>Enter the Café →</button>
              </div>
            ) : (
              cafePosts.map(p => (
                <div key={p.id} className="pf-card">
                  <div className="pf-cafe-header">
                    <span className="pf-cafe-topic">{p.topic}</span>
                    {p.category && (
                      <span className="pf-cafe-cat">{p.category}</span>
                    )}
                  </div>
                  <p className="pf-cafe-content">{p.content}</p>
                  <div className="pf-cafe-meta">
                    <span className="pf-cafe-replies">
                      <MessageSquare style={{ width: 12, height: 12 }} />
                      {p.replies ?? 0} {p.replies === 1 ? "reply" : "replies"}
                    </span>
                    <span className="pf-whisper-date">{fmtRelative(p.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Music ───────────────────────────────────────────────────────── */}
        {tab === "music" && (
          <div className="pf-section">
            {savedStations.length === 0 ? (
              <div className="pf-card pf-empty-lg">
                <Music style={{ width: 36, height: 36, opacity: 0.2 }} />
                <p>No saved stations. Discover music for your mood.</p>
                <button className="pf-cta-link" onClick={() => navigate("/music-mood")}>Explore Music →</button>
              </div>
            ) : (
              <div className="pf-stations">
                {savedStations.map(id => (
                  <div key={id} className="pf-station">
                    <Music style={{ width: 16, height: 16, color: "#60a5fa" }} />
                    <span>{id.replace(/-/g, " ")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.pf-spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 3px solid rgba(167,139,250,0.15);
  border-top-color: #a855f7;
  animation: pf-spin 0.8s linear infinite;
}
@keyframes pf-spin { to { transform: rotate(360deg); } }

.pf-back {
  position: fixed; top: 16px; left: 20px; z-index: 50;
  display: flex; align-items: center; gap: 4px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 100px; padding: 7px 14px 7px 10px;
  color: #9ca3af; font-size: 13px; cursor: pointer; font-family: inherit;
  transition: all 0.2s;
}
.pf-back:hover { background: rgba(255,255,255,0.09); color: #f1f5f9; }

.pf-shell {
  max-width: 720px; margin: 0 auto;
  padding: 70px 16px 60px;
  display: flex; flex-direction: column; gap: 16px;
}

/* ── Hero ── */
.pf-hero {
  position: relative;
  background: linear-gradient(145deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 24px; padding: 28px; overflow: hidden;
}
.pf-hero-glow {
  position: absolute; top: -60px; right: -60px;
  width: 260px; height: 260px; border-radius: 50%;
  background: radial-gradient(circle, rgba(168,85,247,0.18), transparent 70%);
  pointer-events: none;
}
.pf-hero-content { display: flex; gap: 22px; align-items: flex-start; flex-wrap: wrap; }

/* Avatar */
.pf-avatar-wrap { position: relative; flex-shrink: 0; }
.pf-avatar-img, .pf-avatar-init {
  width: 88px; height: 88px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.pf-avatar-img { object-fit: cover; }
.pf-avatar-init {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  font-size: 34px; font-weight: 800; color: white;
}
.pf-avatar-ring {
  position: absolute; inset: -3px; border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #a855f7, #60a5fa);
  z-index: -1;
}

/* Info */
.pf-hero-info { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 12px; }
.pf-name-row { display: flex; flex-direction: column; gap: 2px; }
.pf-name { font-size: 24px; font-weight: 800; letter-spacing: -0.03em; color: #f1f5f9; }
.pf-handle { font-size: 14px; color: rgba(148,163,184,0.6); }

.pf-meta-row { display: flex; flex-wrap: wrap; gap: 8px; }
.pf-meta-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11.5px; color: rgba(148,163,184,0.65);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 100px; padding: 3px 10px;
}

.pf-stats-row { display: flex; flex-wrap: wrap; gap: 10px; }
.pf-stat {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px; padding: 10px 14px; min-width: 64px;
  transition: border-color 0.2s;
}
.pf-stat:hover { border-color: rgba(var(--sc, 192,132,252), 0.3); }
.pf-stat-icon { display: flex; align-items: center; }
.pf-stat-val { font-size: 16px; font-weight: 700; color: #f1f5f9; }
.pf-stat-lbl { font-size: 10px; color: rgba(148,163,184,0.5); }

/* ── Tabs ── */
.pf-tabs {
  display: flex; gap: 4px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px; padding: 4px;
}
.pf-tab {
  flex: 1; padding: 8px 6px;
  border-radius: 10px; border: none; background: transparent;
  color: rgba(148,163,184,0.6); font-size: 13px; font-weight: 500;
  font-family: inherit; cursor: pointer;
  transition: all 0.2s; white-space: nowrap;
}
.pf-tab:hover { color: #e2e8f0; }
.pf-tab.is-active {
  background: rgba(168,85,247,0.15);
  color: #c084fc;
  border: 1px solid rgba(168,85,247,0.25);
}

/* ── Content sections ── */
.pf-section { display: flex; flex-direction: column; gap: 12px; }
.pf-card {
  background: linear-gradient(155deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.065);
  border-radius: 18px; padding: 20px;
  display: flex; flex-direction: column; gap: 14px;
}
.pf-card-title { font-size: 13px; font-weight: 600; color: rgba(148,163,184,0.6); text-transform: uppercase; letter-spacing: 0.06em; }
.pf-card-header-row { display: flex; align-items: center; justify-content: space-between; }
.pf-mood-dominant { font-size: 14px; font-weight: 600; text-transform: capitalize; }

/* Achievements */
.pf-achievements { display: flex; flex-wrap: wrap; gap: 10px; }
.pf-badge {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px; padding: 8px 12px;
  transition: border-color 0.2s, background 0.2s;
}
.pf-badge:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(var(--bc), 0.3);
}
.pf-badge-icon { font-size: 18px; }
.pf-badge-title { font-size: 13px; font-weight: 600; color: #f1f5f9; }
.pf-badge-desc { font-size: 11px; color: rgba(148,163,184,0.5); }

/* Mood bars */
.pf-mood-bars { display: flex; flex-direction: column; gap: 10px; }
.pf-mood-row { display: flex; align-items: center; gap: 10px; }
.pf-mood-label { font-size: 12px; color: rgba(148,163,184,0.6); width: 80px; text-transform: capitalize; flex-shrink: 0; }
.pf-mood-track { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 100px; overflow: hidden; }
.pf-mood-fill { height: 100%; border-radius: 100px; transition: width 0.6s ease; }
.pf-mood-count { font-size: 12px; color: rgba(148,163,184,0.45); width: 20px; text-align: right; flex-shrink: 0; }

/* Activity feed */
.pf-activity { display: flex; flex-direction: column; gap: 1px; }
.pf-activity-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.pf-activity-item:last-child { border-bottom: none; }
.pf-activity-icon-wrap {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  background: rgba(255,255,255,0.05);
  display: flex; align-items: center; justify-content: center;
}
.pf-activity-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.pf-activity-label { font-size: 13.5px; color: #e2e8f0; line-height: 1.4; }
.pf-activity-sub { font-size: 11.5px; color: rgba(148,163,184,0.5); }

/* Empty states */
.pf-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 16px 0; color: rgba(148,163,184,0.45); font-size: 13px; text-align: center;
}
.pf-empty-lg {
  align-items: center; padding: 36px 20px; gap: 10px; text-align: center;
  color: rgba(148,163,184,0.45);
}
.pf-cta-link {
  background: none; border: none; color: #a78bfa; font-size: 13px;
  cursor: pointer; font-family: inherit; padding: 0; margin-top: 4px;
}
.pf-cta-link:hover { color: #c084fc; text-decoration: underline; }

/* Whispers */
.pf-whisper-card { gap: 10px; }
.pf-whisper-text {
  font-size: 14px; color: #cbd5e1; line-height: 1.65;
  font-style: italic;
}
.pf-whisper-meta { display: flex; align-items: center; justify-content: space-between; }
.pf-whisper-meta-left { display: flex; gap: 8px; }
.pf-whisper-meta-right { display: flex; align-items: center; gap: 12px; }
.pf-emotion-tag {
  font-size: 11px; font-weight: 500; text-transform: capitalize;
  border: 1px solid; border-radius: 100px; padding: 2px 8px;
}
.pf-whisper-hearts { display: flex; align-items: center; gap: 4px; font-size: 12px; color: rgba(148,163,184,0.5); }
.pf-whisper-date { font-size: 11.5px; color: rgba(148,163,184,0.4); }

/* Café */
.pf-cafe-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.pf-cafe-topic { font-size: 14px; font-weight: 600; color: #fde68a; }
.pf-cafe-cat {
  font-size: 11px; color: #fbbf24;
  background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.2);
  border-radius: 100px; padding: 2px 8px; white-space: nowrap;
}
.pf-cafe-content { font-size: 13.5px; color: #cbd5e1; line-height: 1.6; }
.pf-cafe-meta { display: flex; align-items: center; justify-content: space-between; }
.pf-cafe-replies { display: flex; align-items: center; gap: 5px; font-size: 12px; color: rgba(148,163,184,0.5); }

/* Music */
.pf-stations { display: flex; flex-wrap: wrap; gap: 10px; }
.pf-station {
  display: flex; align-items: center; gap: 8px;
  background: rgba(96,165,250,0.08);
  border: 1px solid rgba(96,165,250,0.2);
  border-radius: 12px; padding: 10px 16px;
  font-size: 13px; font-weight: 500; color: #bfdbfe;
  text-transform: capitalize;
  transition: background 0.2s;
}
.pf-station:hover { background: rgba(96,165,250,0.13); }
`;