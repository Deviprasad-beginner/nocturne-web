import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Link, Redirect } from "wouter";
import { Loader2, Music, Coffee, Heart, ArrowLeft, Edit, Camera, Star, Users, MessageSquare, BookOpen, TrendingUp, Trophy, MapPin, Link as LinkIcon, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Whisper, MidnightCafe } from "@shared/schema";
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
    enabled: !!user
  });

  const { data: cafePosts, isLoading: cafeLoading } = useQuery<MidnightCafe[]>({
    queryKey: ["/api/v1/users/me/cafe"],
    enabled: !!user
  });

  const { data: savedStations, isLoading: stationsLoading } = useQuery<string[]>({
    queryKey: ["/api/v1/users/me/favorites"],
    enabled: !!user
  });

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    displayName: "Night Wanderer",
    username: "nightwanderer",
    bio: "A fellow insomniac exploring the depths of midnight thoughts.",
    location: "Somewhere in the night",
    website: "",
    email: "",
    joinedAt: new Date(),
    timezone: "UTC",
    profileImageUrl: ""
  });

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        displayName: user.displayName || user.username,
        username: user.username,
        email: user.email || "",
        joinedAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        profileImageUrl: user.profileImageUrl || ""
      }));
    }
  }, [user]);

  // Derived Stats based on real data
  const realTotalPosts = (whispers?.length || 0) + (cafePosts?.length || 0);
  const realTotalHearts = whispers?.reduce((acc, w) => acc + (w.hearts || 0), 0) || 0;

  const [stats] = useState({
    level: 5,
    xp: 2840,
    nextLevelXp: 3000,
    // These defaults will be overwritten by real counts where applicable in the UI render
    totalComments: 445,
    circlesJoined: 12,
    friendsCount: 67,
    nightOwlStreak: 45,
  });

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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-600";
      case "rare": return "bg-blue-600";
      case "epic": return "bg-purple-600";
      case "legendary": return "bg-yellow-600";
      default: return "bg-gray-600";
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Profile Header */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={profile.profileImageUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
                      {profile.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    onClick={handleAvatarUpload}
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 bg-purple-600 hover:bg-purple-700"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <Badge className={`${getRarityColor("epic")} text-white`}>
                  Level {stats.level} Night Owl
                </Badge>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white">{profile.displayName}</h1>
                    <p className="text-gray-400">@{profile.username}</p>
                  </div>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>

                <p className="text-gray-300">{profile.bio}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    <span className="text-purple-400 hover:underline cursor-pointer">
                      nocturne.social/{profile.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joined {profile.joinedAt.toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {profile.timezone}
                  </div>
                </div>

                {/* Level Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress to Level {stats.level + 1}</span>
                    <span className="text-gray-400">{stats.xp} / {stats.nextLevelXp} XP</span>
                  </div>
                  <Progress value={(stats.xp / stats.nextLevelXp) * 100} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profile.displayName}
                    onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-gray-300">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
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
            </CardContent>
          </Card>
        )}

        {/* Profile Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
            <TabsTrigger value="music" className="data-[state=active]:bg-purple-600">Music</TabsTrigger>
            <TabsTrigger value="whispers" className="data-[state=active]:bg-purple-600">Whispers</TabsTrigger>
            <TabsTrigger value="cafe" className="data-[state=active]:bg-purple-600">Cafe</TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-600">Awards</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Posts</span>
                    <span className="text-white font-semibold">{realTotalPosts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hearts Received</span>
                    <span className="text-white font-semibold">{realTotalHearts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saved Stations</span>
                    <span className="text-white font-semibold">{savedStations?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Night Owl Streak</span>
                    <span className="text-orange-400 font-semibold">{stats.nightOwlStreak} days</span>
                  </div>
                </CardContent>
              </Card>

              {/* Community */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Community</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Circles Joined</span>
                    <span className="text-white font-semibold">{stats.circlesJoined}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Friends</span>
                    <span className="text-white font-semibold">{stats.friendsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reputation</span>
                    <span className="text-purple-400 font-semibold">Night Sage</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievement */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Latest Achievement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{achievements[0].icon}</div>
                    <div>
                      <p className="text-white font-medium">{achievements[0].title}</p>
                      <p className="text-gray-400 text-sm">{achievements[0].description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {achievements[0].unlockedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="music" className="mt-6 space-y-4">
            {stationsLoading ? (
              <div className="text-center p-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" /></div>
            ) : savedStations && savedStations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {savedStations.map((stationId) => (
                  <div key={stationId} className="p-4 rounded-xl bg-gray-800/40 border border-gray-700 flex items-center justify-between group hover:border-purple-500 transition-colors">
                    <span className="font-medium capitalize text-gray-200 group-hover:text-purple-400">{stationId.replace(/-/g, ' ')}</span>
                    <Music className="w-5 h-5 text-purple-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 text-gray-500 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
                <Music className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No saved stations yet.</p>
                <Link href="/music-mood">
                  <Button variant="link" className="text-purple-400 mt-2">Discover Music</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="whispers" className="mt-6 space-y-4">
            {whispersLoading ? (
              <div className="text-center p-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" /></div>
            ) : whispers && whispers.length > 0 ? (
              whispers.map((whisper) => (
                <Card key={whisper.id} className="bg-gray-800/30 border-gray-700">
                  <CardContent className="p-4">
                    <p className="text-gray-300 italic mb-2">"{whisper.content}"</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{format(new Date(whisper.createdAt || ''), 'PP p')}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-pink-500" /> {whisper.hearts}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-12 text-gray-500 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>You haven't told any secrets to the night yet.</p>
                <Link href="/whispers">
                  <Button variant="link" className="text-purple-400 mt-2">Share a Whisper</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cafe" className="mt-6 space-y-4">
            {cafeLoading ? (
              <div className="text-center p-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" /></div>
            ) : cafePosts && cafePosts.length > 0 ? (
              cafePosts.map((post) => (
                <Card key={post.id} className="bg-gray-800/30 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base text-amber-200/80">{post.topic}</CardTitle>
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500">{post.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-gray-300 mb-2">{post.content}</p>
                    <div className="flex justify-between text-xs text-gray-500 mt-3">
                      <span>{format(new Date(post.createdAt || ''), 'PP p')}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-blue-400" /> {post.replies} Replies</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-12 text-gray-500 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
                <Coffee className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>The cafe is quiet. Start a conversation.</p>
                <Link href="/midnight-cafe">
                  <Button variant="link" className="text-amber-400 mt-2">Enter Cafe</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Achievements</CardTitle>
                <CardDescription className="text-gray-400">Your accomplishments and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg border-l-4 border-purple-500">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold">{achievement.title}</h3>
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{achievement.description}</p>
                        <p className="text-xs text-gray-500">
                          Unlocked {achievement.unlockedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}