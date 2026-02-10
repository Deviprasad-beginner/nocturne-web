import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Activity, Heart, MessageCircle, Users, Star, ChevronDown, ChevronUp } from "lucide-react";

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
    <>
      <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-all duration-200"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">Live Activity</span>
            <div className="flex items-center space-x-1 px-2 py-0.5 bg-green-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-300">LIVE</span>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <ChevronUp className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-0' : 'rotate-180'}`} />
          </button>
        </div>

        <div
          className="transition-all duration-500 ease-in-out overflow-hidden"
          style={{
            maxHeight: isExpanded ? '500px' : '0px',
            opacity: isExpanded ? 1 : 0
          }}
        >
          <div className="px-4 pb-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {activities.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No recent activity</p>
                  </div>
                ) : (
                  displayActivities.map((activity, index) => (
                    <Link key={activity.id} href={activity.link || '/'}>
                      <div
                        className="flex items-center space-x-2 p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer group border border-white/0 hover:border-white/10 hover:scale-[1.01]"
                        style={{
                          animation: isExpanded ? `fadeSlideIn 0.3s ease-out ${index * 0.05}s both` : 'none'
                        }}
                      >
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs truncate">
                            <span className="text-purple-300 font-medium group-hover:text-purple-200 transition-colors duration-200">
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
          </div>
        </div>

        <div
          className="transition-all duration-300 ease-in-out overflow-hidden"
          style={{
            maxHeight: !isExpanded && activities.length > 0 ? '50px' : '0px',
            opacity: !isExpanded ? 1 : 0
          }}
        >
          <div className="px-4 pb-3">
            <div className="text-center text-xs text-gray-500 py-1">
              {activities.length} recent {activities.length === 1 ? 'activity' : 'activities'}
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
