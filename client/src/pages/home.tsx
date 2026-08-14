import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { useMusic } from "@/context/MusicContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Track } from "@/lib/audioPlayer";
import {
  Moon, Heart, Compass, Sparkles, Notebook, MessageSquare, Brain, Music,
  BookOpen, Users, Mic, Coffee, Lightbulb, Zap, ArrowRight, User, Settings,
  Bell, LogOut, Loader2, Send, Flame, ChevronRight, Headphones, Stars,
  Play, Pause, Hash, Activity, Library, Plus, ScanLine
} from "lucide-react";
import "@/styles/home.css";
import { ScannerLens } from "@/components/read-card/ScannerLens";

// ── Like deduplication helpers ──────────────────────────────────────────────
const LIKED_KEY = "nc_liked_whispers";

function getLikedIds(): Set<number> {
  try {
    const raw = localStorage.getItem(LIKED_KEY);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveLikedIds(ids: Set<number>) {
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify(Array.from(ids)));
  } catch { }
}

// Type definitions matching DB schemas
interface Whisper {
  id: number;
  content: string;
  hearts: number;
  decayStage?: string;
  createdAt?: string;
}

interface Diary {
  id: number;
  content: string;
  isPublic: boolean;
  authorId?: number;
  createdAt?: string;
}

interface MindMaze {
  id: number;
  type: "puzzle" | "philosophy";
  content: string;
  responses: number;
  createdAt?: string;
}

interface NightlyPrompt {
  id: number;
  content: string;
}

// Services shown on the home feed
const SERVICES = [
  {
    title: "Soothing Night",
    icon: Headphones,
    route: "/music-mood",
    description: "Ambient music & sounds",
    accent: "#818cf8",
    accentRgb: "129,140,248",
    emoji: "🎵",
  },
  {
    title: "Story Vault",
    icon: BookOpen,
    route: "/read-card",
    description: "Immersive reading space",
    accent: "#f59e0b",
    accentRgb: "245,158,11",
    emoji: "📖",
  },
  {
    title: "Night Circles",
    icon: Users,
    route: "/night-circles",
    description: "Anonymous group chats",
    accent: "#a78bfa",
    accentRgb: "167,139,250",
    emoji: "🌙",
  },
  {
    title: "Midnight Café",
    icon: Coffee,
    route: "/midnight-cafe",
    description: "Ambient visual hangout",
    accent: "#fb923c",
    accentRgb: "251,146,60",
    emoji: "☕",
  },
  {
    title: "Starlit Speaker",
    icon: Mic,
    route: "/starlit-speaker",
    description: "Anonymous voice rooms",
    accent: "#34d399",
    accentRgb: "52,211,153",
    emoji: "🎤",
  },
  {
    title: "Night Thoughts",
    icon: Zap,
    route: "/night-thoughts",
    description: "Raw scroll-feed stream",
    accent: "#fb7185",
    accentRgb: "251,113,133",
    emoji: "💭",
  },
  {
    title: "Mind Maze",
    icon: Brain,
    route: "/mind-maze",
    description: "Philosophy & puzzles",
    accent: "#fbbf24",
    accentRgb: "251,191,36",
    emoji: "🧩",
  },
];

// Music mood categories for the inline widget
const MUSIC_MOODS = [
  { label: "Chill", query: "lofi,chill", color: "#818cf8" },
  { label: "Sleep", query: "sleep,ambient", color: "#60a5fa" },
  { label: "Focus", query: "meditation,relax", color: "#34d399" },
  { label: "Nature", query: "nature,ambient,sounds", color: "#86efac" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { currentTrack, isPlaying, togglePlay, playTrack } = useMusic();

  const [showMenu, setShowMenu] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [isPrivateDiary, setIsPrivateDiary] = useState(false);
  const [anonymousWhisperText, setAnonymousWhisperText] = useState("");
  const [likedIds, setLikedIds] = useState<Set<number>>(() => getLikedIds());

  // Soothing Night widget state
  const [activeMoodQuery, setActiveMoodQuery] = useState("lofi,chill");

  // Live clock
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetching live feed data
  const { data: prompt } = useQuery<NightlyPrompt>({
    queryKey: ["/api/v1/reflections/prompt?type=diary"],
  });

  const { data: whispersData, isLoading: isLoadingWhispers } = useQuery<Whisper[]>({
    queryKey: ["/api/v1/whispers"],
  });
  const whispers = whispersData || [];

  const { data: diariesData, isLoading: isLoadingDiaries } = useQuery<Diary[]>({
    queryKey: ["/api/v1/diaries"],
  });
  const diaries = diariesData || [];

  const { data: mindMazeData, isLoading: isLoadingMaze } = useQuery<MindMaze[]>({
    queryKey: ["/api/v1/mind-maze"],
  });
  const mindMaze = mindMazeData || [];

  // Night Circles widget
  type NightCircleData = { id: number; name: string; state: string; currentMembers: number; maxMembers: number; primaryEmotion?: string };
  const { data: circlesData, isLoading: isLoadingCircles } = useQuery<NightCircleData[]>({
    queryKey: ["/api/v1/circles"],
    refetchInterval: 45_000,
  });
  const circles = circlesData || [];

  // Music widget: fetch tracks for selected mood
  const { data: moodTracksData, isLoading: isLoadingTracks } = useQuery<Track[]>({
    queryKey: ["home-music", activeMoodQuery],
    queryFn: async () => {
      const res = await fetch(`/api/v1/music/search?query=${encodeURIComponent(activeMoodQuery)}`);
      const json = await res.json();
      return Array.isArray(json) ? json : (json.data ?? []);
    },
    staleTime: 1000 * 60 * 15,
  });
  const moodTracks = moodTracksData || [];

  // Story Vault widget: user's reads
  type ReadEntry = { id: number; title: string; author?: string; intention?: string; wordCount?: number };
  const { data: myReadsData, isLoading: isLoadingReads } = useQuery<ReadEntry[]>({
    queryKey: ["/api/v1/reads/mine"],
    enabled: !!user,
  });
  const myReads = myReadsData || [];

  // Whispers mutations
  const createWhisperMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/v1/whispers", { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/whispers"] });
      setAnonymousWhisperText("");
      toast({
        title: "Whisper released",
        description: "Your anonymous comment is drifting into the night.",
        style: { background: "rgba(99, 102, 241, 0.95)", color: "white" }
      });
    }
  });

  const likeWhisperMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/v1/whispers/${id}/like`);
      return res.json();
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/whispers"] });
      const next = new Set(likedIds);
      next.add(id);
      setLikedIds(next);
      saveLikedIds(next);
    }
  });

  const resonateWhisperMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/v1/whispers/${id}/interaction`, { type: "resonate" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/whispers"] });
    }
  });

  // Reflections to Diary mutation
  const createDiaryMutation = useMutation({
    mutationFn: async (payload: { content: string; isPublic: boolean; mood: string; authorId?: number }) => {
      const res = await apiRequest("POST", "/api/v1/diaries", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/diaries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setReflectionText("");
      toast({
        title: "Musings saved",
        description: "Your reflection has been added to your diary.",
        style: { background: "linear-gradient(to right, #10b981, #059669)", color: "white" }
      });
    }
  });

  // Mind maze vote/resonate mutation
  const mindMazeRespondMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/v1/mind-maze/${id}/respond`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/mind-maze"] });
      toast({
        title: "Challenge Accepted",
        description: "Your spark has been registered in the labyrinth.",
      });
    }
  });

  // Handlers
  const handlePublishReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim()) return;

    if (!user) {
      toast({
        title: "Authentication needed",
        description: "Please sign in to save your reflections.",
        variant: "destructive"
      });
      return;
    }

    createDiaryMutation.mutate({
      content: reflectionText.trim(),
      isPublic: !isPrivateDiary,
      mood: "reflective",
      authorId: user.id
    });
  };

  const handlePostWhisper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonymousWhisperText.trim()) return;
    createWhisperMutation.mutate(anonymousWhisperText.trim());
  };

  const handleLikeWhisper = useCallback((id: number) => {
    if (likedIds.has(id)) return; // already liked – do nothing
    likeWhisperMutation.mutate(id);
  }, [likedIds, likeWhisperMutation]);

  // Close menu handler
  useEffect(() => {
    if (!showMenu) return;
    const clickHandler = () => setShowMenu(false);
    window.addEventListener("click", clickHandler);
    return () => window.removeEventListener("click", clickHandler);
  }, [showMenu]);

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? "Still awake?" :
      hour < 12 ? "Good morning" :
        hour < 18 ? "Good afternoon" :
          "Good evening";

  return (
    <div className="nc-shell">
      <SEO title="Nocturne – Immersive Midnight Feed" />

      {/* ── Top Bar ───────────────────────────────── */}
      <header className="nc-topbar">
        <div className="nc-topbar-inner">
          <button className="nc-brand" onClick={() => setLocation("/")}>
            <div className="nc-moon">
              <Moon style={{ width: 16, height: 16, color: "white" }} />
            </div>
            <span className="nc-brand-name">Nocturne</span>
          </button>

          <div className="nc-topbar-right">
            {/* NOCTURNAL LENS - Always available top action, like UPI scanner */}
            <button
              className="mr-2 p-2 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-colors"
              onClick={() => setIsScannerOpen(true)}
              title="Scanner Lens"
            >
              <ScanLine className="w-5 h-5" />
            </button>

            {user ? (
              <div style={{ position: "relative" }}>
                <button
                  className="nc-avatar-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu((s) => !s);
                  }}
                >
                  <div className="nc-avatar">
                    <User style={{ width: 14, height: 14, color: "white" }} />
                  </div>
                  <span className="nc-user-greeting">
                    {greeting}, {user.displayName || user.username}
                  </span>
                </button>

                {showMenu && (
                  <div className="nc-dropdown" onClick={(e) => e.stopPropagation()}>
                    {[
                      { icon: User, label: "Profile", route: "/profile" },
                      { icon: Settings, label: "Settings", route: "/settings" },
                      { icon: Bell, label: "Notifications", route: "/notifications" },
                    ].map(({ icon: Icon, label, route }) => (
                      <button
                        key={route}
                        className="nc-dd-item"
                        onClick={() => {
                          setLocation(route);
                          setShowMenu(false);
                        }}
                      >
                        <Icon style={{ width: 14, height: 14 }} /> {label}
                      </button>
                    ))}
                    <div className="nc-dd-sep" />
                    <button
                      className="nc-dd-item nc-dd-logout"
                      onClick={() => {
                        logoutMutation.mutate();
                        setShowMenu(false);
                      }}
                    >
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

      {/* ── Scanner Modal ───────────────────────── */}
      <ScannerLens isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />

      {/* ── Hero / Header ─────────────────────────── */}
      <section className="nc-hero" style={{ paddingBottom: "12px" }}>
        <p className="nc-greeting">
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} •{" "}
          {time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
        </p>
        <h1 className="nc-headline" style={{ marginBottom: "16px" }}>
          Tonight is <span className="nc-hl-b">unwritten</span>.
        </h1>
      </section>

      {/* ── Main Feed ────────────────────────────── */}
      <main className="nc-main">
        <div className="nc-feed-layout">
          {/* Main Feed stream */}
          <div className="nc-feed-stream">

            {/* ── Services Discover Row ─────────────── */}
            <section className="nc-services-section">
              <div className="nc-services-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Stars style={{ width: 15, height: 15, color: "#818cf8" }} />
                  <span className="nc-services-title">Explore Nocturne</span>
                </div>
              </div>
              <div className="nc-services-scroll">
                {SERVICES.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.route}
                      className="nc-service-card"
                      style={{ "--sc-accent": s.accent, "--sc-accent-rgb": s.accentRgb } as React.CSSProperties}
                      onClick={() => setLocation(s.route)}
                    >
                      <div className="nc-service-card-icon">
                        <Icon style={{ width: 22, height: 22, color: s.accent }} />
                      </div>
                      <div className="nc-service-card-body">
                        <span className="nc-service-card-title">{s.title}</span>
                        <span className="nc-service-card-desc">{s.description}</span>
                      </div>
                      <ChevronRight className="nc-service-card-arrow" style={{ color: s.accent }} />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Tonight's Reflection */}
            <section className="nc-section" style={{ "--accent": "#818cf8", "--accent-rgb": "129,140,248" } as React.CSSProperties}>
              <div className="nc-section-header">
                <div className="nc-section-title-wrap">
                  <div className="nc-section-icon" style={{ background: "rgba(129, 140, 248, 0.15)" }}>
                    <Sparkles style={{ width: 16, height: 16, color: "#818cf8" }} />
                  </div>
                  <span className="nc-section-title">Tonight's Reflection</span>
                </div>
                <button className="nc-section-action" onClick={() => setLocation("/nightly-reflection")}>
                  Tonight's Inspection <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </div>


              <div className="nc-prompt-container">
                <p className="nc-prompt-text">
                  "{prompt?.content || "What is keeping you awake tonight?"}"
                </p>

                <form onSubmit={handlePublishReflection} className="nc-prompt-input-area">
                  <textarea
                    className="nc-prompt-textarea"
                    placeholder="Reflect on this cue. The night remembers..."
                    rows={3}
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                  />
                  <div className="nc-prompt-footer">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-[12px] text-gray-500">
                      <input
                        type="checkbox"
                        checked={isPrivateDiary}
                        onChange={(e) => setIsPrivateDiary(e.target.checked)}
                        className="rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-0"
                      />
                      <span>Keep private (Encrypted vault)</span>
                    </label>

                    <button
                      type="submit"
                      disabled={createDiaryMutation.isPending || !reflectionText.trim()}
                      className="nc-prompt-submit"
                    >
                      {createDiaryMutation.isPending ? "Archiving..." : "Archive Entry"}
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* ── Soothing Night Inline Widget ───────── */}
            <section className="nc-section" style={{ "--accent": "#818cf8", "--accent-rgb": "129,140,248" } as React.CSSProperties}>
              <div className="nc-section-header">
                <div className="nc-section-title-wrap">
                  <div className="nc-section-icon" style={{ background: "rgba(129,140,248,0.15)" }}>
                    <Headphones style={{ width: 16, height: 16, color: "#818cf8" }} />
                  </div>
                  <span className="nc-section-title">Soothing Night</span>
                </div>
                <button className="nc-section-action" onClick={() => setLocation("/music-mood")}>
                  Full Library <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </div>

              {/* Mood picker */}
              <div className="nc-sn-moods">
                {MUSIC_MOODS.map((m) => (
                  <button
                    key={m.query}
                    className={`nc-sn-mood-btn${activeMoodQuery === m.query ? " is-active" : ""}`}
                    style={{ "--sn-color": m.color } as React.CSSProperties}
                    onClick={() => setActiveMoodQuery(m.query)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Track list */}
              <div className="nc-sn-tracks">
                {isLoadingTracks ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                  </div>
                ) : moodTracks.slice(0, 4).map((track) => {
                  const isThisPlaying = isPlaying && currentTrack?.id === track.id;
                  return (
                    <button
                      key={track.id}
                      className={`nc-sn-track${isThisPlaying ? " is-playing" : ""}`}
                      onClick={() => isThisPlaying ? togglePlay() : playTrack(track)}
                    >
                      <span className="nc-sn-track-art">
                        {track.coverArt
                          ? <img src={track.coverArt} alt="" />
                          : <Music style={{ width: 14, height: 14, color: "#818cf8" }} />}
                        <span className="nc-sn-play-overlay">
                          {isThisPlaying
                            ? <Pause style={{ width: 12, height: 12 }} />
                            : <Play style={{ width: 12, height: 12 }} />}
                        </span>
                      </span>
                      <span className="nc-sn-track-info">
                        <span className="nc-sn-track-title">{track.title}</span>
                        <span className="nc-sn-track-artist">{track.artist}</span>
                      </span>
                      {isThisPlaying && (
                        <span className="nc-sn-track-bars">
                          <span /><span /><span />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── Night Circles Inline Widget ─────────── */}
            <section className="nc-section" style={{ "--accent": "#a78bfa", "--accent-rgb": "167,139,250" } as React.CSSProperties}>
              <div className="nc-section-header">
                <div className="nc-section-title-wrap">
                  <div className="nc-section-icon" style={{ background: "rgba(167,139,250,0.15)" }}>
                    <Users style={{ width: 16, height: 16, color: "#a78bfa" }} />
                  </div>
                  <span className="nc-section-title">Night Circles</span>
                </div>
                <button className="nc-section-action" onClick={() => setLocation("/night-circles")}>
                  All Circles <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </div>

              {isLoadingCircles ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                </div>
              ) : circles.filter(c => c.state !== "ended").length === 0 ? (
                <div className="nc-circles-empty">
                  <p>No open circles right now.</p>
                  <button className="nc-circles-start-btn" onClick={() => setLocation("/night-circles")}>
                    <Plus style={{ width: 13, height: 13 }} /> Start One
                  </button>
                </div>
              ) : (
                <div className="nc-circles-list">
                  {circles.filter(c => c.state !== "ended").slice(0, 3).map((circle) => {
                    const isFull = circle.currentMembers >= circle.maxMembers;
                    const stateDot =
                      circle.state === "active" ? "#34d399"
                        : circle.state === "deep_phase" ? "#c084fc"
                          : circle.state === "forming" ? "#818cf8"
                            : "#f59e0b";
                    return (
                      <div key={circle.id} className="nc-circle-row">
                        <span className="nc-circle-dot" style={{ background: stateDot }} />
                        <span className="nc-circle-info">
                          <span className="nc-circle-name"># {circle.name}</span>
                          {circle.primaryEmotion && (
                            <span className="nc-circle-emotion">{circle.primaryEmotion}</span>
                          )}
                        </span>
                        <span className="nc-circle-members">
                          <Users style={{ width: 11, height: 11 }} /> {circle.currentMembers}/{circle.maxMembers}
                        </span>
                        <button
                          className="nc-circle-join-btn"
                          disabled={isFull}
                          onClick={() => setLocation("/night-circles")}
                        >
                          {isFull ? "Full" : "Join →"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Story Vault Inline Widget ────────────── */}
            <section className="nc-section" style={{ "--accent": "#f59e0b", "--accent-rgb": "245,158,11" } as React.CSSProperties}>
              <div className="nc-section-header">
                <div className="nc-section-title-wrap">
                  <div className="nc-section-icon" style={{ background: "rgba(245,158,11,0.15)" }}>
                    <BookOpen style={{ width: 16, height: 16, color: "#f59e0b" }} />
                  </div>
                  <span className="nc-section-title">Story Vault</span>
                </div>
                <button className="nc-section-action" onClick={() => setLocation("/read-card")}>
                  Upload Book <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </div>

              {!user ? (
                <div className="nc-vault-empty">
                  <Library style={{ width: 20, height: 20, color: "#6b7280" }} />
                  <p>Sign in to access your bookshelf.</p>
                  <button className="nc-vault-cta" onClick={() => setLocation("/auth")}>Sign In</button>
                </div>
              ) : isLoadingReads ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                </div>
              ) : myReads.length === 0 ? (
                <div className="nc-vault-empty">
                  <Library style={{ width: 20, height: 20, color: "#6b7280" }} />
                  <p>Your vault is empty. Upload a PDF or paste text to begin reading.</p>
                  <button className="nc-vault-cta" onClick={() => setLocation("/read-card")}>
                    Add First Book
                  </button>
                </div>
              ) : (
                <div className="nc-vault-shelf">
                  {myReads.slice(0, 4).map((read) => (
                    <button
                      key={read.id}
                      className="nc-vault-book"
                      onClick={() => setLocation(`/reader/${read.id}`)}
                    >
                      <span className="nc-vault-book-spine" />
                      <span className="nc-vault-book-info">
                        <span className="nc-vault-book-title">{read.title}</span>
                        {read.author && <span className="nc-vault-book-author">{read.author}</span>}
                        {read.intention && (
                          <span className="nc-vault-book-mode">{read.intention} mode</span>
                        )}
                      </span>
                      <span className="nc-vault-book-cta">Read →</span>
                    </button>
                  ))}
                  {myReads.length > 4 && (
                    <button className="nc-vault-more" onClick={() => setLocation("/read-alone")}>
                      +{myReads.length - 4} more in vault
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* Late-Night Whispers */}
            <section className="nc-section" style={{ "--accent": "#fb7185", "--accent-rgb": "251,113,133" } as React.CSSProperties}>
              <div className="nc-section-header">
                <div className="nc-section-title-wrap">
                  <div className="nc-section-icon" style={{ background: "rgba(251, 113, 133, 0.15)" }}>
                    <Heart style={{ width: 16, height: 16, color: "#fb7185" }} />
                  </div>
                  <span className="nc-section-title">Late-Night Whispers</span>
                </div>
                <button className="nc-section-action" onClick={() => setLocation("/whispers")}>
                  Full Void <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </div>

              {/* Quick whisper text entry */}
              <form onSubmit={handlePostWhisper} className="nc-quick-whisper">
                <input
                  type="text"
                  placeholder="Whisper anonymously into the void..."
                  className="nc-whisper-input"
                  value={anonymousWhisperText}
                  onChange={(e) => setAnonymousWhisperText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={createWhisperMutation.isPending || !anonymousWhisperText.trim()}
                  className="nc-whisper-submit"
                >
                  <Send style={{ width: 14, height: 14 }} />
                </button>
              </form>

              {/* Feed items */}
              {isLoadingWhispers ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                </div>
              ) : whispers.length === 0 ? (
                <p className="text-center text-xs text-gray-600 py-4">The void is silent.</p>
              ) : (
                <div className="nc-whispers-list">
                  {whispers.slice(0, 3).map((w) => {
                    const isLiked = likedIds.has(w.id);
                    return (
                      <div key={w.id} className="nc-whisper-post">
                        <p className="nc-whisper-text">{w.content}</p>
                        <div className="nc-whisper-actions">
                          <button
                            className={`nc-whisper-btn${isLiked ? " is-active" : ""}`}
                            onClick={() => handleLikeWhisper(w.id)}
                            disabled={isLiked || likeWhisperMutation.isPending}
                            title={isLiked ? "Already liked" : "Like"}
                          >
                            <Heart
                              style={{
                                width: 13,
                                height: 13,
                                fill: isLiked ? "currentColor" : "none",
                              }}
                            />
                            <span>{w.hearts || 0}</span>
                          </button>
                          <button
                            className="nc-whisper-btn"
                            onClick={() => resonateWhisperMutation.mutate(w.id)}
                          >
                            <Compass style={{ width: 13, height: 13 }} />
                            <span>Resonate</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Philosophical Labyrinth */}
            <section className="nc-section" style={{ "--accent": "#fbbf24", "--accent-rgb": "251,191,36" } as React.CSSProperties}>
              <div className="nc-section-header">
                <div className="nc-section-title-wrap">
                  <div className="nc-section-icon" style={{ background: "rgba(251, 191, 36, 0.15)" }}>
                    <Brain style={{ width: 16, height: 16, color: "#fbbf24" }} />
                  </div>
                  <span className="nc-section-title">Philosophical Labyrinth</span>
                </div>
                <button className="nc-section-action" onClick={() => setLocation("/mind-maze")}>
                  Enter Maze <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </div>

              {isLoadingMaze ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                </div>
              ) : mindMaze.length === 0 ? (
                <p className="text-center text-xs text-gray-600 py-4">The labyrinth is quiet.</p>
              ) : (
                (() => {
                  const activeChallenge = mindMaze[0];
                  return (
                    <div className="nc-maze-card">
                      <div className="nc-maze-meta">
                        <span className="nc-maze-type">{activeChallenge.type}</span>
                        <span className="nc-maze-date">Interactive</span>
                      </div>
                      <p className="nc-maze-text">{activeChallenge.content}</p>
                      <div className="nc-maze-interactive">
                        <span className="nc-maze-responses">
                          {activeChallenge.responses || 0} solutions generated tonight
                        </span>
                        <button
                          className="nc-maze-vote-btn"
                          onClick={() => mindMazeRespondMutation.mutate(activeChallenge.id)}
                        >
                          Trigger Spark
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}
            </section>

            {/* Night Diaries highlights */}
            <section className="nc-section" style={{ "--accent": "#34d399", "--accent-rgb": "52,211,153" } as React.CSSProperties}>
              <div className="nc-section-header">
                <div className="nc-section-title-wrap">
                  <div className="nc-section-icon" style={{ background: "rgba(52, 211, 153, 0.15)" }}>
                    <Notebook style={{ width: 16, height: 16, color: "#34d399" }} />
                  </div>
                  <span className="nc-section-title">Echoes from the Diaries</span>
                </div>
                <button className="nc-section-action" onClick={() => setLocation("/diaries")}>
                  Read All <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </div>

              {isLoadingDiaries ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                </div>
              ) : diaries.length === 0 ? (
                <p className="text-center text-xs text-gray-600 py-4">No public diary entries tonight.</p>
              ) : (
                <div className="nc-diaries-stream">
                  {diaries.filter((d) => d.isPublic).slice(0, 2).map((d) => (
                    <div key={d.id} className="nc-diary-post">
                      <div className="nc-diary-author-bar">
                        <div className="nc-diary-avatar">
                          {d.authorId ? "D" : "A"}
                        </div>
                        <div>
                          <div className="nc-diary-name">
                            Journalist #{d.authorId || "Anon"}
                          </div>
                          <div className="nc-diary-date">Public memory</div>
                        </div>
                      </div>
                      <p className="nc-diary-content">{d.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* Sidebar */}
          <aside className="nc-feed-sidebar">

            {/* Playback controller */}
            <div className="nc-widget" style={{ "--accent": "#0ea5e9", "--accent-rgb": "14, 165, 233" } as React.CSSProperties}>
              <h3 className="nc-widget-title">Nocturnal Soundscape</h3>
              <div className="nc-widget-body nc-music-widget">
                <div className="nc-track-status">
                  <span />
                  {isPlaying ? "Live broadcast playing" : "Station standby"}
                </div>

                <div className="nc-track-details">
                  <div className="nc-track-cover">
                    <Music style={{ width: 22, height: 22, color: "white" }} />
                  </div>
                  <div className="nc-track-info">
                    <span className="nc-track-name">
                      {currentTrack?.title || "Silence of the void"}
                    </span>
                    <span className="nc-track-artist">
                      {currentTrack?.artist || "Standby station"}
                    </span>
                  </div>
                </div>

                <button className="nc-music-btn" onClick={togglePlay}>
                  {isPlaying ? "Pause Broadcast" : "Tune Broadcast"}
                </button>
                <button
                  className="nc-music-btn"
                  style={{ marginTop: 6, background: "rgba(14,165,233,0.08)", color: "#7dd3fc" }}
                  onClick={() => setLocation("/music-mood")}
                >
                  Open Music Library →
                </button>
              </div>
            </div>

            {/* Streak card (if logged in) */}
            {user && (
              <div className="nc-widget flex items-center justify-between" style={{ background: "rgba(234, 179, 8, 0.03)", borderColor: "rgba(234, 179, 8, 0.1)" }}>
                <div>
                  <h4 className="text-[11px] font-semibold text-yellow-500 uppercase tracking-widest">
                    Your Night Streak
                  </h4>
                  <p className="text-2xl font-light text-white mt-1">
                    {user.currentStreak || 0} <span className="text-xs text-gray-500">nights</span>
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-yellow-500 animate-pulse" />
                </div>
              </div>
            )}

          </aside>
        </div>
        <div className="nc-grid-footer" />
      </main>

      {/* ── Mobile bottom Nav ─────────────────────── */}
      <nav className="nc-nav" aria-label="Mobile navigation">
        {[
          { label: "Feed", icon: Sparkles, route: "/" },
          { label: "Whispers", icon: Heart, route: "/whispers" },
          { label: "Music", icon: Music, route: "/music-mood" },
          { label: "Circles", icon: Users, route: "/night-circles" },
        ].map((t) => (
          <button
            key={t.route}
            className="nc-nav-btn"
            onClick={() => setLocation(t.route)}
          >
            <span className="nc-nav-pip">
              <t.icon style={{ width: 18, height: 18, color: "#374151" }} />
            </span>
            <span className="nc-nav-label" style={{ color: "#374151" }}>
              {t.label}
            </span>
          </button>
        ))}
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