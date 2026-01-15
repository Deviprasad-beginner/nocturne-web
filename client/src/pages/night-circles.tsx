import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { NightCircle, InsertNightCircle } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, UserPlus, Circle, Clock, Video, Shuffle } from "lucide-react";
import { VideoChat } from "@/components/video-chat";
import { RandomChat } from "@/components/random-chat";

export default function NightCircles() {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [currentView, setCurrentView] = useState<'lobby' | 'video-chat' | 'random-chat'>('lobby');
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [username, setUsername] = useState("");

  const { data: nightCircles = [], isLoading } = useQuery<NightCircle[]>({
    queryKey: ['/api/nightCircles'],
  });

  const createCircleMutation = useMutation({
    mutationFn: async (newCircle: InsertNightCircle) => {
      const response = await fetch('/api/nightCircles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCircle),
      });
      if (!response.ok) throw new Error('Failed to create night circle');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nightCircles'] });
      setName("");
      setIsCreating(false);
    },
  });

  const joinCircleMutation = useMutation({
    mutationFn: async ({ id, currentMembers }: { id: number; currentMembers: number }) => {
      const response = await fetch(`/api/nightCircles/${id}/members`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ members: currentMembers + 1 }),
      });
      if (!response.ok) throw new Error('Failed to join circle');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nightCircles'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createCircleMutation.mutate({
        name: name.trim(),
        description: description.trim() || "A space for night owls to connect",
        maxMembers: 6,
        currentMembers: 1,
        isActive: true
      });
    }
  };

  const handleJoinCircle = (circle: NightCircle) => {
    if (!username.trim()) {
      const newUsername = prompt("Enter your username for the video chat:");
      if (!newUsername?.trim()) return;
      setUsername(newUsername.trim());
    }
    
    setCurrentRoomId(`circle_${circle.id}`);
    setCurrentView('video-chat');
    
    joinCircleMutation.mutate({ 
      id: circle.id, 
      currentMembers: circle.members || 0 
    });
  };

  const handleStartRandomChat = () => {
    if (!username.trim()) {
      const newUsername = prompt("Enter your username for the video chat:");
      if (!newUsername?.trim()) return;
      setUsername(newUsername.trim());
    }
    
    setCurrentView('random-chat');
  };

  const handleBackToLobby = () => {
    setCurrentView('lobby');
    setCurrentRoomId("");
  };

  // Render different views based on current state
  if (currentView === 'video-chat' && currentRoomId) {
    return (
      <VideoChat
        roomId={currentRoomId}
        username={username}
        onLeave={handleBackToLobby}
      />
    );
  }

  if (currentView === 'random-chat') {
    return (
      <RandomChat
        username={username}
        onBack={handleBackToLobby}
      />
    );
  }

  const activeCircles = nightCircles.filter(circle => circle.active);
  const inactiveCircles = nightCircles.filter(circle => !circle.active);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
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
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Night Circles</h1>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700"
          >
            {isCreating ? "Cancel" : "Create Circle"}
          </Button>
        </div>

        <div className="mb-6 p-4 bg-pink-900/30 rounded-lg border border-pink-700/50">
          <p className="text-sm text-pink-200">
            Join intimate conversation circles for meaningful discussions with fellow night owls. 
            Share thoughts, find support, and build connections in smaller groups.
          </p>
        </div>

        {/* Create Form */}
        {isCreating && (
          <Card className="mb-8 bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl">Create New Night Circle</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Circle Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Late Night Philosophers, Creative Minds, Support Group..."
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!name.trim() || createCircleMutation.isPending}
                  className="bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700"
                >
                  {createCircleMutation.isPending ? "Creating..." : "Create Circle"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Active Circles */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Circle className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold">Active Circles</h2>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300">
              {activeCircles.length} active now
            </Badge>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCircles.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-12">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl mb-2">No active circles</p>
                <p>Create the first circle to start conversations!</p>
              </div>
            ) : (
              activeCircles.map((circle) => (
                <Card key={circle.id} className="bg-gradient-to-br from-pink-900/30 to-red-900/30 border-pink-700/50 hover:from-pink-900/40 hover:to-red-900/40 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{circle.name}</h3>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400">Live</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Members</span>
                        <span className="text-white">{circle.members || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Online now</span>
                        <span className="text-green-400">{circle.online || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Created</span>
                        <span className="text-gray-300">
                          {circle.timestamp ? new Date(circle.timestamp).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleJoinCircle(circle)}
                      disabled={joinCircleMutation.isPending}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Circle
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Inactive Circles */}
        {inactiveCircles.length > 0 && (
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Clock className="w-6 h-6 text-gray-400" />
              <h2 className="text-2xl font-bold">Sleeping Circles</h2>
              <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">
                {inactiveCircles.length} dormant
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveCircles.map((circle) => (
                <Card key={circle.id} className="bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-300">{circle.name}</h3>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Sleeping</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Members</span>
                        <span className="text-gray-400">{circle.members || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Last active</span>
                        <span className="text-gray-400">
                          {circle.timestamp ? new Date(circle.timestamp).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleJoinCircle(circle)}
                      disabled={joinCircleMutation.isPending}
                      variant="outline"
                      className="w-full border-gray-600 text-gray-400 hover:text-white hover:border-pink-500"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Wake Circle
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}