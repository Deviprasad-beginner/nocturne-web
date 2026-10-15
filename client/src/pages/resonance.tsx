import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import type { WhisperMood } from "@shared/schema";

// ── Types ──────────────────────────────────────────────────────────────────────
type Stage = "mood" | "topic" | "intent";

interface TopicItem {
  id: string;
  type: "topic" | "quote";
  title?: string;
  prompt?: string;
  author?: string;
  category: string;
  moods: string[];
  depth?: "gentle" | "deep" | "exploratory";
}

type ResonanceMoodKey = WhisperMood | "open" | "curious" | "reflective" | "hopeful";

// ── Curated Moods ─────────────────────────────────────────────────────────────
const MOODS: {
  key: ResonanceMoodKey;
  label: string;
  emoji: string;
  description: string;
  gradient: string;
  glow: string;
  border: string;
  textColor: string;
}[] = [
  {
    key: "lonely",
    label: "Lonely",
    emoji: "🌙",
    description: "Adrift in the quiet night, seeking a soft presence",
    gradient: "from-blue-900/40 to-indigo-900/30",
    glow: "shadow-blue-500/20",
    border: "border-blue-500/30",
    textColor: "text-blue-300",
  },
  {
    key: "restless",
    label: "Restless",
    emoji: "⚡",
    description: "Electric and awake — thoughts racing like midnight thunder",
    gradient: "from-amber-900/40 to-orange-900/30",
    glow: "shadow-amber-500/20",
    border: "border-amber-500/30",
    textColor: "text-amber-300",
  },
  {
    key: "nostalgic",
    label: "Nostalgic",
    emoji: "📼",
    description: "Yearning for moments that have gently passed",
    gradient: "from-purple-900/40 to-violet-900/30",
    glow: "shadow-purple-500/20",
    border: "border-purple-500/30",
    textColor: "text-purple-300",
  },
  {
    key: "curious",
    label: "Curious",
    emoji: "🔭",
    description: "Wondering about the infinite questions of existence",
    gradient: "from-sky-900/40 to-indigo-900/30",
    glow: "shadow-sky-500/20",
    border: "border-sky-500/30",
    textColor: "text-sky-300",
  },
  {
    key: "inspired",
    label: "Inspired",
    emoji: "💡",
    description: "Ideas burning bright in the sacred silence of 3 AM",
    gradient: "from-emerald-900/40 to-teal-900/30",
    glow: "shadow-emerald-500/20",
    border: "border-emerald-500/30",
    textColor: "text-emerald-300",
  },
  {
    key: "anxious",
    label: "Anxious",
    emoji: "🍃",
    description: "Searching for an anchor in the gentle storm within",
    gradient: "from-rose-900/40 to-pink-900/30",
    glow: "shadow-rose-500/20",
    border: "border-rose-500/30",
    textColor: "text-rose-300",
  },
  {
    key: "grateful",
    label: "Grateful",
    emoji: "✨",
    description: "Heart full and open, wanting to share this quiet warmth",
    gradient: "from-cyan-900/40 to-sky-900/30",
    glow: "shadow-cyan-500/20",
    border: "border-cyan-500/30",
    textColor: "text-cyan-300",
  },
  {
    key: "reflective",
    label: "Reflective",
    emoji: "🪞",
    description: "Peering inward into the mirror of midnight thoughts",
    gradient: "from-violet-900/40 to-fuchsia-900/30",
    glow: "shadow-violet-500/20",
    border: "border-violet-500/30",
    textColor: "text-violet-300",
  },
  {
    key: "hopeful",
    label: "Hopeful",
    emoji: "🌅",
    description: "Looking forward to what the new dawn might bring",
    gradient: "from-teal-900/40 to-emerald-900/30",
    glow: "shadow-teal-500/20",
    border: "border-teal-500/30",
    textColor: "text-teal-300",
  },
  {
    key: "open",
    label: "Open / Any mood",
    emoji: "🌌",
    description: "No specific feeling — simply open to connecting with anyone",
    gradient: "from-zinc-900/50 to-slate-900/40",
    glow: "shadow-zinc-500/20",
    border: "border-zinc-500/30",
    textColor: "text-zinc-300",
  },
];

// ── Built-in Curated Fallback Library ─────────────────────────────────────────
const FALLBACK_TOPICS: TopicItem[] = [
  { id: "t1", type: "topic", title: "Things I Never Say Out Loud", category: "Vulnerability", moods: ["lonely", "reflective", "anxious"], depth: "deep" },
  { id: "t2", type: "topic", title: "Unfinished Dreams", category: "Aspiration", moods: ["inspired", "restless", "hopeful"], depth: "exploratory" },
  { id: "t3", type: "topic", title: "The Fear Behind My Ambition", category: "Growth", moods: ["restless", "curious", "anxious"], depth: "deep" },
  { id: "t4", type: "topic", title: "People I Still Think About", category: "Memory", moods: ["nostalgic", "lonely", "reflective"], depth: "deep" },
  { id: "t5", type: "topic", title: "Questions About Life", category: "Philosophy", moods: ["curious", "reflective", "inspired"], depth: "exploratory" },
  { id: "t6", type: "topic", title: "Things I Wish Someone Understood", category: "Connection", moods: ["lonely", "reflective", "anxious"], depth: "deep" },
  { id: "t7", type: "topic", title: "Memories That Changed Me", category: "Growth", moods: ["nostalgic", "grateful", "reflective"], depth: "deep" },
  { id: "t8", type: "topic", title: "Thoughts I Have at 2 AM", category: "Midnight", moods: ["restless", "lonely", "curious"], depth: "gentle" },
  { id: "t9", type: "topic", title: "Small Moments of Grace", category: "Gratitude", moods: ["grateful", "hopeful", "reflective"], depth: "gentle" },
  { id: "t10", type: "topic", title: "The Masks We Wear During the Day", category: "Identity", moods: ["reflective", "anxious", "lonely"], depth: "deep" },
];

const FALLBACK_QUOTES: TopicItem[] = [
  { id: "q1", type: "quote", prompt: "What is something you wish people understood about you without you having to explain it?", category: "Insight", moods: ["lonely", "reflective"], depth: "deep" },
  { id: "q2", type: "quote", prompt: "Do you miss a person, or the version of yourself you were around them?", category: "Nostalgia", moods: ["nostalgic", "reflective"], depth: "deep" },
  { id: "q3", type: "quote", prompt: "What is a dream you have never told anyone about?", category: "Secret", moods: ["inspired", "hopeful", "restless"], depth: "exploratory" },
  { id: "q4", type: "quote", prompt: "What is one question you wish someone would ask you tonight?", category: "Connection", moods: ["curious", "lonely", "reflective"], depth: "gentle" },
  { id: "q5", type: "quote", prompt: "What thought keeps returning when everything becomes quiet?", category: "Midnight", moods: ["reflective", "anxious", "lonely"], depth: "deep" },
  { id: "q6", type: "quote", prompt: "What was the most peacefully solitary moment you can remember?", category: "Peace", moods: ["grateful", "nostalgic"], depth: "gentle" },
  { id: "q7", type: "quote", prompt: "If tonight had no consequences, what would you give yourself permission to feel?", category: "Freedom", moods: ["curious", "restless"], depth: "exploratory" },
  { id: "q8", type: "quote", prompt: "What are you quietly proud of that went unnoticed by the world?", category: "Validation", moods: ["reflective", "hopeful", "grateful"], depth: "gentle" },
];

const CONVERSATION_INTENTS = [
  "I want a thoughtful conversation.",
  "I want someone to listen.",
  "I want to explore an idea.",
  "I want something lighthearted.",
  "I want to share an experience.",
  "I'm open to anything.",
];

interface StarTwinkleStyle extends React.CSSProperties {
  "--twinkle-op"?: number;
}

// ── StarField Component ───────────────────────────────────────────────────────
function StarField() {
  const stars = Array.from({ length: 45 }, (_, i) => ({
    id: i,
    x: (i * 37 + 13) % 100,
    y: (i * 53 + 7) % 100,
    size: 0.8 + (i % 3) * 0.7,
    opacity: 0.15 + (i % 5) * 0.1,
    delay: (i % 7) * 0.7,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: var(--twinkle-op); transform: scale(1); }
          50% { opacity: calc(var(--twinkle-op) * 0.2); transform: scale(0.6); }
        }
      `}</style>
      {stars.map((star) => (
        <div
          key={star.id}
          style={{
            position: "absolute",
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: "50%",
            backgroundColor: "#c4b5fd",
            "--twinkle-op": star.opacity,
            animation: `twinkle ${3 + star.delay}s ease-in-out ${star.delay}s infinite`,
          } as StarTwinkleStyle}
        />
      ))}
    </div>
  );
}

// ── Radar Search Overlay ──────────────────────────────────────────────────────
function SearchingRadar({
  moodLabel,
  topicText,
  countdown,
  onCancel,
}: {
  moodLabel: string;
  topicText: string;
  countdown: number;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030712]/95 backdrop-blur-2xl px-6 text-center"
    >
      <style>{`
        @keyframes radarSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes radarPing { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(2.6); opacity: 0; } }
        @keyframes orbGlow { 0%, 100% { box-shadow: 0 0 30px 10px rgba(139,92,246,0.3); } 50% { box-shadow: 0 0 60px 25px rgba(139,92,246,0.6); } }
        @keyframes floatDot { 0%, 100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-6px); opacity: 1; } }
      `}</style>

      <div className="relative flex items-center justify-center mb-10" style={{ width: 180, height: 180 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border border-violet-500/25"
            style={{ animation: `radarPing ${2 + i * 0.6}s ease-out ${i * 0.5}s infinite` }}
          />
        ))}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 70%, rgba(139,92,246,0.7) 100%)",
            animation: "radarSpin 2.5s linear infinite",
          }}
        />
        <div
          className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg"
          style={{ animation: "orbGlow 2s ease-in-out infinite" }}
        >
          <span className="text-2xl">◎</span>
        </div>
      </div>

      <p className="text-violet-400 text-xs tracking-[0.3em] uppercase font-medium mb-3">
        Scanning Midnight Frequencies
      </p>
      <h2 className="text-white text-xl sm:text-2xl font-light mb-2">
        Seeking compatible resonance
      </h2>
      <p className="text-white/40 text-sm max-w-sm mb-3 leading-relaxed">
        Matching across <span className="text-violet-300 font-medium">{moodLabel}</span> frequencies on:
      </p>
      <div className="max-w-md bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 mb-8 text-xs text-white/80 italic">
        "{topicText}"
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-violet-400"
              style={{ animation: `floatDot 1.4s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
        <span className="text-white/40 text-xs font-mono">
          Matching window: <span className="text-violet-300 font-semibold">{countdown}s</span>
        </span>
      </div>

      <button
        onClick={onCancel}
        className="px-6 py-2.5 rounded-full border border-white/15 text-white/50 text-xs hover:border-white/30 hover:text-white/80 transition-all uppercase tracking-wider"
      >
        Cancel Search
      </button>
    </motion.div>
  );
}

// ── Matched Overlay ───────────────────────────────────────────────────────────
function MatchedOverlay({
  peerMood,
  topicText,
  onEnter,
  onDismiss,
}: {
  peerMood?: string;
  topicText: string;
  onEnter: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/95 backdrop-blur-2xl p-6"
    >
      <style>{`
        @keyframes matchPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.4); }
          70% { box-shadow: 0 0 0 20px rgba(52,211,153,0); }
        }
      `}</style>

      <motion.div
        initial={{ scale: 0.92, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl"
            style={{ animation: "matchPulse 2s ease-in-out infinite" }}
          >
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.1-1.1" />
            </svg>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Harmonic Resonance Established
        </div>

        <h2 className="text-2xl sm:text-3xl font-light text-white mb-3">
          A soul has answered <br />
          <span className="italic text-emerald-300">in the quiet</span>
        </h2>

        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 mb-6 text-left">
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Shared Resonance Point</p>
          <p className="text-sm text-white/90 font-light italic leading-relaxed">
            "{topicText}"
          </p>
          {peerMood && (
            <p className="text-xs text-emerald-400/80 mt-2">
              Peer frequency: <span className="capitalize font-medium">{peerMood}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onEnter}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-900/40"
          >
            Open Resonance Chamber →
          </button>
          <button
            onClick={onDismiss}
            className="w-full py-2.5 text-white/40 text-xs hover:text-white/60 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Fallback Screen ───────────────────────────────────────────────────────────
function FallbackScreen({
  moodLabel,
  onRetry,
  onDismiss,
}: {
  moodLabel: string;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="max-w-md mx-auto text-center py-16 px-4"
    >
      <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-6">
        🌑
      </div>
      <h3 className="text-xl font-light text-white mb-2">The Night is Calm</h3>
      <p className="text-white/45 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
        No kindred frequencies answered this instant. Your{" "}
        <span className="text-violet-300 capitalize">{moodLabel}</span>{" "}
        whisper has floated peacefully into the quiet continuum.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onRetry}
          className="px-6 py-2.5 rounded-xl bg-violet-700/80 hover:bg-violet-600 text-white text-xs font-medium uppercase tracking-wider transition-all border border-violet-500/30"
        >
          Scan Again
        </button>
        <button
          onClick={onDismiss}
          className="px-6 py-2.5 rounded-xl border border-white/10 text-white/50 text-xs uppercase tracking-wider hover:text-white/80 hover:border-white/20 transition-all"
        >
          Change Spark
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ResonancePage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  // Navigation stage in the guided discovery flow
  const [stage, setStage] = useState<Stage>("mood");

  // Selection states
  const [selectedMoodKey, setSelectedMoodKey] = useState<ResonanceMoodKey>("reflective");
  const [contentType, setContentType] = useState<"topic" | "quote" | "custom">("topic");
  const [selectedTopic, setSelectedTopic] = useState<TopicItem>(FALLBACK_TOPICS[0]);
  const [customWhisperText, setCustomWhisperText] = useState("");
  const [conversationIntent, setConversationIntent] = useState(CONVERSATION_INTENTS[0]);
  const [personalNote, setPersonalNote] = useState("");

  // Library starters loaded from backend
  const [topics, setTopics] = useState<TopicItem[]>(FALLBACK_TOPICS);
  const [quotes, setQuotes] = useState<TopicItem[]>(FALLBACK_QUOTES);

  // Matching & queue lifecycle
  const [status, setStatus] = useState<"idle" | "searching" | "matched" | "fallback">("idle");
  const [matchedChatId, setMatchedChatId] = useState<number | null>(null);
  const [matchedPeerMood, setMatchedPeerMood] = useState<string | undefined>(undefined);
  const [countdown, setCountdown] = useState(45);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Load starters from API
  useEffect(() => {
    async function loadStarters() {
      try {
        const moodParam = selectedMoodKey !== "open" ? selectedMoodKey : "";
        const res = await fetch(`/api/v1/resonance/starters?mood=${moodParam}`);
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.topics?.length) setTopics(json.data.topics);
          if (json.data.quotes?.length) setQuotes(json.data.quotes);
        }
      } catch {
        // Fallbacks used automatically
      }
    }
    loadStarters();
  }, [selectedMoodKey]);

  const selectedMoodData = MOODS.find((m) => m.key === selectedMoodKey) ?? MOODS[0];

  // Active topic/spark text preview
  const activeSparkText =
    contentType === "custom"
      ? customWhisperText.trim() || "What keeps returning in the quiet of the night?"
      : selectedTopic.type === "topic"
      ? selectedTopic.title || ""
      : selectedTopic.prompt || "";

  // ── Matching execution ─────────────────────────────────────────────────────
  const handleStartMatch = async () => {
    if (!isAuthenticated) {
      setLocation("/auth");
      return;
    }

    setStatus("searching");
    setCountdown(45);
    setMatchedChatId(null);

    let remaining = 45;
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(Math.max(0, remaining));
      if (remaining <= 0) {
        clearTimers();
        setStatus("fallback");
      }
    }, 1000);

    try {
      const payload: {
        mood?: string;
        topicText: string;
        conversationIntent: string;
        personalWhisper?: string;
      } = {
        mood: selectedMoodKey !== "open" ? selectedMoodKey : undefined,
        topicText: activeSparkText,
        conversationIntent,
        personalWhisper: personalNote.trim() || undefined,
      };

      const res = await apiRequest("POST", "/api/v1/resonance/queue", payload);
      const data = await res.json();
      const matchData = data.data ?? data;

      if (matchData.status === "matched") {
        clearTimers();
        setMatchedChatId(matchData.chatId);
        setMatchedPeerMood(matchData.peerMood);
        setStatus("matched");
        return;
      }

      // Poll status every 2.5s
      pollRef.current = setInterval(async () => {
        try {
          const pollRes = await apiRequest("GET", "/api/v1/resonance/queue/status");
          const pollJson = await pollRes.json();
          const p = pollJson.data ?? pollJson;

          if (p.status === "matched") {
            clearTimers();
            setMatchedChatId(p.chatId);
            setMatchedPeerMood(p.peerMood);
            setStatus("matched");
          } else if (p.status === "fallback") {
            clearTimers();
            setStatus("fallback");
          }
        } catch {}
      }, 2500);
    } catch {
      clearTimers();
      setStatus("idle");
    }
  };

  const handleCancelSearch = async () => {
    clearTimers();
    setStatus("idle");
    try {
      await apiRequest("DELETE", "/api/v1/resonance/queue/leave", {});
    } catch {}
  };

  const handleEnterChat = () => {
    if (matchedChatId) {
      setLocation(`/resonance-chat/${matchedChatId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-zinc-100 relative overflow-x-hidden">
      <SEO
        title="Resonance | 1:1 Guided Midnight Connection"
        description="Find someone who resonates with you. Choose a feeling, discover a thought starter, and connect anonymously with an attuned soul."
      />

      <StarField />

      {/* Atmospheric ambient glows */}
      <div className="fixed top-10 left-1/3 w-96 h-96 bg-violet-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-1/4 w-80 h-80 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Real-time Overlays */}
      <AnimatePresence>
        {status === "searching" && (
          <SearchingRadar
            moodLabel={selectedMoodData.label}
            topicText={activeSparkText}
            countdown={countdown}
            onCancel={handleCancelSearch}
          />
        )}
        {status === "matched" && (
          <MatchedOverlay
            peerMood={matchedPeerMood}
            topicText={activeSparkText}
            onEnter={handleEnterChat}
            onDismiss={() => setStatus("idle")}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-10 pb-32">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-violet-400 text-[10px] tracking-[0.3em] uppercase mb-3 font-medium">
            <span className="w-5 h-px bg-violet-500/50" />
            Nocturne Resonance
            <span className="w-5 h-px bg-violet-500/50" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight mb-2">
            Find someone who{" "}
            <span className="italic text-violet-300">resonates with you</span>
          </h1>
          <p className="text-white/40 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            You don't need the perfect words. Choose a feeling, explore a thought, and let the quiet night connect you.
          </p>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[
            { id: "mood", label: "1. Feeling" },
            { id: "topic", label: "2. Spark" },
            { id: "intent", label: "3. Intent" },
          ].map((st, idx) => {
            const isActive = stage === st.id;
            const isCompleted =
              (stage === "topic" && idx === 0) ||
              (stage === "intent" && (idx === 0 || idx === 1));

            return (
              <button
                key={st.id}
                onClick={() => setStage(st.id as Stage)}
                className={`flex items-center gap-2 text-xs transition-colors ${
                  isActive
                    ? "text-violet-300 font-medium"
                    : isCompleted
                    ? "text-white/60 hover:text-white"
                    : "text-white/20"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isActive
                      ? "bg-violet-600 text-white font-bold"
                      : isCompleted
                      ? "bg-violet-950 border border-violet-500/40 text-violet-300"
                      : "bg-white/5 border border-white/10 text-white/30"
                  }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </span>
                <span>{st.label}</span>
                {idx < 2 && <span className="text-white/10 mx-1">—</span>}
              </button>
            );
          })}
        </div>

        {/* Fallback Display */}
        <AnimatePresence>
          {status === "fallback" && (
            <FallbackScreen
              moodLabel={selectedMoodData.label}
              onRetry={handleStartMatch}
              onDismiss={() => {
                setStatus("idle");
                setStage("topic");
              }}
            />
          )}
        </AnimatePresence>

        {/* ── STAGE A: MOOD SELECTION ────────────────────────────────────────── */}
        {status === "idle" && stage === "mood" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="mb-6">
              <h2 className="text-lg font-light text-white mb-1">
                What kind of night are you having?
              </h2>
              <p className="text-xs text-white/40">
                Pick a wavelength that fits you right now, or continue open to any vibe.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {MOODS.map((m) => {
                const isSelected = selectedMoodKey === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setSelectedMoodKey(m.key)}
                    className={`
                      relative p-4 rounded-xl border text-left transition-all duration-200
                      bg-gradient-to-br ${m.gradient}
                      ${isSelected
                        ? `${m.border} ring-1 ring-white/25 shadow-lg ${m.glow} scale-[1.01]`
                        : "border-white/5 hover:border-white/15"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{m.emoji}</span>
                        <span className={`text-sm font-medium ${isSelected ? m.textColor : "text-zinc-200"}`}>
                          {m.label}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400/80 leading-relaxed pl-8">
                      {m.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedMoodKey("open");
                  setStage("topic");
                }}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Skip emotion disclosure →
              </button>
              <button
                type="button"
                onClick={() => setStage("topic")}
                className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-lg shadow-violet-900/30"
              >
                Explore Topics & Quotes →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STAGE B: TOPICS & QUOTES ───────────────────────────────────────── */}
        {status === "idle" && stage === "topic" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-light text-white mb-1">
                  Choose what resonates tonight
                </h2>
                <p className="text-xs text-white/40">
                  Select a theme or question to start the conversation without pressure.
                </p>
              </div>

              {/* Content type toggle */}
              <div className="inline-flex bg-white/5 border border-white/10 rounded-xl p-1 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setContentType("topic")}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    contentType === "topic" ? "bg-violet-600 text-white font-medium" : "text-white/50 hover:text-white"
                  }`}
                >
                  Whisper Topics
                </button>
                <button
                  type="button"
                  onClick={() => setContentType("quote")}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    contentType === "quote" ? "bg-violet-600 text-white font-medium" : "text-white/50 hover:text-white"
                  }`}
                >
                  Thought Starters
                </button>
                <button
                  type="button"
                  onClick={() => setContentType("custom")}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    contentType === "custom" ? "bg-violet-600 text-white font-medium" : "text-white/50 hover:text-white"
                  }`}
                >
                  Write My Own
                </button>
              </div>
            </div>

            {/* List of Whisper Topics */}
            {contentType === "topic" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {topics.map((t) => {
                  const isSelected = selectedTopic.id === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTopic(t)}
                      className={`
                        p-4 rounded-xl border text-left transition-all duration-200
                        ${isSelected
                          ? "bg-violet-950/40 border-violet-500/60 ring-1 ring-violet-500/40 shadow-lg shadow-violet-900/20"
                          : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-violet-900/40 text-violet-300 border border-violet-500/20">
                          {t.category}
                        </span>
                        {t.depth && (
                          <span className="text-[10px] text-white/30 capitalize">
                            {t.depth}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-white/90 leading-snug">
                        {t.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* List of Quotes & Thought Starters */}
            {contentType === "quote" && (
              <div className="space-y-3 mb-8">
                {quotes.map((q) => {
                  const isSelected = selectedTopic.id === q.id;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setSelectedTopic(q)}
                      className={`
                        w-full p-4 rounded-xl border text-left transition-all duration-200
                        ${isSelected
                          ? "bg-violet-950/40 border-violet-500/60 ring-1 ring-violet-500/40 shadow-lg shadow-violet-900/20"
                          : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-900/40 text-indigo-300 border border-indigo-500/20">
                          {q.category}
                        </span>
                        {q.depth && (
                          <span className="text-[10px] text-white/30 capitalize">
                            {q.depth}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/90 italic font-light leading-relaxed">
                        "{q.prompt}"
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Write My Own Whisper */}
            {contentType === "custom" && (
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 mb-8">
                <p className="text-xs text-violet-300 uppercase tracking-wider font-semibold mb-2">
                  Original Whisper Topic
                </p>
                <textarea
                  value={customWhisperText}
                  onChange={(e) => setCustomWhisperText(e.target.value)}
                  placeholder="What is keeping you up tonight? Express an unfinished thought or feeling..."
                  maxLength={250}
                  rows={4}
                  className="w-full rounded-xl bg-black/60 border border-white/10 p-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 resize-none mb-2"
                />
                <div className="flex justify-between items-center text-[11px] text-white/40">
                  <span>This will be the shared spark for your 1:1 conversation.</span>
                  <span>{customWhisperText.length}/250</span>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStage("mood")}
                className="text-xs text-white/50 hover:text-white transition-colors"
              >
                ← Back to Feeling
              </button>
              <button
                type="button"
                onClick={() => setStage("intent")}
                className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-lg shadow-violet-900/30"
              >
                Set Conversation Intent →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STAGE C: INTENT & REVIEW ───────────────────────────────────────── */}
        {status === "idle" && stage === "intent" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="mb-6">
              <h2 className="text-lg font-light text-white mb-1">
                Conversation intent & personal thought
              </h2>
              <p className="text-xs text-white/40">
                Help us align with someone who wants the same kind of exchange tonight.
              </p>
            </div>

            {/* Selectable Intents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
              {CONVERSATION_INTENTS.map((intent) => {
                const isSelected = conversationIntent === intent;
                return (
                  <button
                    key={intent}
                    type="button"
                    onClick={() => setConversationIntent(intent)}
                    className={`
                      p-3 rounded-xl border text-left text-xs transition-all duration-200
                      ${isSelected
                        ? "bg-violet-950/60 border-violet-500/60 text-white font-medium shadow-md shadow-violet-950/40"
                        : "bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                      }
                    `}
                  >
                    {intent}
                  </button>
                );
              })}
            </div>

            {/* Optional Personal Note */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/70 font-medium">
                  Add a private thought (optional)
                </span>
                <span className="text-[10px] text-white/40">
                  {personalNote.length}/300
                </span>
              </div>
              <textarea
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                placeholder="A detail or nuance you'd like to share once matched..."
                maxLength={300}
                rows={2}
                className="w-full rounded-xl bg-black/50 border border-white/10 p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 resize-none"
              />
            </div>

            {/* Resonance Summary Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-950/30 to-indigo-950/20 border border-violet-500/30 mb-8">
              <p className="text-[10px] uppercase tracking-widest text-violet-400 font-semibold mb-3">
                ◎ Your Resonance Spark Summary
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-white/40">Frequency:</span>
                  <span className="text-violet-300 font-medium capitalize">
                    {selectedMoodData.emoji} {selectedMoodData.label}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block mb-1">Shared Starting Point:</span>
                  <p className="text-white/90 italic bg-black/30 p-2.5 rounded-lg border border-white/5">
                    "{activeSparkText}"
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-white/40">Intent:</span>
                  <span className="text-emerald-300 font-medium">
                    {conversationIntent}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Match Button */}
            <button
              onClick={handleStartMatch}
              className="w-full py-5 rounded-2xl font-medium text-white text-base transition-all duration-300 bg-gradient-to-r from-violet-700 via-purple-600 to-indigo-700 hover:from-violet-600 hover:via-purple-500 hover:to-indigo-600 shadow-xl shadow-violet-900/30 hover:shadow-violet-900/50 relative overflow-hidden group mb-4"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-violet-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Find My Resonance
                <span className="text-white/60 text-xs font-normal">(45s matching window)</span>
              </span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStage("topic")}
                className="text-xs text-white/40 hover:text-white transition-colors"
              >
                ← Back to Topic Selection
              </button>
            </div>
          </motion.div>
        )}

        {/* How It Works Explainer */}
        {status === "idle" && (
          <div className="mt-20 pt-10 border-t border-white/5">
            <p className="text-center text-white/25 text-[10px] tracking-widest uppercase mb-8">
              The Resonance Journey
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { step: "01", title: "Feeling & Spark", desc: "Discover a thought or quote that mirrors tonight" },
                { step: "02", title: "Harmonic Match", desc: "Our engine pairs compatible intents & frequencies" },
                { step: "03", title: "Quiet Chamber", desc: "A thoughtful 1:1 conversation, completely anonymous" },
              ].map((item) => (
                <div key={item.step} className="p-3">
                  <p className="text-violet-500/40 text-[10px] font-mono mb-1">{item.step}</p>
                  <p className="text-white/70 text-xs font-medium mb-1">{item.title}</p>
                  <p className="text-white/30 text-[11px] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-white/20 text-[10px] mt-8">
              ◌ Zero permanent logs · Never reveals private profile details · Safe & moderated
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
