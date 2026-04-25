import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Moon, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface NightlyPrompt {
    id: number;
    content: string;
    shiftMode: string;
    createdAt: Date;
    expiresAt: Date;
}

interface UserReflection {
    id: number;
    promptId: number;
    userId: number;
    responseContent: string;
    aiEvaluation: { text: string };
    createdAt: Date;
}

export default function InspectionCard() {
    const [response, setResponse] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [sentiment, setSentiment] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();

    // Data Fetching
    const { data: user } = useQuery<User | null>({
        queryKey: ['/api/user'],
    });

    const { data: prompt, isLoading: promptLoading } = useQuery<NightlyPrompt>({
        queryKey: ['/api/v1/reflections/prompt?type=inspection'],
        enabled: !!user,
    });

    const { data: history = [], isLoading: historyLoading } = useQuery<UserReflection[]>({
        queryKey: ['/api/v1/reflections/history'],
        enabled: !!user && showHistory,
    });

    // Mutations
    const submitMutation = useMutation({
        mutationFn: async (content: string) => {
            const res = await apiRequest('POST', '/api/v1/reflections/respond', {
                promptId: prompt?.id,
                content
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/v1/reflections/history'] });
            queryClient.invalidateQueries({ queryKey: ['/api/user'] }); // Update streak
            setResponse("");
            setSentiment(null);
            toast({
                title: "Reflection Sealed",
                description: "Your thought has been captured in the night.",
            });
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Could not seal reflection",
                description: String(error),
            });
        }
    });

    const sentimentMutation = useMutation({
        mutationFn: async (content: string) => {
            const res = await apiRequest('POST', '/api/v1/reflections/sentiment', { content });
            return res.json();
        },
        onSuccess: (data) => {
            setSentiment(data.sentiment);
        }
    });

    // Effects
    useEffect(() => {
        if (response.length > 50 && !isTyping) {
            const timer = setTimeout(() => {
                sentimentMutation.mutate(response);
            }, 1000); // Debounce sentiment check
            return () => clearTimeout(timer);
        }
    }, [response, isTyping]);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setResponse(e.target.value);
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 800);
    };

    // Derived State
    const wordCount = response.trim().split(/\s+/).filter(w => w.length > 0).length;
    const depthLevel = wordCount < 30 ? "Opening up" : wordCount < 80 ? "Going deeper" : "Fully expressed";
    const depthProgress = Math.min((wordCount / 150) * 100, 100);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (response.length < 5) return;
        submitMutation.mutate(response);
    };

    // Auth Guard
    if (!user) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-light">
                <div className="text-center space-y-6">
                    <Moon className="w-12 h-12 mx-auto text-indigo-400 opacity-50" />
                    <p className="text-gray-400 tracking-wide">Enter the night to inspect your thoughts.</p>
                    <Link href="/auth">
                        <Button className="bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-200 border border-indigo-800/50">
                            Sign In
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#05050A] to-black text-white p-4 sm:p-8 flex justify-center">
            <div className="w-full max-w-[720px] space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5 rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Moon className="w-5 h-5 text-indigo-400" />
                        <h1 className="text-xl font-light tracking-wide text-white/90">Inspection</h1>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white hover:bg-white/5 font-light"
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        {showHistory ? "Current" : "History"}
                    </Button>
                </div>

                {/* Main Content */}
                <AnimatePresence mode="wait">
                    {!showHistory ? (
                        <motion.div
                            key="inspection-active"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {/* Intro Line */}
                            <div className="text-center">
                                <p className="text-sm font-light text-white/40 tracking-wider">
                                    There is no right answer. Only honesty.
                                </p>
                            </div>

                            {/* Prompt Section */}
                            <div className="bg-white/[0.03] border border-white/5 rounded-[20px] p-6 sm:p-8 backdrop-blur-sm">
                                {promptLoading ? (
                                    <div className="space-y-4 animate-pulse">
                                        <div className="h-6 bg-white/5 rounded w-3/4 mx-auto"></div>
                                        <div className="h-4 bg-white/5 rounded w-1/2 mx-auto"></div>
                                    </div>
                                ) : prompt ? (
                                    <div className="space-y-6">
                                        <h2 className="text-xl sm:text-2xl font-light leading-relaxed text-center text-white/90">
                                            {prompt.content}
                                        </h2>
                                        <div className="flex justify-center">
                                            <span className="text-xs text-white/30 font-light bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                                Closes at 4:00 AM
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500">No inspection topics for tonight.</p>
                                )}
                            </div>

                            {/* Editor Section */}
                            {prompt && (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="relative group">
                                        <Textarea
                                            value={response}
                                            onChange={handleTextChange}
                                            placeholder="Say what you haven't said..."
                                            className="min-h-[240px] bg-transparent border-0 text-lg font-light leading-relaxed resize-none focus:ring-0 p-0 text-white/80 placeholder:text-white/20 selection:bg-indigo-500/30"
                                            autoFocus
                                        />

                                        {/* Micro Intelligence Indicators */}
                                        <div className="absolute bottom-0 right-0 left-0 flex items-center justify-between pointer-events-none pb-2">
                                            {/* Depth Indicator */}
                                            <div className="flex items-center gap-3 transition-opacity duration-500">
                                                <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500/50 transition-all duration-1000 ease-out"
                                                        style={{ width: `${depthProgress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-white/30 font-light lowercase">
                                                    {depthLevel}
                                                </span>
                                            </div>

                                            {/* Sentiment Tag */}
                                            <AnimatePresence>
                                                {sentiment && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="bg-indigo-900/20 px-3 py-1 rounded-full border border-indigo-500/20 backdrop-blur-md"
                                                    >
                                                        <span className="text-xs text-indigo-300 font-light">
                                                            Tone: {sentiment}
                                                        </span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Primary Action */}
                                    <Button
                                        type="submit"
                                        disabled={submitMutation.isPending || response.length <= 20}
                                        className="w-full h-[52px] bg-white text-black hover:bg-gray-200 transition-all duration-300 rounded-xl font-medium tracking-wide disabled:opacity-30 disabled:hover:bg-white"
                                    >
                                        {submitMutation.isPending ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Sealing...</span>
                                            </div>
                                        ) : (
                                            "Seal Reflection"
                                        )}
                                    </Button>

                                    <div className="text-center">
                                        <span className="text-xs text-white/20 font-light">
                                            {response.length} characters
                                        </span>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="inspection-history"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-lg font-light text-white/50 mb-6 border-b border-white/5 pb-2">
                                Past Inspections
                            </h2>

                            {historyLoading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-white/20" />
                                </div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-20 opacity-30">
                                    <p>The archives are empty.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {history.map((item) => (
                                        <Card key={item.id} className="bg-white/[0.02] border-white/5 hover:bg-white/[0.04] transition-colors duration-300">
                                            <CardContent className="p-6 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-xs text-indigo-400/50 font-mono">
                                                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                                                            weekday: 'long',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    <p className="text-white/80 font-light leading-relaxed italic border-l-2 border-white/10 pl-4 py-1">
                                                        "{item.responseContent}"
                                                    </p>

                                                    {item.aiEvaluation && (
                                                        <div className="mt-4 pt-4 border-t border-white/5">
                                                            <div className="flex gap-2 items-start">
                                                                <Sparkles className="w-3 h-3 text-indigo-400 mt-1 opacity-50" />
                                                                <p className="text-sm text-indigo-200/60 leading-relaxed font-light">
                                                                    {item.aiEvaluation.text}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
