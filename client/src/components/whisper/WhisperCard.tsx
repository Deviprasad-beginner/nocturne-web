import { motion } from "framer-motion";
import { type Whisper } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Activity, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhisperCardProps {
    whisper: Whisper;
    isLiked?: boolean;
    onInteract: (id: number, type: 'resonate' | 'echo' | 'absorb') => void;
    onLike?: (id: number) => void;
}

export function WhisperCard({ whisper, isLiked = false, onInteract, onLike }: WhisperCardProps) {
    const getEmotionColor = (emotion: string | null) => {
        switch (emotion) {
            case 'loneliness': return 'text-blue-400 border-blue-500/30 bg-blue-500/5';
            case 'curiosity': return 'text-purple-400 border-purple-500/30 bg-purple-500/5';
            case 'peace': return 'text-green-400 border-green-500/30 bg-green-500/5';
            case 'anxiety': return 'text-red-400 border-red-500/30 bg-red-500/5';
            case 'mystery': return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5';
            default: return 'text-gray-400 border-gray-500/30 bg-gray-500/5';
        }
    };

    const colorClass = getEmotionColor(whisper.detectedEmotion);
    const opacity = (whisper.visibilityOpacity || 100) / 100;

    // Check if this is a scanned quote from a book
    const isQuote = (whisper as any).type === "quote";

    if (isQuote) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity, scale: 1 }}
                whileHover={{ scale: 1.01, y: -2 }}
                transition={{ duration: 0.4 }}
                className="relative group w-full my-4"
            >
                {/* Visual Book Margin styling */}
                <div className="absolute inset-0 bg-[#f5f2eb] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-[#d4cfc3] -z-10" />
                <div className="absolute left-10 top-0 bottom-0 w-px bg-red-800/20 -z-10" />

                <Card className="bg-transparent border-none shadow-none rounded-xl overflow-hidden">
                    <CardContent className="p-8 pl-16 relative">
                        <div className="font-serif text-xl leading-relaxed text-[#2c2825] border-l-4 border-indigo-500/20 pl-4 py-2 my-2 bg-black/5 rounded-r">
                            {whisper.content}
                        </div>

                        {/* Faux Hand-written context / margins */}
                        <div className="absolute top-4 left-2 -rotate-90 text-[10px] uppercase tracking-widest text-red-900/40 font-mono">
                            Nocturnal Lens
                        </div>

                        <div className="mt-8 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
                            <span className="font-mono text-xs text-[#5c5855] italic">
                                Scanned at {whisper.decayStage?.toUpperCase()} • {Math.round(whisper.audioFrequency || 444)}Hz
                            </span>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (isLiked) return;
                                        if (onLike) {
                                            onLike(whisper.id);
                                        } else {
                                            onInteract(whisper.id, 'resonate');
                                        }
                                    }}
                                    disabled={isLiked}
                                    className={cn(
                                        "transition-colors p-2 rounded-full",
                                        isLiked
                                            ? "text-red-600 bg-red-100 cursor-default"
                                            : "hover:text-red-600 text-[#8c8885] hover:bg-black/5 cursor-pointer"
                                    )}
                                    title={isLiked ? "Already liked" : "Resonate"}
                                >
                                    <Heart
                                        className="w-4 h-4"
                                        style={{ fill: isLiked ? "currentColor" : "none" }}
                                    />
                                </button>
                                <button
                                    onClick={() => onInteract(whisper.id, 'echo')}
                                    className="text-[#8c8885] hover:text-blue-700 hover:bg-black/5 transition-colors p-2 rounded-full"
                                    title="Leave Margin Note (Echo)"
                                >
                                    <Waves className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity, scale: 1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
            className="relative group"
        >
            <Card className={cn("backdrop-blur-md border transition-all duration-300", colorClass)}>
                <CardContent className="p-6">
                    <p className="text-lg font-light leading-relaxed mb-4 italic">
                        "{whisper.content}"
                    </p>

                    <div className="flex justify-between items-center text-sm opacity-70 group-hover:opacity-100 transition-opacity">
                        <span className="font-mono text-xs">
                            {whisper.decayStage?.toUpperCase()} • {Math.round(whisper.audioFrequency || 444)}Hz
                        </span>

                        <div className="flex gap-2">
                            {/* Like/Resonate button with deduplication */}
                            <button
                                onClick={() => {
                                    if (isLiked) return;
                                    if (onLike) {
                                        onLike(whisper.id);
                                    } else {
                                        onInteract(whisper.id, 'resonate');
                                    }
                                }}
                                disabled={isLiked}
                                className={cn(
                                    "transition-colors p-1 flex items-center gap-1",
                                    isLiked
                                        ? "text-pink-400 cursor-default"
                                        : "hover:text-pink-400 text-gray-400 cursor-pointer"
                                )}
                                title={isLiked ? "Already liked" : "Resonate"}
                            >
                                <Heart
                                    className="w-4 h-4"
                                    style={{ fill: isLiked ? "currentColor" : "none" }}
                                />
                                <span className="sr-only">{isLiked ? "Liked" : "Resonate"}</span>
                            </button>

                            <button
                                onClick={() => onInteract(whisper.id, 'echo')}
                                className="hover:text-blue-400 transition-colors p-1"
                                title="Echo"
                            >
                                <Waves className="w-4 h-4" />
                                <span className="sr-only">Echo</span>
                            </button>

                            <button
                                onClick={() => onInteract(whisper.id, 'absorb')}
                                className="hover:text-purple-400 transition-colors p-1"
                                title="Absorb"
                            >
                                <Activity className="w-4 h-4" />
                                <span className="sr-only">Absorb</span>
                            </button>
                        </div>
                    </div>
                </CardContent>

                {/* Glow effect */}
                <div className={cn("absolute inset-0 -z-10 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500", colorClass.replace('text-', 'bg-'))} />
            </Card>
        </motion.div>
    );
}
