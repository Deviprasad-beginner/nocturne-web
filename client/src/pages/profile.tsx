import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, Redirect } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Whisper, MidnightCafe } from "@shared/schema";
import ProfileHeader from "@/components/profile/ProfileHeader";
import MoodAnalytics from "@/components/profile/MoodAnalytics";
import ContentTabs from "@/components/profile/ContentTabs";
import { format } from "date-fns";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export default function Profile() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  // Fetch real data
  const { data: whispers, isLoading: whispersLoading } = useQuery<Whisper[]>({
    queryKey: ["/api/v1/users/me/whispers"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const { data: cafePosts, isLoading: cafeLoading } = useQuery<MidnightCafe[]>({
    queryKey: ["/api/v1/users/me/cafe"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const { data: savedStations, isLoading: stationsLoading } = useQuery<string[]>({
    queryKey: ["/api/v1/users/me/favorites"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    bio: "",
    location: ""
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        displayName: user.displayName || user.username,
        bio: "", // Bio not yet in schema, using empty default locally
        location: "" // Location not yet in schema, using empty default
      });
    }
  }, [user]);

  // Derived Stats based on real data
  // In a real app, these would come from the trust-score service or a dedicated stats endpoint
  const stats = {
    level: Math.floor((user?.trustScore || 0) / 20) + 1, // Example logic
    xp: (user?.trustScore || 0) * 10,
    nextLevelXp: ((Math.floor((user?.trustScore || 0) / 20) + 1) * 200),
  };

  const [achievements] = useState<Achievement[]>([
    {
      id: "1",
      title: "Night Owl",
      description: "Active for 30 consecutive nights",
      icon: "🦉",
      unlockedAt: new Date("2024-01-15"),
      rarity: "common"
    },
    {
      id: "2",
      title: "Whisper Master",
      description: "Shared your first whisper",
      icon: "💭",
      unlockedAt: new Date("2024-01-10"),
      rarity: "rare"
    },
    {
      id: "3",
      title: "Music Lover",
      description: "Saved 5 radio stations",
      icon: "🎵",
      unlockedAt: new Date("2024-02-01"),
      rarity: "epic"
    }
  ]);

  const handleSave = () => {
    // Here we would call an API to update the user profile
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully.",
    });
  };

  const handleAvatarUpload = () => {
    toast({
      title: "Avatar Upload",
      description: "Avatar upload feature coming soon!",
    });
  };

  // Calculate mood analytics from whispers (client-side approximation until we have real logs)
  const moodData = React.useMemo(() => {
    if (!whispers) return undefined;

    const counts: Record<string, number> = {};
    whispers.forEach(w => {
      if (w.detectedEmotion) {
        counts[w.detectedEmotion] = (counts[w.detectedEmotion] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([emotion, count]) => ({
      emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      count
    }));
  }, [whispers]);

  const dominantEmotion = React.useMemo(() => {
    if (!moodData || moodData.length === 0) return "Reflection";
    return moodData.reduce((prev: { emotion: string; count: number }, current: { emotion: string; count: number }) => (prev.count > current.count) ? prev : current).emotion;
  }, [moodData]);

  const averageReflectionDepth = React.useMemo(() => {
    if (!whispers || whispers.length === 0) return 0;
    const total = whispers.reduce((acc, w) => acc + (w.reflectionDepth || 0), 0);
    return Number((total / whispers.length).toFixed(1));
  }, [whispers]);


  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-aurora text-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">

        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Profile Header Component */}
        <ProfileHeader
          user={user}
          stats={stats}
          isEditing={isEditing}
          onEditToggle={() => setIsEditing(!isEditing)}
          onAvatarUpload={handleAvatarUpload}
        />

        {/* Edit Mode Panel */}
        {isEditing && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl mb-6 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Edit Profile</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
                  <Input
                    id="displayName"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-gray-300">Location</Label>
                  <Input
                    id="location"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                <Textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                  Save Changes
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" className="border-slate-600 text-white">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mood Analytics Component */}
        <MoodAnalytics
          moodData={moodData}
          dominantEmotion={dominantEmotion}
          reflectionScore={averageReflectionDepth}
        />

        {/* Content Tabs Component */}
        <ContentTabs
          whispers={whispers}
          cafePosts={cafePosts}
          savedStations={savedStations}
          whispersLoading={whispersLoading}
          cafeLoading={cafeLoading}
          stationsLoading={stationsLoading}
          achievements={achievements}
        />

      </div>
    </div>
  );
}