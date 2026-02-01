import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, MessageCircle, ArrowUp, Brain, Clock, Rocket, Coffee, Zap, Star, Moon, Flame, Target, Gem, Crown, Award, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { AmFounder, InsertAmFounder } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function AmFounderPage() {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: founders = [], isLoading } = useQuery<AmFounder[]>({
    queryKey: ["/api/v1/founder"],
  });

  const createFounderMutation = useMutation({
    mutationFn: async (newFounder: InsertAmFounder) => {
      const response = await apiRequest("POST", "/api/v1/founder", newFounder);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/founder"] });
      setContent("");
      setCategory("");
      setIsTyping(false);
      toast({
        title: "Insight Shared",
        description: "Your 3AM revelation has been recorded.",
        style: { background: 'linear-gradient(to right, #f97316, #ef4444)', color: 'white' }
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to share",
        description: "Your thoughts were too fast for our servers. Try again!",
      });
    }
  });

  const upvoteFounderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/v1/founder/${id}/upvote`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/founder"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && category) {
      createFounderMutation.mutate({
        content: content.trim(),
        category,
      });
    }
  };

  const handleUpvote = (id: number) => {
    upvoteFounderMutation.mutate(id);
  };

  const categoryOptions = [
    { value: "idea", label: "💡 Eureka Moment", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", description: "That spark of genius that hits at 3AM" },
    { value: "struggle", label: "⚡ Real Talk", color: "bg-red-500/20 text-red-300 border-red-500/30", description: "The honest struggles we all face" },
    { value: "success", label: "🎉 Victory Lap", color: "bg-green-500/20 text-green-300 border-green-500/30", description: "Celebrating the wins, big or small" },
    { value: "startup", label: "🚀 Launch Pad", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", description: "Building something from nothing" },
    { value: "funding", label: "💰 Money Talks", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", description: "The financial journey of startups" },
    { value: "product", label: "⚙️ Build Mode", color: "bg-orange-500/20 text-orange-300 border-orange-500/30", description: "Product development insights" },
    { value: "team", label: "👥 Squad Goals", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", description: "Team building and leadership" },
    { value: "insight", label: "🧠 Deep Thoughts", color: "bg-pink-500/20 text-pink-300 border-pink-500/30", description: "Those profound realizations" }
  ];

  const getCategoryColor = (cat: string) => {
    return categoryOptions.find(opt => opt.value === cat)?.color || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  const getCategoryLabel = (cat: string) => {
    return categoryOptions.find(opt => opt.value === cat)?.label || cat;
  };

  const is3AM = () => {
    const hour = currentTime.getHours();
    return hour >= 0 && hour <= 5;
  };

  const getMotivationalPrompts = () => {
    const prompts = [
      "What brilliant idea is keeping you up tonight?",
      "Share that breakthrough moment from your entrepreneurial journey...",
      "What would you tell your past self about starting a business?",
      "Drop that raw, unfiltered startup truth...",
      "What's the craziest business idea you've ever had?",
      "Share your late-night productivity hack...",
      "What mistake taught you the most valuable lesson?",
      "What's your current 3AM obsession?"
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="animate-pulse space-y-6">
            <div className="flex justify-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full bg-gray-700/50" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48 bg-gray-700/50" />
                <Skeleton className="h-4 w-32 bg-gray-700/50" />
              </div>
            </div>
            <Skeleton className="h-48 rounded bg-gray-700/30" />
            <div className="grid grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 bg-gray-700/20 rounded" />
              ))}
            </div>
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-40 bg-gray-700/20 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
        <div className="absolute top-60 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Dynamic Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="relative">
              <div className="p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full border border-orange-500/30">
                {is3AM() ? (
                  <Coffee className="w-8 h-8 text-orange-400 animate-bounce" />
                ) : (
                  <Lightbulb className="w-8 h-8 text-orange-400" />
                )}
              </div>
              {is3AM() && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  LIVE
                </div>
              )}
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                3AM Founder
              </h1>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {currentTime.toLocaleTimeString()} {is3AM() ? "🌙 Peak creativity hours!" : "💡 Share your insights"}
                </span>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-gray-300 mb-4">
              Where midnight visionaries share their raw, unfiltered thoughts. No polish, no pretense—just pure entrepreneurial truth.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center space-x-2 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-orange-300">Anonymous & Honest</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                <Star className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300">Community Driven</span>
              </div>
              <div className="flex items-center space-x-2 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300">Real-time Insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Share Form */}
        <Card className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-600 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Brain className="w-6 h-6 text-orange-400" />
                <span className="text-xl">Drop Your 3AM Truth</span>
              </div>
              <div className="text-sm text-gray-400">
                {getMotivationalPrompts()}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setIsTyping(e.target.value.length > 0);
                  }}
                  placeholder="What entrepreneurial revelation hit you tonight? Share your raw thoughts, crazy ideas, or honest struggles... The community is listening. 🌙"
                  rows={5}
                  className="bg-gray-700/50 border-gray-500 text-white resize-none focus:border-orange-400 transition-colors text-lg leading-relaxed"
                />
                {isTyping && (
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2 text-orange-400">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <span className="text-xs">Capturing your thoughts...</span>
                  </div>
                )}
              </div>

              {/* Category Selection */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-300">Choose your vibe:</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-500 text-white h-12">
                    <SelectValue placeholder="What kind of insight are you sharing?" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-base">{option.label}</span>
                          <span className="text-xs text-gray-400 ml-2">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  disabled={!content.trim() || !category || createFounderMutation.isPending}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {createFounderMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sharing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Rocket className="w-5 h-5" />
                      <span>Share Anonymously</span>
                    </div>
                  )}
                </Button>

                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Moon className="w-4 h-4" />
                  <span>Your identity stays in the shadows</span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Stats & Community */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30">
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-300">{founders.length}</div>
              <div className="text-sm text-gray-400">Founder Insights</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-300">
                {founders.reduce((sum, f) => sum + (f.upvotes || 0), 0)}
              </div>
              <div className="text-sm text-gray-400">Community Upvotes</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-green-500/30">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-300">
                {founders.reduce((sum, f) => sum + (f.comments || 0), 0)}
              </div>
              <div className="text-sm text-gray-400">Conversations Started</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Insights Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gem className="w-7 h-7 text-orange-400" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Midnight Revelations
              </h2>
            </div>
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-4 py-2">
              {founders.length} visionaries sharing
            </Badge>
          </div>

          <div className="grid gap-6">
            <AnimatePresence>
              {founders.map((founder, index) => (
                <motion.div
                  key={founder.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 border-gray-600 backdrop-blur-sm hover:from-gray-800/50 hover:to-gray-900/50 transition-all duration-500 group shadow-lg hover:shadow-2xl overflow-hidden relative">
                    {/* Visual accent */}
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                      <Zap className="w-24 h-24 text-orange-500" />
                    </div>

                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <Badge className={`${getCategoryColor(founder.category)} border transition-all duration-300 group-hover:scale-105 shadow-lg shadow-black/20`}>
                          {getCategoryLabel(founder.category)}
                        </Badge>
                        <div className="flex items-center space-x-3 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(founder.createdAt || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {new Date(founder.createdAt || new Date()).getHours() >= 0 && new Date(founder.createdAt || new Date()).getHours() <= 5 && (
                            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs shadow-sm shadow-blue-500/10">
                              🌙 3AM Drop
                            </Badge>
                          )}
                        </div>
                      </div>

                      <blockquote className="text-gray-100 mb-6 leading-relaxed text-xl italic border-l-4 border-orange-500/50 pl-6 group-hover:border-orange-400 transition-colors">
                        "{founder.content}"
                      </blockquote>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpvote(founder.id)}
                            className="flex items-center space-x-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 transition-all duration-300 group/button rounded-full px-4"
                          >
                            <ArrowUp className={`w-5 h-5 group-hover/button:animate-bounce ${founder.upvotes ? 'text-orange-500' : ''}`} />
                            <span className={`font-bold ${founder.upvotes ? 'text-orange-400' : ''}`}>{founder.upvotes}</span>
                            <span className="text-xs opacity-60 font-medium">UPVOTES</span>
                          </Button>

                          <div className="flex items-center space-x-2 text-gray-500 group-hover:text-gray-400 transition-colors">
                            <MessageCircle className="w-5 h-5" />
                            <span className="font-bold">{founder.comments}</span>
                            <span className="text-xs opacity-50 font-medium uppercase tracking-tighter">REPLIES</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="hidden sm:flex items-center space-x-2 text-[10px] text-gray-600 font-mono tracking-widest">
                            <div className="w-1.5 h-1.5 bg-orange-600/50 rounded-full"></div>
                            <span>VERIFIED-FOUNDER-#{founder.id.toString(16).toUpperCase()}</span>
                          </div>
                          <Crown className="w-5 h-5 text-yellow-500/30 group-hover:text-yellow-400 transition-all group-hover:rotate-12" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-orange-300 mb-4">
              Join the 3AM Revolution
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Every great startup began with a sleepless night and a crazy idea. Share yours and inspire the next generation of founders.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 text-orange-300">
                <Target className="w-5 h-5" />
                <span>No judgment zone</span>
              </div>
              <div className="flex items-center space-x-2 text-orange-300">
                <Zap className="w-5 h-5" />
                <span>Raw & authentic</span>
              </div>
              <div className="flex items-center space-x-2 text-orange-300">
                <Star className="w-5 h-5" />
                <span>Community support</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}