
import { useState } from "react";
import { TrendingUp, Hash, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrendingTopic {
  id: number;
  tag: string;
  posts: number;
  growth: number;
  category: string;
}

export function TrendingTopics() {
  const [trendingTopics] = useState<TrendingTopic[]>([
    { id: 1, tag: "3amthoughts", posts: 147, growth: 23, category: "philosophy" },
    { id: 2, tag: "insomniacreations", posts: 89, growth: 45, category: "creative" },
    { id: 3, tag: "midnightmusic", posts: 203, growth: 12, category: "music" },
    { id: 4, tag: "nightowlstartup", posts: 76, growth: 67, category: "business" },
    { id: 5, tag: "dreamjournal", posts: 134, growth: 34, category: "personal" },
    { id: 6, tag: "starlitconversations", posts: 98, growth: 29, category: "social" }
  ]);

  const getCategoryColor = (category: string) => {
    const colors = {
      philosophy: "bg-purple-500/20 text-purple-300",
      creative: "bg-pink-500/20 text-pink-300",
      music: "bg-green-500/20 text-green-300",
      business: "bg-orange-500/20 text-orange-300",
      personal: "bg-blue-500/20 text-blue-300",
      social: "bg-cyan-500/20 text-cyan-300"
    };
    return colors[category as keyof typeof colors] || "bg-gray-500/20 text-gray-300";
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border-gray-600">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <span>Trending Tonight</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div 
              key={topic.id}
              className="flex items-center justify-between p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 bg-gray-600 rounded text-xs font-bold text-gray-300">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-white font-medium">{topic.tag}</span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-400 flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{topic.posts} posts</span>
                    </span>
                    <Badge className={getCategoryColor(topic.category)} variant="secondary">
                      {topic.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+{topic.growth}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Hashtag Suggestions */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Quick Tags</h4>
          <div className="flex flex-wrap gap-2">
            {["#nightthoughts", "#3amwisdom", "#moonlitmusings", "#insomniaclife", "#midnightmagic"].map(tag => (
              <Badge 
                key={tag}
                variant="outline" 
                className="cursor-pointer hover:bg-purple-500/20 transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
