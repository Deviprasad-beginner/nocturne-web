import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { User, Star, Trophy, Moon, Flame, Heart, Loader2, ChevronDown, ChevronUp } from "lucide-react";
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

  const isLoading = isLoadingStats || isLoadingAchievements;

  if (!user) {
    return (
      <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden animate-in fade-in duration-500">
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 hover:bg-white/10 hover:scale-105">
            <User className="w-6 h-6 text-gray-500" />
          </div>
          <p className="text-xs text-gray-500 mb-3">Sign in to track progress</p>
          <Link href="/auth">
            <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs transition-all duration-200 border border-purple-500/30 hover:scale-105">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-all duration-200"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/20 transition-all duration-200 hover:scale-105">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user.displayName || 'User'} className="w-full h-full rounded-xl object-cover" />
              ) : (
                <User className="w-4 h-4 text-purple-300" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-white truncate font-medium">{user.displayName || 'Night Wanderer'}</div>
              <div className="flex items-center space-x-1.5">
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs px-1.5 py-0 border border-purple-500/30 transition-all duration-200 hover:bg-purple-500/30">
                  Lvl {userStats.nightOwlLevel}
                </Badge>
                <span className="text-xs text-gray-500 truncate">{getLevelTitle(userStats.nightOwlLevel)}</span>
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <ChevronUp className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-0' : 'rotate-180'}`} />
          </button>
        </div>

        <div
          className="transition-all duration-500 ease-in-out overflow-hidden"
          style={{
            maxHeight: isExpanded ? '600px' : '0px',
            opacity: isExpanded ? 1 : 0
          }}
        >
          <div className="px-4 pb-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Progress Bar */}
                <div style={{ animation: isExpanded ? 'fadeSlideIn 0.3s ease-out 0s both' : 'none' }}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Level {userStats.nightOwlLevel + 1}</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-blue-400 h-1.5 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: isExpanded ? `${Math.min(progressPercent, 100)}%` : '0%' }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: Heart, value: userStats.totalHearts, label: 'Hearts', color: 'red', delay: 0.05 },
                    { icon: Flame, value: userStats.streakDays, label: 'Streak', color: 'orange', delay: 0.1 },
                    { icon: Moon, value: userStats.postsShared, label: 'Posts', color: 'blue', delay: 0.15 },
                    { icon: Trophy, value: userStats.conversationsJoined, label: 'Chats', color: 'green', delay: 0.2 }
                  ].map(({ icon: Icon, value, label, color, delay }) => (
                    <div
                      key={label}
                      className={`text-center p-2 bg-white/5 rounded-xl border border-${color}-500/20 hover:bg-white/10 transition-all duration-200 hover:scale-105 cursor-default`}
                      style={{ animation: isExpanded ? `fadeSlideIn 0.3s ease-out ${delay}s both` : 'none' }}
                    >
                      <Icon className={`w-4 h-4 text-${color}-400 mx-auto mb-0.5`} />
                      <div className={`text-sm font-bold text-${color}-300`}>{value}</div>
                      <div className="text-xs text-gray-500">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Achievements */}
                {achievements.length > 0 && (
                  <div style={{ animation: isExpanded ? 'fadeSlideIn 0.3s ease-out 0.25s both' : 'none' }}>
                    <h4 className="text-xs font-semibold text-gray-500 mb-2">Achievements</h4>
                    <div className="space-y-1.5">
                      {achievements.slice(0, 2).map((achievement, index) => (
                        <div
                          key={achievement.id}
                          className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 border border-purple-500/20 hover:bg-white/10 transition-all duration-200 hover:scale-[1.02]"
                          style={{ animation: isExpanded ? `fadeSlideIn 0.3s ease-out ${0.3 + (index * 0.05)}s both` : 'none' }}
                        >
                          <div className="text-purple-400">
                            {getAchievementIcon(achievement.icon)}
                          </div>
                          <span className="text-xs font-medium text-purple-300 truncate">{achievement.title}</span>
                        </div>
                      ))}
                    </div>
                    {achievements.length > 2 && (
                      <Link href="/profile">
                        <button className="w-full mt-2 text-xs text-purple-400 hover:text-purple-300 transition-all duration-200 hover:scale-105">
                          +{achievements.length - 2} more →
                        </button>
                      </Link>
                    )}
                  </div>
                )}

                {achievements.length === 0 && (
                  <div className="text-center py-4 text-gray-500" style={{ animation: isExpanded ? 'fadeSlideIn 0.3s ease-out 0.25s both' : 'none' }}>
                    <Trophy className="w-6 h-6 mx-auto mb-1 opacity-30" />
                    <p className="text-xs">Start sharing to earn!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div
          className="transition-all duration-300 ease-in-out overflow-hidden"
          style={{
            maxHeight: !isExpanded ? '60px' : '0px',
            opacity: !isExpanded ? 1 : 0
          }}
        >
          <div className="px-4 pb-3">
            <div className="flex justify-around text-center py-1">
              <div className="transition-transform duration-200 hover:scale-110">
                <div className="text-sm font-bold text-purple-300">{userStats.postsShared}</div>
                <div className="text-xs text-gray-600">Posts</div>
              </div>
              <div className="transition-transform duration-200 hover:scale-110">
                <div className="text-sm font-bold text-red-300">{userStats.totalHearts}</div>
                <div className="text-xs text-gray-600">Hearts</div>
              </div>
              <div className="transition-transform duration-200 hover:scale-110">
                <div className="text-sm font-bold text-orange-300">{userStats.streakDays}d</div>
                <div className="text-xs text-gray-600">Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
