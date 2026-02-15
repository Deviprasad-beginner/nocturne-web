import { useQuery } from "@tanstack/react-query";
import { Diary, Whisper, UserReflection, MidnightCafe } from "@shared/schema";
import { Loader2, Book, MessageCircle, Moon, Lock, ExternalLink, Coffee } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

interface UserContentPreviewProps {
    type: 'void' | 'inspection';
}

export function UserContentPreview({ type }: UserContentPreviewProps) {

    // Queries
    const { data: diaries = [], isLoading: diariesLoading } = useQuery<Diary[]>({
        queryKey: ['/api/v1/users/me/diaries'],
        enabled: type === 'void',
    });

    const { data: whispers = [], isLoading: whispersLoading } = useQuery<Whisper[]>({
        queryKey: ['/api/v1/users/me/whispers'],
        enabled: type === 'void',
    });

    const { data: reflections = [], isLoading: reflectionsLoading } = useQuery<UserReflection[]>({
        queryKey: ['/api/v1/reflections/history'],
        enabled: type === 'inspection',
    });

    const isLoading = (type === 'void' && (diariesLoading || whispersLoading)) || (type === 'inspection' && reflectionsLoading);

    if (isLoading) {
        return (
            <div className="py-8 flex justify-center items-center text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm font-light tracking-wide">Retrieving your archives...</span>
            </div>
        );
    }

    // Render for THE VOID
    if (type === 'void') {
        const hasContent = diaries.length > 0 || whispers.length > 0;

        if (!hasContent) {
            return (
                <div className="py-6 text-center">
                    <p className="text-gray-500 text-sm mb-4">You haven't left any traces in the void yet.</p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/diaries" className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-full transition-colors">
                            Write Private Diary
                        </Link>
                        <Link href="/whispers" className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-full transition-colors">
                            Whisper to the Void
                        </Link>
                        <Link href="/midnight-cafe" className="text-xs text-orange-400 hover:text-orange-300 border border-orange-500/30 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                            <Coffee className="w-3 h-3" /> Start Discussion
                        </Link>
                    </div>
                </div>
            )
        }

        // Combine and sort recent items (top 5)
        // We'll show parallel lists or combined? 
        // Let's show two columns: "Private Diaries" and "Whispers" if space permits, or stacked.
        // Given the grid, this is INSIDE a column under the card? No, the user said "right below the category".
        // If we expand the card itself, layout shifts.
        // Let's assume we render this in a container *below* the card using a full-width expansion or just local.

        return (
            <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 gap-6 animate-fade-in">

                {/* Diaries Section */}
                {diaries.length > 0 && (
                    <div className="space-y-3">
                        <h5 className="text-xs uppercase tracking-widest text-gray-500 font-medium flex items-center gap-2">
                            <Book className="w-3 h-3" /> Private Diaries
                        </h5>
                        <div className="space-y-2">
                            {diaries.slice(0, 3).map(diary => (
                                <Link key={`diary-${diary.id}`} href={`/diaries?id=${diary.id}`} className="block group">
                                    <div className="bg-white/5 hover:bg-white/10 p-3 rounded-lg transition-colors border border-transparent hover:border-white/10 flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-300 line-clamp-2 italic font-light">
                                                "{diary.content}"
                                            </p>
                                            <span className="text-[10px] text-gray-600 mt-1 block">
                                                {format(new Date(diary.createdAt || new Date()), "MMM d, h:mm a")}
                                            </span>
                                        </div>
                                        <Lock className="w-3 h-3 text-gray-600 group-hover:text-gray-400 mt-1 ml-2" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Whispers Section */}
                {whispers.length > 0 && (
                    <div className="space-y-3">
                        <h5 className="text-xs uppercase tracking-widest text-gray-500 font-medium flex items-center gap-2">
                            <MessageCircle className="w-3 h-3" /> Whispers
                        </h5>
                        <div className="space-y-2">
                            {whispers.slice(0, 3).map(whisper => (
                                <Link key={`whisper-${whisper.id}`} href={`/whispers?id=${whisper.id}`} className="block">
                                    <div className="bg-white/5 hover:bg-white/10 p-3 rounded-lg transition-colors border border-transparent hover:border-white/10">
                                        <p className="text-sm text-gray-300 line-clamp-2 font-light">
                                            "{whisper.content}"
                                        </p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[10px] text-gray-600">
                                                {format(new Date(whisper.createdAt || new Date()), "MMM d, h:mm a")}
                                            </span>
                                            <span className="text-[10px] text-pink-500/70 flex items-center gap-1">
                                                {whisper.hearts} <span className="opacity-50">hearts</span>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-center pt-2 flex justify-center gap-4">
                    <Link href="/night-thoughts" className="inline-flex items-center text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                        Enter The Void <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                    <Link href="/midnight-cafe" className="inline-flex items-center text-xs text-orange-400 hover:text-orange-300 transition-colors">
                        Open Midnight Cafe <Coffee className="w-3 h-3 ml-1" />
                    </Link>
                </div>

            </div>
        );
    }

    // Render for INSPECTION
    if (type === 'inspection') {
        if (reflections.length === 0) {
            return (
                <div className="py-6 text-center">
                    <p className="text-gray-500 text-sm mb-4">No reflections recorded yet.</p>
                    <Link href="/nightly-reflection" className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-full transition-colors">
                        Start Inspection
                    </Link>
                </div>
            )
        }

        return (
            <div className="mt-6 pt-6 border-t border-white/5 space-y-4 animate-fade-in">
                <h5 className="text-xs uppercase tracking-widest text-gray-500 font-medium flex items-center gap-2">
                    <Moon className="w-3 h-3" /> Recent Insights
                </h5>

                {reflections.slice(0, 3).map(reflection => (
                    <div key={reflection.id} className="bg-white/5 p-4 rounded-lg border border-white/5">
                        <div className="mb-2 pb-2 border-b border-white/5">
                            <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-bold">
                                {format(new Date(reflection.createdAt || new Date()), "MMMM d")}
                            </span>
                        </div>
                        <p className="text-sm text-gray-300 italic mb-2">
                            "{reflection.responseContent}"
                        </p>
                        <div className="text-xs text-gray-500 bg-black/20 p-2 rounded">
                            <span className="text-indigo-300/80 font-medium">AI Insight: </span>
                            {/* We assume evaluation is in the metadata or just not shown fully here to keep it clean */}
                            Using the stars to navigate...
                        </div>
                    </div>
                ))}

                <div className="text-center pt-2">
                    <Link href="/nightly-reflection" className="inline-flex items-center text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                        Continue Inspection <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                </div>
            </div>
        );
    }

    return null;
}
