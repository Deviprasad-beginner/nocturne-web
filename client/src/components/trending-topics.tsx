import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { TrendingUp, Hash, ArrowUpRight } from "lucide-react";

interface TrendingTopic {
  id: number;
  tag: string;
  posts: number;
  growth: number;
  category: string;
  destination: string;
}

export function TrendingTopics() {
  const { data: response, isLoading } = useQuery<{ success: boolean; data: TrendingTopic[] }>({
    queryKey: ["/api/v1/trending/topics"],
    refetchInterval: 60000,
  });

  const trendingTopics = response?.data || [];
  const displayTopics = trendingTopics.slice(0, 3); // Top 3 only

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-3.5 h-3.5 text-fuchsia-400" />
          <span className="text-xs font-medium text-fuchsia-100 tracking-wide">Trending Tonight</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-1 h-8 bg-fuchsia-500/20 rounded animate-pulse" />
          </div>
        ) : trendingTopics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-2 opacity-50">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs">Quiet night...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {displayTopics.map((topic, index) => (
              <Link key={topic.id} href={topic.destination}>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer group border border-transparent hover:border-white/5">
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-xs font-bold text-gray-600 w-3 text-center group-hover:text-fuchsia-500/50 transition-colors">
                      {index + 1}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-gray-300 truncate group-hover:text-white transition-colors">
                        {topic.tag}
                      </span>
                      <span className="text-[10px] text-gray-600 truncate">
                        {topic.posts} posts
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-green-400 font-medium">+{topic.growth}%</span>
                    <ArrowUpRight className="w-3 h-3 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer / More Link */}
      {trendingTopics.length > 3 && (
        <div className="px-4 py-2 border-t border-white/5 bg-white/[0.02]">
          <Link href="/explore">
            <div className="text-[10px] text-center text-gray-500 hover:text-white cursor-pointer transition-colors">
              View all trends
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
