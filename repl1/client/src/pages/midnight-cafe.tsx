import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { MidnightCafe, InsertMidnightCafe } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Coffee, MessageCircle, Clock, User } from "lucide-react";

export default function MidnightCafePage() {
  const [isCreating, setIsCreating] = useState(false);
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");

  const { data: midnightCafe = [], isLoading } = useQuery<MidnightCafe[]>({
    queryKey: ['/api/midnightCafe'],
  });

  const createPostMutation = useMutation({
    mutationFn: async (newPost: InsertMidnightCafe) => {
      const response = await fetch('/api/midnightCafe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/midnightCafe'] });
      setContent("");
      setAuthor("");
      setIsCreating(false);
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/midnightCafe/${id}/replies`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to reply');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/midnightCafe'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && author.trim()) {
      createPostMutation.mutate({
        content: content.trim(),
        author: author.trim(),
        authorId: "current_user"
      });
    }
  };

  const handleReply = (id: number) => {
    replyMutation.mutate(id);
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Good evening, night owl";
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
                  <Label htmlFor="author">Your Name</Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="How should we call you?"
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
                  disabled={!content.trim() || !author.trim() || createPostMutation.isPending}
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
            <div className="text-center text-gray-400 py-12">
              <Coffee className="w-12 h-12 mx-auto mb-3 animate-pulse opacity-50" />
              <p>Preparing your coffee...</p>
            </div>
          ) : midnightCafe.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <Coffee className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl mb-2">The cafe is quiet tonight</p>
              <p>Be the first to start a conversation!</p>
            </div>
          ) : (
            midnightCafe.map((post) => (
              <Card key={post.id} className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-700/30 hover:from-amber-900/30 hover:to-orange-900/30 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-lg">
                        {"A"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-amber-200">Anonymous Patron</h3>
                        <div className="flex items-center space-x-1 text-gray-400 text-sm">
                          <Clock className="w-3 h-3" />
                          <span>
                            {post.createdAt 
                              ? new Date(post.createdAt).toLocaleString()
                              : 'Just now'
                            }
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-200 leading-relaxed mb-4">{post.content}</p>
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReply(post.id)}
                          disabled={replyMutation.isPending}
                          className="text-amber-400 hover:text-amber-300 hover:bg-amber-900/30"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {post.replies || 0} replies
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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