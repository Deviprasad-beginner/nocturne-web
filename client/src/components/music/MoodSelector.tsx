import { useMusic } from "@/context/MusicContext";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const moods = [
    { id: "focus", label: "Focus", icon: "🎯", color: "from-blue-600 to-cyan-600" },
    { id: "relax", label: "Relax", icon: "🌊", color: "from-indigo-600 to-purple-600" },
    { id: "lonely", label: "Lonely", icon: "🌙", color: "from-purple-600 to-pink-600" },
    { id: "deep-night", label: "Deep Night", icon: "🌌", color: "from-gray-800 to-purple-900" },
    { id: "coding", label: "Coding", icon: "💻", color: "from-green-600 to-teal-600" },
];

export function MoodSelector() {
    const { mood, setMood } = useMusic();

    return (
        <div className="w-full">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🎭</span>
                Select Your Mood
            </h2>
            <div className="flex flex-wrap gap-3">
                {moods.map((m) => (
                    <motion.button
                        key={m.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMood(mood === m.id ? null : m.id)}
                        className={`
              relative px-6 py-3 rounded-full font-medium transition-all
              ${mood === m.id
                                ? `bg-gradient-to-r ${m.color} text-white shadow-lg shadow-purple-500/50 border-2 border-white/20`
                                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                            }
            `}
                    >
                        <span className="mr-2">{m.icon}</span>
                        {m.label}
                        {mood === m.id && (
                            <motion.div
                                layoutId="mood-glow"
                                className={`absolute inset-0 rounded-full bg-gradient-to-r ${m.color} opacity-20 blur-xl`}
                            />
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
