import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface EmotionVisualizerProps {
    dominantEmotion: string;
}

export function EmotionVisualizer({ dominantEmotion }: EmotionVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const getColors = (emotion: string) => {
        switch (emotion) {
            case 'loneliness': return ['#1e3a8a', '#172554']; // Blue
            case 'curiosity': return ['#581c87', '#3b0764']; // Purple
            case 'peace': return ['#064e3b', '#022c22']; // Green
            case 'anxiety': return ['#7f1d1d', '#450a0a']; // Red
            case 'mystery': return ['#312e81', '#1e1b4b']; // Indigo
            default: return ['#1f2937', '#111827']; // Gray
        }
    };

    const [primary, secondary] = getColors(dominantEmotion);

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
            <motion.div
                animate={{
                    background: `radial-gradient(circle at 50% 50%, ${primary} 0%, ${secondary} 70%, #000000 100%)`,
                }}
                transition={{ duration: 2 }}
                className="absolute inset-0 opacity-40"
            />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />
        </div>
    );
}
