import { Track } from "@/lib/audioPlayer";
import { useMusic } from "@/context/MusicContext";
import { Play, Pause, Heart } from "lucide-react";
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
    const isCurrentlyPlaying = isCurrentTrack && isPlaying;

    const { data: savedStationsRaw } = useQuery<string[]>({
        queryKey: ["/api/v1/users/me/favorites"],
        enabled: !!user,
        staleTime: 5 * 60 * 1000,
    });

    const savedStations = Array.isArray(savedStationsRaw) ? savedStationsRaw : [];
    const isFavorited = savedStations.includes(String(track.id));

    const toggleFavoriteMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", `/api/v1/music/favorites/${track.id}`);
            return res.json();
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["/api/v1/users/me/favorites"] });
            const saved = data?.data?.saved ?? data?.saved;
            toast({
                title: saved ? "Saved" : "Removed",
                description: saved ? `${track.title} saved.` : `${track.title} removed.`,
            });
        },
        onError: () => {
            toast({
                title: "Sign in to save stations",
                variant: "destructive",
            });
        },
    });

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            toast({ title: "Sign in to save stations", variant: "destructive" });
            return;
        }
        toggleFavoriteMutation.mutate();
    };

    return (
        <div
            onClick={() => playTrack(track)}
            className={cn(
                "group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-400",
                "border bg-white/[0.02]",
                isCurrentTrack
                    ? "border-white/15 shadow-[0_0_40px_rgba(120,100,200,0.08)]"
                    : "border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
            )}
        >
            {/* Cover Art */}
            <div className="aspect-square relative overflow-hidden bg-[#0d0d14]">
                {track.coverArt ? (
                    <img
                        src={track.coverArt}
                        alt={track.title}
                        loading="lazy"
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-500 scale-105 group-hover:scale-100 transition-transform"
                        style={{ filter: "saturate(0.5) brightness(0.85)" }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-light text-white/8 font-serif">
                        {track.title.charAt(0)}
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Play indicator */}
                <div className={cn(
                    "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                    isCurrentTrack ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                    <div className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center",
                        "bg-black/50 backdrop-blur-md border border-white/15",
                        "transition-transform duration-200 group-hover:scale-105"
                    )}>
                        {isCurrentlyPlaying ? (
                            <div className="flex gap-[3px] items-end h-4">
                                {[0, 1, 2].map(i => (
                                    <div
                                        key={i}
                                        className="w-[3px] bg-white/70 rounded-full"
                                        style={{
                                            height: "100%",
                                            animation: `barBounce 0.9s ease-in-out ${i * 0.15}s infinite alternate`,
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Play className="h-5 w-5 text-white/80 ml-0.5" />
                        )}
                    </div>
                </div>

                {/* Mood label bottom-left */}
                <div className="absolute bottom-2.5 left-3">
                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                        {track.mood}
                    </span>
                </div>

                {/* Heart */}
                <button
                    onClick={handleFavoriteClick}
                    className={cn(
                        "absolute top-2.5 right-2.5 p-1.5 rounded-full transition-all duration-200",
                        isFavorited
                            ? "text-white/60 opacity-100"
                            : "text-white/20 opacity-0 group-hover:opacity-100 hover:text-white/50"
                    )}
                >
                    <Heart className={cn("h-3.5 w-3.5", isFavorited && "fill-current")} />
                </button>
            </div>

            {/* Track info */}
            <div className="px-4 py-3.5">
                <p className={cn(
                    "text-sm font-medium truncate transition-colors duration-200",
                    isCurrentTrack ? "text-white/90" : "text-white/55 group-hover:text-white/80"
                )}>
                    {track.title}
                </p>
                <p className="text-xs text-white/28 truncate mt-0.5">{track.artist}</p>
            </div>

            {/* Active bar at bottom */}
            {isCurrentTrack && (
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/20" />
            )}

            <style>{`
                @keyframes barBounce {
                    from { transform: scaleY(0.3); }
                    to   { transform: scaleY(1); }
                }
            `}</style>
        </div>
    );
}
