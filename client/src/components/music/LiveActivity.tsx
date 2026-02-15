import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Play, Radio } from "lucide-react";

interface Activity {
    id: string;
    type: "join" | "play" | "switch";
    text: string;
    timestamp: Date;
}

const mockActivities: Activity[] = [
    { id: "1", type: "play", text: "DevBeats started Code & Coffee", timestamp: new Date(Date.now() - 30000) },
    { id: "2", type: "join", text: "3 souls joined Midnight Session", timestamp: new Date(Date.now() - 60000) },
    { id: "3", type: "switch", text: "Someone switched to Nocturne Ambient", timestamp: new Date(Date.now() - 120000) },
    { id: "4", type: "play", text: "NightOwl42 started Lo-Fi Dreams", timestamp: new Date(Date.now() - 180000) },
    { id: "5", type: "join", text: "5 listeners joined Deep Focus", timestamp: new Date(Date.now() - 240000) },
];

export function LiveActivity() {
    const [activities, setActivities] = useState<Activity[]>(mockActivities);

    useEffect(() => {
        // Simulate new activities every 10-15 seconds
        const interval = setInterval(() => {
            const newActivity: Activity = {
                id: Date.now().toString(),
                type: ["join", "play", "switch"][Math.floor(Math.random() * 3)] as Activity["type"],
                text: [
                    "Someone started Midnight Vibes",
                    "2 listeners joined Coding Flow",
                    "NightCoder switched to Deep Thought",
                    "DevSoul started Ambient Dreams",
                ][Math.floor(Math.random() * 4)],
                timestamp: new Date(),
            };
            setActivities((prev) => [newActivity, ...prev.slice(0, 9)]);
        }, Math.random() * 5000 + 10000);

        return () => clearInterval(interval);
    }, []);

    const getIcon = (type: Activity["type"]) => {
        switch (type) {
            case "join":
                return <Users className="h-3 w-3" />;
            case "play":
                return <Play className="h-3 w-3" />;
            case "switch":
                return <Radio className="h-3 w-3" />;
        }
    };

    const getTimeAgo = (timestamp: Date) => {
        const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
        if (seconds < 60) return "just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

    return (
        <div className="w-full h-full">
            <div className="mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <h3 className="text-sm font-semibold text-white">Live Activity</h3>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <AnimatePresence initial={false}>
                    {activities.map((activity) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-start gap-2">
                                <div className="mt-0.5 text-purple-400">
                                    {getIcon(activity.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                        {activity.text}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {getTimeAgo(activity.timestamp)}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
