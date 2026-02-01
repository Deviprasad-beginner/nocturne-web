import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { User, Star, Trophy, Moon, Flame, Heart, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface UserStats {
  nightOwlLevel: number;
  totalHearts: number;
  postsShared: number;
  conversationsJoined: number;
  streakDays: number;
  experiencePoints: number;
}

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

export function UserProfileCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();

  const { data: statsResponse, isLoading: isLoadingStats } = useQuery<{ success: boolean; data: UserStats }>({
    queryKey: ["/api/v1/profile/stats"],
    enabled: !!user,
  });

  const { data: achievementsResponse, isLoading: isLoadingAchievements } = useQuery<{ success: boolean; data: Achievement[] }>({
    queryKey: ["/api/v1/profile/achievements"],
    enabled: !!user,
  });

  const userStats = statsResponse?.data || {
    nightOwlLevel: 1,
    totalHearts: 0,
    postsShared: 0,
    conversationsJoined: 0,
    streakDays: 0,
    experiencePoints: 0
  };

  const achievements = achievementsResponse?.data || [];

  const getLevelTitle = (level: number) => {
    if (level >= 10) return "Midnight Master";
    if (level >= 7) return "Night Sage";
    if (level >= 5) return "Moonlit Wanderer";
    if (level >= 3) return "Starlit Seeker";
    return "Night Owl Apprentice";
  };

  const getNextLevelExp = (level: number) => {
    return (level + 1) * 100;
  };

  const nextLevelExp = getNextLevelExp(userStats.nightOwlLevel);
  const progressPercent = (userStats.experiencePoints / nextLevelExp) * 100;

  const getAchievementIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      moon: <Moon className="w-3 h-3" />,
      star: <Star className="w-3 h-3" />,
      heart: <Heart className="w-3 h-3" />,
      trophy: <Trophy className="w-3 h-3" />,
      message: <Star className="w-3 h-3" />,
    };
    return icons[iconName] || <Star className="w-3 h-3" />;
  };

  const getAchievementColorClass = (color: string) => {
    const colors: Record<string, string> = {
      purple: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
      pink: 'bg-pink-500/10 border-pink-500/20 text-pink-300',
      red: 'bg-red-500/10 border-red-500/20 text-red-300',
      blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
      yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300',
      gold: 'bg-yellow-600/10 border-yellow-600/20 text-yellow-400',
    };
    return colors[color] || 'bg-gray-500/10 border-gray-500/20 text-gray-300';
  };

  const isLoading = isLoadingStats || isLoadingAchievements;

  if (!user) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 rounded-2xl">
        <CardContent className="py-8">
          <div className="text-center text-gray-400">
            <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs mb-3">Sign in to track progress</p>
            <Link href="/auth">
              <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs transition-all duration-200">
                Sign In
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
      <CardHeader className="pb-3">
        <CardTitle
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user.displayName || 'User'} className="w-full h-full rounded-full" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-white truncate">{user.displayName || 'Night Wanderer'}</div>
              <div className="flex items-center space-x-1">
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs px-1.5 py-0">
                  Lvl {userStats.nightOwlLevel}
                </Badge>
                <span className="text-xs text-gray-400 truncate">{getLevelTitle(userStats.nightOwlLevel)}</span>
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Level {userStats.nightOwlLevel + 1}</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-blue-400 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 bg-red-500/10 rounded-xl border border-red-500/20">
                  <Heart className="w-4 h-4 text-red-400 mx-auto mb-0.5" />
                  <div className="text-sm font-bold text-red-300">{userStats.totalHearts}</div>
                  <div className="text-xs text-gray-400">Hearts</div>
                </div>

                <div className="text-center p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                  <Flame className="w-4 h-4 text-orange-400 mx-auto mb-0.5" />
                  <div className="text-sm font-bold text-orange-300">{userStats.streakDays}</div>
                  <div className="text-xs text-gray-400">Streak</div>
                </div>

                <div className="text-center p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Moon className="w-4 h-4 text-blue-400 mx-auto mb-0.5" />
                  <div className="text-sm font-bold text-blue-300">{userStats.postsShared}</div>
                  <div className="text-xs text-gray-400">Posts</div>
                </div>

                <div className="text-center p-2 bg-green-500/10 rounded-xl border border-green-500/20">
                  <Trophy className="w-4 h-4 text-green-400 mx-auto mb-0.5" />
                  <div className="text-sm font-bold text-green-300">{userStats.conversationsJoined}</div>
                  <div className="text-xs text-gray-400">Chats</div>
                </div>
              </div>

              {/* Achievements */}
              {achievements.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 mb-2">Achievements</h4>
                  <div className="space-y-1">
                    {achievements.slice(0, 2).map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`flex items-center space-x-2 p-1.5 rounded-lg border ${getAchievementColorClass(achievement.color)}`}
                      >
                        {getAchievementIcon(achievement.icon)}
                        <span className="text-xs font-medium truncate">{achievement.title}</span>
                      </div>
                    ))}
                  </div>
                  {achievements.length > 2 && (
                    <Link href="/profile">
                      <button className="w-full mt-2 text-xs text-purple-400 hover:text-purple-300 transition-all duration-200">
                        +{achievements.length - 2} more →
                      </button>
                    </Link>
                  )}
                </div>
              )}

              {achievements.length === 0 && (
                <div className="text-center py-3 text-gray-400">
                  <Trophy className="w-6 h-6 mx-auto mb-1 opacity-30" />
                  <p className="text-xs">Start sharing to earn!</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}

      {!isExpanded && (
        <CardContent className="pt-0">
          <div className="flex justify-around text-center py-2">
            <div>
              <div className="text-sm font-bold text-purple-300">{userStats.postsShared}</div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div>
              <div className="text-sm font-bold text-red-300">{userStats.totalHearts}</div>
              <div className="text-xs text-gray-500">Hearts</div>
            </div>
            <div>
              <div className="text-sm font-bold text-orange-300">{userStats.streakDays}d</div>
              <div className="text-xs text-gray-500">Streak</div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
