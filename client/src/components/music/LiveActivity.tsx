import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Activity {
    id: string;
    type: "join" | "play" | "switch";
    text: string;
    timestamp: Date;
}

const mockActivities: Activity[] = [
    { id: "1", type: "play",   text: "DevBeats started Code & Coffee",       timestamp: new Date(Date.now() - 30000) },
    { id: "2", type: "join",   text: "3 souls joined Midnight Session",       timestamp: new Date(Date.now() - 60000) },
    { id: "3", type: "switch", text: "Someone switched to Nocturne Ambient",  timestamp: new Date(Date.now() - 120000) },
    { id: "4", type: "play",   text: "NightOwl42 started Lo-Fi Dreams",       timestamp: new Date(Date.now() - 180000) },
    { id: "5", type: "join",   text: "5 listeners joined Deep Focus",         timestamp: new Date(Date.now() - 240000) },
];

function getTimeAgo(timestamp: Date) {
    const s = Math.floor((Date.now() - timestamp.getTime()) / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
}

export function LiveActivity() {
    const [activities, setActivities] = useState<Activity[]>(mockActivities);

    useEffect(() => {
        const interval = setInterval(() => {
            const texts = [
                "Someone started Midnight Vibes",
                "2 listeners joined Coding Flow",
                "NightCoder switched to Deep Thought",
                "DevSoul started Ambient Dreams",
            ];
            setActivities(prev => [{
                id: Date.now().toString(),
                type: (["join", "play", "switch"] as const)[Math.floor(Math.random() * 3)],
                text: texts[Math.floor(Math.random() * texts.length)],
                timestamp: new Date(),
            }, ...prev.slice(0, 9)]);
        }, Math.random() * 5000 + 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full">
            <div className="flex items-center gap-2 mb-5">
                <span className="block w-1.5 h-1.5 rounded-full bg-white/25" />
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-medium">
                    Live activity
                </p>
            </div>

            <div className="space-y-1 max-h-[420px] overflow-y-auto">
                <AnimatePresence initial={false}>
                    {activities.map((a) => (
                        <motion.div
                            key={a.id}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35 }}
                            className="px-3 py-2.5 rounded-xl border border-white/[0.04] hover:border-white/[0.07] hover:bg-white/[0.02] transition-colors duration-300"
                        >
                            <p className="text-xs text-white/38 leading-relaxed">{a.text}</p>
                            <p className="text-[10px] text-white/18 mt-0.5">{getTimeAgo(a.timestamp)}</p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
