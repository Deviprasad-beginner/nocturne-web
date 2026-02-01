import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { TrendingUp, Hash, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrendingTopic {
  id: number;
  tag: string;
  posts: number;
  growth: number;
  category: string;
  destination: string;
}

export function TrendingTopics() {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: response, isLoading } = useQuery<{ success: boolean; data: TrendingTopic[] }>({
    queryKey: ["/api/v1/trending/topics"],
    refetchInterval: 60000,
  });

  const trendingTopics = response?.data || [];

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

  const displayTopics = isExpanded ? trendingTopics : trendingTopics.slice(0, 5);

  return (
    <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border-gray-600 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm">Trending Tonight</span>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {displayTopics.map((topic, index) => (
                  <Link key={topic.id} href={topic.destination}>
                    <div className="flex items-center justify-between p-2 bg-black/20 rounded-xl hover:bg-black/40 transition-all duration-200 cursor-pointer group">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-5 h-5 bg-gray-600 group-hover:bg-purple-600 rounded-lg text-xs font-bold text-gray-300 transition-all duration-200 flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex items-center space-x-1 min-w-0">
                          <Hash className="w-3 h-3 text-gray-400 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                          <span className="text-xs text-white font-medium group-hover:text-purple-300 transition-colors truncate">
                            {topic.tag}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {topic.posts}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-green-400 flex-shrink-0">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs font-medium">+{topic.growth}%</span>
                      </div>
                    </div>
                  </Link>
                ))}

                {trendingTopics.length === 0 && (
                  <div className="text-center py-4 text-gray-400">
                    <p className="text-xs">No trending topics yet</p>
                  </div>
                )}
              </div>

              {/* Quick Tags - Only show when expanded */}
              <div className="mt-4 pt-3 border-t border-gray-700">
                <h4 className="text-xs font-semibold text-gray-400 mb-2">Quick Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {[
                    { tag: "#nightthoughts", dest: "/diaries" },
                    { tag: "#3amwisdom", dest: "/whispers" },
                    { tag: "#moonlitmusings", dest: "/midnight-cafe" },
                    { tag: "#insomniaclife", dest: "/night-circles" },
                  ].map(({ tag, dest }) => (
                    <Link key={tag} href={dest}>
                      <Badge
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-purple-500/20 hover:border-purple-400 transition-colors"
                      >
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}

      {!isExpanded && trendingTopics.length > 0 && (
        <CardContent className="pt-0">
          <div className="text-center text-xs text-gray-400 py-2">
            {trendingTopics.length} trending {trendingTopics.length === 1 ? 'topic' : 'topics'}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
