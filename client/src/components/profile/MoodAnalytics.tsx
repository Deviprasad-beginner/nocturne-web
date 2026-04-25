import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface MoodAnalyticsProps {
    moodData?: { emotion: string; count: number }[];
    dominantEmotion?: string;
    reflectionScore?: number;
}

export default function MoodAnalytics({ moodData, dominantEmotion, reflectionScore }: MoodAnalyticsProps) {

    // Mock data if none provided
    const data = moodData || [
        { emotion: "Lonely", count: 4 },
        { emotion: "Nostalgia", count: 7 },
        { emotion: "Anxiety", count: 2 },
        { emotion: "Ambition", count: 5 },
        { emotion: "Joy", count: 3 },
    ];

    const getEmotionColor = (emotion: string) => {
        const colors: Record<string, string> = {
            Lonely: "#6b7280", // Gray
            Nostalgia: "#f59e0b", // Amber
            Anxiety: "#ef4444", // Red
            Ambition: "#8b5cf6", // Purple
            Joy: "#10b981", // Emerald
        };
        return colors[emotion] || "#6366f1";
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Mood Chart */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                        Weekly Mood Graph
                    </h3>
                    <div className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400 border border-white/5">Last 7 Days</div>
                </div>

                <div className="h-[220px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis
                                dataKey="emotion"
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                }}
                                cursor={{ fill: 'rgba(139, 92, 246, 0.1)', radius: 8 }}
                            />
                            <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={32}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getEmotionColor(entry.emotion)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Dominant Emotion & Reflection Score */}
            <div className="grid grid-cols-1 gap-6">
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
                    {/* Decorative background blur */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl group-hover:bg-purple-600/30 transition-colors duration-500"></div>

                    <h3 className="text-lg font-semibold text-slate-300 mb-2">Dominant Emotion</h3>
                    <div className="flex items-end justify-between relative z-10">
                        <div>
                            <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 capitalize drop-shadow-lg">
                                {dominantEmotion || "Reflection"}
                            </span>
                            <p className="text-slate-400 mt-3 text-sm leading-relaxed max-w-xs">
                                Your thoughts have been leaning towards <span className="text-purple-300 font-medium">{dominantEmotion?.toLowerCase() || "reflection"}</span> lately.
                            </p>
                        </div>
                        <div className="text-4xl">
                            {/* Emoji based on emotion could go here */}
                            ✨
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-slate-300">Reflection Depth</h3>
                        <span className="text-sm font-medium text-slate-500">Average</span>
                    </div>

                    <div className="flex items-end gap-2 mb-4">
                        <span className="text-5xl font-bold text-blue-400">{reflectionScore || 7.5}</span>
                        <span className="text-slate-500 text-lg mb-1">/ 10.0</span>
                    </div>

                    <div className="relative h-4 bg-slate-800/80 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                            style={{ width: `${(reflectionScore || 7.5) * 10}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
