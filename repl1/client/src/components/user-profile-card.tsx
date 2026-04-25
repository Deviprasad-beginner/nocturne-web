
import { useState } from "react";
import { User, Star, Trophy, Moon, Flame, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UserStats {
  nightOwlLevel: number;
  totalHearts: number;
  postsShared: number;
  conversationsJoined: number;
  streakDays: number;
}

export function UserProfileCard() {
  const [userStats] = useState<UserStats>({
    nightOwlLevel: 7,
    totalHearts: 234,
    postsShared: 18,
    conversationsJoined: 42,
    streakDays: 12
  });

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

  const currentExp = userStats.totalHearts + (userStats.postsShared * 10) + (userStats.conversationsJoined * 5);
  const nextLevelExp = getNextLevelExp(userStats.nightOwlLevel);
  const progressPercent = (currentExp / nextLevelExp) * 100;

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-lg text-white">Night Wanderer</div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                Level {userStats.nightOwlLevel}
              </Badge>
              <span className="text-sm text-gray-400">{getLevelTitle(userStats.nightOwlLevel)}</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress to Level {userStats.nightOwlLevel + 1}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <Heart className="w-6 h-6 text-red-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-red-300">{userStats.totalHearts}</div>
            <div className="text-xs text-gray-400">Hearts Received</div>
          </div>
          
          <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-orange-300">{userStats.streakDays}</div>
            <div className="text-xs text-gray-400">Day Streak</div>
          </div>
          
          <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Moon className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-300">{userStats.postsShared}</div>
            <div className="text-xs text-gray-400">Posts Shared</div>
          </div>
          
          <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <Trophy className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-300">{userStats.conversationsJoined}</div>
            <div className="text-xs text-gray-400">Conversations</div>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Recent Achievements</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-3 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-300">First Heart Received</span>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <Moon className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Night Owl Initiate</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
