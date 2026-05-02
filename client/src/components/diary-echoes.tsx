import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DiaryComment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function DiaryEchoes({ diaryId }: { diaryId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: comments = [], isLoading } = useQuery<DiaryComment[]>({
    queryKey: [`/api/v1/diaries/${diaryId}/comments`],
    enabled: isOpen,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/v1/diaries/${diaryId}/comments`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/v1/diaries/${diaryId}/comments`] });
      setContent("");
      toast({
        title: "Echo sent",
        description: "Your reflection has joined the night.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Connection lost",
        description: "Failed to send your echo. Please try again.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    addCommentMutation.mutate(content.trim());
  };

  return (
    <div className="mt-4 border-t border-white/5 pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-xs text-indigo-300/60 hover:text-indigo-300 transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span>{isOpen ? "Hide Echoes" : "View Echoes"}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-4 space-y-4"
          >
            {/* Comment List */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-xs text-gray-500 animate-pulse">Listening to the night...</div>
              ) : comments.length === 0 ? (
                <div className="text-xs text-gray-500 italic">No echoes yet. Be the first.</div>
              ) : (
                comments.map((comment: any) => (
                  <motion.div 
                    key={comment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex space-x-3 text-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 text-indigo-300 font-serif text-[10px]">
                      {comment.authorId ? "J" : "?"}
                    </div>
                    <div className="flex-1 bg-white/5 rounded-lg rounded-tl-none p-3 border border-white/5">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-[10px] font-medium text-indigo-200/70">
                          Journalist #{comment.authorId}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Input Form */}
            {user && (
              <form onSubmit={handleSubmit} className="relative mt-2">
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Leave an echo..."
                  className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all pr-10"
                />
                <button
                  type="submit"
                  disabled={!content.trim() || addCommentMutation.isPending}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:hover:text-indigo-400 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
