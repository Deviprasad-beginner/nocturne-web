import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Clock, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Read } from "@shared/schema";

export default function ReadTonight() {
    const [, setLocation] = useLocation();
    const { user } = useAuth();
    const [selectedIntention, setSelectedIntention] = useState<string | null>(null);

    // Fetch curated reads
    const { data: reads = [], isLoading } = useQuery<Read[]>({
        queryKey: ["/api/v1/reads/tonight"],
        enabled: !!user,
    });

    const filteredReads = selectedIntention
        ? reads.filter((r) => r.intention === selectedIntention)
        : reads;

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-400">Please sign in to see tonight's reads</p>
                    <Button onClick={() => setLocation("/auth")} className="mt-4">
                        Sign In
                    </Button>
                </div>
            </div>
        );
    }

    const intentions = [
        { value: "learn", label: "Learn", icon: "📚", color: "blue" },
        { value: "feel", label: "Feel", icon: "💫", color: "amber" },
        { value: "think", label: "Think", icon: "🧠", color: "indigo" },
        { value: "sleep", label: "Sleep", icon: "🌙", color: "purple" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="w-8 h-8 text-purple-400" />
                        <h1 className="text-4xl font-bold">Tonight's Reads</h1>
                        <Sparkles className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-gray-400 text-lg">
                        Curated texts shared anonymously by fellow night readers
                    </p>
                </div>

                {/* Intention Filter */}
                <div className="flex justify-center gap-3 mb-8 flex-wrap">
                    <Button
                        variant={selectedIntention === null ? "default" : "outline"}
                        onClick={() => setSelectedIntention(null)}
                        size="sm"
                    >
                        All
                    </Button>
                    {intentions.map((int) => (
                        <Button
                            key={int.value}
                            variant={selectedIntention === int.value ? "default" : "outline"}
                            onClick={() => setSelectedIntention(int.value)}
                            size="sm"
                            className="gap-2"
                        >
                            <span>{int.icon}</span>
                            {int.label}
                        </Button>
                    ))}
                </div>

                {/* Reads Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-400">Loading tonight's reads...</p>
                        </div>
                    ) : filteredReads.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 mb-2">No reads available yet tonight</p>
                            <p className="text-gray-500 text-sm">
                                Be the first to share something for others to discover
                            </p>
                            <Button
                                onClick={() => setLocation("/read-card")}
                                className="mt-4"
                                variant="outline"
                            >
                                Share a Read
                            </Button>
                        </div>
                    ) : (
                        filteredReads.map((read) => (
                            <Card
                                key={read.id}
                                className="p-6 bg-gray-800/30 border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer group"
                                onClick={() => setLocation(`/reader/${read.id}`)}
                            >
                                <div className="mb-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-xl font-semibold group-hover:text-purple-300 transition-colors">
                                            {read.title}
                                        </h3>
                                        {read.contentType === "pdf" && (
                                            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
                                                PDF
                                            </span>
                                        )}
                                    </div>
                                    {read.author && (
                                        <p className="text-gray-400 text-sm mb-3">by {read.author}</p>
                                    )}
                                    <p className="text-gray-500 text-sm line-clamp-3">
                                        {read.content?.substring(0, 150)}...
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-700">
                                    {read.estimatedReadTimeMinutes && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {read.estimatedReadTimeMinutes}m
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1 capitalize">
                                        {intentions.find((i) => i.value === read.intention)?.icon}
                                        {read.intention}
                                    </span>
                                    <span className="flex items-center gap-1 ml-auto text-purple-400">
                                        <Users className="w-3 h-3" />
                                        quiet
                                    </span>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* Back Button */}
                <div className="mt-12 text-center">
                    <Button variant="ghost" onClick={() => setLocation("/read-card")}>
                        ← Back to Read Card
                    </Button>
                </div>
            </div>
        </div>
    );
}
