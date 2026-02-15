import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { SEO } from "@/components/SEO";
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
  Star as StarIcon,
  BookOpen
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
    queryKey: ['/api/v1/diaries?limit=5'],
    enabled: true,
  });

  const { data: whispers = [], isLoading: whispersLoading } = useQuery<Whisper[]>({
    queryKey: ['/api/v1/whispers?limit=5'],
    enabled: true,
  });

  const { data: mindMaze = [], isLoading: mindMazeLoading } = useQuery<MindMaze[]>({
    queryKey: ['/api/v1/mind-maze?limit=5'],
    enabled: true,
  });

  const { data: nightCircles = [], isLoading: nightCirclesLoading } = useQuery<NightCircle[]>({
    queryKey: ['/api/v1/circles?limit=5'],
    enabled: true,
  });

  const { data: midnightCafe = [], isLoading: midnightCafeLoading } = useQuery<MidnightCafe[]>({
    queryKey: ['/api/v1/cafe?limit=5'],
    enabled: true,
  });

  const handleLogin = () => {
    setLocation("/auth");
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white relative overflow-hidden">

      {/* Stars Background */}
      <SEO title="Home" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Star className="w-1 h-1 top-20 left-10 animate-twinkle" />
        <Star className="w-1 h-1 top-32 right-20 animate-twinkle" style={{ animationDelay: '0.5s' }} />
        <Star className="w-0.5 h-0.5 top-48 left-1/3 animate-twinkle" style={{ animationDelay: '1s' }} />
        <Star className="w-1 h-1 top-64 right-1/3 animate-twinkle" style={{ animationDelay: '1.5s' }} />
        <Star className="w-0.5 h-0.5 top-80 left-20 animate-twinkle" style={{ animationDelay: '2s' }} />
        <Star className="w-1 h-1 top-96 right-10 animate-twinkle" style={{ animationDelay: '0.8s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse-glow">
              <Moon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Nocturne
            </h1>
          </div>

          <AuthButton user={user} onLogin={handleLogin} onLogout={handleLogout} />
        </nav>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Category Grid */}
      <section className="relative z-10 px-4 sm:px-6 pb-12 md:pb-20">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-3 md:mb-4 text-white">Explore Nocturne</h3>

          {/* Guiding Sentence */}
          <h2 className="text-sm sm:text-base md:text-lg text-center text-gray-400 font-light mb-8 md:mb-12 italic tracking-wide animate-pulse-slow px-4">
            "Choose one place. You don't need to stay."
          </h2>

          {/* Dashboard Widgets Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {/* 1. Profile (Personal Context) */}
            <div className="h-48">
              <UserProfileCard />
            </div>

            {/* 2. Live Activity (Real-time Pulse) */}
            <div className="h-48">
              <LiveActivityFeed />
            </div>

            {/* 3. Trending (Community Pulse) */}
            <div className="h-48">
              <TrendingTopics />
            </div>
          </div>

          {/* SECTION 1: Your Sanctuary - Solo Activities */}
          <div className="mb-12 md:mb-16">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent flex-1"></div>
              <h4 className="text-base sm:text-lg md:text-xl font-semibold text-indigo-300 uppercase tracking-wider">Your Sanctuary</h4>
              <div className="h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent flex-1"></div>
            </div>
            <p className="text-center text-gray-400 text-xs sm:text-sm mb-4 md:mb-6 italic">Solo spaces for reflection and creation</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
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
                          <span>Anoymous</span>
                          <span>{new Date(diary.createdAt || new Date()).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CategoryCard>

              {/* Nightly Reflection */}
              <CategoryCard
                title="Inspection"
                description="Deep self-analysis protocols. Examine your thoughts and patterns with daily AI-guided inspection."
                icon={Moon}
                iconColor="bg-gradient-to-br from-indigo-400 to-purple-500"
                count="Still Drifting"
                countLabel=""
                countColor="bg-indigo-500/20 text-indigo-300"
                onClick={() => setLocation('/nightly-reflection')}
              >
                <div className="space-y-3">
                  <div className="bg-black/30 p-3 rounded-lg">
                    <p className="text-sm text-gray-300 font-medium mb-2">✨ Today's Thinking</p>
                    <p className="text-xs text-gray-400">
                      Receive a daily AI-generated prompt designed to encourage introspection. No judgments, just reflection.
                    </p>
                  </div>
                </div>
              </CategoryCard>

              {/* Music & Mood */}
              <CategoryCard
                title="Music & Mood"
                description="Curated playlists and ambient sounds for different night moods and activities."
                icon={Music}
                iconColor="bg-gradient-to-br from-purple-400 to-pink-500"
                count="After Midnight"
                countLabel=""
                countColor="bg-purple-500/20 text-purple-300"
                glow={true}
                onClick={() => setLocation('/music-mood')}
              >
                <div className="space-y-3">
                  <div className="bg-black/30 p-3 rounded-lg">
                    <img
                      src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      alt="Headphones in dark ambient lighting"
                      className="w-full h-16 object-cover rounded mb-2 opacity-80"
                    />
                    <p className="text-sm text-gray-300 font-medium">🎵 Currently Playing</p>
                    <p className="text-xs text-gray-400 mt-1">"Midnight Study Beats" • Lo-fi Hip Hop</p>
                  </div>
                </div>
              </CategoryCard>

              {/* Read Card */}
              <CategoryCard
                title="Read Card"
                description="Private reading sanctuary. Upload texts, track progress, read with intention."
                icon={BookOpen}
                iconColor="bg-gradient-to-br from-emerald-400 to-teal-500"
                count="Quiet"
                countLabel=""
                countColor="bg-emerald-500/20 text-emerald-300"
                onClick={() => setLocation('/read-card')}
              >
                <div className="space-y-3">
                  <div className="bg-black/30 p-3 rounded-lg">
                    <p className="text-sm text-gray-300 font-medium mb-2">📖 Read with Purpose</p>
                    <p className="text-xs text-gray-400">
                      Upload texts and read privately. Choose your intention: learn, feel, think, or sleep.
                    </p>
                  </div>
                </div>
              </CategoryCard>
            </div>
          </div>

          {/* SECTION 2: Connect - Social Features */}
          <div className="mb-12 md:mb-16">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-pink-400/30 to-transparent flex-1"></div>
              <h4 className="text-base sm:text-lg md:text-xl font-semibold text-pink-300 uppercase tracking-wider">Connect</h4>
              <div className="h-px bg-gradient-to-r from-transparent via-pink-400/30 to-transparent flex-1"></div>
            </div>
            <p className="text-center text-gray-400 text-xs sm:text-sm mb-4 md:mb-6 italic">Find others wandering the night</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
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
                        <p className="text-sm text-gray-300 italic">"{whisper.content.substring(0, 60)}..."</p>
                        <div className="text-xs text-gray-500 mt-1">{new Date(whisper.createdAt || new Date()).toLocaleTimeString()}</div>
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
                iconColor="bg-gradient-to-br from-pink-500 to-rose-500"
                count={nightCircles.length}
                countLabel="circles"
                countColor="bg-pink-500/20 text-pink-300"
                onClick={() => setLocation('/night-circles')}
              >
                <div className="space-y-3">
                  {nightCirclesLoading ? (
                    <div className="text-gray-400 text-sm">Loading circles...</div>
                  ) : nightCircles.length === 0 ? (
                    <div className="text-gray-400 text-sm">No circles yet. Create the first night circle!</div>
                  ) : (
                    nightCircles.slice(0, 2).map((circle: NightCircle) => (
                      <div key={circle.id} className="bg-black/30 p-3 rounded-lg">
                        <p className="text-sm text-pink-300 font-medium">{circle.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{circle.currentMembers || 0} members • {circle.isActive ? 'Active' : 'Quiet'}</p>
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
                iconColor="bg-gradient-to-br from-amber-500 to-orange-500"
                count={midnightCafe.length}
                countLabel="voices"
                countColor="bg-amber-500/20 text-amber-300"
                onClick={() => setLocation('/midnight-cafe')}
              >
                <div className="space-y-3">
                  {midnightCafeLoading ? (
                    <div className="text-gray-400 text-sm">Loading cafe...</div>
                  ) : midnightCafe.length === 0 ? (
                    <div className="text-gray-400 text-sm">The cafe is quiet tonight...</div>
                  ) : (
                    midnightCafe.slice(0, 2).map((post: MidnightCafe) => (
                      <div key={post.id} className="bg-black/30 p-3 rounded-lg">
                        <p className="text-sm text-gray-300">"{post.content.substring(0, 50)}..."</p>
                        <div className="text-xs text-gray-500 mt-1">{post.replies || 0} replies</div>
                      </div>
                    ))
                  )}
                </div>
              </CategoryCard>

              {/* Moon Messenger */}
              <CategoryCard
                title="Moon Messenger"
                description="Random text pairing for anonymous conversations with strangers in the night."
                icon={MessageCircle}
                iconColor="bg-gradient-to-br from-blue-500 to-cyan-500"
                count="156"
                countLabel="active chats"
                countColor="bg-blue-500/20 text-blue-300"
                onClick={() => setLocation('/moon-messenger')}
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

          {/* SECTION 3: Explore - Experimental Features */}
          <div className="mb-12 md:mb-16">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent flex-1"></div>
              <h4 className="text-base sm:text-lg md:text-xl font-semibold text-amber-300 uppercase tracking-wider">Explore</h4>
              <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent flex-1"></div>
            </div>
            <p className="text-center text-gray-400 text-xs sm:text-sm mb-4 md:mb-6 italic">Experimental spaces for the curious</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {/* Mind Maze */}
              <CategoryCard
                title="Mind Maze"
                description="Brain teasers, philosophy, and deep questions to stimulate late-night thinking."
                icon={Brain}
                iconColor="bg-gradient-to-br from-fuchsia-500 to-purple-600"
                count={mindMaze.length}
                countLabel="puzzles"
                countColor="bg-fuchsia-500/20 text-fuchsia-300"
                onClick={() => setLocation('/mind-maze')}
              >
                <div className="space-y-3">
                  {mindMazeLoading ? (
                    <div className="text-gray-400 text-sm">Loading puzzles...</div>
                  ) : mindMaze.length === 0 ? (
                    <div className="text-gray-400 text-sm">No puzzles yet. Share a thought-provoking question!</div>
                  ) : (
                    mindMaze.slice(0, 2).map((maze: MindMaze) => (
                      <div key={maze.id} className="bg-black/30 p-3 rounded-lg">
                        <p className="text-sm text-gray-300">"{maze.content.substring(0, 60)}..."</p>
                        <div className="text-xs text-gray-500 mt-1">{maze.responses || 0} responses</div>
                      </div>
                    ))
                  )}
                </div>
              </CategoryCard>

              {/* 3AM Founder */}
              <CategoryCard
                title="3AM Founder"
                description="Anonymous thoughts and insights from midnight entrepreneurs."
                icon={Lightbulb}
                iconColor="text-orange-400"
                count="Awake"
                countLabel=""
                countColor="text-orange-300"
                onClick={() => setLocation('/3am-founder')}
              >
                <div className="h-16"></div>
              </CategoryCard>

              {/* Starlit Speaker */}
              <CategoryCard
                title="Starlit Speaker"
                description="Voice chat rooms for intimate audio conversations."
                icon={StarIcon}
                iconColor="text-purple-400"
                count="Live"
                countLabel=""
                countColor="text-purple-300"
                onClick={() => setLocation('/starlit-speaker')}
              >
                <div className="h-16"></div>
              </CategoryCard>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}