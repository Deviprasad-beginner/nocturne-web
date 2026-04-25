
import { useState } from "react";
import { Plus, Edit, Users, MessageCircle, Moon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

export function QuickActions() {
  const [, setLocation] = useLocation();
  const [showQuickActions, setShowQuickActions] = useState(false);

  const quickActions = [
    {
      icon: Edit,
      label: "Write Diary",
      description: "Share your midnight thoughts",
      color: "bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/30",
      action: () => setLocation('/diaries')
    },
    {
      icon: MessageCircle,
      label: "Start Whisper",
      description: "Anonymous message",
      color: "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30",
      action: () => setLocation('/whispers')
    },
    {
      icon: Users,
      label: "Join Circle",
      description: "Connect with others",
      color: "bg-green-500/20 hover:bg-green-500/30 border-green-500/30",
      action: () => setLocation('/night-circles')
    },
    {
      icon: Star,
      label: "Share Insight",
      description: "3AM founder wisdom",
      color: "bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30",
      action: () => setLocation('/3am-founder')
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {showQuickActions && (
        <Card className="mb-4 bg-gray-800/90 backdrop-blur-sm border-gray-600">
          <CardContent className="p-4">
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={`w-full justify-start space-x-3 ${action.color} transition-all duration-200`}
                  onClick={() => {
                    action.action();
                    setShowQuickActions(false);
                  }}
                >
                  <action.icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs opacity-70">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        size="lg"
        className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg"
        onClick={() => setShowQuickActions(!showQuickActions)}
      >
        <Plus className={`w-6 h-6 transition-transform duration-200 ${showQuickActions ? 'rotate-45' : ''}`} />
      </Button>
    </div>
  );
}
