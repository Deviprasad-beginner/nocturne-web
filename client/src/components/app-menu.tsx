import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Menu, 
  Home, 
  BookOpen, 
  MessageSquare, 
  Brain, 
  Users, 
  Coffee, 
  Music, 
  MessageCircle, 
  NotebookPen, 
  Heart, 
  Lightbulb, 
  Mic, 
  Moon,
  Settings,
  User,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Star
} from "lucide-react";

interface AppMenuProps {
  className?: string;
}

export function AppMenu({ className }: AppMenuProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const mainNavItems = [
    { href: "/", label: "Home", icon: Home, badge: null },
    { href: "/diaries", label: "Personal Diaries", icon: BookOpen, badge: null },
    { href: "/whispers", label: "Anonymous Whispers", icon: MessageSquare, badge: "3" },
    { href: "/mind-maze", label: "Mind Maze", icon: Brain, badge: null },
    { href: "/night-circles", label: "Night Circles", icon: Users, badge: "2" },
    { href: "/midnight-cafe", label: "Midnight Café", icon: Coffee, badge: null },
  ];

  const secondaryNavItems = [
    { href: "/music-mood", label: "Music & Mood", icon: Music, badge: null },
    { href: "/night-conversations", label: "Night Conversations", icon: MessageCircle, badge: null },
    { href: "/digital-journals", label: "Digital Journals", icon: NotebookPen, badge: null },
    { href: "/mindful-spaces", label: "Mindful Spaces", icon: Heart, badge: null },
    { href: "/3am-founder", label: "3AM Founder", icon: Lightbulb, badge: null },
    { href: "/starlit-speaker", label: "Starlit Speaker", icon: Mic, badge: "Live" },
    { href: "/moon-messenger", label: "Moon Messenger", icon: Moon, badge: "5" },
  ];

  const settingsItems = [
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/privacy", label: "Privacy", icon: Shield },
    { href: "/help", label: "Help & Support", icon: HelpCircle },
  ];

  const isActive = (href: string) => location === href;

  const NavItem = ({ href, label, icon: Icon, badge }: any) => (
    <Link href={href}>
      <Button
        variant={isActive(href) ? "secondary" : "ghost"}
        className={`w-full justify-start text-left h-auto p-3 ${
          isActive(href) 
            ? "bg-purple-600/20 text-purple-300 border-l-2 border-purple-400" 
            : "text-gray-300 hover:text-white hover:bg-slate-700/50"
        }`}
        onClick={() => setIsOpen(false)}
      >
        <Icon className="mr-3 h-5 w-5" />
        <span className="flex-1">{label}</span>
        {badge && (
          <Badge 
            variant={badge === "Live" ? "destructive" : "secondary"} 
            className={`ml-2 text-xs ${
              badge === "Live" 
                ? "bg-red-600 text-white animate-pulse" 
                : "bg-purple-600/30 text-purple-300"
            }`}
          >
            {badge}
          </Badge>
        )}
      </Button>
    </Link>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700 ${className}`}
        >
          <Menu className="h-5 w-5 mr-2" />
          Menu
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="w-80 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-slate-700 overflow-y-auto"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="text-white flex items-center gap-2">
            <Moon className="h-6 w-6 text-purple-400" />
            Nocturne
          </SheetTitle>
          <p className="text-gray-400 text-sm">Where night owls gather</p>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* User Profile Section */}
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">Night Wanderer</p>
                <p className="text-gray-400 text-sm">Online</p>
              </div>
            </div>
            <div className="flex gap-2 text-xs text-gray-400">
              <span>Level 5 Night Owl</span>
              <span>•</span>
              <span>142 connections</span>
            </div>
          </div>

          {/* Main Navigation */}
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-3 px-1">Main Features</h3>
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* Secondary Features */}
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-3 px-1">Additional Features</h3>
            <div className="space-y-1">
              {secondaryNavItems.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* Settings & Account */}
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-3 px-1">Account & Settings</h3>
            <div className="space-y-1">
              {settingsItems.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="text-gray-400 text-sm font-medium mb-3 px-1">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-slate-800/50 border-slate-600 text-gray-300 hover:bg-slate-700"
                onClick={() => setIsOpen(false)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                New Post
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-slate-800/50 border-slate-600 text-gray-300 hover:bg-slate-700"
                onClick={() => setIsOpen(false)}
              >
                <Users className="h-4 w-4 mr-1" />
                Join Circle
              </Button>
            </div>
          </div>

          {/* Logout */}
          <div className="pt-4">
            <Button 
              variant="outline" 
              className="w-full bg-slate-800/50 border-slate-600 text-gray-300 hover:bg-red-700/20 hover:border-red-600 hover:text-red-300"
              onClick={() => setIsOpen(false)}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t border-slate-700">
            <p>Nocturne v1.0</p>
            <p>Built for night owls, by night owls</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default AppMenu;