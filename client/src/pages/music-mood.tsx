import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Music } from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { MusicCard } from "@/components/music/MusicCard";
import { MoodSelector } from "@/components/music/MoodSelector";
import { LiveActivity } from "@/components/music/LiveActivity";
import { AtmosphereBackground } from "@/components/music/AtmosphereBackground";
import { tracks, getTracksByMood } from "@/data/tracks";

export default function MusicMood() {
    const { mood } = useMusic();
    const filteredTracks = getTracksByMood(mood);

    return (
        <div className="min-h-screen bg-[#06060a] text-white relative overflow-hidden pb-32">
            <AtmosphereBackground />

            <div className="relative z-10 max-w-[1700px] mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-5">
                        <Link href="/">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/25 hover:text-white/60 hover:bg-white/4 transition-colors -ml-2"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1.5" />
                                Back
                            </Button>
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border border-white/8 flex items-center justify-center">
                                <Music className="w-3.5 h-3.5 text-white/35" />
                            </div>
                            <div>
                                <h1 className="text-base font-medium text-white/75 tracking-wide">
                                    Music & Mood
                                </h1>
                                <p className="text-[11px] text-white/22 tracking-wider uppercase">
                                    Nocturnal soundscapes
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mood selector */}
                <div className="mb-10">
                    <MoodSelector />
                </div>

                {/* Layout */}
                <div className="grid lg:grid-cols-[1fr_280px] gap-10">
                    {/* Cards */}
                    <div>
                        {/* Subtle section label */}
                        <div className="flex items-baseline gap-3 mb-6">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/22 font-medium">
                                {mood
                                    ? `${mood.charAt(0).toUpperCase()}${mood.slice(1).replace("-", " ")}`
                                    : "All stations"}
                            </p>
                            <span className="text-[10px] text-white/14">
                                {filteredTracks.length}
                            </span>
                        </div>

                        {filteredTracks.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredTracks.map((track) => (
                                    <MusicCard key={track.id} track={track} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <p className="text-white/18 text-sm">No stations for this mood</p>
                                <button
                                    className="mt-4 text-xs text-white/25 hover:text-white/45 transition-colors underline underline-offset-4"
                                    onClick={() => {}}
                                >
                                    Clear filter
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="hidden lg:block">
                        <div className="sticky top-8 rounded-2xl border border-white/[0.04] bg-white/[0.015] backdrop-blur-sm p-6">
                            <LiveActivity />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-20 text-center">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/14">
                        Curated for the nocturnal soul
                    </p>
                </div>
            </div>
        </div>
    );
}