import { motion } from "framer-motion";
import { Whisper } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Activity, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhisperCardProps {
    whisper: Whisper;
    onInteract: (id: number, type: 'resonate' | 'echo' | 'absorb') => void;
}

export function WhisperCard({ whisper, onInteract }: WhisperCardProps) {
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
                            <button
                                onClick={() => onInteract(whisper.id, 'resonate')}
                                className="hover:text-pink-400 transition-colors p-1"
                                title="Resonate"
                            >
                                <Heart className="w-4 h-4" />
                                <span className="sr-only">Resonate</span>
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
