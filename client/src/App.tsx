import { Switch, Route, Link } from "wouter";
import { Suspense, lazy } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SEO } from "@/components/SEO";
import { MusicProvider } from "@/context/MusicContext";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import { Background } from "@/components/layout/Background";
import { SectionLoader } from "@/components/ui/loaders";

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
      <Suspense fallback={<SectionLoader />}>
        <FirstNight />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<SectionLoader />}>
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

// ─── Loading Screen (Dark Glowing Circle Design) ─────────────────────
function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#030712",
        backgroundImage: "radial-gradient(circle at center, rgba(30, 27, 75, 0.4) 0%, #030712 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinSlowReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 10px rgba(167, 139, 250, 0.2); opacity: 0.8; }
          50% { text-shadow: 0 0 20px rgba(196, 181, 253, 0.6); opacity: 1; }
        }
      `}</style>

      {/* Main glowing ring container */}
      <div style={{
        position: "relative",
        width: 300,
        height: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        
        {/* Outer diffused ring */}
        <div style={{
          position: "absolute",
          inset: -10,
          borderRadius: "50%",
          border: "1px solid rgba(139, 92, 246, 0.15)",
          animation: "breathe 4s ease-in-out infinite",
        }} />

        {/* First Gradient Ring (Purple/Violet) */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "conic-gradient(from 0deg, transparent 0%, rgba(139, 92, 246, 0.05) 30%, rgba(167, 139, 250, 0.9) 50%, rgba(139, 92, 246, 0.05) 70%, transparent 100%)",
          animation: "spinSlow 4s linear infinite",
          filter: "blur(3px)",
        }} />

        {/* Second Reverse Gradient Ring (Indigo/Cyan) */}
        <div style={{
          position: "absolute",
          inset: 16,
          borderRadius: "50%",
          background: "conic-gradient(from 180deg, transparent 0%, rgba(56, 189, 248, 0.05) 30%, rgba(99, 102, 241, 0.7) 50%, rgba(56, 189, 248, 0.05) 70%, transparent 100%)",
          animation: "spinSlowReverse 5.5s linear infinite",
          filter: "blur(2px)",
        }} />
        
        {/* Core hollow masking - makes the center dark */}
        <div style={{
          position: "absolute",
          inset: 4,
          borderRadius: "50%",
          backgroundColor: "#030712",
          boxShadow: "inset 0 0 40px rgba(99, 102, 241, 0.15)",
        }} />

        {/* The Text Content Inside */}
        <div style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}>
          <div style={{
            fontSize: 15,
            fontWeight: 400,
            letterSpacing: "0.2em",
            color: "#e2e8f0",
            textTransform: "uppercase",
            animation: "textGlow 3s ease-in-out infinite",
            textAlign: "center",
            padding: "0 20px"
          }}>
            {message}
          </div>
          
          {/* Tiny glowing dots below text */}
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  backgroundColor: "#c4b5fd",
                  boxShadow: "0 0 10px #c4b5fd",
                  animation: `breathe 1.5s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}



function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Entering the night" />
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