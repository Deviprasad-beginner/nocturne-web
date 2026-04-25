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
    <div className="min-h-screen bg-[#07070A] text-white relative overflow-hidden pb-32">
      {/* Atmosphere Background */}
      <AtmosphereBackground />

      {/* Main Content */}
      <div className="relative z-10 max-w-[1800px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/50">
                <Music className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Music & Mood
                </h1>
                <p className="text-sm text-gray-500">Immersive nocturnal soundscapes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mood Selector */}
        <div className="mb-10">
          <MoodSelector />
        </div>

        {/* Main Layout Grid */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Music Cards Grid */}
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="text-2xl">🎵</span>
                {mood ? `${mood.charAt(0).toUpperCase()}${mood.slice(1).replace('-', ' ')} Vibes` : 'All Tracks'}
                <span className="text-sm text-gray-500 font-normal ml-2">({filteredTracks.length} tracks)</span>
              </h2>
            </div>

            {filteredTracks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTracks.map((track) => (
                  <MusicCard key={track.id} track={track} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎧</div>
                <p className="text-gray-400">No tracks found for this mood</p>
                <Button
                  variant="outline"
                  className="mt-4 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  onClick={() => { }}
                >
                  Clear Filter
                </Button>
              </div>
            )}
          </div>

          {/* Live Activity Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <LiveActivity />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-2">
            <Music className="w-4 h-4" />
            <span>Curated soundscapes for the nocturnal soul</span>
          </div>
          <p className="text-xs text-gray-600">Connect your headphones for the best experience</p>
        </div>
      </div>
    </div>
  );
}