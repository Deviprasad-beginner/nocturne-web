import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { User, Heart, Flame, Moon, Sparkles, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface UserStats {
  nightOwlLevel: number;
  totalHearts: number;
  postsShared: number;
  conversationsJoined: number;
  streakDays: number;
  experiencePoints: number;
}

export function UserProfileCard() {
  const { user } = useAuth();

  const { data: statsResponse, isLoading } = useQuery<{ success: boolean; data: UserStats }>({
    queryKey: ["/api/v1/profile/stats"],
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

  const getNextLevelExp = (level: number) => (level + 1) * 100;
  const nextLevelExp = getNextLevelExp(userStats.nightOwlLevel);
  const progressPercent = Math.min((userStats.experiencePoints / nextLevelExp) * 100, 100);

  if (!user) {
    return (
      <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-xl p-4 h-full flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <User className="w-5 h-5 text-gray-500" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-300">Wanderer</p>
          <p className="text-xs text-gray-500">Join the night.</p>
        </div>
        <Link href="/auth">
          <button className="flex items-center space-x-2 px-4 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-lg text-xs transition-colors border border-indigo-500/20">
            <LogIn className="w-3 h-3" />
            <span>Sign In</span>
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-xl p-4 h-full flex flex-col justify-between relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-500" />

      {/* Header: Avatar + Identity */}
      <div className="flex items-center space-x-3 mb-4">
        <Link href="/profile">
          <div className="relative cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-0.5 border border-white/10 group-hover:border-indigo-500/30 transition-colors">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl || undefined} alt={user.displayName || 'User'} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-black/50 flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-300/70" />
                </div>
              )}
            </div>
            {/* Level Badge */}
            <div className="absolute -bottom-1 -right-1 bg-black border border-gray-800 rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold text-indigo-300">
              {userStats.nightOwlLevel}
            </div>
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link href="/profile">
            <h3 className="text-sm font-medium text-white/90 truncate cursor-pointer hover:text-indigo-300 transition-colors">
              {user.displayName || 'Anonymous'}
            </h3>
          </Link>
          <div className="flex items-center space-x-1.5">
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[9px] text-gray-500 tabular-nums">{Math.round(progressPercent)}%</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-help group/stat border border-transparent hover:border-white/5">
          <Moon className="w-3.5 h-3.5 text-indigo-400 mb-1 opacity-70 group-hover/stat:opacity-100 transition-opacity" />
          <span className="text-xs font-semibold text-gray-200">{userStats.postsShared}</span>
          <span className="text-[9px] text-gray-500">Posts</span>
        </div>

        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-help group/stat border border-transparent hover:border-white/5">
          <Heart className="w-3.5 h-3.5 text-pink-400 mb-1 opacity-70 group-hover/stat:opacity-100 transition-opacity" />
          <span className="text-xs font-semibold text-gray-200">{userStats.totalHearts}</span>
          <span className="text-[9px] text-gray-500">Hearts</span>
        </div>

        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-help group/stat border border-transparent hover:border-white/5">
          <Flame className="w-3.5 h-3.5 text-orange-400 mb-1 opacity-70 group-hover/stat:opacity-100 transition-opacity" />
          <span className="text-xs font-semibold text-gray-200">{userStats.streakDays}</span>
          <span className="text-[9px] text-gray-500">Days</span>
        </div>
      </div>
    </div>
  );
}
