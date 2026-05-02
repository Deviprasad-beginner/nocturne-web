import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { SEO } from "@/components/SEO";
import {
    Moon, Notebook, Brain, Users,
    Heart, Lightbulb, BookOpen,
    Mic, MessageSquare, Sparkles,
    Bell, Settings, User, LogOut,
    Flame, Zap, Compass, ArrowRight, Music,
} from "lucide-react";
import { NightlyReflectionPopup } from "@/components/nightly-reflection-popup";

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = "sanctuary" | "connect" | "discover";

interface ServiceDef {
    title: string;
    description: string;
    route: string;
    icon: React.ElementType;
    gradient: string;
    accent: string;
    accentRgb: string;
    status: string;
    hot?: boolean;
}

// ─── Tab Config ───────────────────────────────────────────────────────────────
const TABS = [
    {
        id: "sanctuary" as TabId,
        label: "Sanctuary",
        icon: Moon,
        accent: "#818cf8",
        accentRgb: "129,140,248",
        orb1: "rgba(99,102,241,0.2)",
        orb2: "rgba(139,92,246,0.13)",
        line1: "Your private corner",
        line2: "of the night",
    },
    {
        id: "connect" as TabId,
        label: "Connect",
        icon: Heart,
        accent: "#fb7185",
        accentRgb: "251,113,133",
        orb1: "rgba(244,63,94,0.18)",
        orb2: "rgba(251,113,133,0.11)",
        line1: "Find others",
        line2: "wandering the dark",
    },
    {
        id: "discover" as TabId,
        label: "Discover",
        icon: Compass,
        accent: "#fbbf24",
        accentRgb: "251,191,36",
        orb1: "rgba(251,191,36,0.15)",
        orb2: "rgba(245,158,11,0.1)",
        line1: "Go further",
        line2: "than you planned",
    },
];

// ─── Services ─────────────────────────────────────────────────────────────────
const SERVICES: Record<TabId, ServiceDef[]> = {
    sanctuary: [
        {
            title: "Read Card",
            description: "Upload a PDF or paste text, pick your mood, and step into a private reading room shaped around how you feel right now.",
            route: "/read-card",
            icon: BookOpen,
            gradient: "from-emerald-400 to-teal-600",
            accent: "#34d399",
            accentRgb: "52,211,153",
            status: "Quiet",
            hot: true,
        },
        {
            title: "Night Diaries",
            description: "A journal that doesn't judge. Write in private or whisper it publicly — midnight thoughts deserve somewhere to live.",
            route: "/diaries",
            icon: Notebook,
            gradient: "from-amber-400 to-orange-500",
            accent: "#fbbf24",
            accentRgb: "251,191,36",
            status: "Open",
        },
        {
            title: "Nightly Reflection",
            description: "AI-guided prompts that gently surface your patterns, spirals, and silences. A mirror you actually want to look into.",
            route: "/nightly-reflection",
            icon: Sparkles,
            gradient: "from-indigo-400 to-purple-600",
            accent: "#a78bfa",
            accentRgb: "167,139,250",
            status: "Drifting",
        },
        {
            title: "Music & Mood",
            description: "Nocturnal soundscapes tuned to how you feel right now. Lofi, jazz, synthwave, ambient rain — let the night play through you.",
            route: "/music-mood",
            icon: Music,
            gradient: "from-violet-500 to-purple-700",
            accent: "#a78bfa",
            accentRgb: "167,139,250",
            status: "Playing",
        },
    ],
    connect: [
        {
            title: "Whispers",
            description: "Anonymous thoughts dropped in the dark for strangers to find. Sometimes the right person finds exactly what they needed.",
            route: "/whispers",
            icon: MessageSquare,
            gradient: "from-indigo-400 to-violet-600",
            accent: "#818cf8",
            accentRgb: "129,140,248",
            status: "Active",
            hot: true,
        },
        {
            title: "Night Circles",
            description: "Small, intimate groups built for the kind of conversation that only happens after midnight. No audience. Just presence.",
            route: "/night-circles",
            icon: Users,
            gradient: "from-rose-400 to-pink-600",
            accent: "#fb7185",
            accentRgb: "251,113,133",
            status: "Live",
        },
        {
            title: "Starlit Speaker",
            description: "Voice rooms for people who think better when they can hear themselves. Say the thing you've been circling for weeks.",
            route: "/starlit-speaker",
            icon: Mic,
            gradient: "from-violet-500 to-purple-700",
            accent: "#c084fc",
            accentRgb: "192,132,252",
            status: "On Air",
            hot: true,
        },
    ],
    discover: [
        {
            title: "Mind Maze",
            description: "Philosophy traps, impossible questions, and ideas that won't leave you alone once you've read them. Enter at your own risk.",
            route: "/mind-maze",
            icon: Brain,
            gradient: "from-fuchsia-400 to-purple-700",
            accent: "#e879f9",
            accentRgb: "232,121,249",
            status: "Active",
            hot: true,
        },
        {
            title: "3AM Founder",
            description: "Anonymous midnight confessions from founders, dreamers, and builders. The version of the story they don't tell in public.",
            route: "/3am-founder",
            icon: Lightbulb,
            gradient: "from-orange-400 to-red-600",
            accent: "#fb923c",
            accentRgb: "251,146,60",
            status: "Awake",
        },
        {
            title: "Night Thoughts",
            description: "A living stream of the things nobody said out loud today. Scroll until one of them is yours.",
            route: "/night-thoughts",
            icon: Zap,
            gradient: "from-yellow-400 to-amber-600",
            accent: "#fbbf24",
            accentRgb: "251,191,36",
            status: "Flowing",
        },
    ],
};

// ─── Stars Background ─────────────────────────────────────────────────────────
function Stars() {
    const stars = useMemo(() =>
        Array.from({ length: 48 }, (_, i) => ({
            id: i,
            x: ((i * 71 + 17) % 100),
            y: ((i * 47 + 11) % 100),
            size: i % 5 === 0 ? 2 : 1,
            delay: (i * 0.41) % 5,
            duration: 2 + ((i * 0.47) % 3),
        })), []);

    return (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
            {stars.map(s => (
                <div
                    key={s.id}
                    style={{
                        position: "absolute",
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: s.size,
                        height: s.size,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.65)",
                        animation: `starTwinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
                    }}
                />
            ))}
        </div>
    );
}

// ─── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({ svc, idx, onClick }: { svc: ServiceDef; idx: number; onClick: () => void }) {
    const Icon = svc.icon;
    return (
        <button
            className="nc-card"
            onClick={onClick}
            style={{
                "--accent": svc.accent,
                "--rgb": svc.accentRgb,
                animationDelay: `${idx * 80}ms`,
            } as React.CSSProperties}
        >
            {svc.hot && (
                <span className="nc-hot">
                    <Flame className="nc-hot-icon" /> Hot
                </span>
            )}

            <div className="nc-card-header">
                <div className={`nc-icon bg-gradient-to-br ${svc.gradient}`}>
                    <Icon className="nc-icon-svg" />
                    <div className="nc-icon-sheen" />
                </div>
                <span className="nc-badge">
                    <span className="nc-badge-dot" />
                    {svc.status}
                </span>
            </div>

            <div className="nc-card-body">
                <h3 className="nc-card-title">{svc.title}</h3>
                <p className="nc-card-desc">{svc.description}</p>
            </div>

            <div className="nc-card-cta">
                <span className="nc-cta-text">Enter</span>
                <ArrowRight className="nc-cta-arrow" />
            </div>

            <div className="nc-card-glow" />
        </button>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
    const [, setLocation] = useLocation();
    const { user, logoutMutation } = useAuth();
    const [activeTab, setActiveTab] = useState<TabId>("sanctuary");
    const [isAnimating, setIsAnimating] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const tab = TABS.find(t => t.id === activeTab)!;

    function switchTab(id: TabId) {
        if (id === activeTab || isAnimating) return;
        setIsAnimating(true);
        setTimeout(() => { setActiveTab(id); setIsAnimating(false); }, 200);
    }

    useEffect(() => {
        if (!showMenu) return;
        const h = () => setShowMenu(false);
        window.addEventListener("click", h);
        return () => window.removeEventListener("click", h);
    }, [showMenu]);

    const hour = new Date().getHours();
    const greeting =
        hour < 5  ? "Still awake?" :
        hour < 12 ? "Good morning" :
        hour < 18 ? "Good afternoon" :
                    "Good evening";

    return (
        <div
            className="nc-shell"
            style={{ "--tab-accent": tab.accent, "--tab-rgb": tab.accentRgb } as React.CSSProperties}
        >
            <SEO title="Nocturne — Where night owls gather" />
            <style>{STYLES}</style>

            {/* Stars */}
            <Stars />
            
            {/* Popups */}
            <NightlyReflectionPopup />

            {/* Ambient orbs */}
            <div className="nc-orb nc-orb-a" style={{ background: `radial-gradient(circle, ${tab.orb1}, transparent 70%)` }} />
            <div className="nc-orb nc-orb-b" style={{ background: `radial-gradient(circle, ${tab.orb2}, transparent 70%)` }} />

            {/* ── Top bar ───────────────────────────────── */}
            <header className="nc-topbar">
                <div className="nc-topbar-inner">
                    <button className="nc-brand" onClick={() => setLocation("/")}>
                        <div className="nc-moon">
                            <Moon style={{ width: 17, height: 17, color: "white" }} />
                        </div>
                        <span className="nc-brand-name">Nocturne</span>
                    </button>

                    <div className="nc-topbar-right">
                        {user ? (
                            <div style={{ position: "relative" }}>
                                <button
                                    className="nc-avatar-btn"
                                    onClick={e => { e.stopPropagation(); setShowMenu(s => !s); }}
                                >
                                    <div className="nc-avatar">
                                        <User style={{ width: 14, height: 14, color: "white" }} />
                                    </div>
                                    <span className="nc-user-greeting">{greeting}</span>
                                </button>

                                {showMenu && (
                                    <div className="nc-dropdown" onClick={e => e.stopPropagation()}>
                                        {[
                                            { icon: User, label: "Profile",       route: "/profile" },
                                            { icon: Settings, label: "Settings",  route: "/settings" },
                                            { icon: Bell, label: "Notifications", route: "/notifications" },
                                        ].map(({ icon: Icon, label, route }) => (
                                            <button key={route} className="nc-dd-item"
                                                onClick={() => { setLocation(route); setShowMenu(false); }}>
                                                <Icon style={{ width: 14, height: 14 }} /> {label}
                                            </button>
                                        ))}
                                        <div className="nc-dd-sep" />
                                        <button className="nc-dd-item nc-dd-logout"
                                            onClick={() => { logoutMutation.mutate(); setShowMenu(false); }}>
                                            <LogOut style={{ width: 14, height: 14 }} /> Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button className="nc-signin" onClick={() => setLocation("/auth")}>
                                Sign in
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Hero ─────────────────────────────────── */}
            <section className="nc-hero">
                <p className="nc-eyebrow">3 am · quiet · open</p>

                <h1 className="nc-headline" key={activeTab}>
                    <span className="nc-hl-a">{tab.line1}</span>
                    <br />
                    <span className="nc-hl-b">{tab.line2}</span>
                </h1>

                {/* Segment control */}
                <div className="nc-seg" role="tablist">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            role="tab"
                            aria-selected={activeTab === t.id}
                            className={`nc-seg-btn ${activeTab === t.id ? "is-on" : ""}`}
                            style={{ "--t": t.accent, "--tr": t.accentRgb } as React.CSSProperties}
                            onClick={() => switchTab(t.id)}
                        >
                            <t.icon className="nc-seg-icon" />
                            <span>{t.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Cards ────────────────────────────────── */}
            <main className="nc-main">
                <div
                    className={`nc-grid ${isAnimating ? "is-leaving" : "is-entering"}`}
                    key={activeTab}
                >
                    {SERVICES[activeTab].map((svc, i) => (
                        <ServiceCard
                            key={svc.route}
                            svc={svc}
                            idx={i}
                            onClick={() => setLocation(svc.route)}
                        />
                    ))}
                </div>
                <div className="nc-grid-footer" />
            </main>

            {/* ── Mobile bottom nav ─────────────────────── */}
            <nav className="nc-nav" aria-label="Main navigation">
                {TABS.map(t => {
                    const on = activeTab === t.id;
                    return (
                        <button
                            key={t.id}
                            className={`nc-nav-btn ${on ? "is-on" : ""}`}
                            style={{ "--t": t.accent, "--tr": t.accentRgb } as React.CSSProperties}
                            onClick={() => switchTab(t.id)}
                        >
                            <span
                                className="nc-nav-pip"
                                style={on ? {
                                    background: `rgba(${t.accentRgb},0.15)`,
                                    borderColor: `rgba(${t.accentRgb},0.3)`,
                                } : {}}
                            >
                                <t.icon style={{ width: 18, height: 18, color: on ? t.accent : "#374151" }} />
                            </span>
                            <span className="nc-nav-label" style={{ color: on ? t.accent : "#374151" }}>
                                {t.label}
                            </span>
                        </button>
                    );
                })}
                <button className="nc-nav-btn" onClick={() => setLocation(user ? "/profile" : "/auth")}>
                    <span className="nc-nav-pip">
                        <User style={{ width: 18, height: 18, color: "#374151" }} />
                    </span>
                    <span className="nc-nav-label" style={{ color: "#374151" }}>
                        {user ? "Me" : "Sign in"}
                    </span>
                </button>
            </nav>
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Shell ─────────────────────────────────── */
.nc-shell {
  min-height: 100vh; min-height: 100dvh;
  background: #050508;
  color: #e2e8f0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  position: relative;
  overflow-x: hidden;
}

/* ── Stars ─────────────────────────────────── */
@keyframes starTwinkle {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50%       { opacity: 0.85; transform: scale(1.5); }
}

/* ── Orbs ──────────────────────────────────── */
.nc-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(110px);
  pointer-events: none;
  z-index: 0;
  transition: background 0.9s ease;
}
.nc-orb-a { width: 70vw; height: 70vw; top: -25%; left: -18%; animation: orbA 28s ease-in-out infinite alternate; }
.nc-orb-b { width: 55vw; height: 55vw; bottom: -10%; right: -15%; animation: orbB 22s ease-in-out infinite alternate; opacity: 0.75; }
@keyframes orbA { to { transform: translate(6%, 8%) scale(1.1); } }
@keyframes orbB { to { transform: translate(-5%, -7%) scale(1.06); } }

/* ── Top bar ───────────────────────────────── */
.nc-topbar {
  position: sticky; top: 0; z-index: 50;
  background: rgba(5,5,8,0.72);
  backdrop-filter: blur(28px) saturate(1.6);
  -webkit-backdrop-filter: blur(28px) saturate(1.6);
  border-bottom: 1px solid rgba(255,255,255,0.046);
}
.nc-topbar-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 20px;
}
.nc-brand {
  display: flex; align-items: center; gap: 11px;
  background: none; border: none; cursor: pointer;
}
.nc-moon {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(145deg, #5b5fcf 0%, #7c3aed 100%);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 22px rgba(99,102,241,0.5), 0 0 60px rgba(139,92,246,0.18);
  animation: moonPulse 4.5s ease-in-out infinite;
}
@keyframes moonPulse {
  0%,100% { box-shadow: 0 0 22px rgba(99,102,241,0.5), 0 0 60px rgba(139,92,246,0.18); }
  50%      { box-shadow: 0 0 34px rgba(99,102,241,0.7), 0 0 90px rgba(139,92,246,0.28); }
}
.nc-brand-name {
  font-size: 18px; font-weight: 750;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #818cf8, #c4b5fd);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.nc-topbar-right { display: flex; align-items: center; gap: 12px; }

/* Avatar + greeting */
.nc-avatar-btn {
  display: flex; align-items: center; gap: 9px;
  padding: 5px 14px 5px 5px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 100px;
  cursor: pointer; color: #cbd5e1;
  font-size: 13px; font-weight: 500;
  transition: background 0.2s, border-color 0.2s;
}
.nc-avatar-btn:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.12); }
.nc-avatar {
  width: 26px; height: 26px; border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex; align-items: center; justify-content: center;
}
.nc-user-greeting { display: none; }
@media (min-width: 460px) { .nc-user-greeting { display: block; } }

/* Sign-in button */
.nc-signin {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none; border-radius: 100px;
  padding: 9px 22px; color: white;
  font-size: 13px; font-weight: 600; font-family: inherit;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(99,102,241,0.35);
  transition: all 0.2s;
}
.nc-signin:hover { transform: translateY(-1px); box-shadow: 0 6px 26px rgba(99,102,241,0.55); }

/* Dropdown menu */
.nc-dropdown {
  position: absolute; right: 0; top: calc(100% + 10px);
  background: rgba(7,7,12,0.97);
  backdrop-filter: blur(28px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 18px; padding: 8px;
  min-width: 192px;
  box-shadow: 0 28px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.025);
  animation: ddIn 0.2s cubic-bezier(0.16,1,0.3,1);
  z-index: 200;
}
@keyframes ddIn {
  from { opacity:0; transform:translateY(-8px) scale(0.97); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
.nc-dd-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 10px 13px;
  border-radius: 11px; border: none;
  background: transparent; color: #94a3b8;
  font-size: 13.5px; font-family: inherit; cursor: pointer;
  transition: all 0.15s; text-align: left; font-weight: 450;
}
.nc-dd-item:hover { background: rgba(255,255,255,0.05); color: #f1f5f9; }
.nc-dd-sep { height: 1px; background: rgba(255,255,255,0.06); margin: 6px 4px; }
.nc-dd-logout { color: #f87171; }
.nc-dd-logout:hover { background: rgba(248,113,113,0.09); color: #fca5a5; }

/* ── Hero ──────────────────────────────────── */
.nc-hero {
  position: relative; z-index: 1;
  max-width: 1200px; margin: 0 auto;
  padding: 52px 20px 36px;
}
.nc-eyebrow {
  font-size: 10.5px; font-weight: 500;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: rgba(148,163,184,0.45);
  margin-bottom: 16px;
}
.nc-headline {
  font-size: clamp(30px, 6.5vw, 58px);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.07;
  margin-bottom: 36px;
}
.nc-hl-a {
  display: block;
  color: rgba(241,245,249,0.92);
  animation: hlSlide 0.45s cubic-bezier(0.16,1,0.3,1) both;
}
.nc-hl-b {
  display: block;
  background: linear-gradient(130deg, var(--tab-accent, #818cf8) 0%, rgba(255,255,255,0.45) 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: hlSlide 0.45s 0.06s cubic-bezier(0.16,1,0.3,1) both;
  transition: background 0.5s ease;
}
@keyframes hlSlide {
  from { opacity:0; transform:translateY(14px); }
  to   { opacity:1; transform:translateY(0); }
}

/* Segment control */
.nc-seg {
  display: inline-flex;
  gap: 3px;
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(255,255,255,0.065);
  border-radius: 14px;
  padding: 4px;
}
.nc-seg-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 20px;
  border-radius: 10px; border: 1px solid transparent;
  background: transparent;
  color: #6b7280; font-size: 14px; font-weight: 500; font-family: inherit;
  cursor: pointer; white-space: nowrap;
  transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
}
.nc-seg-btn:hover:not(.is-on) { color: #9ca3af; background: rgba(255,255,255,0.04); }
.nc-seg-btn.is-on {
  color: var(--t, #818cf8);
  background: rgba(var(--tr, 129,140,248), 0.13);
  border-color: rgba(var(--tr, 129,140,248), 0.22);
  box-shadow: 0 0 20px rgba(var(--tr, 129,140,248), 0.1), inset 0 1px 0 rgba(255,255,255,0.07);
}
.nc-seg-icon { width: 15px; height: 15px; flex-shrink: 0; }

/* ── Cards grid ────────────────────────────── */
.nc-main {
  position: relative; z-index: 1;
  max-width: 1200px; margin: 0 auto;
  padding: 0 16px;
}
@media (min-width: 768px) { .nc-main { padding: 0 20px; } }

.nc-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}
@media (min-width: 620px)  { .nc-grid { grid-template-columns: 1fr 1fr; gap: 18px; } }
@media (min-width: 1024px) { .nc-grid { grid-template-columns: 1fr 1fr 1fr; gap: 22px; } }

.nc-grid.is-entering { animation: gridIn 0.38s cubic-bezier(0.16,1,0.3,1) both; }
.nc-grid.is-leaving  { animation: gridOut 0.2s ease both; }
@keyframes gridIn  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes gridOut { to   { opacity:0; transform:translateY(-10px); } }

.nc-grid-footer { height: 120px; }

/* ── Service card ──────────────────────────── */
.nc-card {
  position: relative; overflow: hidden;
  display: flex; flex-direction: column;
  padding: 24px 24px 20px;
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,0.055);
  background: linear-gradient(155deg,
    rgba(255,255,255,0.04)  0%,
    rgba(255,255,255,0.02) 60%,
    rgba(255,255,255,0.015) 100%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  cursor: pointer; text-align: left;
  min-height: 272px;
  transition:
    transform 0.35s cubic-bezier(0.16,1,0.3,1),
    box-shadow 0.35s ease,
    border-color 0.35s ease;
  animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
}
@keyframes cardIn {
  from { opacity:0; transform:translateY(22px) scale(0.99); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
.nc-card:hover {
  transform: translateY(-7px);
  border-color: rgba(var(--rgb, 129,140,248), 0.28);
  box-shadow:
    0 24px 64px rgba(0,0,0,0.45),
    0 0 0 1px rgba(var(--rgb, 129,140,248), 0.09),
    0 0 50px rgba(var(--rgb, 129,140,248), 0.06);
}
.nc-card:active { transform: translateY(-2px) scale(0.99); }

/* Hot badge */
.nc-hot {
  position: absolute; top: 16px; right: 16px;
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 9.5px; font-weight: 700;
  letter-spacing: 0.07em; text-transform: uppercase;
  color: #fb923c;
  background: rgba(251,146,60,0.1);
  border: 1px solid rgba(251,146,60,0.22);
  border-radius: 100px; padding: 3px 8px 3px 6px;
}
.nc-hot-icon { width: 10px; height: 10px; }

/* Card header */
.nc-card-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 20px;
}

/* Icon */
.nc-icon {
  position: relative; overflow: hidden;
  width: 54px; height: 54px; border-radius: 17px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.45);
  transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
}
.nc-card:hover .nc-icon { transform: scale(1.07) rotate(-3deg); }
.nc-icon-svg { width: 25px; height: 25px; color: white; position: relative; z-index: 1; }
.nc-icon-sheen {
  position: absolute; top: -60%; left: -60%;
  width: 220%; height: 220%;
  background: linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 55%);
  pointer-events: none;
}

/* Status badge */
.nc-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 500; letter-spacing: 0.02em;
  color: var(--accent, #818cf8);
  background: rgba(var(--rgb, 129,140,248), 0.1);
  border: 1px solid rgba(var(--rgb, 129,140,248), 0.18);
  border-radius: 100px; padding: 4px 10px; margin-top: 5px;
}
.nc-badge-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--accent, #818cf8);
  animation: dotPulse 2.8s ease-in-out infinite;
}
@keyframes dotPulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:0.35; transform:scale(0.7); }
}

/* Card body */
.nc-card-body { flex: 1; }
.nc-card-title {
  font-size: 17px; font-weight: 650;
  color: #f1f5f9; line-height: 1.25;
  letter-spacing: -0.015em;
  margin-bottom: 9px;
}
.nc-card-desc {
  font-size: 13px; font-weight: 400;
  color: rgba(148,163,184,0.72);
  line-height: 1.7;
}

/* Enter CTA */
.nc-card-cta {
  display: flex; align-items: center; gap: 5px;
  margin-top: 20px;
  font-size: 12.5px; font-weight: 600;
  color: var(--accent, #818cf8);
  opacity: 0.45;
  transition: opacity 0.25s, gap 0.25s;
}
.nc-card:hover .nc-card-cta { opacity: 1; gap: 9px; }
.nc-cta-text { }
.nc-cta-arrow { width: 14px; height: 14px; transition: transform 0.25s; }
.nc-card:hover .nc-cta-arrow { transform: translateX(4px); }

/* Card glow overlay */
.nc-card-glow {
  position: absolute; inset: 0;
  border-radius: 24px;
  background: radial-gradient(ellipse at 15% 15%, rgba(var(--rgb, 129,140,248), 0.11), transparent 55%);
  opacity: 0; transition: opacity 0.4s;
  pointer-events: none;
}
.nc-card:hover .nc-card-glow { opacity: 1; }

/* ── Mobile bottom nav ─────────────────────── */
.nc-nav {
  display: flex;
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
  background: rgba(5,5,8,0.88);
  backdrop-filter: blur(30px) saturate(1.5);
  -webkit-backdrop-filter: blur(30px) saturate(1.5);
  border-top: 1px solid rgba(255,255,255,0.052);
  padding: 10px 4px max(14px, env(safe-area-inset-bottom));
  justify-content: space-around;
}
@media (min-width: 768px) { .nc-nav { display: none; } }

.nc-nav-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  border: none; background: none; cursor: pointer; padding: 0 8px;
  min-width: 52px;
  -webkit-tap-highlight-color: transparent;
}
.nc-nav-pip {
  width: 46px; height: 32px;
  border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid transparent;
  transition: all 0.22s cubic-bezier(0.16,1,0.3,1);
}
.nc-nav-label {
  font-size: 10px; font-weight: 500;
  letter-spacing: 0.01em;
  transition: color 0.2s;
  font-family: inherit;
}
`;