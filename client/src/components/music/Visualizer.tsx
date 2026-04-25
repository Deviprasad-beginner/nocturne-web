import { useEffect, useState } from "react";
import { Station } from "@/data/playlists";
import { X, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VisualizerProps {
    station: Station;
    isPlaying: boolean;
    onClose: () => void;
    color: string;
}

export function Visualizer({ station, isPlaying, onClose, color }: VisualizerProps) {
    const [bars, setBars] = useState<number[]>(new Array(32).fill(10));

    // Simulate audio data
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setBars(prev => prev.map(() => Math.max(10, Math.random() * 100)));
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500">
            {/* Background Atmosphere */}
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20 blur-3xl`} />

            {/* Header */}
            <div className="absolute top-6 right-6 z-50">
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white/50 hover:text-white hover:bg-white/10 rounded-full">
                    <Minimize2 className="w-6 h-6" />
                </Button>
            </div>

            {/* Central Content */}
            <div className="relative z-10 flex flex-col items-center gap-8 text-center p-8 max-w-2xl">
                <div className={`w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-gradient-to-br ${color} shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center mb-8 animate-pulse-slow`}>
                    <div className="w-full h-full bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
                        <span className="text-6xl animate-bounce-slow">🎵</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight">
                        {station.name}
                    </h2>
                    <p className="text-xl text-white/50 font-light tracking-wide">
                        Live Broadcast
                    </p>
                </div>
            </div>

            {/* Visualizer Bars */}
            <div className="absolute bottom-0 left-0 right-0 h-64 flex items-end justify-center gap-1 md:gap-2 px-8 pb-32 md:pb-12 opacity-80">
                {bars.map((height, i) => (
                    <div
                        key={i}
                        className={`w-2 md:w-4 rounded-t-full transition-all duration-300 ease-in-out bg-gradient-to-t ${color.replace('from-', 'from-white/10 ').replace('to-', 'to-')}`}
                        style={{
                            height: `${isPlaying ? height : 10}%`,
                            opacity: Math.max(0.3, height / 100)
                        }}
                    />
                ))}
            </div>

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.02); opacity: 0.9; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }
                 @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow {
                     animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
