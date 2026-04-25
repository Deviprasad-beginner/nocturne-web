import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Moon, Star, Sparkles } from "lucide-react";

export default function FirstNight() {
    const [_, setLocation] = useLocation();
    const [isCompleting, setIsCompleting] = useState(false);

    const handleContinue = async () => {
        setIsCompleting(true);
        try {
            // Mark onboarding as complete
            await apiRequest("POST", "/api/v1/onboarding/complete", {});

            // Invalidate user query - React Query will refetch automatically
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });

            // Navigate to diaries page to write first thought
            setLocation("/diaries");
        } catch (error) {
            console.error("Error completing onboarding:", error);
            // Continue anyway - user can manually mark complete later
            setLocation("/diaries");
        } finally {
            setIsCompleting(false);
        }
    };

    const handleSkip = async () => {
        setIsCompleting(true);
        try {
            await apiRequest("POST", "/api/v1/onboarding/complete", {});

            // Invalidate user query - React Query will refetch automatically
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });

            setLocation("/");
        } catch (error) {
            console.error("Error skipping onboarding:", error);
            setLocation("/");
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
            <div className="max-w-2xl w-full space-y-12 text-center">

                {/* Stars decoration */}
                <div className="flex justify-center items-center gap-4 mb-8">
                    <Star className="w-5 h-5 text-purple-400/50 animate-pulse" />
                    <Moon className="w-8 h-8 text-purple-300" />
                    <Star className="w-5 h-5 text-purple-400/50 animate-pulse" style={{ animationDelay: "0.5s" }} />
                </div>

                {/* Title */}
                <div className="space-y-6">
                    <h1 className="text-4xl font-light text-white tracking-wide">
                        Your First Night
                    </h1>

                    {/* Identity statement */}
                    <p className="text-xl text-gray-300 font-light leading-relaxed max-w-xl mx-auto">
                        Nocturne is a quiet place to share thoughts you don't post anywhere else.
                    </p>
                </div>

                {/* Three rules */}
                <div className="space-y-6 py-8">
                    <div className="flex items-start gap-4 max-w-md mx-auto">
                        <Sparkles className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                        <p className="text-lg text-gray-400 text-left">
                            You are anonymous.
                        </p>
                    </div>

                    <div className="flex items-start gap-4 max-w-md mx-auto">
                        <Sparkles className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                        <p className="text-lg text-gray-400 text-left">
                            No likes, no followers.
                        </p>
                    </div>

                    <div className="flex items-start gap-4 max-w-md mx-auto">
                        <Sparkles className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                        <p className="text-lg text-gray-400 text-left">
                            Write honestly. Read gently.
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <div className="space-y-4 pt-4">
                    <Button
                        onClick={handleContinue}
                        disabled={isCompleting}
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 hover:scale-105"
                    >
                        {isCompleting ? "..." : "Write your first thought"}
                    </Button>

                    {/* Skip button - subtle */}
                    <div>
                        <button
                            onClick={handleSkip}
                            disabled={isCompleting}
                            className="text-sm text-gray-500 hover:text-gray-400 transition-colors underline"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>

                {/* Reassurance */}
                <p className="text-sm text-gray-600 max-w-md mx-auto pt-8">
                    Nothing here is tied to your real identity.
                </p>

            </div>
        </div>
    );
}
