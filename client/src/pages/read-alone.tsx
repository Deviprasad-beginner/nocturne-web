import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Plus, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReadUpload } from "@/components/read-card/ReadUpload";
import type { Read } from "@shared/schema";

export default function ReadAlone() {
    const [, setLocation] = useLocation();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [showUpload, setShowUpload] = useState(false);

    // Get intention from URL params
    const params = new URLSearchParams(window.location.search);
    const intention = params.get("intention") || "think";

    // Fetch user's reads
    const { data, isLoading } = useQuery<Read[]>({
        queryKey: ["/api/v1/reads/mine"],
        enabled: !!user,
    });
    const reads = data ?? [];

    // Create read mutation with file upload support
    const createReadMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            formData.append("intention", intention);

            const res = await fetch("/api/v1/reads", {
                method: "POST",
                credentials: "include",
                body: formData, // Send FormData directly (not JSON)
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to create read");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/v1/reads/mine"] });
            setShowUpload(false);
        },
    });

    // Delete read mutation
    const deleteReadMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/v1/reads/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to delete read");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/v1/reads/mine"] });
        },
    });

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-400">Please sign in to access your bookshelf</p>
                    <Button onClick={() => setLocation("/auth")} className="mt-4">
                        Sign In
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Your Bookshelf</h1>
                        <p className="text-gray-400">Reading to {intention}</p>
                    </div>
                    <Button onClick={() => setShowUpload(!showUpload)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Read
                    </Button>
                </div>

                {/* Upload Component */}
                {showUpload && (
                    <div className="mb-8">
                        <ReadUpload
                            onUpload={(formData) => createReadMutation.mutate(formData)}
                            isUploading={createReadMutation.isPending}
                        />
                        <Button
                            variant="ghost"
                            onClick={() => setShowUpload(false)}
                            className="mt-4 w-full"
                        >
                            Cancel
                        </Button>
                    </div>
                )}

                {/* Reads List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <p className="text-gray-400 text-center py-12">Loading your reads...</p>
                    ) : reads.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 mb-2">Your bookshelf is empty</p>
                            <p className="text-gray-500 text-sm">Add your first read to get started</p>
                        </div>
                    ) : (
                        reads.map((read) => (
                            <Card
                                key={read.id}
                                className="p-6 bg-gray-800/30 border-gray-700 hover:border-indigo-500/50 transition-colors cursor-pointer"
                                onClick={() => setLocation(`/reader/${read.id}`)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-xl font-semibold">{read.title}</h3>
                                            {read.contentType === "pdf" && (
                                                <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
                                                    PDF
                                                </span>
                                            )}
                                        </div>
                                        {read.author && (
                                            <p className="text-gray-400 text-sm mb-2">by {read.author}</p>
                                        )}
                                        <p className="text-gray-500 text-sm line-clamp-2">
                                            {read.content?.substring(0, 150)}...
                                        </p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                            {read.estimatedReadTimeMinutes && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {read.estimatedReadTimeMinutes} min
                                                </span>
                                            )}
                                            <span className="capitalize">{read.intention || "Think"} mode</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm("Delete this read?")) {
                                                deleteReadMutation.mutate(read.id);
                                            }
                                        }}
                                        className="text-gray-400 hover:text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* Back Button */}
                <div className="mt-12 text-center">
                    <Button variant="ghost" onClick={() => setLocation("/read-card")}>
                        ← Change Intention
                    </Button>
                </div>
            </div>
        </div>
    );
}
