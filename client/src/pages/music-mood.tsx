import { Link } from "wouter";
import {
    Moon, Search, Heart, User, BookOpen, Layers, Camera,
    Wind, Brain, Headphones, Activity, Droplets, X, RefreshCw,
    ListPlus, Plus, Trash2
} from "lucide-react";
import { FeaturedCard } from "@/components/music/FeaturedCard";
import { CategoryCard } from "@/components/music/CategoryCard";
import { MusicCard } from "@/components/music/MusicCard";
import { SEO } from "@/components/SEO";
import { useMusic } from "@/context/MusicContext";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Track } from "@/lib/audioPlayer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

// Category definitions — each maps to a targeted Jamendo tags query
const CATEGORIES = [
    {
        id: "sleep-stories",
        title: "Sleep Stories",
        subtitle: "Narrated escapes",
        icon: <BookOpen className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80",
        query: "sleep,ambient",
        mood: "deep-night",
    },
    {
        id: "meditations",
        title: "Meditations",
        subtitle: "Guided mindfulness",
        icon: <Layers className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&q=80",
        query: "meditation,relax",
        mood: "relax",
    },
    {
        id: "nature-sounds",
        title: "Nature Sounds",
        subtitle: "Ambient audio",
        icon: <Camera className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80",
        query: "nature,ambient,sounds",
        mood: "relax",
    },
    {
        id: "nocturne",
        title: "Nocturne",
        subtitle: "Deep sleep focus",
        icon: <Wind className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80",
        query: "darkambient,ambient",
        mood: "deep-night",
    },
    {
        id: "calming-music",
        title: "Calming Music",
        subtitle: "Soothing beats",
        icon: <Brain className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80",
        query: "lofi,chill",
        mood: "focus",
    },
    {
        id: "asmr",
        title: "ASMR",
        subtitle: "Tingling triggers",
        icon: <Headphones className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=400&q=80",
        query: "asmr,relaxation",
        mood: "asmr",
    },
    {
        id: "bedtime-yoga",
        title: "Bedtime Yoga",
        subtitle: "Relaxing stretches",
        icon: <Activity className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",
        query: "yoga,relax",
        mood: "relax",
    },
    {
        id: "journal",
        title: "Journal",
        subtitle: "Evening reflection",
        icon: <Droplets className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=80",
        query: "study,ambient",
        mood: "journal",
    },
];

// Featured cards — each triggers a search
const FEATURED = [
    {
        title: "Find Your Serenity",
        subtitle: "Mellow instrumental sounds",
        image: "https://images.unsplash.com/photo-1499810631641-541e76d678a2?w=800&q=80",
        query: "instrumental",
        showPlayIcon: false,
    },
    {
        title: "Welcome to Peaceful Sleep",
        subtitle: "Drift into a quiet night",
        image: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&q=80",
        query: "piano",
        showPlayIcon: true,
    },
    {
        title: "Ocean Dreams",
        subtitle: "Waves for deep rest",
        image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80",
        query: "chill",
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

    const { setMood } = useMusic();
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
        <div className="min-h-screen bg-[#0f1115] text-white relative pb-32 font-sans selection:bg-white/20">
            <SEO 
                title="Soothing Night Sounds & Ambient Music" 
                description="Drift into deep sleep and evening focus with Nocturne's curated ambient soundscapes, nature sounds, and lofi beats." 
            />

            {/* ── Hero Header ───────────────────────────────── */}
            <div className="relative h-[45vh] min-h-[300px] w-full overflow-hidden flex items-center justify-center">
                <img
                    src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80"
                    alt="Starry Night"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f1115]" />
                <div className="relative z-10 text-center flex flex-col items-center mt-8">
                    <Moon className="w-10 h-10 text-white mb-4" />
                    <h1 className="text-5xl md:text-6xl font-serif text-white tracking-wide">
                        Soothing Night
                    </h1>
                    <p className="text-white/40 mt-3 text-sm tracking-widest uppercase">
                        Music &amp; Mood
                    </p>
                </div>
            </div>

            {/* ── Sticky Nav ────────────────────────────────── */}
            <div className="sticky top-0 z-40 bg-[#0f1115]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Moon className="w-5 h-5 text-white/90" />
                        <span className="font-medium text-sm tracking-wide">Soothing Night</span>
                    </div>
                    <div className="flex items-center gap-6 text-white/70">
                        <button className="hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
                        <button className="hover:text-white transition-colors"><Heart className="w-4 h-4" /></button>
                        <button className="hover:text-white transition-colors"><User className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* ── Main Content ──────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">

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
                                displayTracks.map((track) => (
                                    <MusicCard 
                                        key={track.id} 
                                        track={track} 
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
                            ) : discoverTracks.map((track) => (
                                <MusicCard key={track.id} track={track} />
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