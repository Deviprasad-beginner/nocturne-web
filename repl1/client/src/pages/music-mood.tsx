import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Music, Play, Pause, SkipForward, Volume2, Users, Clock } from "lucide-react";

interface Playlist {
  id: string;
  name: string;
  description: string;
  mood: string;
  listeners: number;
  duration: string;
  tracks: number;
  color: string;
  isPlaying?: boolean;
}

interface LiveSession {
  id: string;
  name: string;
  host: string;
  listeners: number;
  currentTrack: string;
  genre: string;
}

export default function MusicMood() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>("midnight-study");

  const playlists: Playlist[] = [
    {
      id: "midnight-study",
      name: "Midnight Study Beats",
      description: "Lo-fi hip hop for deep focus and concentration",
      mood: "Focus",
      listeners: 89,
      duration: "2h 34m",
      tracks: 42,
      color: "from-blue-500 to-cyan-600",
      isPlaying: true
    },
    {
      id: "nocturne-ambient",
      name: "Nocturne Ambient",
      description: "Rain sounds mixed with gentle piano melodies",
      mood: "Relaxation",
      listeners: 67,
      duration: "1h 48m",
      tracks: 18,
      color: "from-purple-500 to-indigo-600"
    },
    {
      id: "night-jazz",
      name: "After Hours Jazz",
      description: "Smooth jazz for late night contemplation",
      mood: "Contemplative",
      listeners: 34,
      duration: "3h 12m",
      tracks: 56,
      color: "from-amber-500 to-orange-600"
    },
    {
      id: "synthwave-dreams",
      name: "Synthwave Dreams",
      description: "80s inspired electronic sounds for night drives",
      mood: "Energetic",
      listeners: 123,
      duration: "2h 07m",
      tracks: 38,
      color: "from-pink-500 to-purple-600"
    },
    {
      id: "classical-night",
      name: "Classical Nighttime",
      description: "Peaceful classical compositions for reflection",
      mood: "Peaceful",
      listeners: 45,
      duration: "4h 23m",
      tracks: 74,
      color: "from-green-500 to-teal-600"
    },
    {
      id: "indie-melancholy",
      name: "Indie Melancholy",
      description: "Introspective indie tracks for deep thoughts",
      mood: "Melancholic",
      listeners: 78,
      duration: "2h 56m",
      tracks: 47,
      color: "from-gray-500 to-slate-600"
    }
  ];

  const liveSessions: LiveSession[] = [
    {
      id: "live-1",
      name: "Midnight DJ Session",
      host: "NightMixer",
      listeners: 156,
      currentTrack: "Ethereal Waves - Moonlight Sonata Remix",
      genre: "Electronic"
    },
    {
      id: "live-2",
      name: "Acoustic Nights",
      host: "GuitarNomad",
      listeners: 89,
      currentTrack: "Original - Whispers in the Dark",
      genre: "Acoustic"
    },
    {
      id: "live-3",
      name: "Code & Coffee",
      host: "DevBeats",
      listeners: 203,
      currentTrack: "Binary Dreams - Algorithm Blues",
      genre: "Lo-fi"
    }
  ];

  const handlePlayPause = (playlistId: string) => {
    if (currentlyPlaying === playlistId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(playlistId);
    }
  };

  const getCurrentMood = () => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) return "Deep Night";
    if (hour >= 18) return "Evening Wind Down";
    if (hour >= 12) return "Afternoon Focus";
    return "Morning Gentle";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Music & Mood</h1>
                <p className="text-sm text-purple-300">Current mood: {getCurrentMood()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Now Playing Bar */}
        {currentlyPlaying && (
          <div className="mb-8 p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg border border-purple-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Now Playing</p>
                  <p className="text-sm text-gray-300">
                    {playlists.find(p => p.id === currentlyPlaying)?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <SkipForward className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handlePlayPause(currentlyPlaying)}
                >
                  <Pause className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Curated Playlists */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <Music className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Curated for Night Owls</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {playlists.map((playlist) => (
                <Card key={playlist.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className={`w-full h-32 bg-gradient-to-br ${playlist.color} rounded-lg mb-4 flex items-center justify-center relative overflow-hidden`}>
                      <Music className="w-12 h-12 text-white/80" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{playlist.name}</h3>
                        <p className="text-sm text-gray-400">{playlist.description}</p>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{playlist.listeners}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{playlist.duration}</span>
                        </span>
                        <span>{playlist.tracks} tracks</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {playlist.mood}
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => handlePlayPause(playlist.id)}
                          className={`${currentlyPlaying === playlist.id ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                          {currentlyPlaying === playlist.id ? 
                            <Pause className="w-4 h-4" /> : 
                            <Play className="w-4 h-4" />
                          }
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Live Sessions */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold">Live Sessions</h2>
            </div>
            
            <div className="space-y-4">
              {liveSessions.map((session) => (
                <Card key={session.id} className="bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-sm">{session.name}</h3>
                        <p className="text-xs text-gray-400">by {session.host}</p>
                      </div>
                      <div className="flex items-center space-x-1 text-red-400">
                        <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs">LIVE</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <p className="text-xs text-gray-300">{session.currentTrack}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{session.genre}</span>
                        <span className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{session.listeners}</span>
                        </span>
                      </div>
                    </div>
                    
                    <Button size="sm" variant="outline" className="w-full text-xs border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white">
                      Join Session
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mood Stats */}
            <Card className="mt-8 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-700/50">
              <CardHeader>
                <CardTitle className="text-lg">Tonight's Vibes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Most Popular</span>
                    <span className="text-purple-300">Lo-fi Beats</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Listeners</span>
                    <span className="text-purple-300">892</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Live Sessions</span>
                    <span className="text-purple-300">{liveSessions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Peak Hour</span>
                    <span className="text-purple-300">2:00 AM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Music className="w-4 h-4" />
            <span>Curated soundscapes for the nocturnal soul</span>
          </div>
          <p>Connect your headphones and let the night inspire you</p>
        </div>
      </div>
    </div>
  );
}