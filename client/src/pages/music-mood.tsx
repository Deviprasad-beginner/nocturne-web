import { useState } from "react";
import * as React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Music, Play, Pause, Volume2, Users, Radio, ChevronRight, Loader2, Plus, Heart } from "lucide-react";

import { playlists, Playlist, Station } from "../data/playlists";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useMusic } from "@/context/MusicContext";

interface LiveSession {
  id: string;
  name: string;
  host: string;
  listeners: number;
  currentTrack: string;
  genre: string;
}

export default function MusicMood() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    currentStation,
    isPlaying,
    playStation,
    togglePlay,
    activePlaylist
  } = useMusic();

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [discoveredStations, setDiscoveredStations] = useState<Station[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);

  const { data: savedStations = [] } = useQuery<string[]>({
    queryKey: ["/api/v1/music/favorites"],
    enabled: !!user,
  });

  const toggleSaveMutation = useMutation({
    mutationFn: async (stationId: string) => {
      const res = await apiRequest("POST", `/api/v1/music/favorites/${stationId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/music/favorites"] });
    }
  });

  const handleToggleSave = (e: React.MouseEvent, stationId: string) => {
    e.stopPropagation();
    if (!user) return;
    toggleSaveMutation.mutate(stationId);
  };

  const isSaved = (stationId: string) => savedStations?.includes(stationId);

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

  const handlePlaylistClick = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setDiscoveredStations([]);
  };

  const handleDiscoverMore = async () => {
    if (!selectedPlaylist) return;

    setIsDiscovering(true);
    try {
      const res = await fetch(`/api/v1/music/search?query=${encodeURIComponent(selectedPlaylist.name)}`);
      if (res.ok) {
        const newStations = await res.json();
        const existingIds = new Set(selectedPlaylist.stations.map(s => s.id));
        const uniqueNewStations = newStations.filter((s: Station) => !existingIds.has(s.id));
        setDiscoveredStations(prev => [...prev, ...uniqueNewStations]);
      }
    } catch (error) {
      console.error("Failed to discover stations:", error);
    } finally {
      setIsDiscovering(false);
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
              <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Music & Mood</h1>
                <p className="text-sm text-slate-400">Current mood: {getCurrentMood()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Now Playing Bar (Simplified view for this page, acting as indicator) */}
        {currentStation && activePlaylist && (
          <div className="mb-8 p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg border border-slate-600/50 sticky top-4 z-40 backdrop-blur-md shadow-lg shadow-slate-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${activePlaylist.color} rounded-lg flex items-center justify-center shadow-lg`}>
                  {isPlaying ? (
                    <div className="flex gap-0.5 items-center h-4">
                      <span className="w-0.5 h-full bg-white animate-[music-bar_0.6s_ease-in-out_infinite]" />
                      <span className="w-0.5 h-2/3 bg-white animate-[music-bar_0.8s_ease-in-out_infinite]" />
                      <span className="w-0.5 h-full bg-white animate-[music-bar_0.7s_ease-in-out_infinite]" />
                    </div>
                  ) : (
                    <Radio className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-white">{currentStation.name}</p>
                    <Badge variant="outline" className="text-[10px] h-4 border-slate-400 text-slate-300">LIVE</Badge>
                  </div>
                  <p className="text-xs text-slate-300/70">
                    {activePlaylist.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  size="icon"
                  className="bg-slate-600 hover:bg-slate-700 text-white rounded-full w-10 h-10 shadow-lg shadow-slate-900/50"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </Button>
                {user && (
                  <Button variant="ghost" size="icon" className={`${isSaved(currentStation.id) ? "text-pink-500" : "text-gray-400"} hover:text-pink-500`} onClick={(e) => handleToggleSave(e, currentStation.id)}>
                    <Heart className={`w-5 h-5 ${isSaved(currentStation.id) ? "fill-current" : ""}`} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">

            {/* Conditional Rendering: Playlist Detail or Grid */}
            {selectedPlaylist ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Button
                  variant="ghost"
                  className="mb-6 hover:bg-white/5 text-gray-400 hover:text-white"
                  onClick={() => setSelectedPlaylist(null)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Categories
                </Button>

                <div className={`p-8 rounded-2xl bg-gradient-to-br ${selectedPlaylist.color} bg-opacity-20 mb-8 relative overflow-hidden`}>
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end gap-6">
                    <div className="w-32 h-32 bg-black/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-xl">
                      <Music className="w-16 h-16 text-white/90" />
                    </div>
                    <div className="flex-1">
                      <Badge className="mb-2 bg-black/20 text-white hover:bg-black/30 border-none">{selectedPlaylist.mood}</Badge>
                      <h2 className="text-4xl font-bold mb-2 text-white shadow-sm">{selectedPlaylist.name}</h2>
                      <p className="text-white/80 max-w-lg">{selectedPlaylist.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-white/80 bg-black/20 p-3 rounded-lg backdrop-blur-sm">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {selectedPlaylist.listeners} listening
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Radio className="w-5 h-5 text-slate-400" />
                    Available Stations
                  </h3>
                  <div className="grid gap-3">
                    {[...selectedPlaylist.stations, ...discoveredStations].map((station) => (
                      <div
                        key={station.id}
                        onClick={() => playStation(station)}
                        className={`
                                        group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 cursor-pointer
                                        ${currentStation?.id === station.id
                            ? 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                            : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/80 hover:border-gray-600'
                          }
                                    `}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center transition-colors
                                            ${currentStation?.id === station.id
                              ? 'bg-slate-500 text-white'
                              : 'bg-gray-700 text-gray-400 group-hover:bg-gray-600 group-hover:text-white'
                            }
                                        `}>
                            {currentStation?.id === station.id && isPlaying ? (
                              <div className="flex gap-0.5 items-center h-3">
                                <span className="w-0.5 h-full bg-white animate-[music-bar_0.5s_ease-in-out_infinite]" />
                                <span className="w-0.5 h-2/3 bg-white animate-[music-bar_0.7s_ease-in-out_infinite]" />
                                <span className="w-0.5 h-full bg-white animate-[music-bar_0.6s_ease-in-out_infinite]" />
                              </div>
                            ) : (
                              <Play className="w-5 h-5 ml-0.5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium truncate pr-4 ${currentStation?.id === station.id ? 'text-slate-300' : 'text-gray-200 group-hover:text-white'}`}>
                              {station.name}
                            </h4>
                            <p className="text-xs text-gray-500 group-hover:text-gray-400">Live Radio Stream</p>
                          </div>
                        </div>


                        {currentStation?.id === station.id && (
                          <Badge variant="outline" className="border-slate-500/50 text-slate-400 bg-slate-500/10 mr-2">
                            Playing
                          </Badge>
                        )}

                        {user && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`
                                    h-8 w-8 
                                    ${isSaved(station.id) ? "text-pink-500" : "text-gray-500 hover:text-pink-500"}
                                `}
                            onClick={(e) => handleToggleSave(e, station.id)}
                          >
                            <Heart className={`w-4 h-4 ${isSaved(station.id) ? "fill-current" : ""}`} />
                          </Button>
                        )}
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full mt-2 border-dashed border-gray-700 hover:border-slate-500 hover:text-slate-400 hover:bg-slate-500/10 transition-all h-12"
                      onClick={handleDiscoverMore}
                      disabled={isDiscovering}
                    >
                      {isDiscovering ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Discovering Frequencies...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Discover More Live Stations
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center space-x-3 mb-6">
                  <Music className="w-6 h-6 text-slate-400" />
                  <h2 className="text-2xl font-bold">Curated for Night Owls</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {playlists.map((playlist) => (
                    <Card
                      key={playlist.id}
                      className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 group cursor-pointer hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                      onClick={() => handlePlaylistClick(playlist)}
                    >
                      <CardContent className="p-6">
                        <div className={`w-full h-32 bg-gradient-to-br ${playlist.color} rounded-lg mb-4 flex items-center justify-center relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]`}>
                          <Music className="w-12 h-12 text-white/80 drop-shadow-lg" />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-slate-300 transition-colors">{playlist.name}</h3>
                            <p className="text-sm text-gray-400 line-clamp-1">{playlist.description}</p>
                          </div>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Radio className="w-3 h-3" />
                              <span>{playlist.stations.length} stations</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{playlist.listeners}</span>
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary" className="text-xs bg-gray-800 group-hover:bg-purple-900/30 transition-colors">
                              {playlist.mood}
                            </Badge>
                            <div className="p-2 rounded-full bg-gray-700 text-gray-300 group-hover:bg-slate-600 group-hover:text-white transition-all">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Live Sessions - Sidebar */}
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

                    <Button size="sm" variant="outline" className="w-full text-xs border-slate-600 text-slate-400 hover:bg-slate-600 hover:text-white">
                      Join Session
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mood Stats */}
            <Card className="mt-8 bg-gradient-to-br from-slate-800/30 to-slate-700/30 border-slate-600/50">
              <CardHeader>
                <CardTitle className="text-lg">Tonight's Vibes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Most Popular</span>
                    <span className="text-slate-300">Lo-fi Beats</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Listeners</span>
                    <span className="text-slate-300">892</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Live Sessions</span>
                    <span className="text-slate-300">{liveSessions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Peak Hour</span>
                    <span className="text-slate-300">2:00 AM</span>
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
      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 100%; transform: scaleY(1); }
          50% { height: 50%; transform: scaleY(0.5); }
        }
      `}</style>
    </div>
  );
}