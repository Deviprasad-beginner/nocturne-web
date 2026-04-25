
import { useState, useEffect } from "react";
import { Activity, Heart, MessageCircle, Users, Star, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ActivityItem {
  id: number;
  type: 'heart' | 'comment' | 'join' | 'post' | 'whisper';
  user: string;
  content: string;
  timestamp: Date;
  category?: string;
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: 1,
      type: 'heart',
      user: 'MidnightDreamer',
      content: 'loved a diary entry about city nights',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      category: 'diaries'
    },
    {
      id: 2,
      type: 'post',
      user: 'StarlitThinker',
      content: 'shared a 3AM founder insight',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      category: '3am-founder'
    },
    {
      id: 3,
      type: 'join',
      user: 'NightOwl92',
      content: 'joined "Midnight Philosophers" circle',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      category: 'night-circles'
    },
    {
      id: 4,
      type: 'whisper',
      user: 'Anonymous',
      content: 'shared a midnight whisper',
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      category: 'whispers'
    },
    {
      id: 5,
      type: 'comment',
      user: 'DeepThinker',
      content: 'replied to a mind maze puzzle',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      category: 'mind-maze'
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity: ActivityItem = {
        id: Date.now(),
        type: ['heart', 'comment', 'join', 'post', 'whisper'][Math.floor(Math.random() * 5)] as any,
        user: ['NightWanderer', 'MoonChaser', 'StarGazer', 'DreamWeaver'][Math.floor(Math.random() * 4)],
        content: 'just engaged with the community',
        timestamp: new Date(),
        category: 'general'
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 19)]); // Keep last 20 activities
    }, 30000); // Add new activity every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'heart': return <Heart className="w-4 h-4 text-red-400" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-400" />;
      case 'join': return <Users className="w-4 h-4 text-green-400" />;
      case 'post': return <Star className="w-4 h-4 text-yellow-400" />;
      default: return <Activity className="w-4 h-4 text-purple-400" />;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border-gray-600">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-green-400" />
          <span>Live Activity</span>
          <Badge variant="secondary" className="bg-green-500/20 text-green-300 animate-pulse">
            LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {activities.map(activity => (
            <div 
              key={activity.id}
              className="flex items-start space-x-3 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
            >
              {getActivityIcon(activity.type)}
              <div className="flex-1">
                <div className="text-sm">
                  <span className="text-blue-300 font-medium">{activity.user}</span>
                  <span className="text-gray-300 ml-1">{activity.content}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</span>
                  {activity.category && (
                    <Badge variant="outline" className="text-xs">
                      {activity.category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
