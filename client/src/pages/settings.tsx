import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Moon, Bell, Shield, User, Globe, Download, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Profile Settings
    displayName: "Night Wanderer",
    bio: "A fellow insomniac exploring the depths of midnight thoughts",
    location: "Somewhere in the night",
    
    // Privacy Settings
    profileVisibility: "public",
    showOnlineStatus: true,
    allowDirectMessages: true,
    showActivity: false,
    anonymousPosting: true,
    
    // Notification Settings
    pushNotifications: true,
    emailNotifications: false,
    mentionNotifications: true,
    messageNotifications: true,
    circleUpdates: true,
    whisperReplies: false,
    
    // Theme Settings
    darkMode: true,
    accentColor: "purple",
    fontSize: "medium",
    compactMode: false,
    
    // Content Settings
    showExplicitContent: false,
    autoPlayMedia: true,
    showReadReceipts: true,
    dataUsage: "standard",
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved.",
      duration: 2000,
    });
  };

  const exportData = () => {
    toast({
      title: "Data Export Started",
      description: "Your data archive will be ready for download shortly.",
    });
  };

  const deleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Customize your Nocturne experience</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
                  <Input
                    id="displayName"
                    value={settings.displayName}
                    onChange={(e) => handleSettingChange('displayName', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-gray-300">Location</Label>
                  <Input
                    id="location"
                    value={settings.location}
                    onChange={(e) => handleSettingChange('location', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                <Textarea
                  id="bio"
                  value={settings.bio}
                  onChange={(e) => handleSettingChange('bio', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription className="text-gray-400">
                Control who can see your activity and content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Profile Visibility</Label>
                  <p className="text-sm text-gray-500">Who can see your profile</p>
                </div>
                <Select
                  value={settings.profileVisibility}
                  onValueChange={(value) => handleSettingChange('profileVisibility', value)}
                >
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Show Online Status</Label>
                  <p className="text-sm text-gray-500">Let others see when you're online</p>
                </div>
                <Switch
                  checked={settings.showOnlineStatus}
                  onCheckedChange={(checked) => handleSettingChange('showOnlineStatus', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Allow Direct Messages</Label>
                  <p className="text-sm text-gray-500">Receive messages from other users</p>
                </div>
                <Switch
                  checked={settings.allowDirectMessages}
                  onCheckedChange={(checked) => handleSettingChange('allowDirectMessages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Anonymous Posting</Label>
                  <p className="text-sm text-gray-500">Allow posting without your name</p>
                </div>
                <Switch
                  checked={settings.anonymousPosting}
                  onCheckedChange={(checked) => handleSettingChange('anonymousPosting', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Show Activity Status</Label>
                  <p className="text-sm text-gray-500">Display your activity in feeds</p>
                </div>
                <Switch
                  checked={settings.showActivity}
                  onCheckedChange={(checked) => handleSettingChange('showActivity', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription className="text-gray-400">
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive browser notifications</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive email updates</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Mentions</Label>
                  <p className="text-sm text-gray-500">When someone mentions you</p>
                </div>
                <Switch
                  checked={settings.mentionNotifications}
                  onCheckedChange={(checked) => handleSettingChange('mentionNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Direct Messages</Label>
                  <p className="text-sm text-gray-500">New message notifications</p>
                </div>
                <Switch
                  checked={settings.messageNotifications}
                  onCheckedChange={(checked) => handleSettingChange('messageNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Circle Updates</Label>
                  <p className="text-sm text-gray-500">Activity in your circles</p>
                </div>
                <Switch
                  checked={settings.circleUpdates}
                  onCheckedChange={(checked) => handleSettingChange('circleUpdates', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription className="text-gray-400">
                Customize the look and feel of Nocturne
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Dark Mode</Label>
                  <p className="text-sm text-gray-500">Perfect for late-night browsing</p>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Accent Color</Label>
                  <p className="text-sm text-gray-500">Choose your theme color</p>
                </div>
                <Select
                  value={settings.accentColor}
                  onValueChange={(value) => handleSettingChange('accentColor', value)}
                >
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Font Size</Label>
                  <p className="text-sm text-gray-500">Adjust text size</p>
                </div>
                <Select
                  value={settings.fontSize}
                  onValueChange={(value) => handleSettingChange('fontSize', value)}
                >
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Compact Mode</Label>
                  <p className="text-sm text-gray-500">Reduce spacing for more content</p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Settings */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Content & Media
              </CardTitle>
              <CardDescription className="text-gray-400">
                Control how content is displayed and loaded
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Show Explicit Content</Label>
                  <p className="text-sm text-gray-500">Display mature content warnings</p>
                </div>
                <Switch
                  checked={settings.showExplicitContent}
                  onCheckedChange={(checked) => handleSettingChange('showExplicitContent', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Auto-play Media</Label>
                  <p className="text-sm text-gray-500">Automatically play videos and audio</p>
                </div>
                <Switch
                  checked={settings.autoPlayMedia}
                  onCheckedChange={(checked) => handleSettingChange('autoPlayMedia', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Show Read Receipts</Label>
                  <p className="text-sm text-gray-500">Let others know when you've read messages</p>
                </div>
                <Switch
                  checked={settings.showReadReceipts}
                  onCheckedChange={(checked) => handleSettingChange('showReadReceipts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Data Usage</Label>
                  <p className="text-sm text-gray-500">Control data consumption</p>
                </div>
                <Select
                  value={settings.dataUsage}
                  onValueChange={(value) => handleSettingChange('dataUsage', value)}
                >
                  <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Account Management
              </CardTitle>
              <CardDescription className="text-gray-400">
                Export your data or delete your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <Label className="text-gray-300">Export Data</Label>
                  <p className="text-sm text-gray-500">Download all your posts, messages, and activity</p>
                </div>
                <Button 
                  onClick={exportData}
                  variant="outline" 
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
                <div>
                  <Label className="text-red-300">Delete Account</Label>
                  <p className="text-sm text-red-400">Permanently remove your account and all data</p>
                </div>
                <Button 
                  onClick={deleteAccount}
                  variant="destructive" 
                  className="bg-red-700 hover:bg-red-800"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <Button 
            onClick={() => toast({ title: "Settings Saved", description: "All your preferences have been saved." })}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8"
          >
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
}