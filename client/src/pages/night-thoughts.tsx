import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { NightThought, InsertNightThought } from "@shared/schema";
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
    Sparkles, Coffee, Edit3, Trash2, Send, Eye, EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCharacterLimit } from "@/hooks/useCharacterLimit";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@shared/schema";

export default function NightThoughtsPage() {
    const [isCreating, setIsCreating] = useState(false);
    const [isPrivate, setIsPrivate] = useState(true); // Default to private for privacy-first
    const [topic, setTopic] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");
    const { toast } = useToast();

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

    // Neuron Activators - Living Placeholders
    const [activatorIndex, setActivatorIndex] = useState(0);
    const activators = [
        "Something you didn't say today...",
        "A moment that stayed with you...",
        "What feels unfinished right now?",
        "Something you keep postponing...",
        "A thought that doesn't need clarity...",
        "The sound of the night outside...",
        "A memory you haven't visited in a while..."
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/v1/thoughts'], refetchType: 'active' });
            charLimit.reset();
            setTopic("");
            setIsPrivate(true); // Reset to secure default
            setIsCreating(false);
            toast({
                title: "Thought Captured",
                description: isPrivate ? "Securely stored in your private diary." : "Shared with the night sky.",
                className: isPrivate ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-indigo-900 border-indigo-700 text-white"
            });
        },
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({
                variant: "destructive",
                title: "Authentication Required",
                description: "Please log in to share thoughts.",
            });
            return;
        }

        if (charLimit.isUnderMin || charLimit.isOverLimit) return;

        createThoughtMutation.mutate({
            content: charLimit.value.trim(),
            topic: topic.trim() || undefined,
            isPrivate,
            allowReplies: !isPrivate,
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
                    dotColor: "bg-gray-400 shadow-[0_0_10px_rgba(156,163,175,0.5)]"
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
                    dotColor: "bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
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
                    dotColor: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
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
                    dotColor: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
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
                    dotColor: "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                };
        }
    };

    const currentTheme = getTheme(selectedFilter);

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

                        <Button
                            onClick={() => setIsCreating(!isCreating)}
                            className={`px-8 py-6 rounded-full text-base font-medium transition-all duration-300 shadow-lg hover:scale-105 ${isCreating
                                ? "bg-white/10 text-gray-300 hover:bg-white/20"
                                : "bg-white text-black hover:bg-gray-100 shadow-white/10"
                                }`}
                        >
                            {isCreating ? "Close for now" : "New Thought"}
                        </Button>
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

                    {/* Smart Composer */}
                    <AnimatePresence>
                        {isCreating && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                className="mb-10"
                            >
                                <Card className={`overflow-hidden border backdrop-blur-xl transition-colors duration-500 ${isPrivate
                                    ? "bg-black/40 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                                    : "bg-indigo-950/20 border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]"
                                    }`}>
                                    <CardContent className="p-6 sm:p-8">
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-gray-300 transition-opacity duration-500 ${charLimit.length > 0 ? 'opacity-0' : 'opacity-100'}`}>
                                                    <Sparkles className="w-3 h-3 text-yellow-400" />
                                                    <span>{getSmartHint()}</span>
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    <Label htmlFor="private-toggle" className={`text-sm font-medium transition-colors ${topic ? "text-gray-400" : isPrivate ? "text-emerald-400" : "text-gray-500"}`}>
                                                        {topic ? "Public Discussion" : isPrivate ? "Private" : "Public"}
                                                    </Label>
                                                    <Switch
                                                        id="private-toggle"
                                                        checked={isPrivate}
                                                        onCheckedChange={setIsPrivate}
                                                        disabled={topic.trim().length > 0}
                                                        className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {(topic || charLimit.value.includes('?')) && (
                                                    <Input
                                                        value={topic}
                                                        onChange={(e) => setTopic(e.target.value)}
                                                        placeholder="Add a topic..."
                                                        className="bg-transparent border-none text-lg font-medium placeholder:text-gray-600 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                    />
                                                )}
                                                <Textarea
                                                    value={charLimit.value}
                                                    onChange={(e) => charLimit.setValue(e.target.value)}
                                                    placeholder={isPrivate ? "Dear diary..." : "To the world..."}
                                                    rows={5}
                                                    className="bg-transparent border-none text-xl sm:text-2xl font-light placeholder:text-gray-700 leading-relaxed p-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[150px]"
                                                />
                                                <p className="text-xs text-gray-600 italic mt-2 text-center opacity-60">This doesn't need to make sense yet.</p>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <CharacterCounter
                                                    current={charLimit.length}
                                                    max={2000}
                                                    min={5}
                                                    showError={true}
                                                />
                                                <Button
                                                    type="submit"
                                                    disabled={charLimit.isUnderMin || charLimit.isOverLimit || createThoughtMutation.isPending}
                                                    className={`min-w-[120px] transition-all hover:scale-105 ${isPrivate
                                                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                                        : "bg-indigo-600 hover:bg-indigo-500 text-white"
                                                        }`}
                                                >
                                                    {createThoughtMutation.isPending ? "Saving..." : isPrivate ? "Save Privately" : "Publish"}
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>



                    {/* Thoughts Stream */}
                    <div className="space-y-6 pb-20">
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
                                            : "The universe is waiting for your signal. Be the first to break the silence."}
                                    </p>
                                    <Button
                                        variant="link"
                                        onClick={() => setIsCreating(true)}
                                        className="mt-4 text-indigo-400 hover:text-indigo-300"
                                    >
                                        Write a thought
                                    </Button>
                                </motion.div>
                            ) : (
                                filteredThoughts.map((thought, index) => {
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
                                                                        {isOwner ? "You" : `Anonymous #${thought.authorId}`}
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
                                                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 h-8">
                                                                <MessageCircle className="w-4 h-4 mr-1.5" />
                                                                <span className="text-xs">{thought.replies || 0}</span>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>

    );
}
