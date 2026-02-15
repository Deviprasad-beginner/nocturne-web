import { Switch, Route, Link } from "wouter";
import { Loader2 } from "lucide-react";
import { Suspense, lazy } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SEO } from "@/components/SEO";
import { MusicProvider } from "@/context/MusicContext";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import { Background } from "@/components/layout/Background";

// Lazy Load Pages
const Home = lazy(() => import("@/pages/home"));
const Diaries = lazy(() => import("@/pages/diaries"));
const Whispers = lazy(() => import("@/pages/whispers"));
const MindMaze = lazy(() => import("@/pages/mind-maze"));
const NightCircles = lazy(() => import("@/pages/night-circles"));
const MidnightCafe = lazy(() => import("@/pages/midnight-cafe"));
const MusicMood = lazy(() => import("@/pages/music-mood"));
const NightConversations = lazy(() => import("@/pages/night-conversations"));
const DigitalJournals = lazy(() => import("@/pages/digital-journals"));
const MindfulSpaces = lazy(() => import("@/pages/mindful-spaces"));
const AmFounder = lazy(() => import("@/pages/3am-founder"));
const StarlitSpeaker = lazy(() => import("@/pages/starlit-speaker"));
const MoonMessenger = lazy(() => import("@/pages/moon-messenger"));
const NightlyReflection = lazy(() => import("@/pages/nightly-reflection"));
const Settings = lazy(() => import("@/pages/settings"));
const Profile = lazy(() => import("@/pages/profile"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Notifications = lazy(() => import("@/pages/notifications"));
const Help = lazy(() => import("@/pages/help"));
const NotFound = lazy(() => import("@/pages/not-found"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const FirstNight = lazy(() => import("@/pages/first-night"));
const NightThoughts = lazy(() => import("@/pages/night-thoughts"));
const ReadCard = lazy(() => import("@/pages/read-card"));
const ReadAlone = lazy(() => import("@/pages/read-alone"));
const Reader = lazy(() => import("@/pages/reader"));
const ReadTonight = lazy(() => import("@/pages/read-tonight"));

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <SEO
        title="Welcome to Nocturne"
        description="A social platform for night owls to connect and share thoughts during late hours."
      />
      <div className="text-center space-y-8 max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to Nocturne</h1>
        <p className="text-gray-300 text-lg">A social platform for night owls to connect and share thoughts during late hours.</p>
        <div className="space-y-4">
          <Link href="/auth">
            <a className="block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Sign In / Register
            </a>
          </Link>
          <p className="text-gray-400 text-sm">Join the community</p>
          <div className="text-center mt-6">
            <Link href="/">
              <a className="text-gray-500 text-xs hover:text-gray-400">Continue as Guest</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show First Night onboarding for authenticated users who haven't seen it
  if (isAuthenticated && user && !user.hasSeenOnboarding) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <FirstNight />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Switch>
        {/* Auth Routes */}
        <Route path="/auth" component={AuthPage} />
        <Route path="/login" component={AuthPage} />

        {/* Feature Routes - Support Guest Access */}
        <Route path="/diaries" component={Diaries} />
        <Route path="/whispers" component={Whispers} />
        <Route path="/mind-maze" component={MindMaze} />
        <Route path="/night-circles" component={NightCircles} />
        <Route path="/midnight-cafe" component={MidnightCafe} />
        <Route path="/music-mood" component={MusicMood} />
        <Route path="/nightly-reflection" component={NightlyReflection} />
        <Route path="/night-conversations" component={NightConversations} />
        <Route path="/digital-journals" component={DigitalJournals} />
        <Route path="/mindful-spaces" component={MindfulSpaces} />
        <Route path="/3am-founder" component={AmFounder} />
        <Route path="/starlit-speaker" component={StarlitSpeaker} />
        <Route path="/moon-messenger" component={MoonMessenger} />
        <Route path="/night-thoughts" component={NightThoughts} />
        <Route path="/read-card" component={ReadCard} />
        <Route path="/read-alone" component={ReadAlone} />
        <Route path="/reader/:id" component={Reader} />
        <Route path="/read-tonight" component={ReadTonight} />

        {/* Protected / User Specific */}
        <Route path="/settings" component={Settings} />
        <Route path="/profile" component={Profile} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/help" component={Help} />

        {/* Root Route - Landing for Guest, Home for User */}
        <Route path="/">
          <Home />
        </Route>

        {/* 404 Fallback */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center flex-col text-white">
      <div className="mb-4">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
      </div>
      <div className="text-lg font-light tracking-wide text-indigo-200/80 animate-pulse">
        Loading...
      </div>
    </div>
  );
}



function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center flex-col text-white">
        <div className="mb-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
        </div>
        <div className="text-lg font-light tracking-wide text-indigo-200/80 animate-pulse">
          Entering the sanctuary...
        </div>
      </div>
    );
  }

  // Allow access without authentication (guest mode)
  // This makes the app work regardless of auth status
  return (
    <MusicProvider>
      <div className="min-h-screen bg-gray-950">
        <Router />
      </div>
      <MusicPlayer />
    </MusicProvider>
  );
}

export default App;