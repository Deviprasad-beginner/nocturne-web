import { Link } from "wouter";
import {
    Moon, Search, Heart, User, BookOpen, Layers, Camera,
    Wind, Brain, Headphones, Activity, Droplets, X, RefreshCw,
    ListPlus, Plus, Trash2, Music2, ExternalLink, Clock
} from "lucide-react";

// Instrument inspiration tiles
const INSTRUMENTS = [
    {
        name: "Violin",
        emoji: "🎻",
        tagline: "Soulful strings for late nights",
        color: "from-rose-900/30 to-rose-800/10",
        border: "border-rose-800/30",
        searchQuery: "violin beginner lessons night music",
    },
    {
        name: "Piano",
        emoji: "🎹",
        tagline: "Keys that carry every emotion",
        color: "from-indigo-900/30 to-indigo-800/10",
        border: "border-indigo-800/30",
        searchQuery: "piano beginner easy songs calm night",
    },
    {
        name: "Guitar",
        emoji: "🎸",
        tagline: "Acoustic waves for quiet hours",
        color: "from-amber-900/30 to-amber-800/10",
        border: "border-amber-800/30",
        searchQuery: "acoustic guitar beginner night fingerpicking",
    },
    {
        name: "Flute",
        emoji: "🪈",
        tagline: "Breathy tones like midnight air",
        color: "from-teal-900/30 to-teal-800/10",
        border: "border-teal-800/30",
        searchQuery: "flute beginner lessons meditation music",
    },
];
import { FeaturedCard } from "@/components/music/FeaturedCard";
import { CategoryCard } from "@/components/music/CategoryCard";
import { MusicCard } from "@/components/music/MusicCard";
import { NightTones } from "@/components/music/NightTones";
import { SEO } from "@/components/SEO";
import { useMusic } from "@/context/MusicContext";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Track } from "@/lib/audioPlayer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

// Category definitions — each uses a SINGLE valid Jamendo tag (comma-separated breaks the API)
const CATEGORIES = [
    {
        id: "binaural",
        title: "Binaural Beats",
        subtitle: "Brainwave entrainment",
        icon: <Brain className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80",
        query: "binaural",
        mood: "deep-night",
    },
    {
        id: "meditation",
        title: "Meditation",
        subtitle: "Guided mindfulness",
        icon: <Layers className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&q=80",
        query: "meditation",
        mood: "relax",
    },
    {
        id: "ambient",
        title: "Ambient",
        subtitle: "Deep atmospheric sounds",
        icon: <Wind className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80",
        query: "ambient",
        mood: "deep-night",
    },
    {
        id: "sleep",
        title: "Sleep",
        subtitle: "Drift into rest",
        icon: <BookOpen className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80",
        query: "sleep",
        mood: "deep-night",
    },
    {
        id: "relaxation",
        title: "Relaxation",
        subtitle: "Let go of the day",
        icon: <Droplets className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&q=80",
        query: "relaxation",
        mood: "relax",
    },
    {
        id: "healing",
        title: "Healing",
        subtitle: "Sound therapy & Reiki",
        icon: <Activity className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",
        query: "healing",
        mood: "relax",
    },
    {
        id: "nature",
        title: "Nature Sounds",
        subtitle: "Rain, waves, forest",
        icon: <Camera className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80",
        query: "nature",
        mood: "relax",
    },
    {
        id: "piano",
        title: "Solo Piano",
        subtitle: "Gentle keys for quiet nights",
        icon: <Headphones className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80",
        query: "piano",
        mood: "journal",
    },
];

// Featured cards — use single reliable Jamendo tags only
const FEATURED = [
    {
        title: "Binaural Healing",
        subtitle: "Brainwave entrainment for deep rest",
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
        query: "binaural",
        showPlayIcon: true,
    },
    {
        title: "Pure Meditation",
        subtitle: "Stillness in sound",
        image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&q=80",
        query: "meditation",
        showPlayIcon: false,
    },
    {
        title: "Sound Healing",
        subtitle: "Reiki energy & therapeutic tones",
        image: "https://images.unsplash.com/photo-1499810631641-541e76d678a2?w=800&q=80",
        query: "healing",
        showPlayIcon: false,
    },
];

async function fetchTracks(query: string): Promise<Track[]> {
    const res = await fetch(`/api/v1/music/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Search failed");
    const json = await res.json();
    // Handle both plain array and wrapped { data: [] } responses defensively
    return Array.isArray(json) ? json : (json.data ?? []);
}

export default function MusicMood() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { setMood, sleepTimerRemaining, startSleepTimer, cancelSleepTimer } = useMusic();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeQuery, setActiveQuery] = useState<string | null>(null);
    const [activeLabel, setActiveLabel] = useState<string>("");

    // Playlists-related states
    const [activePlaylistId, setActivePlaylistId] = useState<number | null>(null);

    // Fetch user's playlists
    const { data: playlistsResponse, isLoading: playlistsLoading } = useQuery<{ success: boolean; data: any[] }>({
        queryKey: ["/api/v1/playlists"],
        enabled: !!user,
    });
    const playlists = playlistsResponse?.data ?? [];

    // Fetch tracks inside active playlist
    const {
        data: playlistTracksResponse,
        isLoading: isPlaylistTracksLoading,
        isError: isPlaylistTracksError,
        refetch: refetchPlaylistTracks
    } = useQuery<{ success: boolean; data: any[] }>({
        queryKey: ["playlist-tracks", activePlaylistId],
        queryFn: async () => {
            const res = await fetch(`/api/v1/playlists/${activePlaylistId}/tracks`);
            if (!res.ok) throw new Error("Failed to fetch playlist tracks");
            return res.json();
        },
        enabled: !!activePlaylistId && String(selectedId).startsWith("playlist-"),
    });

    // Create a new playlist
    const createPlaylistMutation = useMutation({
        mutationFn: async (name: string) => {
            const res = await apiRequest("POST", `/api/v1/playlists`, { name });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/v1/playlists"] });
            toast({
                title: "Playlist Created",
                description: "Your new playlist is ready.",
            });
        },
        onError: (err: any) => {
            toast({
                title: "Failed to create playlist",
                description: err.message || "An error occurred.",
                variant: "destructive"
            });
        }
    });

    // Delete a playlist
    const deletePlaylistMutation = useMutation({
        mutationFn: async (playlistId: number) => {
            await apiRequest("DELETE", `/api/v1/playlists/${playlistId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/v1/playlists"] });
            toast({
                title: "Playlist Deleted",
                description: "Playlist has been deleted successfully.",
            });
            handleClear();
        },
        onError: (err: any) => {
            toast({
                title: "Failed to delete playlist",
                description: err.message || "An error occurred.",
                variant: "destructive"
            });
        }
    });

    // Remove track from playlist
    const removeTrackFromPlaylistMutation = useMutation({
        mutationFn: async ({ playlistId, trackId }: { playlistId: number; trackId: string }) => {
            await apiRequest("DELETE", `/api/v1/playlists/${playlistId}/tracks/${trackId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["playlist-tracks", activePlaylistId] });
            toast({
                title: "Track Removed",
                description: "Successfully removed track from playlist.",
            });
        },
        onError: (err: any) => {
            toast({
                title: "Failed to remove track",
                description: err.message || "An error occurred.",
                variant: "destructive"
            });
        }
    });

    // Dynamic tracks query — fires whenever a category or featured card is clicked
    const {
        data: dynamicTracks = [],
        isLoading,
        isError,
        refetch,
    } = useQuery<Track[]>({
        queryKey: ["music-search", activeQuery],
        queryFn: () => fetchTracks(activeQuery!),
        enabled: !!activeQuery,
        retry: 2,
        staleTime: 1000 * 60 * 15, // 15 min — healthy cache
        gcTime: 1000 * 60 * 20,
    });

    // Default "discover" section — loads on mount regardless of selection
    const { data: discoverTracks = [], isLoading: isLoadingDiscover } = useQuery<Track[]>({
        queryKey: ["music-discover"],
        queryFn: () => fetchTracks("relax,chill,ambient"),
        staleTime: 1000 * 60 * 30,
    });

    const handleCategoryClick = (cat: typeof CATEGORIES[number]) => {
        setSelectedId(cat.id);
        setActiveQuery(cat.query);
        setActivePlaylistId(null);
        setActiveLabel(cat.title);
        setMood(cat.mood);
    };

    const handleFeaturedClick = (feat: typeof FEATURED[number]) => {
        setSelectedId(`featured-${feat.query}`);
        setActiveQuery(feat.query);
        setActivePlaylistId(null);
        setActiveLabel(feat.title);
        setMood("relax");
    };

    const handlePlaylistClick = (pl: any) => {
        setSelectedId(`playlist-${pl.id}`);
        setActiveQuery(null);
        setActivePlaylistId(pl.id);
        setActiveLabel(pl.name);
        setMood("relax");
    };

    const handleClear = () => {
        setSelectedId(null);
        setActiveQuery(null);
        setActivePlaylistId(null);
        setActiveLabel("");
        setMood(null);
    };

    const handleRemoveTrack = (trackId: string) => {
        if (activePlaylistId) {
            removeTrackFromPlaylistMutation.mutate({ playlistId: activePlaylistId, trackId });
        }
    };

    const isPlaylist = selectedId?.startsWith("playlist-");
    const displayTracks: Track[] = isPlaylist
        ? (playlistTracksResponse?.data ?? []).map((t: any) => ({
            id: String(t.trackId),
            title: t.trackTitle,
            artist: t.trackArtist,
            url: t.trackUrl,
            coverArt: t.trackCoverArt || undefined,
            mood: "playlist"
        }))
        : dynamicTracks;

    const isTracksLoading = isPlaylist ? isPlaylistTracksLoading : isLoading;
    const isTracksError = isPlaylist ? isPlaylistTracksError : isError;
    const handleTracksRetry = isPlaylist ? refetchPlaylistTracks : refetch;

    return (
        <div className="min-h-screen bg-[#0f1115] text-white relative pb-32 pb-safe font-sans selection:bg-white/20">
            <SEO
                title="Soothing Night Sounds & Ambient Music"
                description="Drift into deep sleep and evening focus with Nocturne's curated ambient soundscapes, nature sounds, and lofi beats."
            />

            {/* ── Hero Header ───────────────────────────────── */}
            <div className="relative h-[40vh] min-h-[240px] w-full overflow-hidden flex items-center justify-center">
                <img
                    src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80"
                    alt="Starry Night"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f1115]" />
                <div className="relative z-10 text-center flex flex-col items-center mt-8 px-4">
                    <Moon className="w-8 h-8 sm:w-10 sm:h-10 text-white mb-3 sm:mb-4" />
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-white tracking-wide">
                        Soothing Night
                    </h1>
                    <p className="text-white/40 mt-2 sm:mt-3 text-xs sm:text-sm tracking-widest uppercase">
                        Music &amp; Mood
                    </p>
                </div>
            </div>

            {/* ── Sticky Nav ────────────────────────────────── */}
            <div className="sticky top-0 z-40 bg-[#0f1115]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 sm:h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-white/90" />
                        <span className="font-medium text-xs sm:text-sm tracking-wide">Soothing Night</span>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 text-white/70">
                        {/* Sleep Timer */}
                        <div className="relative group/timer flex">
                            <button className="hover:text-white transition-colors flex items-center gap-1.5 peer">
                                <Clock className="w-4 h-4" />
                                {sleepTimerRemaining && (
                                    <span className="text-[10px] font-mono text-white/90 tracking-widest bg-white/10 px-1.5 py-0.5 rounded">
                                        {Math.floor(sleepTimerRemaining / 60)}:{(sleepTimerRemaining % 60).toString().padStart(2, "0")}
                                    </span>
                                )}
                            </button>
                            <div className="absolute top-full right-0 pt-2 opacity-0 -translate-y-2 pointer-events-none group-hover/timer:opacity-100 group-hover/timer:translate-y-0 group-hover/timer:pointer-events-auto transition-all duration-200 z-50">
                                <div className="bg-[#12121f] border border-white/10 rounded-xl p-2 w-36 shadow-2xl">
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1 px-2 pt-1">Sleep Timer</p>
                                    {[15, 30, 45, 60].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => startSleepTimer(m)}
                                            className="block w-full text-left px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            {m} minutes
                                        </button>
                                    ))}
                                    {sleepTimerRemaining && (
                                        <button
                                            onClick={cancelSleepTimer}
                                            className="block w-full text-left px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg mt-1 border-t border-white/5 transition-colors"
                                        >
                                            Cancel timer
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button className="hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
                        <button className="hover:text-white transition-colors"><Heart className="w-4 h-4" /></button>
                        <button className="hover:text-white transition-colors"><User className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* ── Main Content ──────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-10 sm:space-y-16">

                <NightTones />

                {/* Featured Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {FEATURED.map((feat) => (
                        <FeaturedCard
                            key={feat.query}
                            title={feat.title}
                            subtitle={feat.subtitle}
                            image={feat.image}
                            showPlayIcon={feat.showPlayIcon}
                            onClick={() => handleFeaturedClick(feat)}
                        />
                    ))}
                </div>

                {/* Categories */}
                <div>
                    <h2 className="text-xl font-medium mb-6 tracking-wide">Categories</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {CATEGORIES.map((cat) => (
                            <CategoryCard
                                key={cat.id}
                                title={cat.title}
                                subtitle={cat.subtitle}
                                icon={cat.icon}
                                image={cat.image}
                                isActive={selectedId === cat.id}
                                onClick={() => handleCategoryClick(cat)}
                            />
                        ))}
                    </div>
                </div>

                {/* ── Create Your Sound ──────────────────────── */}
                <div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
                        <Music2 className="w-5 h-5 text-white/50 flex-shrink-0" />
                        <h2 className="text-lg sm:text-xl font-medium tracking-wide">Create Your Sound</h2>
                        <span className="text-xs text-white/30 font-light hidden sm:inline ml-1">— pick an instrument to explore tonight</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {INSTRUMENTS.map((inst) => (
                            <a
                                key={inst.name}
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(inst.searchQuery)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group relative rounded-2xl p-5 border bg-gradient-to-br ${inst.color} ${inst.border} hover:brightness-125 transition-all duration-300 cursor-pointer flex flex-col gap-3`}
                            >
                                <div className="text-3xl">{inst.emoji}</div>
                                <div>
                                    <h3 className="font-semibold text-white text-sm">{inst.name}</h3>
                                    <p className="text-xs text-white/40 mt-0.5 leading-snug">{inst.tagline}</p>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-white/30 group-hover:text-white/60 transition-colors mt-auto">
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Learn on YouTube</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* My Playlists */}
                <div>
                    <h2 className="text-xl font-medium mb-6 tracking-wide flex items-center justify-between">
                        <span>My Playlists</span>
                        {user && (
                            <button
                                onClick={() => {
                                    const name = prompt("Enter playlist name:");
                                    if (name && name.trim()) {
                                        createPlaylistMutation.mutate(name.trim());
                                    }
                                }}
                                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-all bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                New Playlist
                            </button>
                        )}
                    </h2>

                    {!user ? (
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
                            <p className="text-sm text-white/40 mb-3">Sign in to save your personal soundtracks and curate playlists.</p>
                            <Link href="/auth">
                                <button className="text-xs bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-full transition-all">
                                    Sign In
                                </button>
                            </Link>
                        </div>
                    ) : playlistsLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-24 rounded-2xl bg-white/5 border border-white/5" />
                            ))}
                        </div>
                    ) : playlists.length === 0 ? (
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center">
                            <p className="text-sm text-white/40">You haven't created any playlists yet. Tap the '+' button on any track cover to create your first playlist!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {playlists.map((pl: any) => {
                                const isActive = selectedId === `playlist-${pl.id}`;
                                return (
                                    <div
                                        key={pl.id}
                                        onClick={() => handlePlaylistClick(pl)}
                                        className={cn(
                                            "group relative rounded-2xl p-5 cursor-pointer transition-all duration-300",
                                            "border flex flex-col justify-between h-28",
                                            isActive
                                                ? "bg-white/10 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                                                : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                                        )}
                                    >
                                        <div>
                                            <h3 className="font-medium text-sm text-white group-hover:text-white/90 transition-colors truncate">
                                                {pl.name}
                                            </h3>
                                            <p className="text-xs text-white/40 mt-1">Playlist</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">
                                                Nocturne
                                            </span>
                                            {/* Delete playlist button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm(`Are you sure you want to delete the playlist "${pl.name}"?`)) {
                                                        deletePlaylistMutation.mutate(pl.id);
                                                    }
                                                }}
                                                className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-white/40 p-1.5 rounded-full hover:bg-white/5 transition-all duration-200"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Dynamic Track Section ─────────────────── */}
                {selectedId ? (
                    <div className="pt-8 border-t border-white/5">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-medium tracking-wide">{activeLabel}</h2>
                                <p className="text-sm text-white/40 mt-1">
                                    {isTracksLoading ? "Fetching live tracks…" : `${displayTracks.length} tracks — tap to play`}
                                </p>
                            </div>
                            <button
                                onClick={handleClear}
                                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
                            >
                                <X className="w-3.5 h-3.5" />
                                Clear
                            </button>
                        </div>

                        {/* Track Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {isTracksLoading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className="animate-pulse rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
                                        <div className="aspect-square bg-white/10" />
                                        <div className="px-4 py-3.5 space-y-2">
                                            <div className="h-4 bg-white/10 rounded w-3/4" />
                                            <div className="h-3 bg-white/10 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))
                            ) : isTracksError ? (
                                <div className="col-span-full py-12 text-center">
                                    <p className="text-white/40 mb-4">Couldn't load tracks. Please try again.</p>
                                    <button
                                        onClick={() => handleTracksRetry()}
                                        className="flex items-center gap-2 mx-auto text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-full transition-all"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Retry
                                    </button>
                                </div>
                            ) : displayTracks.length > 0 ? (
                                displayTracks.map((track, i) => (
                                    <MusicCard
                                        key={track.id}
                                        track={track}
                                        queue={displayTracks.slice(i + 1)}
                                        onRemoveFromPlaylist={isPlaylist ? handleRemoveTrack : undefined}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center">
                                    <p className="text-white/40 mb-4">No tracks found. Try another category.</p>
                                    <button
                                        onClick={() => handleTracksRetry()}
                                        className="flex items-center gap-2 mx-auto text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-full transition-all"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Try again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* ── Default: Discover Section ──────────── */
                    <div className="pt-8 border-t border-white/5">
                        <h2 className="text-xl font-medium mb-6 tracking-wide">Discover Tonight</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {isLoadingDiscover ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className="animate-pulse rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
                                        <div className="aspect-square bg-white/10" />
                                        <div className="px-4 py-3.5 space-y-2">
                                            <div className="h-4 bg-white/10 rounded w-3/4" />
                                            <div className="h-3 bg-white/10 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))
                            ) : discoverTracks.map((track, i) => (
                                <MusicCard
                                    key={track.id}
                                    track={track}
                                    queue={discoverTracks.slice(i + 1)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end mt-12 gap-6 text-[11px] text-white/40 uppercase tracking-wider">
                    <Link href="/about"><span className="hover:text-white/80 cursor-pointer transition-colors">About Us</span></Link>
                    <Link href="/contact"><span className="hover:text-white/80 cursor-pointer transition-colors">Contact</span></Link>
                    <Link href="/privacy"><span className="hover:text-white/80 cursor-pointer transition-colors">Privacy Policy</span></Link>
                    <Link href="/featured"><span className="hover:text-white/80 cursor-pointer transition-colors">Featured</span></Link>
                </div>
            </div>
        </div>
    );
}