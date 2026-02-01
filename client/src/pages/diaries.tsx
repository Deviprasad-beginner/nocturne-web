import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Diary, InsertDiary } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CharacterCounter } from "@/components/common/CharacterCounter";
import { ArrowLeft, Notebook, Lock, Globe, Trash2, Calendar, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useCharacterLimit } from "@/hooks/useCharacterLimit";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@shared/schema";

export default function Diaries() {
  const [isCreating, setIsCreating] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const { toast } = useToast();
  const confirmDialog = useConfirmDialog();
  const { handleError } = useErrorHandler();

  // Character limit management with validation
  const charLimit = useCharacterLimit({
    maxLength: 1000,
    minLength: 10,
    warningThreshold: 0.9,
  });

  const { data: user } = useQuery<User | null>({
    queryKey: ['/api/user'],
  });

  const { data: diaries = [], isLoading } = useQuery<Diary[]>({
    queryKey: ['/api/v1/diaries'],
  });

  const createDiaryMutation = useMutation({
    mutationFn: async (newDiary: InsertDiary) => {
      const res = await apiRequest('POST', '/api/v1/diaries', newDiary);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/diaries'], refetchType: 'active' });
      charLimit.reset();
      setIsPrivate(false);
      setIsCreating(false);
      toast({
        title: "Entry Saved",
        description: "Your midnight musing has been archived.",
        style: { background: 'linear-gradient(to right, #eab308, #f97316)', color: 'white' }
      });
    },
    onError: (error) => {
      handleError(error, 'creating diary entry');
    }
  });

  const deleteDiaryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/v1/diaries/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/diaries'], refetchType: 'active' });
      toast({
        title: "Entry Deleted",
        description: "The memory has been erased.",
      });
    },
    onError: (error) => {
      handleError(error, 'deleting diary entry');
    }
  });

  /**
   * Handles form submission with validation
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to create diary entries.",
      });
      return;
    }

    if (charLimit.isUnderMin) {
      toast({
        variant: "destructive",
        title: "Entry Too Short",
        description: `Please write at least ${10 - charLimit.length} more characters.`,
      });
      return;
    }

    if (charLimit.isOverLimit) {
      toast({
        variant: "destructive",
        title: "Entry Too Long",
        description: `Please remove ${charLimit.length - 1000} characters.`,
      });
      return;
    }

    createDiaryMutation.mutate({
      content: charLimit.value.trim(),
      mood: "contemplative",
      isPublic: !isPrivate,
      authorId: user.id
    });
  };

  /**
   * Handles delete with confirmation dialog
   */
  const handleDelete = async (diaryId: number) => {
    const confirmed = await confirmDialog.confirm({
      title: "Delete Diary Entry",
      description: "This entry will be permanently deleted. This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });

    if (confirmed) {
      deleteDiaryMutation.mutate(diaryId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Notebook className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Night Diaries</h1>
            </div>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
          >
            {isCreating ? "Cancel" : "Write Entry"}
          </Button>
        </div>

        <div className="mb-6 p-4 bg-yellow-900/30 rounded-lg border border-yellow-700/50">
          <p className="text-sm text-yellow-200">
            <span className="font-medium">Neural Archive Protocol:</span> Secure cognitive data storage for nocturnal consciousness patterns.
            Advanced sentiment analysis and privacy encryption ensure your midnight reflections remain authentically preserved.
          </p>
        </div>

        {/* Create Form */}
        {isCreating && (
          <Card className="mb-8 bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl">New Diary Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Your Thoughts</Label>
                  <Textarea
                    id="content"
                    value={charLimit.value}
                    onChange={(e) => charLimit.setValue(e.target.value)}
                    placeholder="Share your midnight musings... What's keeping you up tonight?"
                    rows={6}
                    className={`bg-gray-700/50 border-gray-600 text-white resize-none ${charLimit.isOverLimit ? 'border-red-500 focus:border-red-500' :
                      charLimit.isNearLimit ? 'border-yellow-500' : ''
                      }`}
                    aria-describedby="char-counter"
                    aria-invalid={charLimit.isOverLimit || charLimit.isUnderMin}
                  />
                  <CharacterCounter
                    current={charLimit.length}
                    max={1000}
                    min={10}
                    showError={true}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="private"
                    checked={isPrivate}
                    onCheckedChange={setIsPrivate}
                    aria-label="Toggle privacy"
                  />
                  <Label htmlFor="private" className="flex items-center space-x-2 cursor-pointer">
                    {isPrivate ? <Lock className="w-4 h-4" aria-hidden="true" /> : <Globe className="w-4 h-4" aria-hidden="true" />}
                    <span>{isPrivate ? "Private Entry" : "Public Entry"}</span>
                  </Label>
                </div>

                {!user && (
                  <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-md">
                    <p className="text-sm text-red-400">⚠️ You must be logged in to create entries.</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={
                    !user ||
                    charLimit.isUnderMin ||
                    charLimit.isOverLimit ||
                    createDiaryMutation.isPending ||
                    charLimit.length === 0
                  }
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Publish diary entry"
                >
                  {createDiaryMutation.isPending ? (
                    <>
                      <span className="mr-2">Publishing...</span>
                      <span className="animate-spin">⏳</span>
                    </>
                  ) : (
                    "Publish Entry"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Diaries List */}
        <div className="space-y-6">
          <AnimatePresence>
            {isLoading ? (
              Array(2).fill(0).map((_, i) => (
                <Card key={i} className="bg-yellow-900/10 border-yellow-700/20">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex space-x-4">
                      <Skeleton className="w-12 h-12 rounded-full bg-yellow-700/20" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4 bg-yellow-700/20" />
                        <Skeleton className="h-4 w-1/3 bg-yellow-700/20" />
                      </div>
                    </div>
                    <Skeleton className="h-20 w-full bg-yellow-700/10" />
                  </CardContent>
                </Card>
              ))
            ) : diaries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-gray-400 py-12"
              >
                <Notebook className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-xl mb-2">No diary entries yet</p>
                <p>Be the first to share your midnight thoughts!</p>
              </motion.div>
            ) : (
              diaries.map((diary, index) => {
                const isOwner = user && diary.authorId === user.id;

                return (
                  <motion.div
                    key={diary.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-800/40 border-gray-700 hover:border-yellow-500/30 transition-all duration-300 group overflow-hidden">
                      <CardContent className="p-6 relative">
                        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Notebook className="w-24 h-24 text-yellow-500" />
                        </div>

                        <div className="flex items-start justify-between mb-4 relative z-10">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/80 to-orange-500/80 rounded-full flex items-center justify-center shadow-lg shadow-orange-900/20 group-hover:scale-105 transition-transform">
                              <Edit3 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-bold text-yellow-100 uppercase tracking-tight">
                                  {diary.authorId ? `Journalist #${diary.authorId}` : "Anonymous Seeker"}
                                </p>
                                {isOwner && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px]">YOU</Badge>}
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500 font-mono">
                                <Calendar className="w-3 h-3 text-yellow-600" />
                                <span>{diary.createdAt ? new Date(diary.createdAt).toLocaleDateString() : 'Unknown Date'}</span>
                                <span>• {diary.createdAt ? new Date(diary.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown Time'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1.5 px-2 py-1 bg-black/30 rounded-full border border-gray-700">
                              {!diary.isPublic ? <Lock className="w-3 h-3 text-red-400" /> : <Globe className="w-3 h-3 text-green-400" />}
                              <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">
                                {!diary.isPublic ? "Private" : "Public"}
                              </span>
                            </div>
                            {isOwner && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                                onClick={() => handleDelete(diary.id)}
                                disabled={deleteDiaryMutation.isPending}
                                aria-label="Delete diary entry"
                              >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-200 leading-relaxed text-lg border-l-2 border-yellow-800/30 pl-4 py-1 italic relative z-10">
                          "{diary.content}"
                        </p>
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
          isLoading={deleteDiaryMutation.isPending}
        />
      </div>
    </div>
  );
}