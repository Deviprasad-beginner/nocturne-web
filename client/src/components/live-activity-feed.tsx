import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Activity, Heart, MessageCircle, Users, Star, Music, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ActivityItem {
  id: string;
  type: 'heart' | 'comment' | 'join' | 'post' | 'whisper' | 'music' | 'cafe';
  user: string;
  content: string;
  timestamp: string;
  category?: string;
  link?: string;
}

export function LiveActivityFeed() {
  const { data: response, isLoading } = useQuery<{ success: boolean; data: ActivityItem[] }>({
    queryKey: ["/api/v1/activity/recent"],
    refetchInterval: 5000, // Faster updates for live feel
  });

  const activities = response?.data || [];
  const displayActivities = activities.slice(0, 4); // Show only top 4

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'heart': return <Heart className="w-3 h-3 text-red-400" />;
      case 'comment': return <MessageCircle className="w-3 h-3 text-blue-400" />;
      case 'join': return <Users className="w-3 h-3 text-green-400" />;
      case 'post': return <Star className="w-3 h-3 text-yellow-400" />;
      case 'whisper': return <Activity className="w-3 h-3 text-purple-400" />;
      case 'music': return <Music className="w-3 h-3 text-pink-400" />;
      case 'cafe': return <Coffee className="w-3 h-3 text-amber-400" />;
      default: return <Activity className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center space-x-2">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-medium text-indigo-100 tracking-wide">Live Activity</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[10px] font-medium text-green-400/80 tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-2 overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/20 to-transparent z-10 pointer-events-none" />

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-1 h-8 bg-indigo-500/20 rounded animate-pulse" />
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-2 opacity-50">
            <Activity className="w-6 h-6" />
            <span className="text-xs">Silence in the ether...</span>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {displayActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={activity.link || '/'}>
                    <div className="group flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer border border-transparent hover:border-white/5">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                        {getActivityIcon(activity.type)}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-baseline space-x-2 min-w-0">
                          <span className="text-xs font-semibold text-gray-300 truncate group-hover:text-white transition-colors">
                            {activity.user}
                          </span>
                          <span className="text-[10px] text-gray-500 truncate">
                            {activity.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate leading-tight group-hover:text-gray-300 transition-colors">
                          {activity.content}
                        </p>
                      </div>

                      <span className="text-[9px] text-gray-600 tabular-nums flex-shrink-0 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        Now
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
