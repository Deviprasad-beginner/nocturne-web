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
  ArrowLeft, Users, Zap, Moon, Star, Send, LogOut,
  Circle, Activity, MessageCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type CircleState = "forming" | "active" | "deep_phase" | "closing" | "ended";
type JoinMode = "silent" | "listener" | "speaker";

interface NightCircleData {
  id: number;
  name: string;
  state: CircleState;
  currentMembers: number;
  maxMembers: number;
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
  timestamp?: string;
  createdAt?: string;
  isAi?: boolean;
  isSystem?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LIFECYCLE_COLORS: Record<CircleState, string> = {
  forming: "from-indigo-900/40 to-blue-900/30 border-indigo-700/40",
  active: "from-violet-900/40 to-purple-900/30 border-violet-700/40",
  deep_phase: "from-purple-900/50 to-fuchsia-900/30 border-fuchsia-700/50",
  closing: "from-gray-900/40 to-gray-800/30 border-gray-700/30",
  ended: "from-gray-900/20 to-black/20 border-gray-800/20",
};

const LIFECYCLE_LABELS: Record<CircleState, string> = {
  forming: "Forming…",
  active: "Active",
  deep_phase: "Deep Phase",
  closing: "Closing Soon",
  ended: "Ended",
};

const LIFECYCLE_DOT: Record<CircleState, string> = {
  forming: "bg-indigo-400 animate-pulse",
  active: "bg-green-400 animate-pulse",
  deep_phase: "bg-fuchsia-400 animate-pulse",
  closing: "bg-amber-400",
  ended: "bg-gray-600",
};

const EMOTION_COLORS: Record<string, string> = {
  calm: "text-sky-300",
  deep: "text-violet-300",
  emotional: "text-pink-300",
  lonely: "text-blue-300",
  curious: "text-amber-300",
  chaotic: "text-red-300",
  neutral: "text-gray-300",
};

const MOODS = ["calm", "curious", "lonely", "deep", "emotional", "chaotic"];
const MODE_LABELS: Record<JoinMode, string> = {
  silent: "Silent Witness",
  listener: "Listener",
  speaker: "Speaker",
};

// ─── Subcomponents ────────────────────────────────────────────────────────────

function VibeBar({ score = 0, emotion = "neutral" }: { score?: number; emotion?: string }) {
  const color = EMOTION_COLORS[emotion] ?? "text-gray-300";
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs mb-1">
        <span className={`${color} capitalize font-medium`}>{emotion}</span>
        <span className="text-gray-500">vibe {score}%</span>
      </div>
      <div className="h-1 rounded-full bg-gray-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1 }}
        />
      </div>
    </div>
  );
}

function CircleCard({ circle, onJoin }: { circle: NightCircleData; onJoin: (id: number) => void }) {
  const gradient = LIFECYCLE_COLORS[circle.state] ?? LIFECYCLE_COLORS.forming;
  const dotColor = LIFECYCLE_DOT[circle.state];
  const label = LIFECYCLE_LABELS[circle.state];
  const isFull = (circle.currentMembers ?? 0) >= (circle.maxMembers ?? 8);
  const capacity = `${circle.currentMembers ?? 0} / ${circle.maxMembers ?? 8}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-gradient-to-br ${gradient} border rounded-2xl p-5 flex flex-col gap-3 cursor-pointer hover:scale-[1.02] transition-transform`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-white font-semibold text-sm">{circle.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        </div>
        <Badge className="bg-white/10 text-gray-300 text-xs">{capacity}</Badge>
      </div>

      {circle.primaryEmotion && (
        <VibeBar score={circle.vibeScore} emotion={circle.primaryEmotion} />
      )}

      <Button
        onClick={() => onJoin(circle.id)}
        disabled={isFull || circle.state === "ended"}
        size="sm"
        className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs"
      >
        {isFull ? "Circle Full" : "Enter Circle"}
      </Button>
    </motion.div>
  );
}

// ─── Circle Room View ─────────────────────────────────────────────────────────

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
  const [liveCircle, setLiveCircle] = useState(circle);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();

  // Load initial messages
  const { data: initialMessages } = useQuery<CircleMsg[]>({
    queryKey: [`/api/v1/circles/${circle.id}/messages`],
  });

  useEffect(() => {
    if (initialMessages) {
      const msgs: CircleMsg[] = [...initialMessages].reverse();
      if (aiSeed) {
        msgs.unshift({ senderAlias: "Night", content: aiSeed, isAi: true });
      }
      setMessages(msgs);
    }
  }, [initialMessages, aiSeed]);

  // WebSocket for real-time events
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "CIRCLE_JOIN",
        circleId: circle.id,
        alias: member.alias,
        lifecycle: circle.state,
      }));
    };

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);

      if (msg.type === "CIRCLE_MESSAGE") {
        setMessages(prev => [...prev, {
          senderAlias: msg.alias,
          content: msg.content,
          timestamp: msg.timestamp,
        }]);
      }

      if (msg.type === "MEMBER_JOINED" || msg.type === "MEMBER_LEFT") {
        setMessages(prev => [...prev, {
          senderAlias: "System",
          content: msg.type === "MEMBER_JOINED"
            ? `${msg.alias} entered the circle`
            : `${msg.alias} left the circle`,
          isSystem: true,
        }]);
        setLiveCircle(prev => ({ ...prev, currentMembers: msg.memberCount }));
      }

      if (msg.type === "LIFECYCLE_CHANGED") {
        setLiveCircle(prev => ({ ...prev, state: msg.state, currentMembers: msg.memberCount }));
      }

      if (msg.type === "EMOTION_UPDATED") {
        setLiveCircle(prev => ({ ...prev, primaryEmotion: msg.primaryEmotion, vibeScore: msg.vibeScore }));
      }

      if (msg.type === "CIRCLE_ENDED") {
        setMessages(prev => [...prev, {
          senderAlias: "System",
          content: "This circle has dissolved into the night.",
          isSystem: true,
        }]);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "CIRCLE_LEAVE", circleId: circle.id, alias: member.alias }));
      }
      ws.close();
    };
  }, [circle.id, member.alias, circle.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/v1/circles/${circle.id}/messages`, {
        senderAlias: member.alias,
        content,
      });
      return res.json();
    },
    onSuccess: (data) => {
      const savedMsg = data?.data;
      if (savedMsg) {
        setMessages(prev => [...prev, {
          id: savedMsg.id,
          senderAlias: member.alias,
          content: savedMsg.content,
          createdAt: savedMsg.createdAt,
        }]);
      }
      // Also broadcast via WS
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "CIRCLE_MESSAGE",
          circleId: circle.id,
          alias: member.alias,
          content: input,
        }));
      }
    },
  });

  const handleSend = () => {
    const content = input.trim();
    if (!content) return;
    setInput("");
    if (member.mode !== "silent") sendMessageMutation.mutate(content);
  };

  const handleLeave = async () => {
    if (user) {
      await apiRequest("POST", `/api/v1/circles/${circle.id}/leave`, {});
    }
    onLeave();
  };

  const avatarEmoji = { moon_1: "🌙", moon_2: "🌕", moon_3: "🌑", star_1: "⭐", star_2: "✨", void_1: "🌌" } as Record<string, string>;
  const stateColor = LIFECYCLE_COLORS[liveCircle.state];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-950 via-[#0d0d1f] to-black text-white">
      {/* Header */}
      <div className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${stateColor} border-b border-white/5 backdrop-blur`}>
        <button onClick={handleLeave} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${LIFECYCLE_DOT[liveCircle.state]}`} />
            <span className="font-semibold truncate">{liveCircle.name}</span>
            <Badge className="bg-white/10 text-gray-300 text-xs">{LIFECYCLE_LABELS[liveCircle.state]}</Badge>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-gray-400">{liveCircle.currentMembers} present</span>
            {liveCircle.primaryEmotion && (
              <span className={`text-xs capitalize ${EMOTION_COLORS[liveCircle.primaryEmotion]}`}>
                ~ {liveCircle.primaryEmotion}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">You are</p>
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
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-xs text-gray-500 py-1"
                >
                  {msg.content}
                </motion.div>
              );
            }
            if (msg.isAi) {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <div className="bg-violet-900/30 border border-violet-700/30 rounded-2xl px-5 py-3 max-w-sm text-center">
                    <p className="text-xs text-violet-400 mb-1">✦ Night asks</p>
                    <p className="text-sm text-violet-100 italic">{msg.content}</p>
                  </div>
                </motion.div>
              );
            }
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  {!isMine && (
                    <span className="text-xs text-gray-500 ml-1">{msg.senderAlias}</span>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm ${isMine
                        ? "bg-violet-600/80 text-white rounded-tr-sm"
                        : "bg-gray-800/70 text-gray-100 rounded-tl-sm"
                      }`}
                  >
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
        <div className="px-4 py-4 text-center text-xs text-gray-500 border-t border-white/5">
          You joined as a <span className="text-gray-300 font-medium">Silent Witness</span>. Listen and breathe.
        </div>
      ) : (
        <div className="flex gap-2 px-4 py-3 border-t border-white/5 bg-black/20 backdrop-blur">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Speak into the night…"
            className="bg-gray-900/60 border-gray-700/50 text-white placeholder:text-gray-600 rounded-xl text-sm flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || sendMessageMutation.isPending}
            size="icon"
            className="bg-violet-600 hover:bg-violet-500 rounded-xl shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Join Flow overlay ────────────────────────────────────────────────────────

function JoinFlow({
  onQuickJoin,
  isPending,
}: {
  onQuickJoin: (mood: string, mode: JoinMode, size: "group" | "duo") => void;
  isPending: boolean;
}) {
  const [selectedMood, setSelectedMood] = useState("calm");
  const [selectedMode, setSelectedMode] = useState<JoinMode>("listener");
  const [selectedSize, setSelectedSize] = useState<"group" | "duo">("group");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-sm bg-gray-950 border border-violet-800/40 rounded-3xl p-6 space-y-5">
        <div className="text-center">
          <Moon className="w-8 h-8 mx-auto text-violet-400 mb-2" />
          <h2 className="text-white text-lg font-semibold">Enter the Night</h2>
          <p className="text-gray-400 text-sm mt-1">We'll find you the right circle.</p>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-3">How are you feeling?</p>
          <div className="grid grid-cols-3 gap-2">
            {MOODS.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMood(m)}
                className={`rounded-xl py-2 text-xs capitalize font-medium transition-all border ${selectedMood === m
                    ? "bg-violet-600/30 border-violet-500 text-violet-200"
                    : "bg-gray-900/40 border-gray-700/40 text-gray-400 hover:border-violet-700/40"
                  }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-3">How do you want to join?</p>
          <div className="flex flex-col gap-2">
            {(["silent", "listener", "speaker"] as JoinMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`rounded-xl py-2.5 px-4 text-sm text-left transition-all border ${selectedMode === mode
                    ? "bg-violet-600/30 border-violet-500 text-violet-100"
                    : "bg-gray-900/40 border-gray-700/40 text-gray-400 hover:border-violet-700/40"
                  }`}
              >
                <span className="font-medium">{MODE_LABELS[mode]}</span>
                <span className="text-xs ml-2 text-gray-500">
                  {mode === "silent" ? "(observe only)" : mode === "listener" ? "(can respond)" : "(full voice)"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-3">Connection Type?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSize("group")}
              className={`flex-1 rounded-xl py-2.5 px-4 text-sm transition-all border ${selectedSize === "group"
                  ? "bg-violet-600/30 border-violet-500 text-violet-100"
                  : "bg-gray-900/40 border-gray-700/40 text-gray-400 hover:border-violet-700/40"
                }`}
            >
              <div className="font-medium text-center">Campfire</div>
              <div className="text-[10px] text-gray-500 mt-0.5 text-center">Group (3-8)</div>
            </button>
            <button
              onClick={() => setSelectedSize("duo")}
              className={`flex-1 rounded-xl py-2.5 px-4 text-sm transition-all border ${selectedSize === "duo"
                  ? "bg-violet-600/30 border-violet-500 text-violet-100"
                  : "bg-gray-900/40 border-gray-700/40 text-gray-400 hover:border-violet-700/40"
                }`}
            >
              <div className="font-medium text-center">Bottle in the Ocean</div>
              <div className="text-[10px] text-gray-500 mt-0.5 text-center">1-on-1</div>
            </button>
          </div>
        </div>

        <Button
          onClick={() => onQuickJoin(selectedMood, selectedMode, selectedSize)}
          disabled={isPending}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl"
        >
          {isPending ? "Finding your circle…" : "✦ Quick Join"}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function NightCircles() {
  const { user } = useAuth();
  const [view, setView] = useState<"lobby" | "join-flow" | "room">("lobby");
  const [activeCircle, setActiveCircle] = useState<NightCircleData | null>(null);
  const [activeMember, setActiveMember] = useState<CircleMemberData | null>(null);
  const [activeAiSeed, setActiveAiSeed] = useState<string | null>(null);

  const { data: circles = [], isLoading } = useQuery<NightCircleData[]>({
    queryKey: ["/api/v1/circles"],
    refetchInterval: 30_000,
  });

  const quickJoinMutation = useMutation({
    mutationFn: async ({ mood, mode, size }: { mood: string; mode: JoinMode; size: "group" | "duo" }) => {
      const res = await apiRequest("POST", "/api/v1/circles/quick-join", {
        preferredEmotion: mood,
        preferredMode: mode,
        size,
      });
      return res.json();
    },
    onSuccess: (data) => {
      const { circle, member, isAiSeed } = data.data;
      setActiveCircle(circle);
      setActiveMember(member);
      setActiveAiSeed(isAiSeed ? nightCirclesService_getAiSeed() : null);
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

  // AI seed displayed from the server response (quick-join already returns it)
  function nightCirclesService_getAiSeed(): string {
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

  const activeCircles = circles.filter(c => c.state !== "ended" && c.state !== "closing");
  const sleepingCircles = circles.filter(c => c.state === "closing");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#0d0d1f] to-black text-white">
      {/* Join flow overlay */}
      <AnimatePresence>
        {view === "join-flow" && (
          <JoinFlow
            onQuickJoin={(mood, mode, size) => {
              setView("lobby");
              quickJoinMutation.mutate({ mood, mode, size });
            }}
            isPending={quickJoinMutation.isPending}
          />
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                <Moon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Night Circles</h1>
                <p className="text-xs text-gray-500">Anonymous intimate spaces</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setView("join-flow")}
            disabled={quickJoinMutation.isPending}
            className="bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl"
          >
            <Zap className="w-4 h-4" />
            {quickJoinMutation.isPending ? "Joining…" : "Quick Join"}
          </Button>
        </div>

        {/* Intro banner */}
        <div className="mb-8 p-4 bg-violet-900/20 border border-violet-700/30 rounded-2xl text-sm text-violet-200">
          Every circle is anonymous. You will be given an alias. When you leave, you vanish.
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-8">
          {(Object.entries(LIFECYCLE_LABELS) as [CircleState, string][]).map(([state, label]) => (
            <div key={state} className="flex items-center gap-1.5 text-xs text-gray-400">
              <div className={`w-2 h-2 rounded-full ${LIFECYCLE_DOT[state]}`} />
              {label}
            </div>
          ))}
        </div>

        {/* Active Circles */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-semibold">Open Circles</h2>
            <Badge className="bg-violet-500/20 text-violet-300 text-xs">{activeCircles.length}</Badge>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-gray-900/40 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : activeCircles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Moon className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No open circles yet.</p>
              <p className="text-xs mt-1">Be the first — Quick Join to start one.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {activeCircles.map(c => (
                  <CircleCard
                    key={c.id}
                    circle={c}
                    onJoin={(id) => manualJoinMutation.mutate({ circleId: id, mode: "listener" })}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Closing circles */}
        {sleepingCircles.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Circle className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-gray-400">Closing Soon</h2>
              <Badge className="bg-amber-500/20 text-amber-400 text-xs">{sleepingCircles.length}</Badge>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sleepingCircles.map(c => (
                <CircleCard key={c.id} circle={c} onJoin={(id) => manualJoinMutation.mutate({ circleId: id, mode: "listener" })} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}