import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Whisper, InsertWhisper, GlobalConsciousness } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CharacterCounter } from "@/components/common/CharacterCounter";
import { ArrowLeft, MessageCircle, Heart, Share2, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useCharacterLimit } from "@/hooks/useCharacterLimit";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@shared/schema";
import { WhisperCard } from "@/components/whisper/WhisperCard";
import { EmotionVisualizer } from "@/components/whisper/EmotionVisualizer";

export default function Whispers() {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const confirmDialog = useConfirmDialog();
  const { handleError } = useErrorHandler();

  // Character limit management
  const charLimit = useCharacterLimit({
    maxLength: 280,
    minLength: 5,
    warningThreshold: 0.9,
  });

  const { data: user } = useQuery<User | null>({
    queryKey: ['/api/user'],
  });

  const { data: whispers = [], isLoading } = useQuery<Whisper[]>({
    queryKey: ['/api/v1/whispers'],
  });

  const { data: consciousness } = useQuery<GlobalConsciousness>({
    queryKey: ['/api/v1/consciousness'],
    refetchInterval: 30000, // Update every 30s
  });

  const createWhisperMutation = useMutation({
    mutationFn: async (newWhisper: InsertWhisper) => {
      const res = await apiRequest('POST', '/api/v1/whispers', newWhisper);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/whispers'], refetchType: 'active' });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/consciousness'] });
      charLimit.reset();
      setIsCreating(false);
      toast({
        title: "Whisper Shared",
        description: "Your anonymous thought has been released into the night.",
        style: { background: 'linear-gradient(to right, #6366f1, #a855f7)', color: 'white' }
      });
    },
    onError: (error) => {
      handleError(error, 'creating whisper');
    }
  });

  const interactMutation = useMutation({
    mutationFn: async ({ id, type }: { id: number, type: 'resonate' | 'echo' | 'absorb' }) => {
      const res = await apiRequest('POST', `/api/v1/whispers/${id}/interaction`, { type });
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/whispers'] });
      toast({
        title: `Interaction Recorded`,
        description: `You ${variables.type}d with a whisper.`,
      });
    },
    onError: (error) => {
      handleError(error, 'interacting with whisper');
    }
  });

  /**
   * Handles form submission with validation
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (charLimit.isUnderMin) {
      toast({
        variant: "destructive",
        title: "Whisper Too Short",
        description: `Please write at least ${5 - charLimit.length} more characters.`,
      });
      return;
    }

    if (charLimit.isOverLimit) {
      toast({
        variant: "destructive",
        title: "Whisper Too Long",
        description: `Please remove ${charLimit.length - 280} characters.`,
      });
      return;
    }

    createWhisperMutation.mutate({
      content: charLimit.value.trim()
    });
  };

  const handleInteraction = (id: number, type: 'resonate' | 'echo' | 'absorb') => {
    interactMutation.mutate({ id, type });
  };

  return (
    <div className="min-h-screen text-white p-3 sm:p-6 relative overflow-hidden">

      <EmotionVisualizer dominantEmotion={consciousness?.currentDominantEmotion || 'neutral'} />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white backdrop-blur-sm bg-black/20">
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20">
                <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Whispers</h1>
                <p className="text-xs text-indigo-300/80 font-mono mt-1">
                  Global Stability: {consciousness?.realmStability || 100}% • {consciousness?.activityLevel?.toUpperCase() || 'CALM'}
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 w-full sm:w-auto transition-all duration-300 hover:scale-105"
          >
            {isCreating ? "Cancel" : "Share Whisper"}
          </Button>
        </div>

        {/* Create Form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <Card className="bg-black/40 border-indigo-500/30 backdrop-blur-xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-xl text-indigo-100">Share Anonymous Whisper</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        value={charLimit.value}
                        onChange={(e) => charLimit.setValue(e.target.value)}
                        placeholder="What weighs on your mind tonight? Share anonymously..."
                        rows={4}
                        className={`bg-white/5 border-white/10 text-white resize-none focus:bg-white/10 transition-all ${charLimit.isOverLimit ? 'border-red-500 focus:border-red-500' :
                          charLimit.isNearLimit ? 'border-yellow-500' : ''
                          }`}
                        aria-describedby="whisper-char-counter"
                        aria-invalid={charLimit.isOverLimit || charLimit.isUnderMin}
                      />
                      <CharacterCounter
                        current={charLimit.length}
                        max={280}
                        min={5}
                        showError={true}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={
                        charLimit.isUnderMin ||
                        charLimit.isOverLimit ||
                        createWhisperMutation.isPending ||
                        charLimit.length === 0
                      }
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all active:scale-95"
                      aria-label="Share whisper"
                    >
                      {createWhisperMutation.isPending ? (
                        <>
                          <span className="mr-2">Sharing...</span>
                          <span className="animate-spin">⏳</span>
                        </>
                      ) : (
                        "Release into the Void"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Whispers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-white/5 rounded-xl animate-pulse" />
              ))
            ) : whispers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center text-gray-400 py-20 flex flex-col items-center"
              >
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <MessageCircle className="w-10 h-10 opacity-30" />
                </div>
                <p className="text-xl mb-2 font-light">The void is silent.</p>
                <p className="text-sm opacity-50">Be the first to whisper into the darkness.</p>
              </motion.div>
            ) : (
              whispers.map((whisper, index) => (
                <WhisperCard
                  key={whisper.id}
                  whisper={whisper}
                  onInteract={handleInteraction}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={confirmDialog.isOpen}
          onOpenChange={confirmDialog.handleCancel}
          onConfirm={confirmDialog.handleConfirm}
          title={confirmDialog.config?.title || ''}
          description={confirmDialog.config?.description || ''}
          confirmText={confirmDialog.config?.confirmText}
          cancelText={confirmDialog.config?.cancelText}
          variant={confirmDialog.config?.variant}
          isLoading={false}
        />
      </div>
    </div>
  );
}