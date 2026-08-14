import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Users, Zap, Moon, Send, LogOut,
  Circle, Activity, MessageCircle, Plus, Hash,
  Info, Lock, Tag, Image as ImageIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CircleState = "forming" | "active" | "deep_phase" | "closing" | "ended";
type JoinMode = "silent" | "listener" | "speaker";

interface NightCircleData {
  id: number;
  name: string;
  state: CircleState;
  currentMembers: number;
  maxMembers: number;
  topic?: string;
  category?: string;
  roomType?: string;
  primaryEmotion?: string;
  vibeScore?: number;
  expiresAt?: string;
  createdAt: string;
}

interface CircleMemberData {
  id: number;
  circleId: number;
  alias: string;
  avatar: string;
  mode: JoinMode;
}

interface CircleMsg {
  id?: number;
  senderAlias: string;
  content: string;
  imageUrl?: string;
  timestamp?: string;
  createdAt?: string;
  isAi?: boolean;
  isSystem?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATE_CONFIG: Record<CircleState, { label: string; dot: string; badge: string }> = {
  forming: { label: "Forming", dot: "bg-indigo-400 animate-pulse", badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  active: { label: "Active", dot: "bg-emerald-400 animate-pulse", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  deep_phase: { label: "Deep Phase", dot: "bg-fuchsia-400 animate-pulse", badge: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30" },
  closing: { label: "Closing Soon", dot: "bg-amber-400", badge: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  ended: { label: "Ended", dot: "bg-gray-600", badge: "bg-gray-700/40 text-gray-500 border-gray-700/40" },
};

const EMOTION_PILL: Record<string, string> = {
  calm: "bg-sky-500/10 text-sky-300",
  deep: "bg-violet-500/10 text-violet-300",
  emotional: "bg-pink-500/10 text-pink-300",
  lonely: "bg-blue-500/10 text-blue-300",
  curious: "bg-amber-500/10 text-amber-300",
  chaotic: "bg-red-500/10 text-red-300",
  neutral: "bg-gray-700/40 text-gray-400",
};

const MOODS = ["calm", "curious", "lonely", "deep", "emotional", "chaotic"];
const MODE_LABELS: Record<JoinMode, { label: string; sub: string }> = {
  silent: { label: "Silent Witness", sub: "observe only" },
  listener: { label: "Listener", sub: "can respond" },
  speaker: { label: "Speaker", sub: "full voice" },
};

const CATEGORIES = ["Philosophy", "Art & Music", "Technology", "Mental Health", "Night Thoughts", "Stories", "Any"];

// ─── Circle Room ──────────────────────────────────────────────────────────────

function CircleRoom({
  circle,
  member,
  aiSeed,
  onLeave,
}: {
  circle: NightCircleData;
  member: CircleMemberData;
  aiSeed: string | null;
  onLeave: () => void;
}) {
  const [messages, setMessages] = useState<CircleMsg[]>([]);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [liveCircle, setLiveCircle] = useState(circle);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();

  const { data: initialMessages } = useQuery<CircleMsg[]>({
    queryKey: [`/api/v1/circles/${circle.id}/messages`],
  });

  useEffect(() => {
    if (initialMessages) {
      const msgs: CircleMsg[] = [...initialMessages].reverse();
      if (aiSeed) msgs.unshift({ senderAlias: "Night", content: aiSeed, isAi: true });
      setMessages(msgs);
    }
  }, [initialMessages, aiSeed]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () =>
      ws.send(JSON.stringify({ type: "CIRCLE_JOIN", circleId: circle.id, alias: member.alias, lifecycle: circle.state }));

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.type === "CIRCLE_MESSAGE") {
        setMessages(prev => [...prev, { senderAlias: msg.alias, content: msg.content, timestamp: msg.timestamp }]);
      }
      if (msg.type === "MEMBER_JOINED" || msg.type === "MEMBER_LEFT") {
        setMessages(prev => [...prev, {
          senderAlias: "System",
          content: msg.type === "MEMBER_JOINED" ? `${msg.alias} joined` : `${msg.alias} left`,
          isSystem: true,
        }]);
        setLiveCircle(prev => ({ ...prev, currentMembers: msg.memberCount }));
      }
      if (msg.type === "LIFECYCLE_CHANGED") setLiveCircle(prev => ({ ...prev, state: msg.state, currentMembers: msg.memberCount }));
      if (msg.type === "EMOTION_UPDATED") setLiveCircle(prev => ({ ...prev, primaryEmotion: msg.primaryEmotion, vibeScore: msg.vibeScore }));
      if (msg.type === "CIRCLE_ENDED") {
        setMessages(prev => [...prev, { senderAlias: "System", content: "This circle has dissolved into the night.", isSystem: true }]);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN)
        ws.send(JSON.stringify({ type: "CIRCLE_LEAVE", circleId: circle.id, alias: member.alias }));
      ws.close();
    };
  }, [circle.id, member.alias, circle.state]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async ({ content, imageUrl }: { content: string; imageUrl?: string }) => {
      const res = await apiRequest("POST", `/api/v1/circles/${circle.id}/messages`, { senderAlias: member.alias, content, imageUrl });
      return res.json();
    },
    onSuccess: (data, variables) => {
      const saved = data?.data;
      if (saved) setMessages(prev => [...prev, { id: saved.id, senderAlias: member.alias, content: saved.content, imageUrl: saved.imageUrl, createdAt: saved.createdAt }]);
      wsRef.current?.readyState === WebSocket.OPEN && wsRef.current.send(JSON.stringify({ type: "CIRCLE_MESSAGE", circleId: circle.id, alias: member.alias, content: variables.content, imageUrl: variables.imageUrl }));
    },
  });

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;
    setInput("");
    if (member.mode !== "silent") sendMutation.mutate({ content });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate image upload to Firebase Storage by converting to Base64 temporarily
    // Real implementation would upload to Firebase and return a gs:// or https:// URL.
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (member.mode !== "silent") {
        sendMutation.mutate({ content: "", imageUrl: url });
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLeave = async () => {
    if (user) await apiRequest("POST", `/api/v1/circles/${circle.id}/leave`, {});
    onLeave();
  };

  const cfg = STATE_CONFIG[liveCircle.state];
  const avatarEmoji: Record<string, string> = { moon_1: "🌙", moon_2: "🌕", moon_3: "🌑", star_1: "⭐", star_2: "✨", void_1: "🌌" };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a12] text-white">
      {/* Room header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/6 bg-[#0e0e1a]">
        <button onClick={handleLeave} className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
          <Hash className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="font-semibold truncate text-white">{liveCircle.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.badge}`}>{cfg.label}</span>
          {liveCircle.primaryEmotion && (
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${EMOTION_PILL[liveCircle.primaryEmotion] ?? "bg-gray-700/40 text-gray-400"}`}>
              {liveCircle.primaryEmotion}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-400 text-xs flex-shrink-0">
          <Users className="w-4 h-4" />
          <span>{liveCircle.currentMembers}</span>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-500">You</p>
          <p className="text-sm font-medium text-violet-300">{avatarEmoji[member.avatar] ?? "🌙"} {member.alias}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isMine = msg.senderAlias === member.alias;
            if (msg.isSystem) {
              return (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                  <span className="text-xs text-gray-600 bg-white/3 border border-white/5 rounded-full px-3 py-1">{msg.content}</span>
                </motion.div>
              );
            }
            if (msg.isAi) {
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
                  <div className="bg-violet-900/25 border border-violet-700/30 rounded-2xl px-5 py-3 max-w-sm text-center">
                    <p className="text-xs text-violet-400 mb-1 font-semibold">✦ Tonight's seed</p>
                    <p className="text-sm text-violet-100 italic">{msg.content}</p>
                  </div>
                </motion.div>
              );
            }
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}>
                  {!isMine && <span className="text-[11px] text-gray-500 ml-2">{msg.senderAlias}</span>}
                  <div className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${isMine
                    ? "bg-violet-600 text-white rounded-br-sm"
                    : "bg-[#1a1a2e] text-gray-100 rounded-bl-sm border border-white/5"
                    }`}>
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Shared" className="max-w-full max-h-48 rounded-lg mb-2 object-contain" />
                    )}
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {member.mode === "silent" ? (
        <div className="px-4 py-4 text-center text-xs text-gray-500 border-t border-white/5 bg-[#0e0e1a]">
          You joined as <span className="text-gray-300 font-medium">Silent Witness</span>. Listen and breathe.
        </div>
      ) : (
        <div className="flex gap-2 px-4 py-3 border-t border-white/5 bg-[#0e0e1a]">
          <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleImageUpload} />
          <label htmlFor="image-upload">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 cursor-pointer transition-colors shadow-sm cursor-pointer">
              <ImageIcon className="w-4 h-4" />
            </div>
          </label>
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Speak into the night…"
            className="bg-[#151525] border-white/8 text-white placeholder:text-gray-600 rounded-xl text-sm flex-1 focus:border-violet-500/50 focus:ring-0 focus-visible:ring-0"
          />
          <Button
            onClick={handleSend}
            disabled={(!input.trim() && !isUploading) || sendMutation.isPending}
            size="icon"
            className="bg-violet-600 hover:bg-violet-500 rounded-xl shrink-0 shadow-lg shadow-violet-500/20"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Join Flow ────────────────────────────────────────────────────────────────

function JoinFlow({
  onQuickJoin,
  onCancel,
  isPending,
}: {
  onQuickJoin: (mood: string, mode: JoinMode, size: "group" | "duo") => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [selectedMood, setSelectedMood] = useState("calm");
  const [selectedMode, setSelectedMode] = useState<JoinMode>("listener");
  const [selectedSize, setSelectedSize] = useState<"group" | "duo">("group");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="w-full max-w-md bg-[#0e0e1a] border border-white/8 rounded-3xl p-6 space-y-5 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-lg">Join a Circle</h2>
            <p className="text-gray-500 text-sm mt-0.5">We'll match you instantly</p>
          </div>
          <button onClick={onCancel} className="text-gray-600 hover:text-gray-300 transition-colors text-sm">Cancel</button>
        </div>

        {/* Mood */}
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">How are you feeling?</p>
          <div className="grid grid-cols-3 gap-2">
            {MOODS.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMood(m)}
                className={`rounded-xl py-2 text-xs capitalize font-medium transition-all ${selectedMood === m
                  ? "bg-violet-600/30 text-violet-200 ring-1 ring-violet-500/50"
                  : "bg-white/4 text-gray-400 hover:bg-white/7 hover:text-gray-300"
                  }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">Participation mode</p>
          <div className="flex flex-col gap-2">
            {(["silent", "listener", "speaker"] as JoinMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`rounded-xl py-2.5 px-4 text-left transition-all flex items-center justify-between ${selectedMode === mode
                  ? "bg-violet-600/20 ring-1 ring-violet-500/50 text-violet-100"
                  : "bg-white/4 text-gray-400 hover:bg-white/6"
                  }`}
              >
                <span className="text-sm font-medium">{MODE_LABELS[mode].label}</span>
                <span className="text-xs text-gray-500">{MODE_LABELS[mode].sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">Circle type</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: "group" as const, label: "Campfire", sub: "Group · 3–8" },
              { value: "duo" as const, label: "1-on-1", sub: "Private · 2" },
            ]).map(({ value, label, sub }) => (
              <button
                key={value}
                onClick={() => setSelectedSize(value)}
                className={`rounded-xl py-3 px-4 text-center transition-all ${selectedSize === value
                  ? "bg-violet-600/20 ring-1 ring-violet-500/50 text-violet-100"
                  : "bg-white/4 text-gray-400 hover:bg-white/6"
                  }`}
              >
                <div className="font-medium text-sm">{label}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{sub}</div>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => onQuickJoin(selectedMood, selectedMode, selectedSize)}
          disabled={isPending}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-6 text-sm font-semibold shadow-lg shadow-violet-500/20"
        >
          {isPending ? "Finding your circle…" : "✦ Match Me Now"}
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── Circle Lobby Card ─────────────────────────────────────────────────────────

function CircleLobbyCard({ circle, onJoin }: { circle: NightCircleData; onJoin: (id: number) => void }) {
  const cfg = STATE_CONFIG[circle.state] ?? STATE_CONFIG.forming;
  const isFull = circle.currentMembers >= circle.maxMembers;
  const pctFull = Math.round((circle.currentMembers / circle.maxMembers) * 100);

  // Random avatar placeholder letters
  const avatars = Array.from({ length: Math.min(circle.currentMembers, 3) }, (_, i) =>
    ["🌙", "✨", "⭐", "🌌", "🌕"][i % 5]
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="group"
    >
      <div className={`bg-[#0e0e1a] border border-white/6 rounded-2xl p-4 transition-all duration-200 ${!isFull && circle.state !== "ended" ? "hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 cursor-pointer" : "opacity-60"}`}
        onClick={() => !isFull && circle.state !== "ended" && onJoin(circle.id)}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
            <span className="font-semibold text-white text-sm truncate">
              {circle.roomType === "custom" && <Tag className="w-3 h-3 inline mr-1 text-violet-400" />} {circle.name}
            </span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.badge}`}>{cfg.label}</span>
        </div>

        {/* Custom room info */}
        {circle.roomType === "custom" && (
          <div className="mb-3 text-xs text-gray-400 flex flex-col gap-1">
            {circle.topic && <p className="truncate italic">"{circle.topic}"</p>}
            {circle.category && <span className="inline-block px-2 py-1 rounded bg-white/5 w-max text-violet-300">c/{circle.category.toLowerCase().replace(/\s+/g, '')}</span>}
          </div>
        )}

        {/* Emotion & vibe */}
        {circle.primaryEmotion && (
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${EMOTION_PILL[circle.primaryEmotion] ?? "bg-gray-700/40 text-gray-400"}`}>
              {circle.primaryEmotion}
            </span>
            {circle.vibeScore !== undefined && (
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all"
                  style={{ width: `${circle.vibeScore}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Footer: avatars + capacity + join CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {avatars.length > 0 && (
              <div className="flex -space-x-1">
                {avatars.map((a, i) => (
                  <span key={i} className="w-6 h-6 rounded-full bg-[#1a1a2e] border border-white/10 flex items-center justify-center text-[10px]">{a}</span>
                ))}
              </div>
            )}
            <span className="text-xs text-gray-500">{circle.currentMembers}/{circle.maxMembers}</span>
          </div>

          <button
            onClick={e => { e.stopPropagation(); if (!isFull && circle.state !== "ended") onJoin(circle.id); }}
            disabled={isFull || circle.state === "ended"}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${isFull || circle.state === "ended"
              ? "bg-white/4 text-gray-600 cursor-not-allowed"
              : "bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600 hover:text-white"
              }`}
          >
            {isFull ? "Full" : circle.state === "ended" ? "Ended" : "Join →"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NightCircles() {
  const { user } = useAuth();
  const [view, setView] = useState<"lobby" | "join-flow" | "create-flow" | "room">("lobby");
  const [activeCircle, setActiveCircle] = useState<NightCircleData | null>(null);
  const [activeMember, setActiveMember] = useState<CircleMemberData | null>(null);
  const [activeAiSeed, setActiveAiSeed] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");

  const { data: circles = [], isLoading } = useQuery<NightCircleData[]>({
    queryKey: ["/api/v1/circles"],
    refetchInterval: 30_000,
  });

  const quickJoinMutation = useMutation({
    mutationFn: async ({ mood, mode, size }: { mood: string; mode: JoinMode; size: "group" | "duo" }) => {
      const res = await apiRequest("POST", "/api/v1/circles/quick-join", { preferredEmotion: mood, preferredMode: mode, size });
      return res.json();
    },
    onSuccess: (data) => {
      const { circle, member, isAiSeed } = data.data;
      setActiveCircle(circle);
      setActiveMember(member);
      setActiveAiSeed(isAiSeed ? getRandomSeed() : null);
      setView("room");
      queryClient.invalidateQueries({ queryKey: ["/api/v1/circles"] });
    },
  });

  const manualJoinMutation = useMutation({
    mutationFn: async ({ circleId, mode }: { circleId: number; mode: JoinMode }) => {
      const res = await apiRequest("POST", `/api/v1/circles/${circleId}/join`, { mode });
      return res.json();
    },
    onSuccess: (data) => {
      const { circle, member, aiSeed } = data.data;
      setActiveCircle(circle);
      setActiveMember(member);
      setActiveAiSeed(aiSeed);
      setView("room");
      queryClient.invalidateQueries({ queryKey: ["/api/v1/circles"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ name, topic, category }: { name: string, topic?: string, category?: string }) => {
      const res = await apiRequest("POST", "/api/v1/circles", { name, maxMembers: 8, topic, category });
      return res.json();
    },
    onSuccess: (data) => {
      const circle = data.data;
      manualJoinMutation.mutate({ circleId: circle.id, mode: "speaker" });
    },
  });

  function getRandomSeed(): string {
    const seeds = [
      "What keeps you awake tonight?",
      "What are you feeling right now?",
      "What changed you recently?",
      "What are you carrying that no one else knows about?",
      "If this moment had a color, what would it be?",
    ];
    return seeds[Math.floor(Math.random() * seeds.length)];
  }

  if (view === "room" && activeCircle && activeMember) {
    return (
      <CircleRoom
        circle={activeCircle}
        member={activeMember}
        aiSeed={activeAiSeed}
        onLeave={() => {
          setView("lobby");
          setActiveCircle(null);
          setActiveMember(null);
          queryClient.invalidateQueries({ queryKey: ["/api/v1/circles"] });
        }}
      />
    );
  }

  const openCircles = circles.filter(c => c.state !== "ended" && c.state !== "closing");
  const closingCircles = circles.filter(c => c.state === "closing");

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      {/* Join flow overlay */}
      <AnimatePresence>
        {view === "join-flow" && (
          <JoinFlow
            onQuickJoin={(mood, mode, size) => {
              setView("lobby");
              quickJoinMutation.mutate({ mood, mode, size });
            }}
            onCancel={() => setView("lobby")}
            isPending={quickJoinMutation.isPending}
          />
        )}
        {view === "create-flow" && (
          <CreateRoomFlow
            onCancel={() => setView("lobby")}
            onCreate={({ name, topic, category }) => {
              setView("lobby");
              createMutation.mutate({ name, topic, category });
            }}
            isPending={createMutation.isPending}
          />
        )}
      </AnimatePresence>

      {/* ─── Sticky header ────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[#080810]/95 backdrop-blur-xl border-b border-white/6">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <button className="text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>

          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-white leading-tight">Night Circles</h1>
              <p className="text-[11px] text-gray-500 leading-tight">Anonymous group spaces</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("create-flow")}
              disabled={quickJoinMutation.isPending || createMutation.isPending}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Room
            </button>
            <button
              onClick={() => setView("join-flow")}
              disabled={quickJoinMutation.isPending}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-lg shadow-violet-500/20 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              Quick Join
            </button>
          </div>
        </div>
      </div>

      {/* ─── Content ──────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-5">

        {/* Privacy notice */}
        <div className="flex items-start gap-3 p-3.5 bg-violet-500/5 border border-violet-500/15 rounded-2xl mb-6 text-sm">
          <Lock className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
          <p className="text-gray-400 text-[13px] leading-relaxed">
            Every circle is <span className="text-violet-300 font-medium">anonymous</span>. You get a random alias. When you leave, you vanish.
          </p>
        </div>

        {/* Status legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6">
          {(Object.entries(STATE_CONFIG) as [CircleState, typeof STATE_CONFIG[CircleState]][]).map(([state, cfg]) => (
            <div key={state} className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </div>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {["All", ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors ${selectedCategoryFilter === cat ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "bg-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/10"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ─── Open Circles ─── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-gray-200">Open Circles</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {openCircles.length}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 bg-white/3 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : openCircles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-gray-600">
              <div className="w-16 h-16 rounded-2xl bg-white/3 flex items-center justify-center mb-4">
                <Moon className="w-8 h-8 opacity-30" />
              </div>
              <p className="text-sm font-medium text-gray-500">No open circles yet</p>
              <p className="text-xs mt-1 text-gray-600">Be the first — Quick Join to start one.</p>
              <button
                onClick={() => setView("join-flow")}
                className="mt-4 text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1.5 bg-violet-500/10 px-3 py-2 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" /> Start a Circle
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence>
                {openCircles
                  .filter(c => selectedCategoryFilter === "All" || c.category === selectedCategoryFilter)
                  .map(c => (
                    <CircleLobbyCard
                      key={c.id}
                      circle={c}
                      onJoin={(id) => manualJoinMutation.mutate({ circleId: id, mode: "listener" })}
                    />
                  ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* ─── Closing Soon ─── */}
        {closingCircles.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Circle className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-gray-400">Closing Soon</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {closingCircles.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {closingCircles.map(c => (
                <CircleLobbyCard key={c.id} circle={c} onJoin={(id) => manualJoinMutation.mutate({ circleId: id, mode: "listener" })} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Create Custom Room Flow ───

function CreateRoomFlow({
  onCreate,
  onCancel,
  isPending,
}: {
  onCreate: (data: { name: string, topic?: string, category?: string }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="w-full max-w-md bg-[#0e0e1a] border border-white/8 rounded-3xl p-6 space-y-5 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-lg">Create Custom Room</h2>
            <p className="text-gray-500 text-sm mt-0.5">Start your own night circle</p>
          </div>
          <button onClick={onCancel} className="text-gray-600 hover:text-gray-300 transition-colors text-sm">Cancel</button>
        </div>

        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 block">Room Name</label>
          <Input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Philosophical Depths"
            className="bg-[#151525] border-white/8 text-white focus:border-violet-500/50 focus:ring-0 focus-visible:ring-0"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 block">Category</label>
          <select
            value={category} onChange={e => setCategory(e.target.value)}
            className="w-full h-10 px-3 py-2 bg-[#151525] border border-white/8 text-white text-sm rounded-md focus:border-violet-500/50 outline-none"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2 block">Topic / Description (Optional)</label>
          <Input
            value={topic} onChange={e => setTopic(e.target.value)}
            placeholder="What exactly are we discussing?"
            maxLength={100}
            className="bg-[#151525] border-white/8 text-white focus:border-violet-500/50 focus:ring-0 focus-visible:ring-0"
          />
        </div>

        <Button
          onClick={() => onCreate({ name, topic, category })}
          disabled={isPending || !name.trim()}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-6 text-sm font-semibold shadow-lg shadow-violet-500/20"
        >
          {isPending ? "Creating Room…" : "✦ Open Room"}
        </Button>
      </motion.div>
    </motion.div>
  );
}