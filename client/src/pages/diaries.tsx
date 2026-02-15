import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Diary, InsertDiary, NightlyPrompt } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CharacterCounter } from "@/components/common/CharacterCounter";
import { ArrowLeft, Notebook, Lock, Globe, Trash2, Calendar, Edit3, Flame, Sparkles, Moon, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useCharacterLimit } from "@/hooks/useCharacterLimit";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@shared/schema";

// Live Clock Component
const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-1 text-yellow-100/80 font-mono">
      <div className="text-4xl md:text-5xl font-light tracking-widest">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-sm uppercase tracking-[0.2em] opacity-60">
        {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
};

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

  const { data: prompt } = useQuery<NightlyPrompt>({
    queryKey: ['/api/v1/reflections/prompt?type=diary'],
  });

  const createDiaryMutation = useMutation({
    mutationFn: async (newDiary: InsertDiary) => {
      const res = await apiRequest('POST', '/api/v1/diaries', newDiary);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/diaries'], refetchType: 'active' });
      // Also invalidate user to update streak
      queryClient.invalidateQueries({ queryKey: ['/api/user'], refetchType: 'active' });

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

  const hasEntries = diaries.length > 0;
  // If no entries, we want the "Begin Tonight" experience.
  // If we have entries, we show the standard list but with the new header style.

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white p-6 md:p-10 overflow-x-hidden relative">
      {/* Background Atmosphere - Radial Moon Glow */}
      <div className="fixed top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen animate-pulse-slow" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-sm">
                <Moon className="w-5 h-5 text-indigo-200" />
              </div>
              <h1 className="text-2xl font-light tracking-wide text-indigo-100">Night Diaries</h1>
            </div>
          </div>

          <Button
            onClick={() => setIsCreating(!isCreating)}
            className={`transition-all duration-500 ${!hasEntries && !isCreating ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/50 hover:bg-indigo-500/30' : 'bg-gradient-to-r from-yellow-600/80 to-orange-700/80 hover:from-yellow-600 hover:to-orange-700 text-white'}`}
          >
            {isCreating ? "Cancel" : hasEntries ? "Write Entry" : "Begin Tonight"}
          </Button>
        </div>

        {/* Neural Archive Banner - Updated Copy */}
        <div className="mb-10 text-center">
          <p className="text-xs md:text-sm text-gray-500 font-light tracking-wide max-w-2xl mx-auto">
            Your midnight reflections are encrypted, gently analyzed, and preserved in your private neural archive.
          </p>
        </div>

        {/* Empty State / Creation Mode Container */}
        <AnimatePresence mode="wait">
          {!hasEntries && !isCreating ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center justify-center py-20 md:py-32 cursor-pointer group"
              onClick={() => setIsCreating(true)}
            >
              {/* Live Clock */}
              <div className="mb-12">
                <LiveClock />
              </div>

              {/* Main Prompt */}
              <div className="text-center space-y-4 relative">
                <h2 className="text-3xl md:text-5xl font-extralight text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 group-hover:to-gray-300 transition-all duration-700">
                  Tonight is unwritten.
                </h2>
                <p className="text-lg md:text-xl text-gray-400 font-light tracking-wide group-hover:text-gray-300 transition-colors duration-500">
                  Start typing. The night remembers.
                </p>
              </div>

              {/* Tonight's Reflection Prompt */}
              {prompt && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="mt-16 p-6 border-t border-white/5 max-w-lg w-full text-center"
                >
                  <p className="text-xs uppercase tracking-widest text-gray-600 mb-3">Tonight's Prompt</p>
                  <p className="text-lg font-serif italic text-indigo-200/80">
                    "{prompt.content}"
                  </p>
                </motion.div>
              )}

              {/* Streak Preview (if 0) */}
              <div className="mt-8 flex items-center space-x-2 text-gray-600 opacity-50">
                <Flame className="w-4 h-4" />
                <span className="text-sm">Night Streak: {user?.currentStreak || 0}</span>
              </div>

            </motion.div>
          ) : (
            // Editor or Content View
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Dashboard Header if entries exist */}
              {hasEntries && !isCreating && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {/* Active Prompt Card */}
                  <Card className="bg-gray-900/40 border-gray-800/60 backdrop-blur-md">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <Sparkles className="w-4 h-4 text-yellow-500/70" />
                        <h3 className="text-xs uppercase tracking-widest text-gray-500">Tonight's Prompt</h3>
                      </div>
                      <p className="text-lg font-serif text-gray-300 italic">
                        "{prompt?.content || "What is keeping you awake tonight?"}"
                      </p>
                      <Button
                        variant="link"
                        className="text-indigo-400 p-0 h-auto mt-4 text-sm"
                        onClick={() => {
                          charLimit.setValue(prompt?.content ? `${prompt.content}\n\n` : '');
                          setIsCreating(true);
                        }}
                      >
                        Answer this &rarr;
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Streak Card */}
                  <Card className="bg-gray-900/40 border-gray-800/60 backdrop-blur-md flex flex-col justify-center">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Flame className={`w-4 h-4 ${user?.currentStreak ? 'text-orange-500' : 'text-gray-600'}`} />
                          <h3 className="text-xs uppercase tracking-widest text-gray-500">Night Streak</h3>
                        </div>
                        <div className="text-3xl font-light text-white">
                          {user?.currentStreak || 0} <span className="text-sm text-gray-600 ml-1">nights</span>
                        </div>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-gray-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Create Form */}
              {isCreating && (
                <Card className="mb-8 bg-gray-900/80 border-indigo-500/20 shadow-2xl shadow-indigo-900/10 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-light text-indigo-100">
                      {hasEntries ? "New Diary Entry" : "Your First Entry"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="content" className="sr-only">Your Thoughts</Label>
                        <Textarea
                          id="content"
                          value={charLimit.value}
                          onChange={(e) => charLimit.setValue(e.target.value)}
                          placeholder="Write what the night is holding..."
                          rows={8}
                          className={`bg-gray-950/50 border-gray-800 text-gray-100 resize-none text-lg font-serif leading-relaxed p-4 focus:border-indigo-500/50 focus:ring-0 ${charLimit.isOverLimit ? 'border-red-500' : ''}`}
                          autoFocus
                        />
                        <div className="flex justify-between items-center text-xs text-gray-500 px-1">
                          <span>{prompt?.content ? "Prompt: " + prompt.content.substring(0, 40) + "..." : "Free reflection"}</span>
                          <CharacterCounter
                            current={charLimit.length}
                            max={1000}
                            min={10}
                            showError={true}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="private"
                            checked={isPrivate}
                            onCheckedChange={setIsPrivate}
                          />
                          <Label htmlFor="private" className="flex items-center space-x-2 cursor-pointer text-gray-400">
                            {isPrivate ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                            <span>{isPrivate ? "Private" : "Public"}</span>
                          </Label>
                        </div>

                        <Button
                          type="submit"
                          disabled={createDiaryMutation.isPending}
                          className={`min-w-[120px] ${!user || charLimit.isUnderMin || charLimit.isOverLimit ? 'opacity-50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                        >
                          {createDiaryMutation.isPending ? "Saving..." : "Publish"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Entries List */}
              <div className="space-y-6">
                <AnimatePresence>
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <Card key={i} className="bg-gray-900/20 border-gray-800">
                        <CardContent className="p-6">
                          <Skeleton className="h-4 w-1/3 bg-gray-800 mb-4" />
                          <Skeleton className="h-24 w-full bg-gray-800" />
                        </CardContent>
                      </Card>
                    ))
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
                          <Card className="bg-gray-900/30 border-gray-800 hover:border-indigo-500/20 transition-all duration-300 group">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 font-serif">
                                    {diary.authorId ? "J" : "?"}
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm font-medium text-gray-300">
                                        {diary.authorId ? `Journalist #${diary.authorId}` : "Anonymous"}
                                      </span>
                                      {isOwner && <Badge variant="outline" className="text-[10px] py-0 border-indigo-500/30 text-indigo-400">YOU</Badge>}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {new Date(diary.createdAt!).toLocaleDateString()}
                                      <span className="mx-1">•</span>
                                      {new Date(diary.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  {!diary.isPublic && <Lock className="w-3 h-3 text-gray-600" />}
                                  {isOwner && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-red-400" onClick={() => handleDelete(diary.id)}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <p className="text-gray-300 leading-relaxed font-serif text-lg pl-4 border-l-2 border-indigo-900/50">
                                {diary.content}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>

                {/* Future Proofing: Ghost Sections */}
                {hasEntries && (
                  <div className="pt-12 border-t border-gray-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-40 grayscale pointer-events-none select-none">
                      <Card className="bg-gray-950 border-gray-900">
                        <CardHeader><CardTitle className="text-sm text-gray-500">Mood Insights</CardTitle></CardHeader>
                        <CardContent className="h-32 flex items-center justify-center text-xs text-gray-700">
                          Analysis requires 5+ entries
                        </CardContent>
                      </Card>
                      <Card className="bg-gray-950 border-gray-900">
                        <CardHeader><CardTitle className="text-sm text-gray-500">Emotion Graph</CardTitle></CardHeader>
                        <CardContent className="h-32 flex items-center justify-center text-xs text-gray-700">
                          Data insufficient
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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