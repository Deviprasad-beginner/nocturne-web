import { Switch, Route, Link } from "wouter";
import { Loader2 } from "lucide-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "@/styles/animations.css";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Diaries from "@/pages/diaries";
import Whispers from "@/pages/whispers";
import MindMaze from "@/pages/mind-maze";
import NightCircles from "@/pages/night-circles";
import MidnightCafe from "@/pages/midnight-cafe";
import MusicMood from "@/pages/music-mood";
import NightConversations from "@/pages/night-conversations";
import DigitalJournals from "@/pages/digital-journals";
import MindfulSpaces from "@/pages/mindful-spaces";
import AmFounder from "@/pages/3am-founder";
import StarlitSpeaker from "@/pages/starlit-speaker";
import MoonMessenger from "@/pages/moon-messenger";
import NightlyReflection from "@/pages/nightly-reflection";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import Privacy from "@/pages/privacy";
import Notifications from "@/pages/notifications";
import Help from "@/pages/help";
import NotFound from "@/pages/not-found";

import AuthPage from "@/pages/auth-page";
import FirstNight from "@/pages/first-night";
import NightThoughts from "@/pages/night-thoughts";
import ReadCard from "@/pages/read-card";
import ReadAlone from "@/pages/read-alone";
import Reader from "@/pages/reader";
import ReadTonight from "@/pages/read-tonight";

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
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
    return <FirstNight />;
  }

  return (
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
        {!isAuthenticated ? <Landing /> : <Home />}
      </Route>

      {/* 404 Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

import { MusicProvider } from "@/context/MusicContext";
import { GlobalPlayer } from "@/components/music/GlobalPlayer";

// ... existing imports

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <MusicProvider>
            <div className="min-h-screen bg-gray-950">
              <Router />
            </div>
            <GlobalPlayer />
            <Toaster />
          </MusicProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;