import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import Privacy from "@/pages/privacy";
import Notifications from "@/pages/notifications";
import Help from "@/pages/help";
import NotFound from "@/pages/not-found";

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to Nocturne</h1>
        <p className="text-gray-300 text-lg">A social platform for night owls to connect and share thoughts during late hours.</p>
        <div className="space-y-4">
          <a 
            href="/api/login"
            className="block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Sign In with Replit
          </a>
          <p className="text-gray-400 text-sm">Secure authentication using your Replit account</p>
          <div className="text-center mt-6">
            <p className="text-gray-500 text-xs">Experience the night owl community</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // For development, show the app regardless of auth status
  // In production, uncomment the auth check
  return (
    <Switch>
      <Route path="/login" component={Landing} />
      <Route path="/" component={Home} />
      <Route path="/diaries" component={Diaries} />
      <Route path="/whispers" component={Whispers} />
      <Route path="/mind-maze" component={MindMaze} />
      <Route path="/night-circles" component={NightCircles} />
      <Route path="/midnight-cafe" component={MidnightCafe} />
      <Route path="/music-mood" component={MusicMood} />
      <Route path="/night-conversations" component={NightConversations} />
      <Route path="/digital-journals" component={DigitalJournals} />
      <Route path="/mindful-spaces" component={MindfulSpaces} />
      <Route path="/3am-founder" component={AmFounder} />
      <Route path="/starlit-speaker" component={StarlitSpeaker} />
      <Route path="/moon-messenger" component={MoonMessenger} />
      <Route path="/settings" component={Settings} />
      <Route path="/profile" component={Profile} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/help" component={Help} />
      <Route component={NotFound} />
    </Switch>
  );

  // Production auth flow (enable when deploying):
  /*
  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/diaries" component={Diaries} />
          <Route path="/whispers" component={Whispers} />
          <Route path="/mind-maze" component={MindMaze} />
          <Route path="/night-circles" component={NightCircles} />
          <Route path="/midnight-cafe" component={MidnightCafe} />
          <Route path="/music-mood" component={MusicMood} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
  */
}

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <div className="text-white text-lg">Loading your night sanctuary...</div>
        </div>
      </div>
    );
  }

  // Allow access without authentication (guest mode)
  // This makes the app work regardless of auth status
  return (
    <div className="min-h-screen bg-gray-950">
      <Router />
    </div>
  );
}

export default App;