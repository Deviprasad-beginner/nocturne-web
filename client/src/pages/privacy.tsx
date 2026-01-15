import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Eye, EyeOff, AlertTriangle, Ban, Flag, Lock, Globe, Users, UserX, MessageSquareOff, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlockedUser {
  id: string;
  username: string;
  blockedAt: Date;
  reason: string;
}

interface ReportedContent {
  id: string;
  type: string;
  content: string;
  reportedAt: Date;
  status: "pending" | "reviewed" | "resolved";
}

export default function Privacy() {
  const { toast } = useToast();
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showOnlineStatus: true,
    allowDirectMessages: true,
    allowGroupInvites: true,
    showReadReceipts: true,
    allowTagging: true,
    dataCollection: true,
    analyticsOptOut: false,
    shareActivity: false,
    twoFactorAuth: false,
    locationSharing: false,
    contentIndexing: true,
  });

  const [blockedUsers] = useState<BlockedUser[]>([
    { id: "1", username: "NightTroll42", blockedAt: new Date("2024-01-15"), reason: "Harassment" },
    { id: "2", username: "SpamBot123", blockedAt: new Date("2024-01-10"), reason: "Spam" },
  ]);

  const [reportedContent] = useState<ReportedContent[]>([
    { id: "1", type: "Whisper", content: "Inappropriate content in whisper...", reportedAt: new Date("2024-01-20"), status: "pending" },
    { id: "2", type: "Circle Post", content: "Spam message in Night Circle...", reportedAt: new Date("2024-01-18"), status: "reviewed" },
  ]);

  const handleSettingChange = (key: string, value: any) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    toast({
      title: "Privacy Setting Updated",
      description: "Your privacy preferences have been saved.",
      duration: 2000,
    });
  };

  const unblockUser = (userId: string) => {
    toast({
      title: "User Unblocked",
      description: "The user has been removed from your blocked list.",
    });
  };

  const blockNewUser = () => {
    toast({
      title: "Block User",
      description: "Enter a username or user ID to block them.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Shield className="h-8 w-8 text-purple-400" />
            Privacy & Security
          </h1>
          <p className="text-gray-400">Control your privacy, security, and content visibility</p>
        </div>

        <div className="space-y-6">
          {/* Profile Privacy */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Profile Privacy
              </CardTitle>
              <CardDescription className="text-gray-400">
                Control who can see your profile and activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Profile Visibility</Label>
                  <p className="text-sm text-gray-500">Who can see your profile information</p>
                </div>
                <Select
                  value={privacySettings.profileVisibility}
                  onValueChange={(value) => handleSettingChange('profileVisibility', value)}
                >
                  <SelectTrigger className="w-36 bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Friends Only
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Private
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Show Online Status</Label>
                  <p className="text-sm text-gray-500">Display when you're active to others</p>
                </div>
                <Switch
                  checked={privacySettings.showOnlineStatus}
                  onCheckedChange={(checked) => handleSettingChange('showOnlineStatus', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Share Activity Status</Label>
                  <p className="text-sm text-gray-500">Show your reading and posting activity</p>
                </div>
                <Switch
                  checked={privacySettings.shareActivity}
                  onCheckedChange={(checked) => handleSettingChange('shareActivity', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Location Sharing</Label>
                  <p className="text-sm text-gray-500">Allow location-based features</p>
                </div>
                <Switch
                  checked={privacySettings.locationSharing}
                  onCheckedChange={(checked) => handleSettingChange('locationSharing', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Communication Privacy */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquareOff className="h-5 w-5" />
                Communication Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                Control how others can interact with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Allow Direct Messages</Label>
                  <p className="text-sm text-gray-500">Receive private messages from other users</p>
                </div>
                <Switch
                  checked={privacySettings.allowDirectMessages}
                  onCheckedChange={(checked) => handleSettingChange('allowDirectMessages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Allow Group Invites</Label>
                  <p className="text-sm text-gray-500">Let others invite you to circles and groups</p>
                </div>
                <Switch
                  checked={privacySettings.allowGroupInvites}
                  onCheckedChange={(checked) => handleSettingChange('allowGroupInvites', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Show Read Receipts</Label>
                  <p className="text-sm text-gray-500">Let others know when you've read their messages</p>
                </div>
                <Switch
                  checked={privacySettings.showReadReceipts}
                  onCheckedChange={(checked) => handleSettingChange('showReadReceipts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Allow Tagging</Label>
                  <p className="text-sm text-gray-500">Let others mention you in posts</p>
                </div>
                <Switch
                  checked={privacySettings.allowTagging}
                  onCheckedChange={(checked) => handleSettingChange('allowTagging', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Privacy */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Data Privacy
              </CardTitle>
              <CardDescription className="text-gray-400">
                Control how your data is collected and used
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Data Collection</Label>
                  <p className="text-sm text-gray-500">Allow collection of usage data for improvement</p>
                </div>
                <Switch
                  checked={privacySettings.dataCollection}
                  onCheckedChange={(checked) => handleSettingChange('dataCollection', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Analytics Opt-Out</Label>
                  <p className="text-sm text-gray-500">Opt out of anonymous analytics tracking</p>
                </div>
                <Switch
                  checked={privacySettings.analyticsOptOut}
                  onCheckedChange={(checked) => handleSettingChange('analyticsOptOut', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Content Indexing</Label>
                  <p className="text-sm text-gray-500">Allow your public content to be searchable</p>
                </div>
                <Switch
                  checked={privacySettings.contentIndexing}
                  onCheckedChange={(checked) => handleSettingChange('contentIndexing', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Security
              </CardTitle>
              <CardDescription className="text-gray-400">
                Enhance your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={privacySettings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                  />
                  {privacySettings.twoFactorAuth && (
                    <Badge className="bg-green-600 text-white">Enabled</Badge>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-700/30 rounded-lg">
                <h4 className="text-white font-medium mb-2">Login History</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>Current session (Chrome on Windows)</span>
                    <span>Active now</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mobile app (iOS)</span>
                    <span>2 hours ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chrome on Mac</span>
                    <span>Yesterday</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-3 bg-slate-700 border-slate-600 text-white">
                  View All Sessions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Blocked Users */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Ban className="h-5 w-5" />
                Blocked Users
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage users you've blocked from interacting with you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter username to block"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button
                    onClick={blockNewUser}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Block
                  </Button>
                </div>

                {blockedUsers.length > 0 ? (
                  <div className="space-y-3">
                    {blockedUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-sm text-gray-400">
                            Blocked {user.blockedAt.toLocaleDateString()} • {user.reason}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="border-slate-600 text-white">
                              Unblock
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-800 border-slate-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Unblock User</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                Are you sure you want to unblock {user.username}? They will be able to interact with you again.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => unblockUser(user.id)}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                Unblock
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <Ban className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No blocked users</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reported Content */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Reported Content
              </CardTitle>
              <CardDescription className="text-gray-400">
                Track content you've reported for moderation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportedContent.length > 0 ? (
                <div className="space-y-3">
                  {reportedContent.map((report) => (
                    <div key={report.id} className="p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {report.type}
                          </Badge>
                          <Badge 
                            variant={
                              report.status === "pending" ? "destructive" : 
                              report.status === "reviewed" ? "secondary" : "default"
                            }
                            className="capitalize"
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {report.reportedAt.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{report.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reported content</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy Tips */}
          <Card className="bg-blue-900/20 border-blue-800/50">
            <CardHeader>
              <CardTitle className="text-blue-300 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Privacy Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-blue-200">
              <ul className="space-y-2 text-sm">
                <li>• Use anonymous posting for sensitive topics</li>
                <li>• Regularly review your privacy settings</li>
                <li>• Be cautious about sharing personal information</li>
                <li>• Report inappropriate content to help keep the community safe</li>
                <li>• Enable two-factor authentication for better security</li>
                <li>• Review login history periodically for suspicious activity</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <Button 
            onClick={() => toast({ title: "Privacy Settings Saved", description: "All your privacy preferences have been updated." })}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8"
          >
            Save Privacy Settings
          </Button>
        </div>
      </div>
    </div>
  );
}