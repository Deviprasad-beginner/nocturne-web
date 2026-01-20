import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import {
  User,
  Edit,
  Camera,
  Star,
  Award,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Mail,
  Moon,
  MessageSquare,
  BookOpen,
  Users,
  Heart,
  TrendingUp,
  Clock,
  Trophy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  type: string;
  content: string;
  timestamp: Date;
  engagement: number;
}

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
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    displayName: user?.displayName || user?.username || "Night Wanderer",
    username: user?.username || "nightwanderer42",
    bio: "A fellow insomniac exploring the depths of midnight thoughts and philosophical conversations.",
    location: "Somewhere in the night",
    website: "",
    email: user?.email || "",
    joinedAt: user?.createdAt ? new Date(user.createdAt) : new Date(),
    lastActive: new Date(),
    timezone: "UTC",
  });

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        displayName: user.displayName || user.username,
        username: user.username,
        email: user.email || "",
        joinedAt: user.createdAt ? new Date(user.createdAt) : new Date(),
      }));
    }
  }, [user]);

  const [stats] = useState({
    level: 5,
    xp: 2840,
    nextLevelXp: 3000,
    totalPosts: 156,
    totalLikes: 892,
    totalComments: 445,
    circlesJoined: 12,
    friendsCount: 67,
    nightOwlStreak: 45,
  });

  const [recentActivity] = useState<Activity[]>([
    { type: "whisper", content: "Shared a midnight thought", timestamp: new Date("2024-01-20T02:30:00"), engagement: 12 },
    { type: "diary", content: "Published 'Late Night Reflections'", timestamp: new Date("2024-01-19T23:45:00"), engagement: 8 },
    { type: "circle", content: "Joined 'Philosophy at 3AM'", timestamp: new Date("2024-01-19T01:15:00"), engagement: 5 },
    { type: "comment", content: "Replied in Mind Maze discussion", timestamp: new Date("2024-01-18T03:20:00"), engagement: 3 },
  ]);

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
      description: "100 whispers shared",
      icon: "💭",
      unlockedAt: new Date("2024-01-10"),
      rarity: "rare"
    },
    {
      id: "3",
      title: "Midnight Philosopher",
      description: "Started 10 philosophical discussions",
      icon: "🧠",
      unlockedAt: new Date("2024-01-05"),
      rarity: "epic"
    },
    {
      id: "4",
      title: "Community Builder",
      description: "Helped 50+ fellow night owls",
      icon: "🏗️",
      unlockedAt: new Date("2023-12-20"),
      rarity: "legendary"
    },
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "whisper": return <MessageSquare className="h-4 w-4" />;
      case "diary": return <BookOpen className="h-4 w-4" />;
      case "circle": return <Users className="h-4 w-4" />;
      case "comment": return <MessageSquare className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src="/api/placeholder/128/128" />
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
                    <a href={profile.website} className="text-purple-400 hover:underline">
                      {profile.website}
                    </a>
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
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
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
                <div>
                  <Label htmlFor="website" className="text-gray-300">Website</Label>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
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
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-purple-600">Activity</TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-600">Achievements</TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-purple-600">Statistics</TabsTrigger>
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
                    <span className="text-white font-semibold">{stats.totalPosts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hearts Received</span>
                    <span className="text-white font-semibold">{stats.totalLikes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Comments Made</span>
                    <span className="text-white font-semibold">{stats.totalComments}</span>
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

          <TabsContent value="activity" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription className="text-gray-400">Your latest interactions on Nocturne</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
                      <div className="text-purple-400">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white">{activity.content}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                          <span>{activity.timestamp.toLocaleString()}</span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {activity.engagement}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{stats.totalLikes}</div>
                    <div className="text-sm text-gray-400">Total Hearts</div>
                  </div>
                  <Separator className="bg-slate-700" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Avg. per post</span>
                    <span className="text-white">{Math.round(stats.totalLikes / stats.totalPosts)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                    Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{stats.totalPosts}</div>
                    <div className="text-sm text-gray-400">Posts Created</div>
                  </div>
                  <Separator className="bg-slate-700" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Comments</span>
                    <span className="text-white">{stats.totalComments}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">{achievements.length}</div>
                    <div className="text-sm text-gray-400">Unlocked</div>
                  </div>
                  <Separator className="bg-slate-700" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Rarest</span>
                    <span className="text-yellow-400">Legendary</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}