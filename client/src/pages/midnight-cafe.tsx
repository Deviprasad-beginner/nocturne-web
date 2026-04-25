import React, { useState, memo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { MidnightCafe, InsertMidnightCafe, CafeReply, InsertCafeReply } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Trash2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Coffee, MessageCircle, Clock, Sparkles, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

// Memoized Post Component
const CafePost = memo(({
  post,
  index,
  user,
  expandedPost,
  onToggleReply,
  onDelete,
  onReplySubmit,
  replyContent,
  setReplyContent,
  replyMutation,
  replies,
  isLoadingReplies
}: {
  post: MidnightCafe;
  index: number;
  user: any;
  expandedPost: number | null;
  onToggleReply: (id: number) => void;
  onDelete: (id: number) => void;
  onReplySubmit: (id: number) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  replyMutation: any;
  replies: CafeReply[] | undefined;
  isLoadingReplies: boolean;
}) => {
  return (
    <Card className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-700/30 hover:border-amber-500/50 transition-all duration-500 group">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-900/20 group-hover:scale-110 transition-transform">
            <span className="text-white font-bold text-lg">
              {post.topic.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <h3 className="font-bold text-lg text-amber-100 group-hover:text-amber-400 transition-colors uppercase tracking-tight">{post.topic}</h3>
                <Sparkles className="w-3 h-3 text-amber-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                {user?.id === post.authorId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2 text-red-500/50 hover:text-red-400 hover:bg-red-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(post.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-1 text-gray-500 text-xs font-mono">
                <Clock className="w-3 h-3" />
                <span>
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Just now'
                  }
                </span>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4 text-sm sm:text-base border-l-2 border-amber-800/20 pl-4 py-1 italic">
              {post.content}
            </p>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleReply(post.id)}
                className="text-amber-400/80 hover:text-amber-300 hover:bg-amber-400/10 rounded-full border border-amber-800/30"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                <span className="font-medium">{post.replies || 0}</span>
                <span className="ml-1 text-xs opacity-60">responses</span>
              </Button>
              <span className="text-[10px] text-gray-600 tracking-widest font-mono">NODE-REF:{post.id.toString(16).toUpperCase()}</span>
            </div>

            {/* Reply Form */}
            <AnimatePresence>
              {expandedPost === post.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-amber-800/30"
                >
                  {isLoadingReplies ? (
                    <div className="text-center py-4 text-gray-500 text-sm">Loading replies...</div>
                  ) : replies && (replies as CafeReply[]).length > 0 ? (
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {(replies as CafeReply[]).map(reply => (
                        <div key={reply.id} className="bg-black/20 p-3 rounded border border-white/5 text-sm">
                          <p className="text-gray-300 mb-1">{reply.content}</p>
                          <div className="text-[10px] text-gray-600">
                            {reply.createdAt ? formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true }) : 'Just now'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-600 text-sm italic">No replies yet. Be the first.</div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write your response..."
                      rows={2}
                      className="flex-1 bg-black/30 border-amber-700/30 text-white text-sm resize-none focus:border-amber-500/50"
                    />
                    <Button
                      onClick={() => onReplySubmit(post.id)}
                      disabled={replyMutation.isPending || !replyContent.trim()}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 h-auto py-3"
                    >
                      {replyMutation.isPending ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default function MidnightCafePage() {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const { toast } = useToast();

  const { data: midnightCafe = [], isLoading } = useQuery<MidnightCafe[]>({
    queryKey: ['/api/v1/cafe'],
  });

  const { data: replies, isLoading: isLoadingReplies } = useQuery<CafeReply[]>({
    queryKey: [`/api/v1/cafe/${expandedPost}/replies`],
    enabled: !!expandedPost,
  });

  const createPostMutation = useMutation({
    mutationFn: async (newPost: InsertMidnightCafe) => {
      const res = await apiRequest('POST', '/api/v1/cafe', newPost);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/cafe'], refetchType: 'active' });
      setContent("");
      setTopic("");
      setIsCreating(false);
      toast({
        title: "Thought Bubbles Sent",
        description: "Your voice has been added to the cafe conversation.",
        style: { background: 'linear-gradient(to right, #f59e0b, #ea580c)', color: 'white' }
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to Post",
        description: "Your coffee spilled... please try again.",
      });
    }
  });

  const replyMutation = useMutation({
    mutationFn: async (data: InsertCafeReply) => {
      const res = await apiRequest('POST', '/api/v1/cafe/replies', data);
      return res.json();
    },
    onSuccess: () => {
      if (expandedPost) {
        queryClient.invalidateQueries({ queryKey: [`/api/v1/cafe/${expandedPost}/replies`] });
        queryClient.invalidateQueries({ queryKey: ['/api/v1/cafe'] });
        setReplyContent("");
        toast({
          title: "Reply Sent",
          description: "Your response has been added to the conversation.",
        });
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Connection problem with the cafe server.",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/v1/cafe/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/cafe'] });
      toast({
        title: "Deleted",
        description: "Discussion removed.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to delete",
        description: error.message || "Could not delete post.",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && topic.trim()) {
      createPostMutation.mutate({
        content: content.trim(),
        topic: topic.trim(),
        category: "general"
      });
    }
  };

  const handleReplySubmit = (postId: number) => {
    if (replyContent.trim()) {
      replyMutation.mutate({
        cafeId: postId,
        content: replyContent.trim(),
        authorId: user?.id || null
      });
    } else {
      toast({
        variant: "destructive",
        title: "Empty Reply",
        description: "Please write something before sending.",
      });
    }
  };

  const toggleReplyForm = (postId: number) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      setReplyContent("");
    } else {
      setExpandedPost(postId);
    }
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Good evening, night owl";
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this discussion?")) deleteMutation.mutate(id);
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
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Midnight Cafe</h1>
                <p className="text-sm text-amber-300">{getTimeOfDay()}</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            {isCreating ? "Cancel" : "Start Conversation"}
          </Button>
        </div>

        <div className="mb-6 p-4 bg-orange-900/30 rounded-lg border border-orange-700/50">
          <p className="text-sm text-orange-200">
            <span className="font-medium">Dialectical Synthesis Hub:</span> Sophisticated discourse facilitation platform for deep intellectual exchange.
            Structured conversation algorithms optimize meaningful idea collision and collaborative knowledge construction.
          </p>
        </div>

        {/* Cafe Atmosphere */}
        <div className="mb-8 p-6 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-lg border border-amber-700/50">
          <div className="flex items-center space-x-4 mb-4">
            <Coffee className="w-8 h-8 text-amber-400" />
            <div>
              <h3 className="text-lg font-semibold text-amber-200">Welcome to the Midnight Cafe</h3>
              <p className="text-sm text-amber-300">Neural convergence space for authentic discourse synthesis</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-amber-400 font-semibold">{midnightCafe.length}</div>
              <div className="text-xs text-amber-300">Conversations</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-amber-400 font-semibold">
                {midnightCafe.reduce((sum, post) => sum + (post.replies || 0), 0)}
              </div>
              <div className="text-xs text-amber-300">Total Replies</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-amber-400 font-semibold">
                {midnightCafe.length > 0 ? midnightCafe.length : 0}
              </div>
              <div className="text-xs text-amber-300">Active Voices</div>
            </div>
          </div>
        </div>

        {/* Create Form */}
        {isCreating && (
          <Card className="mb-8 bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-amber-700/50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center space-x-2">
                <Coffee className="w-5 h-5 text-amber-400" />
                <span>Share Your Thoughts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="What are we discussing?"
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="content">What's on your mind?</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share something interesting, ask a question, or just say hello..."
                    rows={3}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!content.trim() || !topic.trim() || createPostMutation.isPending}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  {createPostMutation.isPending ? "Sharing..." : "Share with Cafe"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Conversations */}
        <div className="space-y-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="bg-amber-900/10 border-amber-700/20">
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    <Skeleton className="w-12 h-12 rounded-full bg-amber-700/20" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-4 w-1/3 bg-amber-700/20" />
                      <Skeleton className="h-4 w-full bg-amber-700/20" />
                      <Skeleton className="h-4 w-2/3 bg-amber-700/20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : midnightCafe.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <Coffee className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl mb-2">The cafe is quiet tonight</p>
              <p>Be the first to start a conversation!</p>
            </div>
          ) : (
            midnightCafe.map((post, index) => (
              <CafePost
                key={post.id}
                post={post}
                index={index}
                user={user}
                expandedPost={expandedPost}
                onToggleReply={toggleReplyForm}
                onDelete={handleDelete}
                onReplySubmit={handleReplySubmit}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                replyMutation={replyMutation}
                replies={replies}
                isLoadingReplies={isLoadingReplies}
              />
            ))
          )}
        </div>

        {/* Cafe Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Coffee className="w-4 h-4" />
            <span>Serving conversations since midnight</span>
          </div>
          <p>Pull up a chair, grab a warm drink, and join the conversation</p>
        </div>
      </div>
    </div>
  );
}