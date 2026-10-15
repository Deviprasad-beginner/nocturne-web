import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/components/SEO";
import { MidnightPrompts } from "@/components/feed/MidnightPrompts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { WhisperMood } from "@shared/schema";
import {
  Moon,
  Sparkles,
  Clock,
  Filter,
  RefreshCw,
  Send,
  Loader2,
  AlertCircle,
  Radio,
  Lock,
  Globe,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FeedItem {
  id: string;
  content: string;
  mood: WhisperMood;
  createdAt: string;
  expiresAt: string;
  anonymousHandle: string;
}

interface FeedResponse {
  items: FeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
  count: number;
}

const MOODS: { key: WhisperMood | "all"; label: string; color: string; border: string; bg: string }[] = [
  { key: "all", label: "All Frequencies", color: "text-zinc-300", border: "border-white/10", bg: "bg-white/5" },
  { key: "lonely", label: "Lonely", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10" },
  { key: "restless", label: "Restless", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" },
  { key: "nostalgic", label: "Nostalgic", color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10" },
  { key: "inspired", label: "Inspired", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
  { key: "anxious", label: "Anxious", color: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10" },
  { key: "grateful", label: "Grateful", color: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/10" },
];

export default function FeedPage() {
  const [selectedMood, setSelectedMood] = useState<WhisperMood | "all">("all");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [composerMood, setComposerMood] = useState<WhisperMood>("lonely");
  const [composerVisibility, setComposerVisibility] = useState<"public" | "private" | "resonance">("public");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // TanStack Query v5 Infinite Query for Cursor Pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useInfiniteQuery<FeedResponse>({
    queryKey: ["/api/whispers/feed", selectedMood],
    queryFn: async ({ pageParam }) => {
      const url = new URL("/api/whispers/feed", window.location.origin);
      url.searchParams.set("limit", "20");
      if (pageParam) {
        url.searchParams.set("cursor", pageParam as string);
      }
      if (selectedMood !== "all") {
        url.searchParams.set("mood", selectedMood);
      }
      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error("Failed to load midnight feed");
      }
      return res.json();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    staleTime: 1000 * 30, // 30 seconds
  });

  // Whisper Creation Mutation
  const createWhisperMutation = useMutation({
    mutationFn: async (payload: { content: string; mood: WhisperMood; visibility: string }) => {
      const res = await fetch("/api/whispers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to whisper");
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/whispers/feed"] });
      setComposerText("");
      setIsComposerOpen(false);
      toast({
        title: "Whisper Cast Into the Night",
        description:
          composerVisibility === "private"
            ? "Saved to your private Sanctuary."
            : composerVisibility === "resonance"
            ? "Your whisper is now resonating in the matchmaking sphere."
            : "Shared with night wanderers until 6:00 AM.",
      });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Unable to Whisper",
        description: err.message || "The night remains silent. Please try again.",
      });
    },
  });

  const handleOpenPrompt = (promptText: string, mood: WhisperMood) => {
    setComposerText(promptText);
    setComposerMood(mood);
    setComposerVisibility("public");
    setIsComposerOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitWhisper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim() || createWhisperMutation.isPending) return;

    createWhisperMutation.mutate({
      content: composerText.trim(),
      mood: composerMood,
      visibility: composerVisibility,
    });
  };

  const allItems = data?.pages.flatMap((page) => page.items) || [];
  const isEmpty = !isLoading && allItems.length === 0;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-zinc-100 pb-24 pt-6 px-4 sm:px-6">
      <SEO
        title="Public Feed | Nocturne Midnight Whispers"
        description="Anonymous public whispers from night wanderers worldwide. Ephemeral, candid, and expiring at dawn."
      />

      <div className="max-w-3xl mx-auto">
        {/* Top Header & Frequency Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
                Live Nocturnal Stream
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              Midnight Feed
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Whispers evaporate at 6:00 AM. Zero identities, pure expression.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-white/[0.03] border-white/10 hover:bg-white/[0.08] text-zinc-300"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button
              onClick={() => setIsComposerOpen(!isComposerOpen)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-indigo-500/20"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              {isComposerOpen ? "Close" : "Whisper"}
            </Button>
          </div>
        </div>

        {/* Inline Composer Drawer / Form */}
        <AnimatePresence>
          {isComposerOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <form
                onSubmit={handleSubmitWhisper}
                className="p-5 sm:p-6 rounded-2xl bg-[#0e0e14] border border-indigo-500/30 shadow-2xl relative"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5" />
                    Share an Anonymous Whisper
                  </span>
                  <span className="text-xs text-zinc-500">
                    {composerText.length}/300
                  </span>
                </div>

                <Textarea
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  placeholder="What is keeping you awake tonight? Speak into the void..."
                  maxLength={300}
                  rows={3}
                  className="bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500 resize-none mb-4 text-base"
                />

                {/* Mood Selector Row */}
                <div className="mb-4">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-2">
                    Select Mood Frequency
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.filter((m) => m.key !== "all").map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setComposerMood(m.key as WhisperMood)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          composerMood === m.key
                            ? `${m.bg} ${m.border} ${m.color} ring-1 ring-white/20`
                            : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setComposerVisibility("public")}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                        composerVisibility === "public"
                          ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                          : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Public Feed
                    </button>
                    <button
                      type="button"
                      onClick={() => setComposerVisibility("private")}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                        composerVisibility === "private"
                          ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                          : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Private Sanctuary
                    </button>
                    <button
                      type="button"
                      onClick={() => setComposerVisibility("resonance")}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                        composerVisibility === "resonance"
                          ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                          : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      Resonance
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={!composerText.trim() || createWhisperMutation.isPending}
                    size="sm"
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium self-end"
                  >
                    {createWhisperMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    ) : (
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Cast Whisper
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mood Filtering Bar (Scrollable on Mobile, No Wrap) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-3 mb-6 flex-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
          <span className="text-xs uppercase tracking-wider text-zinc-500 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {MOODS.map((m) => (
            <button
              key={m.key}
              onClick={() => setSelectedMood(m.key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedMood === m.key
                  ? `${m.bg} ${m.border} ${m.color} shadow-sm ring-1 ring-white/10`
                  : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/10 hover:text-zinc-200"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Feed List or Empty State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-sm font-light tracking-wide">Listening to the quiet hours...</p>
          </div>
        ) : isError ? (
          <div className="p-8 rounded-2xl bg-red-950/20 border border-red-900/40 text-center">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <p className="text-rose-200 font-medium">Failed to tune into the feed</p>
            <p className="text-xs text-zinc-500 mt-1 mb-4">The night connection had a transient disturbance.</p>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="border-white/10 text-white">
              Try Reconnecting
            </Button>
          </div>
        ) : isEmpty ? (
          /* Empty State: Interactive Midnight Prompts */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <MidnightPrompts onSelectPrompt={handleOpenPrompt} />
          </motion.div>
        ) : (
          <div className="space-y-4">
            {allItems.map((whisper, index) => {
              const moodMeta = MOODS.find((m) => m.key === whisper.mood) || MOODS[1];
              let timeAgo = "Just now";
              try {
                timeAgo = formatDistanceToNow(new Date(whisper.createdAt), { addSuffix: true });
              } catch {}

              return (
                <motion.article
                  key={whisper.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
                  className="p-5 sm:p-6 rounded-2xl bg-[#0d0d12]/90 border border-white/[0.06] hover:border-white/[0.12] transition-all backdrop-blur-md relative group hover:shadow-xl hover:shadow-black/60"
                >
                  {/* Top Whisper Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-white/10 flex items-center justify-center text-xs font-semibold text-indigo-300">
                        {whisper.anonymousHandle.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-medium text-zinc-300 tracking-wide">
                          {whisper.anonymousHandle}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full border capitalize font-medium ${moodMeta.bg} ${moodMeta.border} ${moodMeta.color}`}
                      >
                        {whisper.mood}
                      </span>
                    </div>
                  </div>

                  {/* Whisper Content */}
                  <p className="text-base text-zinc-200 leading-relaxed font-light mb-4 whitespace-pre-wrap">
                    {whisper.content}
                  </p>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-white/[0.04]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {timeAgo}
                    </span>
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                      <Moon className="w-3 h-3 text-indigo-400/60" />
                      Expires at 6:00 AM
                    </span>
                  </div>
                </motion.article>
              );
            })}

            {/* Pagination Button */}
            {hasNextPage && (
              <div className="text-center pt-6">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="bg-white/[0.03] border-white/10 hover:bg-white/[0.08] text-zinc-300 px-6"
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Clock className="w-4 h-4 mr-2" />
                  )}
                  Listen Deeper (Older Whispers)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
