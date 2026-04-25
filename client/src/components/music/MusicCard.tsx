import { Track } from "@/lib/youtubePlayer";
import { useMusic } from "@/context/MusicContext";
import { Play, Users, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MusicCardProps {
    track: Track;
}

export function MusicCard({ track }: MusicCardProps) {
    const { playTrack, currentTrack, isPlaying } = useMusic();
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const isCurrentTrack = currentTrack?.id === track.id;
    const listeners = Math.floor(Math.random() * 100) + 10; // Mock listener count

    // Fetch current saved stations for this user
    const { data: savedStations = [] } = useQuery<string[]>({
        queryKey: ["/api/v1/users/me/favorites"],
        enabled: !!user,
        staleTime: 5 * 60 * 1000,
    });

    const isFavorited = savedStations.includes(track.id);

    // Toggle favorite mutation
    const toggleFavoriteMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", `/api/v1/music/favorites/${track.id}`);
            return res.json();
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["/api/v1/users/me/favorites"] });
            const saved = data?.data?.saved ?? data?.saved;
            toast({
                title: saved ? "Station Saved!" : "Station Removed",
                description: saved ? `${track.title} added to your profile.` : `${track.title} removed from saved stations.`,
            });
        },
        onError: () => {
            toast({
                title: "Login Required",
                description: "Sign in to save your favorite stations.",
                variant: "destructive",
            });
        },
    });

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // don't play track when clicking heart
        if (!user) {
            toast({
                title: "Login Required",
                description: "Sign in to save your favorite stations.",
                variant: "destructive",
            });
            return;
        }
        toggleFavoriteMutation.mutate();
    };

    return (
        <motion.div
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => playTrack(track)}
            className="group relative bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
        >
            {/* Cover Art / Gradient */}
            <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-purple-600/20 via-indigo-600/20 to-blue-600/20">
                {track.coverArt ? (
                    <img
                        src={track.coverArt}
                        alt={track.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-white/10">
                        {track.title.charAt(0)}
                    </div>
                )}

                {/* Hover overlay with play button */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/50">
                        {isCurrentTrack && isPlaying ? (
                            <div className="flex gap-1">
                                <div className="w-1 h-4 bg-white animate-pulse" />
                                <div className="w-1 h-4 bg-white animate-pulse delay-75" />
                                <div className="w-1 h-4 bg-white animate-pulse delay-150" />
                            </div>
                        ) : (
                            <Play className="h-6 w-6 text-white ml-0.5" />
                        )}
                    </div>
                </div>

                {/* Mood badge */}
                <div className="absolute top-2 right-2">
                    <Badge
                        variant="secondary"
                        className="bg-black/50 backdrop-blur-sm border-white/10 text-white text-xs"
                    >
                        {track.mood}
                    </Badge>
                </div>

                {/* Heart / Save button */}
                <button
                    onClick={handleFavoriteClick}
                    className={cn(
                        "absolute bottom-2 right-2 p-1.5 rounded-full transition-all duration-200",
                        isFavorited
                            ? "bg-pink-500/80 text-white opacity-100"
                            : "bg-black/50 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-pink-500/60 hover:text-white"
                    )}
                    title={isFavorited ? "Remove from favorites" : "Save to favorites"}
                >
                    <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
                </button>
            </div>

            {/* Track info */}
            <div className="p-4 space-y-1">
                <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                    {track.title}
                </h3>
                <p className="text-sm text-gray-400 truncate">{track.artist}</p>

                {/* Listener count */}
                <div className="flex items-center gap-1 text-xs text-gray-500 pt-1">
                    <Users className="h-3 w-3" />
                    <span>{listeners} listening</span>
                    {isFavorited && (
                        <span className="ml-auto text-pink-400 flex items-center gap-0.5">
                            <Heart className="h-3 w-3 fill-current" /> Saved
                        </span>
                    )}
                </div>
            </div>

            {/* Active indicator */}
            {isCurrentTrack && (
                <div className="absolute inset-0 border-2 border-purple-500 rounded-xl pointer-events-none animate-pulse" />
            )}
        </motion.div>
    );
}
