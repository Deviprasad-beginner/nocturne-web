import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { TrendingUp, Hash, ChevronDown, ChevronUp } from "lucide-react";
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
  const displayTopics = isExpanded ? trendingTopics : trendingTopics.slice(0, 5);

  return (
    <>
      <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-all duration-200"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">Trending Tonight</span>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <ChevronUp className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-0' : 'rotate-180'}`} />
          </button>
        </div>

        <div
          className="transition-all duration-500 ease-in-out overflow-hidden"
          style={{
            maxHeight: isExpanded ? '600px' : '0px',
            opacity: isExpanded ? 1 : 0
          }}
        >
          <div className="px-4 pb-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {displayTopics.map((topic, index) => (
                    <Link key={topic.id} href={topic.destination}>
                      <div
                        className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer group border border-white/0 hover:border-white/10 hover:scale-[1.01]"
                        style={{
                          animation: isExpanded ? `fadeSlideIn 0.3s ease-out ${index * 0.05}s both` : 'none'
                        }}
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <div className="flex items-center justify-center w-5 h-5 bg-white/10 group-hover:bg-purple-500/30 rounded-lg text-xs font-bold text-gray-300 transition-all duration-200 flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex items-center space-x-1 min-w-0">
                            <Hash className="w-3 h-3 text-gray-500 group-hover:text-purple-400 transition-colors flex-shrink-0" />
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
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-xs">No trending topics yet</p>
                    </div>
                  )}
                </div>

                {/* Quick Tags */}
                <div className="mt-4 pt-3 border-t border-white/5 animate-in fade-in duration-500" style={{ animationDelay: '0.2s' }}>
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">Quick Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { tag: "#nightthoughts", dest: "/diaries" },
                      { tag: "#3amwisdom", dest: "/whispers" },
                      { tag: "#moonlitmusings", dest: "/midnight-cafe" },
                      { tag: "#insomniaclife", dest: "/night-circles" },
                    ].map(({ tag, dest }) => (
                      <Link key={tag} href={dest}>
                        <Badge
                          variant="outline"
                          className="text-xs cursor-pointer bg-white/5 border-white/10 text-gray-400 hover:bg-purple-500/20 hover:border-purple-400/50 hover:text-purple-300 transition-all duration-200 hover:scale-105"
                        >
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div
          className="transition-all duration-300 ease-in-out overflow-hidden"
          style={{
            maxHeight: !isExpanded && trendingTopics.length > 0 ? '50px' : '0px',
            opacity: !isExpanded ? 1 : 0
          }}
        >
          <div className="px-4 pb-3">
            <div className="text-center text-xs text-gray-500 py-1">
              {trendingTopics.length} trending {trendingTopics.length === 1 ? 'topic' : 'topics'}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
