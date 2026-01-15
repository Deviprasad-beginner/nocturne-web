
import { useState, useEffect } from "react";
import { Bell, Heart, MessageCircle, Users, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Notification {
  id: number;
  type: 'heart' | 'comment' | 'mention' | 'follow';
  message: string;
  timestamp: Date;
  read: boolean;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'heart',
      message: 'Someone loved your midnight whisper ✨',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: false
    },
    {
      id: 2,
      type: 'comment',
      message: 'New reply to your 3AM founder insight',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false
    },
    {
      id: 3,
      type: 'mention',
      message: 'You were mentioned in Night Circles',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: true
    }
  ]);

  const [showDropdown, setShowDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'heart': return <Heart className="w-4 h-4 text-red-400" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-400" />;
      case 'mention': return <Users className="w-4 h-4 text-green-400" />;
      default: return <Star className="w-4 h-4 text-yellow-400" />;
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {showDropdown && (
        <Card className="absolute top-12 right-0 w-80 bg-gray-800 border-gray-600 z-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-white mb-3">Notifications</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-400 text-sm">No notifications yet</p>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      notification.read ? 'bg-gray-700/50' : 'bg-blue-500/10 border border-blue-500/20'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      {getIcon(notification.type)}
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
