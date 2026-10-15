import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { WhisperMood } from "@shared/schema";
import {
  Lock,
  Moon,
  Feather,
  Clock,
  Sparkles,
  Shield,
  Send,
  Loader2,
  BookOpen,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SanctuaryWhisper {
  id: string;
  content: string;
  mood: WhisperMood;
  visibility: "private";
  createdAt: string;
  expiresAt: string;
}

const MOODS: { key: WhisperMood; label: string }[] = [
  { key: "lonely", label: "Lonely" },
  { key: "restless", label: "Restless" },
  { key: "nostalgic", label: "Nostalgic" },
  { key: "inspired", label: "Inspired" },
  { key: "anxious", label: "Anxious" },
  { key: "grateful", label: "Grateful" },
];

export default function SanctuaryPage() {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<WhisperMood>("lonely");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery<{
    items: SanctuaryWhisper[];
    anonymousHandle: string;
  }>({
    queryKey: ["/api/whispers/sanctuary"],
    queryFn: async () => {
      const res = await fetch("/api/whispers/sanctuary");
      if (!res.ok) throw new Error("Failed to load sanctuary");
      return res.json();
    },
  });

  const createPrivateWhisperMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/whispers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          mood,
          visibility: "private",
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || resData.error || "Failed to save entry");
      return resData;
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/whispers/sanctuary"] });
      toast({
        title: "Saved in Sanctuary",
        description: "Your private thought has been preserved in complete secrecy.",
      });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Could Not Save",
        description: err.message || "An unexpected error occurred.",
      });
    },
  });

  const items = data?.items || [];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-zinc-100 pb-24 pt-6 px-4 sm:px-6">
      <SEO
        title="Sanctuary | Nocturne Private Journal"
        description="Your sacred midnight sanctuary. Completely private, safe, and shielded from the public gaze."
      />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Lock className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold">
              Encrypted Personal Vault
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Your Private Sanctuary
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Thoughts inscribed here remain solely yours. They never enter the public stream or matching queue.
          </p>
        </div>

        {/* Private Compose Box */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0d0d12] border border-white/[0.08] mb-10 shadow-2xl relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Feather className="w-3.5 h-3.5 text-purple-400" />
              Inscribe a Private Whisper
            </span>
            <span className="text-xs text-zinc-500">{content.length}/300</span>
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Confide here in complete confidence. What are you holding onto tonight?"
            maxLength={300}
            rows={3}
            className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-purple-500 resize-none mb-4 text-base"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMood(m.key)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    mood === m.key
                      ? "bg-purple-500/20 border-purple-500/40 text-purple-300 ring-1 ring-purple-500/20"
                      : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <Button
              onClick={() => createPrivateWhisperMutation.mutate()}
              disabled={!content.trim() || createPrivateWhisperMutation.isPending}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium self-end"
            >
              {createPrivateWhisperMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <Lock className="w-3.5 h-3.5 mr-1.5" />
              )}
              Inscribe to Sanctuary
            </Button>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Previous Inscriptions ({items.length})
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0d0d12]/50 border border-white/5 text-center">
              <Lock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-300 font-medium">Your Sanctuary is peaceful and empty.</p>
              <p className="text-xs text-zinc-500 mt-1">
                Any whisper marked with "Private Sanctuary" will be safeguarded here.
              </p>
            </div>
          ) : (
            items.map((whisper) => {
              let timeAgo = "Just now";
              try {
                timeAgo = formatDistanceToNow(new Date(whisper.createdAt), { addSuffix: true });
              } catch {}

              return (
                <motion.div
                  key={whisper.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-[#0d0d12] border border-white/[0.06] backdrop-blur-md relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 capitalize font-medium">
                      {whisper.mood}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-200 leading-relaxed font-light whitespace-pre-wrap">
                    {whisper.content}
                  </p>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
