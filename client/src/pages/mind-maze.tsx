import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MindMaze, MindMazeSpark } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Brain, Sparkles, ChevronRight,
  FlaskConical, Feather, Heart, X, ChevronDown
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Domain definitions — add new ones here only
// ─────────────────────────────────────────────────────────────────────────────

type Domain = typeof DOMAINS[number];

const DOMAINS = [
  { id: "existence", label: "Existence", icon: "🌑", color: "violet" },
  { id: "emotion", label: "Emotion", icon: "🌊", color: "rose" },
  { id: "society", label: "Society", icon: "🏛️", color: "amber" },
  { id: "time-memory", label: "Time & Memory", icon: "🕰️", color: "cyan" },
  { id: "logic", label: "Logic & Paradox", icon: "🔬", color: "green" },
  { id: "tech-ethics", label: "Tech & Ethics", icon: "⚡", color: "blue" },
] as const;

const DOMAIN_COLORS: Record<string, string> = {
  violet: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  rose: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  amber: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  green: "bg-green-500/10 text-green-300 border-green-500/20",
  blue: "bg-blue-500/10 text-blue-300 border-blue-500/20",
};

const DOMAIN_ACTIVE: Record<string, string> = {
  violet: "bg-violet-600 text-white shadow-violet-500/20",
  rose: "bg-rose-600 text-white shadow-rose-500/20",
  amber: "bg-amber-600 text-white shadow-amber-500/20",
  cyan: "bg-cyan-600 text-white shadow-cyan-500/20",
  green: "bg-green-600 text-white shadow-green-500/20",
  blue: "bg-blue-600 text-white shadow-blue-500/20",
};

function getDomain(id: string | null | undefined) {
  return DOMAINS.find((d) => d.id === id);
}

// ─────────────────────────────────────────────────────────────────────────────
// SparkCard
// ─────────────────────────────────────────────────────────────────────────────

function SparkCard({
  spark,
  onResonate,
}: {
  spark: MindMazeSpark;
  onResonate: (id: number) => void;
}) {
  const isAnalytical = spark.sparkType === "analytical";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 border text-sm leading-relaxed ${isAnalytical
          ? "bg-cyan-950/30 border-cyan-500/15 text-cyan-100"
          : "bg-purple-950/30 border-purple-500/15 text-purple-100"
        }`}
    >
      <p className="mb-3">{spark.content}</p>
      <button
        onClick={() => onResonate(spark.id)}
        className={`flex items-center gap-1.5 text-xs opacity-50 hover:opacity-100 transition-opacity ${isAnalytical ? "text-cyan-400" : "text-purple-400"
          }`}
      >
        <Heart className="w-3 h-3" />
        {spark.resonance ?? 0} resonance
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MazeDetail — full-screen modal
// ─────────────────────────────────────────────────────────────────────────────

function MazeDetail({ maze, onClose }: { maze: MindMaze; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [sparkType, setSparkType] = useState<"analytical" | "abstract">("analytical");
  const [content, setContent] = useState("");
  const domain = getDomain(maze.domain);

  const { data: sparksData } = useQuery<{ data: MindMazeSpark[] }>({
    queryKey: [`/api/v1/mind-maze/${maze.id}/sparks`],
    enabled: !!maze.id,
  });

  const sparks = sparksData?.data ?? [];
  const analytical = sparks.filter((s) => s.sparkType === "analytical");
  const abstract = sparks.filter((s) => s.sparkType === "abstract");

  const createSparkMutation = useMutation({
    mutationFn: async (payload: { content: string; sparkType: string }) => {
      const res = await apiRequest("POST", `/api/v1/mind-maze/${maze.id}/sparks`, payload);
      return res.json();
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: [`/api/v1/mind-maze/${maze.id}/sparks`] });
    },
  });

  const resonateMutation = useMutation({
    mutationFn: async (sparkId: number) => {
      const res = await apiRequest("POST", `/api/v1/mind-maze/sparks/${sparkId}/resonate`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/v1/mind-maze/${maze.id}/sparks`] });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col overflow-auto"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
          Back
        </button>
        {domain && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${DOMAIN_COLORS[domain.color]}`}>
            {domain.icon} {domain.label}
          </span>
        )}
        <button onClick={onClose} className="text-gray-700 hover:text-gray-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Paradox */}
      <div className="flex flex-col items-center px-6 pt-8 pb-6 text-center max-w-xl mx-auto w-full">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400/80 to-purple-500/80 flex items-center justify-center mb-5 shadow-xl shadow-purple-500/15">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-white leading-relaxed">{maze.content}</h2>
        <p className="text-gray-600 text-xs mt-3 tabular-nums">
          {analytical.length} analytical &nbsp;·&nbsp; {abstract.length} abstract
        </p>
      </div>

      {/* Spark input */}
      <div className="max-w-xl mx-auto w-full px-6 mb-6 flex-shrink-0">
        <div className="bg-[#0d0d1a] border border-white/6 rounded-2xl p-4">
          <div className="flex gap-2 mb-3">
            {(["analytical", "abstract"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSparkType(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${sparkType === t
                    ? t === "analytical"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-gray-600 hover:text-gray-400"
                  }`}
              >
                {t === "analytical" ? <FlaskConical className="w-3.5 h-3.5" /> : <Feather className="w-3.5 h-3.5" />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              sparkType === "analytical"
                ? "Break it down logically. What does reason say?"
                : "What does instinct, emotion, or imagery say?"
            }
            rows={3}
            className="bg-transparent border-0 text-white text-sm placeholder:text-gray-700 focus-visible:ring-0 focus-visible:outline-none resize-none mb-2"
          />
          <div className="flex justify-end">
            <Button
              onClick={() => createSparkMutation.mutate({ content, sparkType })}
              disabled={!content.trim() || createSparkMutation.isPending}
              size="sm"
              className={`rounded-xl text-xs px-4 ${sparkType === "analytical"
                  ? "bg-cyan-600 hover:bg-cyan-500"
                  : "bg-purple-600 hover:bg-purple-500"
                }`}
            >
              <Sparkles className="w-3 h-3 mr-1.5" />
              Spark
            </Button>
          </div>
        </div>
      </div>

      {/* Split view */}
      <div className="flex-1 grid grid-cols-2 max-w-3xl mx-auto w-full gap-px px-6 pb-8">
        <div className="flex flex-col gap-3 pr-4 border-r border-white/4">
          <p className="text-[11px] text-cyan-500/70 font-medium tracking-widest uppercase mb-1 flex items-center gap-1.5">
            <FlaskConical className="w-3 h-3" /> Analytical
          </p>
          {analytical.length === 0
            ? <p className="text-xs text-gray-700 italic mt-2">No one has reasoned through this yet.</p>
            : analytical.map((s) => <SparkCard key={s.id} spark={s} onResonate={resonateMutation.mutate} />)}
        </div>
        <div className="flex flex-col gap-3 pl-4">
          <p className="text-[11px] text-purple-500/70 font-medium tracking-widest uppercase mb-1 flex items-center gap-1.5 justify-end">
            Abstract <Feather className="w-3 h-3" />
          </p>
          {abstract.length === 0
            ? <p className="text-xs text-gray-700 italic mt-2 text-right">No one has felt their way through this yet.</p>
            : abstract.map((s) => <SparkCard key={s.id} spark={s} onResonate={resonateMutation.mutate} />)}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pose Paradox modal
// ─────────────────────────────────────────────────────────────────────────────

function PoseParadoxModal({
  onClose,
  onCreate,
  isPending,
}: {
  onClose: () => void;
  onCreate: (content: string, domain: string) => void;
  isPending: boolean;
}) {
  const [content, setContent] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        className="w-full max-w-lg bg-[#0d0d1a] border border-white/6 rounded-3xl p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold text-base">Pose a Paradox</h2>
            <p className="text-gray-600 text-xs mt-1">
              Ask something that splits into two valid answers.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-700 hover:text-gray-400 mt-0.5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Domain selector */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2.5">
            Choose a domain <span className="text-rose-500">*</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DOMAINS.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-all ${selectedDomain === d.id
                    ? `${DOMAIN_ACTIVE[d.color]} shadow-lg border-transparent`
                    : "border-white/6 text-gray-500 hover:text-gray-300 hover:border-white/12 hover:bg-white/3"
                  }`}
              >
                <span className="text-lg leading-none">{d.icon}</span>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">
            The Paradox
          </p>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ask the unanswerable. Pose the dilemma. Open the maze."
            rows={3}
            className="bg-[#151525] border-white/6 text-white text-sm placeholder:text-gray-700 focus-visible:ring-0 focus:border-white/15 resize-none"
          />
        </div>

        <Button
          onClick={() => selectedDomain && onCreate(content, selectedDomain)}
          disabled={!content.trim() || !selectedDomain || isPending}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-5 text-sm font-semibold"
        >
          {isPending ? "Opening…" : "✦ Open the Maze"}
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function MindMazePage() {
  const queryClient = useQueryClient();
  const [activeMaze, setActiveMaze] = useState<MindMaze | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const { data: mindMazeResp = [], isLoading } = useQuery<MindMaze[]>({
    queryKey: ["/api/v1/mind-maze"],
  });
  const mazes: MindMaze[] = Array.isArray(mindMazeResp)
    ? mindMazeResp
    : (mindMazeResp as any)?.data ?? [];

  const filtered = activeFilter === "all"
    ? mazes
    : mazes.filter((m) => m.domain === activeFilter);

  const createMazeMutation = useMutation({
    mutationFn: async ({ content, domain }: { content: string; domain: string }) => {
      const res = await apiRequest("POST", "/api/v1/mind-maze", { content, type: "synthesis", domain });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/mind-maze"] });
      setIsCreating(false);
    },
  });

  return (
    <>
      <AnimatePresence>
        {activeMaze && (
          <MazeDetail maze={activeMaze} onClose={() => setActiveMaze(null)} />
        )}
        {isCreating && (
          <PoseParadoxModal
            onClose={() => setIsCreating(false)}
            onCreate={(content, domain) => createMazeMutation.mutate({ content, domain })}
            isPending={createMazeMutation.isPending}
          />
        )}
      </AnimatePresence>

      <div
        className="min-h-screen text-white"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,60,180,0.08) 0%, transparent 65%), #080810" }}
      >
        <div className="max-w-2xl mx-auto px-4 pb-24 pt-6">

          {/* ── Header ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <button className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400/70 to-purple-500/70 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold">Mind Maze</span>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-3.5 py-2 rounded-xl transition-all"
            >
              + Pose Paradox
            </button>
          </div>

          {/* ── Tagline ─────────────────────────────────────────── */}
          <div className="mb-6 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-900/15 to-purple-900/15 border border-white/4 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="text-gray-200 font-medium">The Synthesis</span>
              {" "}— every question here has two honest answers. reason and feeling. choose which voice you will use.
            </p>
          </div>

          {/* ── Domain filter bar ────────────────────────────────── */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 hide-scrollbar -mx-4 px-4">
            <button
              onClick={() => setActiveFilter("all")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${activeFilter === "all"
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:text-gray-300"
                }`}
            >
              All
            </button>
            {DOMAINS.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveFilter(d.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${activeFilter === d.id
                    ? `${DOMAIN_ACTIVE[d.color]} border-transparent shadow-md`
                    : `border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/10`
                  }`}
              >
                <span>{d.icon}</span>
                {d.label}
              </button>
            ))}
          </div>

          {/* ── Maze cards ──────────────────────────────────────── */}
          <div className="space-y-2.5">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-white/3 animate-pulse" />
              ))
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-700">
                <Brain className="w-10 h-10 mx-auto mb-3 opacity-15" />
                <p className="text-sm">
                  {activeFilter === "all"
                    ? "No paradoxes yet. Open the first maze."
                    : `Nothing in ${getDomain(activeFilter)?.label ?? "this domain"} yet.`}
                </p>
              </div>
            ) : (
              filtered.map((maze: MindMaze) => {
                const domain = getDomain(maze.domain);
                return (
                  <motion.button
                    key={maze.id}
                    onClick={() => setActiveMaze(maze)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    className="w-full text-left bg-[#0d0d1a] border border-white/5 hover:border-white/10 rounded-2xl px-5 py-4 transition-all group"
                  >
                    {/* Domain badge */}
                    {domain && (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border mb-3 ${DOMAIN_COLORS[domain.color]}`}>
                        {domain.icon} {domain.label}
                      </span>
                    )}

                    <p className="text-sm text-gray-200 leading-relaxed line-clamp-2 mb-3">
                      {maze.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-cyan-600 flex items-center gap-1">
                          <FlaskConical className="w-3 h-3" /> Analytical
                        </span>
                        <span className="text-gray-800">·</span>
                        <span className="text-purple-600 flex items-center gap-1">
                          <Feather className="w-3 h-3" /> Abstract
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-700 group-hover:text-gray-500 transition-colors flex items-center gap-1">
                        Enter Maze <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}