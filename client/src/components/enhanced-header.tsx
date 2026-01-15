import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AppMenu } from "@/components/app-menu";
import { 
  Search, 
  Bell, 
  Moon, 
  User, 
  Settings, 
  LogOut,
  Plus,
  MessageSquare,
  Users,
  Star,
  Crown
} from "lucide-react";

interface EnhancedHeaderProps {
  className?: string;
}

export function EnhancedHeader({ className }: EnhancedHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Mock user data - in real app this would come from auth context
  const user = {
    name: "Night Wanderer",
    avatar: "/api/placeholder/32/32",
    level: 5,
    unreadNotifications: 3,
    isOnline: true
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Handle search logic here
      console.log("Searching for:", searchQuery);
    }
  };

  const quickActions = [
    { icon: MessageSquare, label: "New Whisper", href: "/whispers" },
    { icon: Users, label: "Join Circle", href: "/night-circles" },
    { icon: Plus, label: "Create Post", href: "/diaries" },
  ];

  return (
    <header className={`bg-slate-900/95 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo & Menu */}
          <div className="flex items-center gap-4">
            <AppMenu className="lg:hidden" />
            
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Moon className="h-5 w-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-xl font-bold text-white">Nocturne</h1>
                  <p className="text-xs text-gray-400 -mt-1">Night Owl Social</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users, circles, or content..."
                className="w-full pl-10 pr-4 bg-slate-800/50 border-slate-600 text-white placeholder-gray-400 focus:border-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Right Section - Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white hover:bg-slate-700"
                    title={action.label}
                  >
                    <action.icon className="h-4 w-4" />
                  </Button>
                </Link>
              ))}
            </div>

            {/* Notifications */}
            <Link href="/notifications">
              <Button
                variant="ghost"
                size="sm"
                className="relative text-gray-300 hover:text-white hover:bg-slate-700"
              >
                <Bell className="h-5 w-5" />
                {user.unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-600 text-white text-xs flex items-center justify-center rounded-full">
                    {user.unreadNotifications}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-64 bg-slate-800 border-slate-700" align="end">
                <div className="flex items-center gap-3 p-3 border-b border-slate-700">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{user.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-purple-600/30 text-purple-300 text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Level {user.level}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-400">Online</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <Link href="/profile">
                    <DropdownMenuItem className="text-gray-300 hover:bg-slate-700 focus:bg-slate-700">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>
                  </Link>
                  
                  <Link href="/settings">
                    <DropdownMenuItem className="text-gray-300 hover:bg-slate-700 focus:bg-slate-700">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </Link>

                  <Link href="/notifications">
                    <DropdownMenuItem className="text-gray-300 hover:bg-slate-700 focus:bg-slate-700">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                      {user.unreadNotifications > 0 && (
                        <Badge className="ml-auto bg-red-600 text-white text-xs">
                          {user.unreadNotifications}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  </Link>
                </div>

                <DropdownMenuSeparator className="bg-slate-700" />

                <div className="py-1">
                  <DropdownMenuItem className="text-gray-300 hover:bg-slate-700 focus:bg-slate-700">
                    <Moon className="mr-2 h-4 w-4" />
                    Night Mode
                    <Badge className="ml-auto bg-green-600 text-white text-xs">ON</Badge>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="bg-slate-700" />

                <div className="py-1">
                  <DropdownMenuItem className="text-red-400 hover:bg-red-900/20 focus:bg-red-900/20">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Desktop Menu Toggle */}
            <div className="hidden lg:block">
              <AppMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default EnhancedHeader;