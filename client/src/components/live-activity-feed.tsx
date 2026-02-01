import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Activity, Heart, MessageCircle, Users, Star, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ActivityItem {
  id: string;
  type: 'heart' | 'comment' | 'join' | 'post' | 'whisper';
  user: string;
  content: string;
  timestamp: string;
  category?: string;
  link?: string;
}

export function LiveActivityFeed() {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: response, isLoading } = useQuery<{ success: boolean; data: ActivityItem[] }>({
    queryKey: ["/api/v1/activity/recent"],
    refetchInterval: 15000,
  });

  const activities = response?.data || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'heart': return <Heart className="w-3 h-3 text-red-400" />;
      case 'comment': return <MessageCircle className="w-3 h-3 text-blue-400" />;
      case 'join': return <Users className="w-3 h-3 text-green-400" />;
      case 'post': return <Star className="w-3 h-3 text-yellow-400" />;
      case 'whisper': return <Activity className="w-3 h-3 text-purple-400" />;
      default: return <Activity className="w-3 h-3 text-purple-400" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diff = now.getTime() - activityTime.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const displayActivities = isExpanded ? activities : activities.slice(0, 3);

  return (
    <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border-gray-600 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm">Live Activity</span>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 text-xs animate-pulse">
              LIVE
            </Badge>
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
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {activities.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No recent activity</p>
                </div>
              ) : (
                displayActivities.map(activity => (
                  <Link key={activity.id} href={activity.link || '/'}>
                    <div className="flex items-center space-x-2 p-2 bg-black/20 rounded-xl hover:bg-black/40 transition-all duration-200 cursor-pointer group">
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs truncate">
                          <span className="text-blue-300 font-medium group-hover:text-blue-200">
                            {activity.user}
                          </span>
                          <span className="text-gray-400 ml-1">
                            {activity.content}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {getTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </CardContent>
      )}

      {!isExpanded && activities.length > 0 && (
        <CardContent className="pt-0">
          <div className="text-center text-xs text-gray-400 py-2">
            {activities.length} recent {activities.length === 1 ? 'activity' : 'activities'}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
