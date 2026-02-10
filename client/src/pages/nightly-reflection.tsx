import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Moon, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

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

export default function NightlyReflection() {
    const [response, setResponse] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const { toast } = useToast();

    const { data: user } = useQuery<User | null>({
        queryKey: ['/api/user'],
    });

    // Get today's prompt
    const { data: prompt, isLoading: promptLoading } = useQuery<NightlyPrompt>({
        queryKey: ['/api/reflections/prompt'],
        enabled: !!user,
    });

    // Get reflection history
    const { data: history = [], isLoading: historyLoading } = useQuery<UserReflection[]>({
        queryKey: ['/api/reflections/history'],
        enabled: !!user && showHistory,
    });

    // Submit response mutation
    const submitMutation = useMutation({
        mutationFn: async (content: string) => {
            const res = await apiRequest('POST', '/api/reflections/respond', {
                promptId: prompt?.id,
                content
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/reflections/history'] });
            setResponse("");
            toast({
                title: "Reflection captured",
                description: "Your thought has been gently received.",
            });
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Could not save reflection",
                description: String(error),
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (response.trim().length < 10) {
            toast({
                variant: "destructive",
                title: "Too brief",
                description: "Please share a bit more of your thinking.",
            });
            return;
        }
        submitMutation.mutate(response.trim());
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Moon className="w-16 h-16 mx-auto opacity-30" />
                    <p className="text-gray-400">Please sign in to access reflections</p>
                    <Link href="/auth">
                        <Button className="bg-indigo-600 hover:bg-indigo-700">Sign In</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white p-3 sm:p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Back</span>
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                                <Moon className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-light">Inspection</h1>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowHistory(!showHistory)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                    >
                        {showHistory ? "Today" : "History"}
                    </Button>
                </div>

                {!showHistory ? (
                    <div className="space-y-6">
                        {/* Info */}
                        <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-700/30">
                            <p className="text-sm text-indigo-200/80 leading-relaxed">
                                Tonight's prompt invites quiet thinking. There is no right answer.
                                The AI will reflect alongside you, not judge you.
                            </p>
                        </div>

                        {/* Prompt Card */}
                        {promptLoading ? (
                            <Card className="bg-gray-800/30 border-gray-700/50">
                                <CardContent className="p-8">
                                    <div className="animate-pulse space-y-3">
                                        <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : prompt ? (
                            <Card className="bg-gray-800/30 border-gray-700/50">
                                <CardContent className="p-8">
                                    <div className="flex items-start space-x-3 mb-4">
                                        <Sparkles className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
                                        <p className="text-lg text-gray-200 leading-relaxed font-light">
                                            {prompt.content}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4">
                                        Valid until {new Date(prompt.expiresAt).toLocaleTimeString()}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-gray-800/30 border-gray-700/50">
                                <CardContent className="p-8 text-center">
                                    <p className="text-gray-400">No prompt available</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Response Form */}
                        {prompt && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Textarea
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        placeholder="Let your thoughts flow..."
                                        rows={6}
                                        className="bg-gray-800/50 border-gray-700/50 text-white resize-none focus:border-indigo-500/50"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">{response.length} characters</p>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={submitMutation.isPending || response.length < 10}
                                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50"
                                >
                                    {submitMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Reflecting...
                                        </>
                                    ) : (
                                        "Submit Reflection"
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-xl font-light mb-4">Past Reflections</h2>
                        {historyLoading ? (
                            <div className="text-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Moon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p>No reflections yet</p>
                            </div>
                        ) : (
                            history.map((item) => (
                                <Card key={item.id} className="bg-gray-800/30 border-gray-700/50">
                                    <CardContent className="p-6 space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-400 mb-2">Your response:</p>
                                            <p className="text-gray-200 italic">"{item.responseContent}"</p>
                                        </div>
                                        {item.aiEvaluation && (
                                            <div className="border-t border-gray-700/50 pt-4">
                                                <p className="text-sm text-gray-400 mb-2">AI reflection:</p>
                                                <p className="text-gray-300 leading-relaxed">{item.aiEvaluation.text}</p>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
