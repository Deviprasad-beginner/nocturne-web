import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  BellOff,
  MessageSquare,
  Heart,
  Users,
  UserPlus,
  Calendar,
  Star,
  AlertCircle,
  Check,
  X,
  Settings,
  Volume2,
  VolumeX,
  Clock,
  Trash2,

} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: "message" | "like" | "follow" | "circle" | "mention" | "system";
  title: string;
  content: string;
  timestamp: Date;
  read: boolean;
  actionUser?: string;
  actionUrl?: string;
}

export default function Notifications() {
  const { toast } = useToast();
  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: true,
    soundEnabled: true,
    emailDigest: true,

    // Type-specific settings
    messages: true,
    likes: true,
    follows: true,
    circles: true,
    mentions: true,
    system: false,

    // Timing settings
    quietHours: true,
    quietStart: "23:00",
    quietEnd: "07:00",
    weekendOnly: false,

    // Frequency settings
    instantNotifications: true,
    hourlyDigest: false,
    dailyDigest: true,
  });

  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      type: "like",
      title: "Someone liked your whisper",
      content: "MidnightDreamer liked your anonymous whisper about insomnia",
      timestamp: new Date("2024-01-21T02:30:00"),
      read: false,
      actionUser: "MidnightDreamer"
    },
    {
      id: "2",
      type: "message",
      title: "New message",
      content: "SleeplessInSeattle sent you a private message",
      timestamp: new Date("2024-01-21T01:45:00"),
      read: false,
      actionUser: "SleeplessInSeattle"
    },
    {
      id: "3",
      type: "circle",
      title: "Circle activity",
      content: "New discussion started in 'Philosophy at 3AM' circle",
      timestamp: new Date("2024-01-20T23:20:00"),
      read: true
    },
    {
      id: "4",
      type: "follow",
      title: "New follower",
      content: "NightOwlPhilosopher started following you",
      timestamp: new Date("2024-01-20T22:15:00"),
      read: true,
      actionUser: "NightOwlPhilosopher"
    },
    {
      id: "5",
      type: "mention",
      title: "You were mentioned",
      content: "InsomniacPoet mentioned you in a Mind Maze discussion",
      timestamp: new Date("2024-01-20T21:30:00"),
      read: true,
      actionUser: "InsomniacPoet"
    },
    {
      id: "6",
      type: "system",
      title: "System update",
      content: "New features added to Nocturne - check them out!",
      timestamp: new Date("2024-01-20T20:00:00"),
      read: false
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSettingChange = (key: string, value: any) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));

    toast({
      title: "Notification Setting Updated",
      description: "Your preferences have been saved.",
      duration: 2000,
    });
  };

  const markAsRead = (id: string) => {
    toast({
      title: "Marked as Read",
      description: "Notification has been marked as read.",
    });
  };

  const markAllAsRead = () => {
    toast({
      title: "All Notifications Read",
      description: "All notifications have been marked as read.",
    });
  };

  const deleteNotification = (id: string) => {
    toast({
      title: "Notification Deleted",
      description: "The notification has been removed.",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message": return <MessageSquare className="h-5 w-5 text-blue-400" />;
      case "like": return <Heart className="h-5 w-5 text-red-400" />;
      case "follow": return <UserPlus className="h-5 w-5 text-green-400" />;
      case "circle": return <Users className="h-5 w-5 text-purple-400" />;
      case "mention": return <Star className="h-5 w-5 text-yellow-400" />;
      case "system": return <AlertCircle className="h-5 w-5 text-orange-400" />;
      default: return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "message": return "bg-blue-600";
      case "like": return "bg-red-600";
      case "follow": return "bg-green-600";
      case "circle": return "bg-purple-600";
      case "mention": return "bg-yellow-600";
      case "system": return "bg-orange-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <Bell className="h-8 w-8 text-purple-400" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-red-600 text-white ml-2">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-gray-400">Manage your notifications and preferences</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={markAllAsRead}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700"
              disabled={unreadCount === 0}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="notifications" className="data-[state=active]:bg-purple-600">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="p-6 space-y-4">
                    {notifications.map((notification, index) => (
                      <div key={notification.id}>
                        <div className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${notification.read
                            ? 'bg-slate-700/30'
                            : 'bg-purple-900/20 border border-purple-700/30'
                          }`}>
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className={`font-medium ${notification.read ? 'text-gray-300' : 'text-white'
                                  }`}>
                                  {notification.title}
                                </h3>
                                <p className={`text-sm ${notification.read ? 'text-gray-400' : 'text-gray-300'
                                  }`}>
                                  {notification.content}
                                </p>
                              </div>
                              <Badge
                                className={`${getTypeColor(notification.type)} text-white text-xs flex-shrink-0`}
                              >
                                {notification.type}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {notification.timestamp.toLocaleString()}
                                {notification.actionUser && (
                                  <>
                                    <span>•</span>
                                    <span>by {notification.actionUser}</span>
                                  </>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                {!notification.read && (
                                  <Button
                                    onClick={() => markAsRead(notification.id)}
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2 text-gray-400 hover:text-white"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  onClick={() => deleteNotification(notification.id)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2 text-gray-400 hover:text-red-400"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < notifications.length - 1 && (
                          <Separator className="bg-slate-700 my-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* General Settings */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Control how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive browser notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushEnabled}
                    onCheckedChange={(checked) => handleSettingChange('pushEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Sound Notifications</Label>
                    <p className="text-sm text-gray-500">Play sound with notifications</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={notificationSettings.soundEnabled}
                      onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
                    />
                    {notificationSettings.soundEnabled ?
                      <Volume2 className="h-4 w-4 text-purple-400" /> :
                      <VolumeX className="h-4 w-4 text-gray-400" />
                    }
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Email Digest</Label>
                    <p className="text-sm text-gray-500">Receive daily email summaries</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailDigest}
                    onCheckedChange={(checked) => handleSettingChange('emailDigest', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Types */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Notification Types</CardTitle>
                <CardDescription className="text-gray-400">
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                    <div>
                      <Label className="text-gray-300">Messages</Label>
                      <p className="text-sm text-gray-500">Direct messages and replies</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.messages}
                    onCheckedChange={(checked) => handleSettingChange('messages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-red-400" />
                    <div>
                      <Label className="text-gray-300">Likes & Hearts</Label>
                      <p className="text-sm text-gray-500">When someone likes your content</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.likes}
                    onCheckedChange={(checked) => handleSettingChange('likes', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5 text-green-400" />
                    <div>
                      <Label className="text-gray-300">Follows</Label>
                      <p className="text-sm text-gray-500">New followers and friend requests</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.follows}
                    onCheckedChange={(checked) => handleSettingChange('follows', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-400" />
                    <div>
                      <Label className="text-gray-300">Circle Activity</Label>
                      <p className="text-sm text-gray-500">Activity in circles you've joined</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.circles}
                    onCheckedChange={(checked) => handleSettingChange('circles', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <div>
                      <Label className="text-gray-300">Mentions</Label>
                      <p className="text-sm text-gray-500">When someone mentions you</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.mentions}
                    onCheckedChange={(checked) => handleSettingChange('mentions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-400" />
                    <div>
                      <Label className="text-gray-300">System Updates</Label>
                      <p className="text-sm text-gray-500">Platform updates and announcements</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.system}
                    onCheckedChange={(checked) => handleSettingChange('system', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Timing Settings */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Timing & Frequency</CardTitle>
                <CardDescription className="text-gray-400">
                  Control when and how often you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Quiet Hours</Label>
                    <p className="text-sm text-gray-500">Pause notifications during specific times</p>
                  </div>
                  <Switch
                    checked={notificationSettings.quietHours}
                    onCheckedChange={(checked) => handleSettingChange('quietHours', checked)}
                  />
                </div>

                {notificationSettings.quietHours && (
                  <div className="ml-6 space-y-4 p-4 bg-slate-700/30 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-400 text-sm">Start Time</Label>
                        <input
                          type="time"
                          value={notificationSettings.quietStart}
                          onChange={(e) => handleSettingChange('quietStart', e.target.value)}
                          className="w-full mt-1 p-2 bg-slate-600 border border-slate-500 rounded text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400 text-sm">End Time</Label>
                        <input
                          type="time"
                          value={notificationSettings.quietEnd}
                          onChange={(e) => handleSettingChange('quietEnd', e.target.value)}
                          className="w-full mt-1 p-2 bg-slate-600 border border-slate-500 rounded text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Instant Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications immediately</p>
                  </div>
                  <Switch
                    checked={notificationSettings.instantNotifications}
                    onCheckedChange={(checked) => handleSettingChange('instantNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Daily Digest</Label>
                    <p className="text-sm text-gray-500">Receive a daily summary email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.dailyDigest}
                    onCheckedChange={(checked) => handleSettingChange('dailyDigest', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => toast({ title: "Settings Saved", description: "Your notification preferences have been updated." })}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8"
              >
                Save Notification Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}