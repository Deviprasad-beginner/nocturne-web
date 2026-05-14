import { Link } from "wouter";
import {
    Moon, Search, Heart, User, BookOpen, Layers, Camera,
    Wind, Brain, Headphones, Activity, Droplets, X, RefreshCw
} from "lucide-react";
import { FeaturedCard } from "@/components/music/FeaturedCard";
import { CategoryCard } from "@/components/music/CategoryCard";
import { MusicCard } from "@/components/music/MusicCard";
import { useMusic } from "@/context/MusicContext";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Track } from "@/lib/audioPlayer";

// Category definitions — each maps to a targeted Jamendo tags query
const CATEGORIES = [
    {
        id: "sleep-stories",
        title: "Sleep Stories",
        subtitle: "Narrated escapes",
        icon: <BookOpen className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80",
        query: "sleep",
        mood: "deep-night",
    },
    {
        id: "meditations",
        title: "Meditations",
        subtitle: "Guided mindfulness",
        icon: <Layers className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&q=80",
        query: "meditation",
        mood: "relax",
    },
    {
        id: "nature-sounds",
        title: "Nature Sounds",
        subtitle: "Ambient audio",
        icon: <Camera className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80",
        query: "nature",
        mood: "relax",
    },
    {
        id: "nocturne",
        title: "Nocturne",
        subtitle: "Deep sleep focus",
        icon: <Wind className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80",
        query: "darkambient",
        mood: "deep-night",
    },
    {
        id: "calming-music",
        title: "Calming Music",
        subtitle: "Soothing beats",
        icon: <Brain className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80",
        query: "lofi",
        mood: "focus",
    },
    {
        id: "asmr",
        title: "ASMR",
        subtitle: "Tingling triggers",
        icon: <Headphones className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=400&q=80",
        query: "asmr",
        mood: "asmr",
    },
    {
        id: "bedtime-yoga",
        title: "Bedtime Yoga",
        subtitle: "Relaxing stretches",
        icon: <Activity className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80",
        query: "yoga",
        mood: "relax",
    },
    {
        id: "journal",
        title: "Journal",
        subtitle: "Evening reflection",
        icon: <Droplets className="w-5 h-5" />,
        image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=80",
        query: "study",
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
    const { setMood } = useMusic();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeQuery, setActiveQuery] = useState<string | null>(null);
    const [activeLabel, setActiveLabel] = useState<string>("");

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
        setActiveLabel(cat.title);
        setMood(cat.mood);
    };

    const handleFeaturedClick = (feat: typeof FEATURED[number]) => {
        setSelectedId(`featured-${feat.query}`);
        setActiveQuery(feat.query);
        setActiveLabel(feat.title);
        setMood("relax");
    };

    const handleClear = () => {
        setSelectedId(null);
        setActiveQuery(null);
        setActiveLabel("");
        setMood(null);
    };

    return (
        <div className="min-h-screen bg-[#0f1115] text-white relative pb-32 font-sans selection:bg-white/20">

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

                {/* ── Dynamic Track Section ─────────────────── */}
                {selectedId ? (
                    <div className="pt-8 border-t border-white/5">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-medium tracking-wide">{activeLabel}</h2>
                                <p className="text-sm text-white/40 mt-1">
                                    {isLoading ? "Fetching live tracks…" : `${dynamicTracks.length} tracks — tap to play`}
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
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className="animate-pulse rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
                                        <div className="aspect-square bg-white/10" />
                                        <div className="px-4 py-3.5 space-y-2">
                                            <div className="h-4 bg-white/10 rounded w-3/4" />
                                            <div className="h-3 bg-white/10 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))
                            ) : isError ? (
                                <div className="col-span-full py-12 text-center">
                                    <p className="text-white/40 mb-4">Couldn't load tracks. Please try again.</p>
                                    <button
                                        onClick={() => refetch()}
                                        className="flex items-center gap-2 mx-auto text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-full transition-all"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Retry
                                    </button>
                                </div>
                            ) : dynamicTracks.length > 0 ? (
                                dynamicTracks.map((track) => (
                                    <MusicCard key={track.id} track={track} />
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center">
                                    <p className="text-white/40 mb-4">No tracks found. Try another category.</p>
                                    <button
                                        onClick={() => refetch()}
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