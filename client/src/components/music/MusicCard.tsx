import { Track } from "@/lib/youtubePlayer";
import { useMusic } from "@/context/MusicContext";
import { Play, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface MusicCardProps {
    track: Track;
}

export function MusicCard({ track }: MusicCardProps) {
    const { playTrack, currentTrack, isPlaying } = useMusic();

    const isCurrentTrack = currentTrack?.id === track.id;
    const listeners = Math.floor(Math.random() * 100) + 10; // Mock listener count

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
                </div>
            </div>

            {/* Active indicator */}
            {isCurrentTrack && (
                <div className="absolute inset-0 border-2 border-purple-500 rounded-xl pointer-events-none animate-pulse" />
            )}
        </motion.div>
    );
}
