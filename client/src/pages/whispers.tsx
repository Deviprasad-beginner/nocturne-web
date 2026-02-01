import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Whisper, InsertWhisper } from "@shared/schema";
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

  const createWhisperMutation = useMutation({
    mutationFn: async (newWhisper: InsertWhisper) => {
      const res = await apiRequest('POST', '/api/v1/whispers', newWhisper);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/whispers'], refetchType: 'active' });
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

  const likeWhisperMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/v1/whispers/${id}/like`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/whispers'] });
    },
    onError: (error) => {
      handleError(error, 'liking whisper');
    }
  });

  const deleteWhisperMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/v1/whispers/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/whispers'], refetchType: 'active' });
      toast({
        title: "Whisper Deleted",
        description: "Your whisper has vanished into the void.",
      });
    },
    onError: (error) => {
      handleError(error, 'deleting whisper');
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

  /**
   * Handles delete with confirmation
   */
  const handleDelete = async (whisperId: number) => {
    const confirmed = await confirmDialog.confirm({
      title: "Delete Whisper",
      description: "This whisper will be permanently deleted. This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });

    if (confirmed) {
      deleteWhisperMutation.mutate(whisperId);
    }
  };

  const handleLike = (id: number) => {
    likeWhisperMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-3xl font-bold">Whispers</h1>
            </div>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 w-full sm:w-auto"
          >
            {isCreating ? "Cancel" : "Share Whisper"}
          </Button>
        </div>

        <div className="mb-6 p-4 bg-indigo-900/30 rounded-lg border border-indigo-700/50">
          <p className="text-sm text-indigo-200">
            <span className="font-medium">Quantum Whisper Network:</span> Anonymous thought transmission system utilizing zero-knowledge cryptography.
            Deploy unfiltered cognitive fragments into the collective subconscious with absolute identity protection.
          </p>
        </div>

        {/* Create Form */}
        {isCreating && (
          <Card className="mb-8 bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl">Share Anonymous Whisper</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    value={charLimit.value}
                    onChange={(e) => charLimit.setValue(e.target.value)}
                    placeholder="What weighs on your mind tonight? Share anonymously..."
                    rows={4}
                    className={`bg-gray-700/50 border-gray-600 text-white resize-none ${charLimit.isOverLimit ? 'border-red-500 focus:border-red-500' :
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
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Share whisper"
                >
                  {createWhisperMutation.isPending ? (
                    <>
                      <span className="mr-2">Sharing...</span>
                      <span className="animate-spin">⏳</span>
                    </>
                  ) : (
                    "Share Whisper"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Whispers List */}
        <div className="space-y-4">
          <AnimatePresence>
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="bg-gray-800/30 border-gray-700">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-4 w-3/4 bg-gray-700/50" />
                    <Skeleton className="h-4 w-1/2 bg-gray-700/50" />
                    <div className="flex justify-between items-center pt-2">
                      <Skeleton className="h-4 w-32 bg-gray-700/50" />
                      <Skeleton className="h-8 w-12 bg-gray-700/50" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : whispers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-gray-400 py-12"
              >
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-xl mb-2">No whispers yet</p>
                <p>Be the first to share an anonymous thought!</p>
              </motion.div>
            ) : (
              whispers.map((whisper, index) => {
                const isOwner = user && whisper.authorId === user.id;

                return (
                  <motion.div
                    key={whisper.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all hover:border-indigo-500/30 group">
                      <CardContent className="p-6">
                        <p className="text-gray-200 leading-relaxed mb-4 text-lg italic italic-indigo-100">
                          "{whisper.content}"
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono text-indigo-400/70">ANON-ID-{whisper.id.toString().padStart(4, '0')}</span>
                            <span className="text-xs text-gray-500">
                              • {whisper.createdAt ? new Date(whisper.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(whisper.id)}
                              disabled={likeWhisperMutation.isPending}
                              className="text-gray-400 hover:text-pink-400 transition-all hover:bg-pink-400/10 rounded-full"
                            >
                              <Heart className={`w-4 h-4 mr-1 ${whisper.hearts ? 'fill-pink-500 text-pink-500' : ''}`} />
                              <span className={whisper.hearts ? 'text-pink-400' : ''}>{whisper.hearts || 0}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-indigo-400 rounded-full">
                              <Share2 className="w-4 h-4" aria-hidden="true" />
                            </Button>
                            {isOwner && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                                onClick={() => handleDelete(whisper.id)}
                                disabled={deleteWhisperMutation.isPending}
                                aria-label="Delete whisper"
                              >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
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
          isLoading={deleteWhisperMutation.isPending}
        />
      </div>
    </div>
  );
}