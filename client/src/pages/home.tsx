import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Diary, Whisper, MindMaze, NightCircle, MidnightCafe } from "@shared/schema";
import { AuthButton } from "@/components/auth-button";
import { CategoryCard } from "@/components/category-card";
import { HeroSection } from "@/components/hero-section";
import { EnhancedHeader } from "@/components/enhanced-header";
import { LiveActivityFeed } from "@/components/live-activity-feed";
import { UserProfileCard } from "@/components/user-profile-card";
import { TrendingTopics } from "@/components/trending-topics";
import { useLocation } from "wouter";
import { Footer } from "@/components/footer";
import {
  Moon,
  Notebook,
  MessageCircle,
  Brain,
  Users,
  Coffee,
  Music,
  Heart,
  Lightbulb,
  Star as StarIcon
} from "lucide-react";

// Star component for background
function Star({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`absolute bg-white ${className}`}
      style={{
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%)',
        ...style
      }}
    />
  );
}

export default function Home() {
  const [location, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();

  // Data fetching with React Query from our backend API
  const { data: diaries = [], isLoading: diariesLoading } = useQuery<Diary[]>({
    queryKey: ['/api/v1/diaries'],
    enabled: true,
  });

  const { data: whispers = [], isLoading: whispersLoading } = useQuery<Whisper[]>({
    queryKey: ['/api/v1/whispers'],
    enabled: true,
  });

  const { data: mindMaze = [], isLoading: mindMazeLoading } = useQuery<MindMaze[]>({
    queryKey: ['/api/v1/mind-maze'],
    enabled: true,
  });

  const { data: nightCircles = [], isLoading: nightCirclesLoading } = useQuery<NightCircle[]>({
    queryKey: ['/api/v1/circles'],
    enabled: true,
  });

  const { data: midnightCafe = [], isLoading: midnightCafeLoading } = useQuery<MidnightCafe[]>({
    queryKey: ['/api/v1/cafe'],
    enabled: true,
  });

  const handleLogin = () => {
    setLocation("/auth");
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Real components are now imported from @/components

  const QuickActions = () => (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-400">Quick Action 1</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-400">Quick Action 2</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-400">Quick Action 3</p>
        </div>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white relative overflow-hidden">

      {/* Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Star className="w-1 h-1 top-20 left-10 animate-twinkle" />
        <Star className="w-1 h-1 top-32 right-20 animate-twinkle" style={{ animationDelay: '0.5s' }} />
        <Star className="w-0.5 h-0.5 top-48 left-1/3 animate-twinkle" style={{ animationDelay: '1s' }} />
        <Star className="w-1 h-1 top-64 right-1/3 animate-twinkle" style={{ animationDelay: '1.5s' }} />
        <Star className="w-0.5 h-0.5 top-80 left-20 animate-twinkle" style={{ animationDelay: '2s' }} />
        <Star className="w-1 h-1 top-96 right-10 animate-twinkle" style={{ animationDelay: '0.8s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse-glow">
              <Moon className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Nocturne
            </h1>
          </div>

          <AuthButton user={user} onLogin={handleLogin} onLogout={handleLogout} />
        </nav>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Category Grid */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-white">Explore Nocturne Communities</h3>

          {/* Top Section - Activity & Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <LiveActivityFeed />
            </div>
            <div>
              <UserProfileCard />
            </div>
          </div>

          {/* Trending Section */}
          <div className="mb-8">
            <TrendingTopics />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Night Diaries */}
            <CategoryCard
              title="Night Diaries"
              description="Private and public journals for your midnight musings and daily reflections."
              icon={Notebook}
              iconColor="bg-gradient-to-br from-yellow-400 to-orange-500"
              count={diaries.length}
              countLabel="entries"
              countColor="bg-yellow-500/20 text-yellow-300"
              onClick={() => setLocation('/diaries')}
            >
              <div className="space-y-3">
                {diariesLoading ? (
                  <div className="text-gray-400 text-sm">Loading entries...</div>
                ) : diaries.length === 0 ? (
                  <div className="text-gray-400 text-sm">No diary entries yet. Be the first to share your thoughts!</div>
                ) : (
                  diaries.slice(0, 2).map((diary: Diary) => (
                    <div key={diary.id} className="bg-black/30 p-3 rounded-lg">
                      <p className="text-sm text-gray-300">"{diary.content.substring(0, 60)}..."</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        {/* <span>{diary.author}</span> */} {/* author is not in Diary type based on schema, authorId is. Schema: authorId. Assuming author logic is elsewhere or simplified here. Wait, schema has authorId. Code uses diary.author. If diary.author is missing, we might have another issue. Let's stick to fixing the date first, but I should check if author exists. Schema says authorId. Let's keep existing structure primarily but fix date. */}
                        {/* Actually, looking at schema, Diary has authorId. 'author' property might be joined. But standard getDiaries usually returns flat table. Let's check storage.getDiaries */}
                        <span>Anoymous</span>
                        <span>{new Date(diary.createdAt || new Date()).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CategoryCard>

            {/* Whispers */}
            <CategoryCard
              title="Whispers"
              description="Anonymous thoughts and confessions shared in the safety of darkness."
              icon={MessageCircle}
              iconColor="bg-gradient-to-br from-indigo-400 to-purple-500"
              count={whispers.length}
              countLabel="whispers"
              countColor="bg-indigo-500/20 text-indigo-300"
              onClick={() => setLocation('/whispers')}
            >
              <div className="space-y-3">
                {whispersLoading ? (
                  <div className="text-gray-400 text-sm">Loading whispers...</div>
                ) : whispers.length === 0 ? (
                  <div className="text-gray-400 text-sm">No whispers yet. Share your anonymous thoughts!</div>
                ) : (
                  whispers.slice(0, 2).map((whisper: Whisper) => (
                    <div key={whisper.id} className="bg-black/30 p-3 rounded-lg">
                      <p className="text-sm text-gray-300">"{whisper.content.substring(0, 60)}..."</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{whisper.hearts}</span>
                        </span>
                        <span>{new Date(whisper.createdAt || new Date()).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CategoryCard>

            {/* Mind Maze */}
            <CategoryCard
              title="Mind Maze"
              description="Brain teasers, philosophy, and deep questions to stimulate late-night thinking."
              icon={Brain}
              iconColor="bg-gradient-to-br from-green-400 to-blue-500"
              count={mindMaze.length}
              countLabel="puzzles"
              countColor="bg-green-500/20 text-green-300"
              onClick={() => setLocation('/mind-maze')}
            >
              <div className="space-y-3">
                {mindMazeLoading ? (
                  <div className="text-gray-400 text-sm">Loading puzzles...</div>
                ) : mindMaze.length === 0 ? (
                  <div className="text-gray-400 text-sm">No puzzles yet. Share a thought-provoking question!</div>
                ) : (
                  mindMaze.slice(0, 2).map((puzzle: any) => (
                    <div key={puzzle.id} className="bg-black/30 p-3 rounded-lg">
                      <p className="text-sm text-gray-300 font-medium">
                        {puzzle.type === 'puzzle' ? '🧩' : '💭'} {puzzle.type === 'puzzle' ? "Tonight's Puzzle:" : "Philosophy Corner:"}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">"{puzzle.content.substring(0, 60)}..."</p>
                      <div className="mt-2 text-xs text-gray-500">
                        <span>{puzzle.responses} responses</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CategoryCard>

            {/* Night Circles */}
            <CategoryCard
              title="Night Circles"
              description="Small group discussions for intimate conversations and mutual support."
              icon={Users}
              iconColor="bg-gradient-to-br from-pink-400 to-red-500"
              count={nightCircles.filter((circle: any) => circle.active).length}
              countLabel="active"
              countColor="bg-pink-500/20 text-pink-300"
              onClick={() => setLocation('/night-circles')}
            >
              <div className="space-y-3">
                {nightCirclesLoading ? (
                  <div className="text-gray-400 text-sm">Loading circles...</div>
                ) : nightCircles.length === 0 ? (
                  <div className="text-gray-400 text-sm">No circles yet. Create the first night circle!</div>
                ) : (
                  nightCircles.slice(0, 2).map((circle: any) => (
                    <div key={circle.id} className="bg-black/30 p-3 rounded-lg">
                      <img
                        src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100"
                        alt="People in deep conversation"
                        className="w-full h-16 object-cover rounded mb-2"
                      />
                      <p className="text-sm text-gray-300 font-medium">🌙 {circle.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {circle.members} members • {circle.active ? 'Active now' : `${circle.online} online`}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CategoryCard>

            {/* Midnight Cafe */}
            <CategoryCard
              title="Midnight Cafe"
              description="Casual hangout space for light conversations and virtual companionship."
              icon={Coffee}
              iconColor="bg-gradient-to-br from-amber-400 to-orange-500"
              count={midnightCafe.length}
              countLabel="online"
              countColor="bg-amber-500/20 text-amber-300"
              onClick={() => setLocation('/midnight-cafe')}
            >
              <div className="space-y-3">
                {midnightCafeLoading ? (
                  <div className="text-gray-400 text-sm">Loading cafe...</div>
                ) : midnightCafe.length === 0 ? (
                  <div className="text-gray-400 text-sm">No one in the cafe yet. Join the conversation!</div>
                ) : (
                  midnightCafe.slice(0, 2).map((post: any) => (
                    <div key={post.id} className="bg-black/30 p-3 rounded-lg">
                      <img
                        src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100"
                        alt="Cozy cafe interior"
                        className="w-full h-16 object-cover rounded mb-2"
                      />
                      <p className="text-sm text-gray-300">"{post.content.substring(0, 60)}..."</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{post.author}</span>
                        <span>{post.replies} replies</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CategoryCard>

            {/* Music & Mood */}
            <CategoryCard
              title="Music & Mood"
              description="Curated playlists and ambient sounds for different night moods and activities."
              icon={Music}
              iconColor="bg-gradient-to-br from-purple-400 to-pink-500"
              count={156}
              countLabel="listening"
              countColor="bg-purple-500/20 text-purple-300"
              onClick={() => setLocation('/music-mood')}
            >
              <div className="space-y-3">
                <div className="bg-black/30 p-3 rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100"
                    alt="People enjoying music under the stars"
                    className="w-full h-16 object-cover rounded mb-2"
                  />
                  <p className="text-sm text-gray-300 font-medium">🎵 Currently Playing</p>
                  <p className="text-xs text-gray-400 mt-1">"Midnight Study Beats" • Lo-fi Hip Hop</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span>89 listening now</span>
                  </div>
                </div>
                <div className="bg-black/30 p-3 rounded-lg">
                  <p className="text-sm text-gray-300 font-medium">🌙 Nocturne Ambient</p>
                  <p className="text-xs text-gray-400 mt-1">Rain sounds mixed with gentle piano</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span>67 listening now</span>
                  </div>
                </div>
              </div>
            </CategoryCard>

            {/* New Categories */}
            <CategoryCard
              title="3AM Founder"
              description="Anonymous thoughts and insights from midnight entrepreneurs. Share your raw startup ideas and struggles without judgment."
              icon={Lightbulb}
              iconColor="text-orange-400"
              count={23}
              countLabel="founder insights"
              countColor="text-orange-300"
              onClick={() => setLocation("/3am-founder")}
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Ideas shared</span>
                  <span className="text-orange-300">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Upvotes today</span>
                  <span className="text-orange-300">45</span>
                </div>
              </div>
            </CategoryCard>

            <CategoryCard
              title="Starlit Speaker"
              description="Voice chat rooms for intimate audio conversations. Connect through spoken words under the digital stars."
              icon={StarIcon}
              iconColor="text-purple-400"
              count={8}
              countLabel="active rooms"
              countColor="text-purple-300"
              onClick={() => setLocation("/starlit-speaker")}
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Live speakers</span>
                  <span className="text-purple-300">24</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Topics active</span>
                  <span className="text-purple-300">6</span>
                </div>
              </div>
            </CategoryCard>

            <CategoryCard
              title="Moon Messenger"
              description="Random text pairing for anonymous conversations. Connect with strangers through thoughtful messages in the night."
              icon={MessageCircle}
              iconColor="text-blue-400"
              count={156}
              countLabel="active chats"
              countColor="text-blue-300"
              onClick={() => setLocation("/moon-messenger")}
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Paired today</span>
                  <span className="text-blue-300">89</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Messages sent</span>
                  <span className="text-blue-300">234</span>
                </div>
              </div>
            </CategoryCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <QuickActions />
      <Footer />
    </div>
  );
}