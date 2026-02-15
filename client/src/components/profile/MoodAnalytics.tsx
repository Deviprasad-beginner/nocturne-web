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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Mood Chart */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white text-lg">Weekly Mood Graph</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="emotion" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getEmotionColor(entry.emotion)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Dominant Emotion & Reflection Score */}
            <div className="grid grid-cols-1 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">Dominant Emotion</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-4xl font-bold text-purple-400 capitalize">{dominantEmotion || "Reflection"}</span>
                            <span className="text-gray-400 text-sm">Based on recent posts</span>
                        </div>
                        <p className="text-gray-400 mt-2 text-sm max-w-xs">
                            Your thoughts have been leaning towards {dominantEmotion?.toLowerCase() || "reflection"} lately.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">Reflection Depth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-4xl font-bold text-blue-400">{reflectionScore || 7.5}</span>
                            <span className="text-gray-400 text-sm">/ 10.0</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                            <div
                                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${(reflectionScore || 7.5) * 10}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
