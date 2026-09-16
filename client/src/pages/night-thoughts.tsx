import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { NightThought, InsertNightThought, NightThoughtReply } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CharacterCounter } from "@/components/common/CharacterCounter";
import {
    ArrowLeft, Moon, Heart, MessageCircle, Lock, Globe,
    Sparkles, Coffee, Edit3, Trash2, Send, Eye, EyeOff, ChevronDown, ChevronUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCharacterLimit } from "@/hooks/useCharacterLimit";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@shared/schema";

export default function NightThoughtsPage() {
    const [isPrivate, setIsPrivate] = useState(true);
    const [topic, setTopic] = useState("");
    const [location, setLocation] = useLocation();
    
    // Initialize filter based on route
    const [selectedFilter, setSelectedFilter] = useState(() => {
        if (location === "/whispers") return "whispers";
        if (location === "/diaries") return "diary";
        return "all";
    });

    const [openRepliesFor, setOpenRepliesFor] = useState<number | null>(null);
    const [replyInput, setReplyInput] = useState<Record<number, string>>({});
    const [mood, setMood] = useState("");
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [isRecommending, setIsRecommending] = useState(false);
    const [serendipityData, setSerendipityData] = useState<any>(null);
    const { toast } = useToast();

    const MOODS = [
        { label: "Melancholy", emoji: "🌧️" },
        { label: "Reflective", emoji: "🌌" },
        { label: "Hopeful", emoji: "🕯️" },
        { label: "Anxious", emoji: "🌪️" },
        { label: "Numb", emoji: "🌫️" },
    ];

    const charLimit = useCharacterLimit({
        maxLength: 2000,
        minLength: 5,
        warningThreshold: 0.9,
    });

    const { data: user } = useQuery<User | null>({
        queryKey: ['/api/user'],
    });

    const { data: thoughts = [], isLoading } = useQuery<NightThought[]>({
        queryKey: ['/api/v1/thoughts'],
    });

    const { data: cafePosts = [], isLoading: isCafeLoading } = useQuery<any[]>({
        queryKey: ['/api/v1/midnight-cafe'],
    });

    // Atmospheric Placeholders (Replacing old clinical activators)
    const [activatorIndex, setActivatorIndex] = useState(0);
    const activators = [
        "A conversation that never happened...",
        "Something you finally understood today...",
        "A memory that suddenly came back...",
        "The hardest part about right now...",
        "An apology you owe yourself...",
        "A feeling that is difficult to name..."
    ];

    // Rotate activators gently
    useEffect(() => {
        const interval = setInterval(() => {
            setActivatorIndex((prev) => (prev + 1) % activators.length);
        }, 5000); // Change every 5 seconds
        return () => clearInterval(interval);
    }, []);

    // Force public visibility for discussions (when topic is present)
    useEffect(() => {
        if (topic.trim().length > 0) {
            setIsPrivate(false);
        }
    }, [topic]);

    // AI Semantic Recommendations for Whispers
    useEffect(() => {
        if (selectedFilter !== 'whispers' || charLimit.length < 15) {
            setRecommendations([]);
            return;
        }
        
        const handler = setTimeout(async () => {
            setIsRecommending(true);
            try {
                const res = await apiRequest('POST', '/api/v1/thoughts/resonate', { 
                    text: charLimit.value, 
                    mood 
                });
                if (res.ok) {
                    const data = await res.json();
                    setRecommendations(data);
                }
            } catch (error) {
                console.error("Error fetching recommendations:", error);
            } finally {
                setIsRecommending(false);
            }
        }, 800);
        
        return () => clearTimeout(handler);
    }, [charLimit.value, mood, selectedFilter]);

    // Smart hint based on character count
    const getSmartHint = () => {
        const len = charLimit.length;
        if (len === 0) return activators[activatorIndex];
        if (len < 100) return isPrivate ? "🔒 Secret whisper..." : "💭 Public whisper...";
        if (len < 500) return "📝 Reflective diary entry...";
        if (topic || charLimit.value.includes('?')) return "☕ Starting a discussion";
        return "✨ Deep thought in progress...";
    };

    const createThoughtMutation = useMutation({
        mutationFn: async (newThought: InsertNightThought) => {
            const res = await apiRequest('POST', '/api/v1/thoughts', newThought);
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['/api/v1/thoughts'], refetchType: 'active' });
            charLimit.reset();
            setTopic("");
            setIsPrivate(true); // Reset to secure default
            toast({
                title: "Thought Captured",
                description: isPrivate ? "Securely stored in your private diary." : "Shared with the night sky.",
                className: isPrivate ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-indigo-900 border-indigo-700 text-white"
            });
            
            if (data.serendipityMatch) {
                setSerendipityData(data.serendipityMatch);
            }
        },
    });

    const createCafePostMutation = useMutation({
        mutationFn: async (newCafe: any) => {
            const res = await apiRequest('POST', '/api/v1/midnight-cafe', newCafe);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/v1/midnight-cafe'] });
            charLimit.reset();
            setTopic("");
            toast({
                title: "Discussion Started",
                description: "Your thoughts are now brewing in the Cafe.",
                className: "bg-amber-900 border-amber-700 text-white"
            });
        }
    });

    const deleteThoughtMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await apiRequest('DELETE', `/api/v1/thoughts/${id}`);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/v1/thoughts'] });
            toast({ title: "Thought Released", description: "Dissolved into the void." });
        },
    });

    const likeThoughtMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await apiRequest('POST', `/api/v1/thoughts/${id}/heart`);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/v1/thoughts'] });
        },
    });

    const addReplyMutation = useMutation({
        mutationFn: async ({ thoughtId, content }: { thoughtId: number; content: string }) => {
            const res = await apiRequest('POST', `/api/v1/thoughts/${thoughtId}/replies`, { content });
            return res.json();
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: [`/api/v1/thoughts/${variables.thoughtId}/replies`] });
            queryClient.invalidateQueries({ queryKey: ['/api/v1/thoughts'] });
            setReplyInput(prev => ({ ...prev, [variables.thoughtId]: '' }));
        },
        onError: () => {
            toast({ variant: 'destructive', title: 'Failed to post reply', description: 'Please try again.' });
        }
    });

    const addCafeReplyMutation = useMutation({
        mutationFn: async ({ cafeId, content }: { cafeId: number; content: string }) => {
            const res = await apiRequest('POST', `/api/v1/midnight-cafe/${cafeId}/replies`, { content });
            return res.json();
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: [`/api/v1/midnight-cafe/${variables.cafeId}/replies`] });
            queryClient.invalidateQueries({ queryKey: ['/api/v1/midnight-cafe'] });
            setReplyInput(prev => ({ ...prev, [`cafe-${variables.cafeId}`]: '' }));
        },
        onError: () => {
            toast({ variant: 'destructive', title: 'Failed to post reply', description: 'Please try again.' });
        }
    });

    const submitWithIntent = (intent: "whisper" | "diary" | "discussion") => {
        if (!user) {
            toast({
                variant: "destructive",
                title: "Authentication Required",
                description: "Please log in to share thoughts.",
            });
            return;
        }

        if (charLimit.isUnderMin || charLimit.isOverLimit) return;

        if (intent === "discussion") {
            createCafePostMutation.mutate({
                content: charLimit.value.trim(),
                topic: topic.trim() || "Midnight Cafe",
            });
            return;
        }

        createThoughtMutation.mutate({
            content: charLimit.value.trim(),
            topic: undefined,
            isPrivate: intent === "diary",
            allowReplies: false,
            thoughtType: intent,
            authorId: user.id,
        });
    };

    // Filter thoughts
    const filteredThoughts = thoughts.filter((thought) => {
        if (selectedFilter === "private") return thought.isPrivate && thought.authorId === user?.id;
        if (selectedFilter === "diary") return thought.thoughtType === "diary";
        if (selectedFilter === "whispers") return thought.thoughtType === "whisper";
        if (selectedFilter === "discussions") return thought.thoughtType === "discussion";
        return true; // "all"
    });

    // Get card style based on thought type
    const getCardStyle = (type?: string | null) => {
        switch (type) {
            case "whisper":
                return "bg-gradient-to-br from-indigo-950/40 via-purple-950/40 to-slate-950/40 border-indigo-500/20";
            case "discussion":
                return "bg-gradient-to-br from-amber-950/40 via-orange-950/40 to-slate-950/40 border-amber-500/20";
            case "diary":
            default:
                return "bg-gradient-to-br from-slate-900/60 via-gray-900/60 to-black/60 border-white/10";
        }
    };

    const getIconForType = (type?: string | null) => {
        switch (type) {
            case "whisper": return <MessageCircle className="w-4 h-4" />;
            case "discussion": return <Coffee className="w-4 h-4" />;
            case "diary": return <Edit3 className="w-4 h-4" />;
            default: return <Moon className="w-4 h-4" />;
        }
    };

    // Dynamic Theme Logic
    // Dynamic Theme Logic
    const getTheme = (mode: string) => {
        switch (mode) {
            case "diary":
                return {
                    bg: "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-gray-950 to-black",
                    accent: "text-gray-300",
                    tabActive: "data-[state=active]:border-gray-400 data-[state=active]:text-gray-100",
                    emptyText: "The pages are blank. Write your history.",
                    emptyIcon: <Edit3 className="w-12 h-12 mb-4 text-gray-600 opacity-50" />,
                    title: "The Diary",
                    subtitle: "Record the history of your days.",
                    dotColor: "bg-gray-400 shadow-[0_0_10px_rgba(156,163,175,0.5)]",
                    composerBg: "bg-gray-950/60",
                    composerBorder: "border-gray-500/20",
                    composerShadow: "shadow-[0_0_40px_rgba(156,163,175,0.05)]",
                    composerPlaceholder: "Dear diary...",
                    composerFocusRing: "focus-visible:border-gray-500/50 focus-visible:shadow-[0_0_20px_rgba(156,163,175,0.2)]",
                    composerIcon: <Edit3 className="w-3 h-3 text-gray-400" />,
                    hintColor: "text-gray-400"
                };
            case "whispers":
                return {
                    bg: "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-purple-950/20 to-black",
                    accent: "text-indigo-300",
                    tabActive: "data-[state=active]:border-indigo-400 data-[state=active]:text-indigo-100",
                    emptyText: "The air is still. Whisper something to the wind.",
                    emptyIcon: <MessageCircle className="w-12 h-12 mb-4 text-indigo-600 opacity-50" />,
                    title: "Whispers",
                    subtitle: "Secrets sent to the silent wind.",
                    dotColor: "bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]",
                    composerBg: "bg-indigo-950/40",
                    composerBorder: "border-indigo-500/20",
                    composerShadow: "shadow-[0_0_40px_rgba(99,102,241,0.1)]",
                    composerPlaceholder: "Whisper your secrets to the wind...",
                    composerFocusRing: "focus-visible:border-indigo-500/50 focus-visible:shadow-[0_0_20px_rgba(99,102,241,0.2)]",
                    composerIcon: <MessageCircle className="w-3 h-3 text-indigo-400" />,
                    hintColor: "text-indigo-400"
                };
            case "discussions":
                return {
                    bg: "bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-900/30 via-stone-950 to-black",
                    accent: "text-amber-300",
                    tabActive: "data-[state=active]:border-amber-400 data-[state=active]:text-amber-100",
                    emptyText: "No voices here yet. Start the conversation.",
                    emptyIcon: <Coffee className="w-12 h-12 mb-4 text-amber-600 opacity-50" />,
                    title: "Discussions",
                    subtitle: "Gather round the fire and speak.",
                    dotColor: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
                    composerBg: "bg-amber-950/40",
                    composerBorder: "border-amber-500/20",
                    composerShadow: "shadow-[0_0_40px_rgba(245,158,11,0.1)]",
                    composerPlaceholder: "Start a conversation...",
                    composerFocusRing: "focus-visible:border-amber-500/50 focus-visible:shadow-[0_0_20px_rgba(245,158,11,0.2)]",
                    composerIcon: <Coffee className="w-3 h-3 text-amber-400" />,
                    hintColor: "text-amber-400"
                };
            case "private":
                return {
                    bg: "bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-900/30 via-gray-950 to-black",
                    accent: "text-emerald-300",
                    tabActive: "data-[state=active]:border-emerald-400 data-[state=active]:text-emerald-100",
                    emptyText: "Your vault is empty. Keep your secrets here.",
                    emptyIcon: <Lock className="w-12 h-12 mb-4 text-emerald-600 opacity-50" />,
                    title: "Private Vault",
                    subtitle: "For your eyes only. Secure and silent.",
                    dotColor: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]",
                    composerBg: "bg-emerald-950/40",
                    composerBorder: "border-emerald-500/20",
                    composerShadow: "shadow-[0_0_40px_rgba(16,185,129,0.1)]",
                    composerPlaceholder: "Store a secure thought...",
                    composerFocusRing: "focus-visible:border-emerald-500/50 focus-visible:shadow-[0_0_20px_rgba(16,185,129,0.2)]",
                    composerIcon: <Lock className="w-3 h-3 text-emerald-400" />,
                    hintColor: "text-emerald-400"
                };
            default: // all
                return {
                    bg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-black",
                    accent: "text-indigo-200",
                    tabActive: "data-[state=active]:border-white data-[state=active]:text-white",
                    emptyText: "The Void is Empty",
                    emptyIcon: <Moon className="w-12 h-12 mb-4 text-gray-700 opacity-50" />,
                    title: "The Void",
                    subtitle: "Cast your thoughts into the infinite.",
                    dotColor: "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]",
                    composerBg: "bg-black/60",
                    composerBorder: "border-white/10",
                    composerShadow: "shadow-[0_0_40px_rgba(255,255,255,0.05)]",
                    composerPlaceholder: "What is on your mind tonight?",
                    composerFocusRing: "focus-visible:border-indigo-500/50 focus-visible:shadow-[0_0_20px_rgba(99,102,241,0.2)]",
                    composerIcon: <Sparkles className="w-3 h-3 text-indigo-400" />,
                    hintColor: "text-indigo-400"
                };
        }
    };

    const currentTheme = getTheme(selectedFilter);

    // ── Render Helpers ───────────────────────────────────────────────────────────
    const renderThought = (thought: NightThought, index: number) => {
        const isOwner = user && thought.authorId === user.id;
        return (
            <motion.div
                key={thought.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
            >
                <Card className={`backdrop-blur-md transition-all duration-300 group ${getCardStyle(thought.thoughtType)} hover:border-white/20`}>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/10 ${thought.thoughtType === 'whisper' ? 'bg-indigo-500/10 text-indigo-400' :
                                    thought.thoughtType === 'discussion' ? 'bg-amber-500/10 text-amber-400' :
                                        'bg-gray-500/10 text-gray-400'
                                    }`}>
                                    {getIconForType(thought.thoughtType)}
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-medium ${isOwner ? "text-white" : "text-gray-400"}`}>
                                            {isOwner ? "You" : (thought.authorId ? `Anonymous #${thought.authorId}` : "Anonymous")}
                                        </span>
                                        {thought.isPrivate && <Lock className="w-3 h-3 text-emerald-500" />}
                                    </div>
                                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">
                                        {thought.createdAt ? new Date(thought.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                    </span>
                                </div>
                            </div>

                            {isOwner && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteThoughtMutation.mutate(thought.id)}
                                    className="h-8 w-8 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 hover:bg-red-500/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        {thought.topic && (
                            <h3 className="text-lg font-medium text-amber-200/90 mb-2">{thought.topic}</h3>
                        )}

                        <p className={`text-gray-300 leading-relaxed font-light ${thought.thoughtType === 'whisper' ? 'text-lg italic text-indigo-200/90' : 'text-base'
                            }`}>
                            {thought.content}
                        </p>

                        <div className="flex items-center justify-end mt-6 space-x-4 border-t border-white/5 pt-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => likeThoughtMutation.mutate(thought.id)}
                                className="text-gray-500 hover:text-pink-400 hover:bg-pink-500/10 h-8"
                            >
                                <Heart className={`w-4 h-4 mr-1.5 ${thought.hearts ? 'fill-pink-500 text-pink-500' : ''}`} />
                                <span className="text-xs">{thought.hearts || 0}</span>
                            </Button>
                            {thought.allowReplies && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setOpenRepliesFor(openRepliesFor === thought.id ? null : thought.id)}
                                    className={`h-8 ${openRepliesFor === thought.id ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500 hover:text-blue-400 hover:bg-blue-500/10'}`}
                                >
                                    <MessageCircle className="w-4 h-4 mr-1.5" />
                                    <span className="text-xs">{thought.replies || 0}</span>
                                    {openRepliesFor === thought.id
                                        ? <ChevronUp className="w-3 h-3 ml-1" />
                                        : <ChevronDown className="w-3 h-3 ml-1" />}
                                </Button>
                            )}
                        </div>

                        {/* Comment Panel */}
                        <AnimatePresence>
                            {openRepliesFor === thought.id && thought.allowReplies && (
                                <CommentPanel
                                    endpoint={`/api/v1/thoughts/${thought.id}/replies`}
                                    user={user ?? null}
                                    replyInput={replyInput[thought.id] ?? ''}
                                    onReplyChange={(val) => setReplyInput(prev => ({ ...prev, [thought.id]: val }))}
                                    onSubmit={() => {
                                        const content = (replyInput[thought.id] ?? '').trim();
                                        if (!content) return;
                                        addReplyMutation.mutate({ thoughtId: thought.id, content });
                                    }}
                                    isPending={addReplyMutation.isPending}
                                />
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    const renderCafePost = (cafe: any, index: number) => {
        const isOwner = user && cafe.authorId === user.id;
        const panelId = `cafe-${cafe.id}`;

        return (
            <motion.div
                key={`cafe-${cafe.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
            >
                <Card className={`backdrop-blur-md transition-all duration-300 group ${getCardStyle('discussion')} hover:border-white/20`}>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 bg-amber-500/10 text-amber-400">
                                    <Coffee className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-medium ${isOwner ? "text-white" : "text-gray-400"}`}>
                                            {isOwner ? "You" : (cafe.author?.username ? `@${cafe.author.username}` : `Anonymous #${cafe.authorId}`)}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">
                                        {cafe.createdAt ? new Date(cafe.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {cafe.topic && (
                            <h3 className="text-lg font-medium text-amber-200/90 mb-2">{cafe.topic}</h3>
                        )}

                        <p className="text-base text-gray-300 leading-relaxed font-light">
                            {cafe.content}
                        </p>

                        <div className="flex items-center justify-end mt-6 space-x-4 border-t border-white/5 pt-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setOpenRepliesFor(openRepliesFor === panelId as any ? null : panelId as any)}
                                className={`h-8 ${openRepliesFor === panelId as any ? 'text-amber-400 bg-amber-500/10' : 'text-gray-500 hover:text-amber-400 hover:bg-amber-500/10'}`}
                            >
                                <MessageCircle className="w-4 h-4 mr-1.5" />
                                <span className="text-xs">{cafe.replies || 0}</span>
                                {openRepliesFor === panelId as any
                                    ? <ChevronUp className="w-3 h-3 ml-1" />
                                    : <ChevronDown className="w-3 h-3 ml-1" />}
                            </Button>
                        </div>

                        {/* Comment Panel */}
                        <AnimatePresence>
                            {openRepliesFor === panelId as any && (
                                <CommentPanel
                                    endpoint={`/api/v1/midnight-cafe/${cafe.id}/replies`}
                                    user={user ?? null}
                                    replyInput={replyInput[panelId as any] ?? ''}
                                    onReplyChange={(val) => setReplyInput(prev => ({ ...prev, [panelId as any]: val }))}
                                    onSubmit={() => {
                                        const content = (replyInput[panelId as any] ?? '').trim();
                                        if (!content) return;
                                        addCafeReplyMutation.mutate({ cafeId: cafe.id, content });
                                    }}
                                    isPending={addCafeReplyMutation.isPending}
                                />
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    return (
        <div className={`min-h-screen ${currentTheme.bg} text-white p-3 sm:p-6 overflow-hidden relative transition-all duration-1000 ease-in-out`}>
            {/* Ambient Background Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 relative z-10">
                {/* Header Row */}
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 gap-8">
                    {/* Left: Title & Subtitle */}
                    <div className="flex items-center space-x-6">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-all">
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-white flex items-center gap-4">
                                {currentTheme.title}
                                <span className={`inline-flex w-3 h-3 rounded-full animate-pulse ${currentTheme.dotColor}`}></span>
                            </h1>
                            <p className="text-gray-400 font-light text-base mt-2 ml-1">
                                {currentTheme.subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Right: Controls (Tabs + Action) */}
                    <div className="flex flex-col md:flex-row items-center gap-8 w-full xl:w-auto">
                        {/* Filter Tabs - Integrated in Header */}
                        <Tabs value={selectedFilter} onValueChange={setSelectedFilter} className="w-full md:w-auto">
                            <TabsList className="bg-white/5 border border-white/5 p-1 gap-2 rounded-full">
                                {["all", "diary", "whispers", "discussions", "private"].map((tab) => {
                                    if (tab === 'private' && !user) return null;
                                    return (
                                        <TabsTrigger
                                            key={tab}
                                            value={tab}
                                            className={`data-[state=active]:bg-white/10 ${currentTheme.tabActive} rounded-full px-6 py-2 text-gray-400 hover:text-gray-200 transition-all uppercase text-xs tracking-widest font-medium`}
                                        >
                                            {tab}
                                        </TabsTrigger>
                                    )
                                })}
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {/* Content Area - Centered & Readable */}
                <div className="max-w-3xl mx-auto">
                    {/* Info Text - Privacy Emphasis */}
                    <div className="mb-12 flex justify-center opacity-60 hover:opacity-100 transition-opacity">
                        <p className="text-gray-400 text-sm flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full border border-white/5">
                            <Lock className="w-3 h-3 text-emerald-500/70" />
                            <span>This space is safe. You control what is shared.</span>
                        </p>
                    </div>

                    {/* Smart Composer - Always Visible */}
                    <div className="mb-10 animate-fade-in-up">
                        <Card className={`overflow-hidden border backdrop-blur-2xl transition-all duration-500 hover:border-white/20 ${currentTheme.composerBg} ${currentTheme.composerBorder} ${currentTheme.composerShadow}`}>
                            <CardContent className="p-6 sm:p-8">
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs transition-opacity duration-500 ${charLimit.length > 0 ? 'opacity-0' : 'opacity-100'} ${currentTheme.hintColor}`}>
                                                    {currentTheme.composerIcon}
                                                    <span className="text-gray-300">{getSmartHint()}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Mood Selector (Whispers Only) */}
                                                <AnimatePresence>
                                                    {selectedFilter === 'whispers' && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
                                                        >
                                                            {MOODS.map(m => (
                                                                <button
                                                                    key={m.label}
                                                                    onClick={() => setMood(mood === m.label ? "" : m.label)}
                                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all whitespace-nowrap ${
                                                                        mood === m.label 
                                                                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200' 
                                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                                    }`}
                                                                >
                                                                    <span>{m.emoji}</span>
                                                                    <span>{m.label}</span>
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <Textarea
                                                    value={charLimit.value}
                                                    onChange={(e) => charLimit.setValue(e.target.value)}
                                                    placeholder={currentTheme.composerPlaceholder}
                                                    rows={4}
                                                    className={`bg-white/5 backdrop-blur-md border border-white/10 ${currentTheme.composerFocusRing} rounded-2xl p-4 sm:p-6 font-light leading-relaxed resize-none transition-all duration-500 ${
                                                        charLimit.length > 200 ? "text-lg text-slate-300 min-h-[150px]" : "text-2xl text-slate-400 min-h-[120px]"
                                                    }`}
                                                />
                                                <div className={`transition-all duration-500 ${
                                                    selectedFilter === 'discussions' ? 'opacity-100 h-auto' :
                                                    (selectedFilter === 'whispers' ? 'opacity-0 h-0 overflow-hidden' :
                                                    (charLimit.length > 200 ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'))
                                                }`}>
                                                    <Input
                                                        value={topic}
                                                        onChange={(e) => setTopic(e.target.value)}
                                                        placeholder={selectedFilter === 'discussions' ? "Discussion Title (Required)..." : "Give this thought a title... (optional)"}
                                                        className="bg-transparent border-b border-white/10 text-lg font-medium placeholder:text-gray-600 px-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <CharacterCounter
                                                    current={charLimit.length}
                                                    max={2000}
                                                    min={5}
                                                    showError={true}
                                                />
                                            </div>
                                            
                                            {/* Intent Buttons */}
                                            {charLimit.length > 0 && (
                                                <div className="flex gap-4 mt-6 animate-fade-in border-t border-white/10 pt-4">
                                                    {(selectedFilter === 'all' || selectedFilter === 'whispers') && (
                                                        <button 
                                                            onClick={() => submitWithIntent('whisper')}
                                                            disabled={charLimit.isUnderMin || charLimit.isOverLimit || createThoughtMutation.isPending}
                                                            className={`group flex flex-col items-center p-3 rounded-xl hover:bg-indigo-900/30 transition-colors disabled:opacity-50 ${
                                                                selectedFilter === 'whispers' ? 'flex-1 bg-indigo-950/50 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'flex-1'
                                                            }`}
                                                        >
                                                            <span className="text-xl mb-1 opacity-70 group-hover:opacity-100">💨</span>
                                                            <span className="text-sm font-medium text-indigo-300">Release Whisper</span>
                                                            <span className="text-xs text-indigo-500/70 text-center mt-1">Fades in 24h. Anonymous.</span>
                                                        </button>
                                                    )}

                                                    {(selectedFilter === 'all' || selectedFilter === 'diary' || selectedFilter === 'private') && (
                                                        <button 
                                                            onClick={() => submitWithIntent('diary')}
                                                            disabled={charLimit.isUnderMin || charLimit.isOverLimit || createThoughtMutation.isPending}
                                                            className={`group flex flex-col items-center p-3 rounded-xl hover:bg-emerald-900/30 transition-colors disabled:opacity-50 ${
                                                                selectedFilter === 'diary' || selectedFilter === 'private' ? 'flex-1 bg-emerald-950/50 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'flex-1 border-l border-r border-white/5'
                                                            }`}
                                                        >
                                                            <span className="text-xl mb-1 opacity-70 group-hover:opacity-100">🔒</span>
                                                            <span className="text-sm font-medium text-emerald-300">{selectedFilter === 'all' ? 'Save to Diary' : 'Lock in Vault'}</span>
                                                            <span className="text-xs text-emerald-500/70 text-center mt-1">For your eyes only.</span>
                                                        </button>
                                                    )}

                                                    {(selectedFilter === 'all' || selectedFilter === 'discussions') && (
                                                        <button 
                                                            onClick={() => submitWithIntent('discussion')}
                                                            disabled={charLimit.isUnderMin || charLimit.isOverLimit || createThoughtMutation.isPending || (selectedFilter === 'discussions' && topic.trim().length === 0)}
                                                            className={`group flex flex-col items-center p-3 rounded-xl hover:bg-amber-900/30 transition-colors disabled:opacity-50 ${
                                                                selectedFilter === 'discussions' ? 'flex-1 bg-amber-950/50 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'flex-1'
                                                            }`}
                                                        >
                                                            <span className="text-xl mb-1 opacity-70 group-hover:opacity-100">☕</span>
                                                            <span className="text-sm font-medium text-amber-300">Share to Cafe</span>
                                                            <span className="text-xs text-amber-500/70 text-center mt-1">Open for public discussion.</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* AI Recommendations UI */}
                                            <AnimatePresence>
                                                {selectedFilter === 'whispers' && (isRecommending || recommendations.length > 0) && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="mt-6 pt-4 border-t border-indigo-500/10"
                                                    >
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                                                            <span className="text-sm font-medium text-indigo-300/80">Resonating with your whisper...</span>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {isRecommending ? (
                                                                [1, 2].map(i => (
                                                                    <div key={i} className="h-20 bg-indigo-950/20 animate-pulse rounded-xl border border-indigo-500/10" />
                                                                ))
                                                            ) : (
                                                                recommendations.map((rec, i) => (
                                                                    <div 
                                                                        key={i} 
                                                                        onClick={() => {
                                                                            if (rec.type === 'circle') {
                                                                                setLocation('/night-circles');
                                                                            } else {
                                                                                setSelectedFilter('discussions');
                                                                                toast({
                                                                                    title: "Joined Discussion",
                                                                                    description: "Scroll down to see the cafe.",
                                                                                });
                                                                            }
                                                                        }}
                                                                        className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-3 hover:bg-indigo-900/30 transition-colors cursor-pointer group"
                                                                    >
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <Badge variant="outline" className="text-[10px] bg-black/40 border-indigo-500/30 text-indigo-300">
                                                                                {rec.type === 'circle' ? 'Night Circle' : 'Discussion'}
                                                                            </Badge>
                                                                            <span className="text-[10px] text-indigo-400/60 font-mono">
                                                                                {(rec.score * 100).toFixed(0)}% match
                                                                            </span>
                                                                        </div>
                                                                        <h4 className="text-sm font-medium text-indigo-100 truncate group-hover:text-white transition-colors">
                                                                            {rec.item.name || rec.item.topic || 'Untitled'}
                                                                        </h4>
                                                                        <p className="text-xs text-indigo-300/70 truncate mt-1">
                                                                            {rec.item.description || rec.item.content}
                                                                        </p>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>



                    {/* Thoughts Stream */}
                    <div className="space-y-6 pb-20">
                        {selectedFilter === 'discussions' ? (
                            <div className="space-y-6">
                                {isCafeLoading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <div key={i} className="animate-pulse space-y-4 p-6 rounded-2xl bg-amber-950/20 border border-amber-500/10">
                                            <div className="h-4 bg-amber-500/10 rounded w-1/4"></div>
                                            <div className="space-y-2">
                                                <div className="h-4 bg-amber-500/10 rounded w-full"></div>
                                                <div className="h-4 bg-amber-500/10 rounded w-5/6"></div>
                                            </div>
                                        </div>
                                    ))
                                ) : cafePosts.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 ring-1 ring-amber-500/20 bg-amber-950/30 mx-auto">
                                            <Coffee className="w-10 h-10 text-amber-500/50" />
                                        </div>
                                        <h3 className="text-xl font-light mb-2 text-amber-300">The Cafe is empty</h3>
                                        <p className="text-gray-500">Brew the first discussion of the night.</p>
                                    </div>
                                ) : (
                                    <AnimatePresence mode="popLayout">
                                        {cafePosts.map((cafe, index) => renderCafePost(cafe, index))}
                                    </AnimatePresence>
                                )}
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {isLoading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <div key={i} className="animate-pulse space-y-4 p-6 rounded-2xl bg-white/5 border border-white/5">
                                            <div className="h-4 bg-white/10 rounded w-1/4"></div>
                                            <div className="space-y-2">
                                                <div className="h-4 bg-white/10 rounded w-full"></div>
                                                <div className="h-4 bg-white/10 rounded w-5/6"></div>
                                            </div>
                                        </div>
                                    ))
                                ) : filteredThoughts.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-20 text-center"
                                    >
                                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10 bg-black/40`}>
                                            {currentTheme.emptyIcon}
                                        </div>
                                        <h3 className={`text-xl font-light mb-2 ${currentTheme.accent}`}>{currentTheme.emptyText}</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto">
                                            {selectedFilter === 'private'
                                                ? "Your secrets are safe, but you haven't written any yet."
                                                : "The universe is waiting for your signal."}
                                        </p>
                                    </motion.div>
                                ) : (
                                    filteredThoughts.map((thought, index) => renderThought(thought, index))
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Comment Panel ─────────────────────────────────────────────────────────────

interface CommentPanelProps {
    endpoint: string;
    user: { id: number; username: string } | null;
    replyInput: string;
    onReplyChange: (val: string) => void;
    onSubmit: () => void;
    isPending: boolean;
}

function CommentPanel({ endpoint, user, replyInput, onReplyChange, onSubmit, isPending }: CommentPanelProps) {
    const { data: replies = [], isLoading } = useQuery<any[]>({
        queryKey: [endpoint],
        queryFn: async () => {
            const res = await fetch(endpoint);
            if (!res.ok) throw new Error('Failed to load replies');
            return res.json();
        },
    });

    const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (replyInput.trim()) onSubmit();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
        >
            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                {/* Existing replies */}
                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2].map(i => (
                            <div key={i} className="h-10 bg-white/5 animate-pulse rounded-lg" />
                        ))}
                    </div>
                ) : replies.length === 0 ? (
                    <p className="text-xs text-gray-600 italic text-center py-2">
                        No replies yet. Be the first to respond.
                    </p>
                ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                        {replies.map((reply) => (
                            <div
                                key={reply.id}
                                className="flex items-start gap-2 bg-white/5 rounded-lg px-3 py-2"
                            >
                                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-[8px] text-indigo-300">
                                        {reply.authorId ? reply.authorId.toString().slice(-2) : '?'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-indigo-300 font-medium mb-0.5">
                                        {reply.authorId ? `Anon #${reply.authorId}` : 'Anonymous'}
                                    </p>
                                    <p className="text-sm text-gray-300 leading-relaxed break-words">{reply.content}</p>
                                    <p className="text-[10px] text-gray-600 mt-1">
                                        {reply.createdAt ? new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reply input */}
                <div className="flex gap-2 items-end">
                    <textarea
                        value={replyInput}
                        onChange={(e) => onReplyChange(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder={user ? 'Write a reply… (Enter to send)' : 'Log in to reply'}
                        disabled={!user || isPending}
                        rows={1}
                        className="flex-1 resize-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/40 disabled:opacity-40 transition-colors"
                        style={{ minHeight: '36px', maxHeight: '100px' }}
                        onInput={(e) => {
                            const t = e.currentTarget;
                            t.style.height = 'auto';
                            t.style.height = Math.min(t.scrollHeight, 100) + 'px';
                        }}
                    />
                    <Button
                        size="icon"
                        disabled={!user || !replyInput.trim() || isPending}
                        onClick={onSubmit}
                        className="h-9 w-9 flex-shrink-0 bg-blue-600 hover:bg-blue-500 disabled:opacity-30"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
