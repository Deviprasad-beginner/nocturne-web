import { useLocation } from "wouter";

// Base styling for loaders
const baseContainerStyle = {
  minHeight: "100vh",
  backgroundColor: "#030712",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative" as const,
  overflow: "hidden",
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};

export function SectionLoader() {
  const [location] = useLocation();

  if (location.startsWith("/midnight-cafe")) {
    return <MidnightCafeLoader />;
  }
  if (location.startsWith("/night-circles") || location.startsWith("/mindful-spaces")) {
    return <CirclesLoader />;
  }
  if (location.startsWith("/diaries") || location.startsWith("/digital-journals") || location.startsWith("/night-thoughts")) {
    return <JournalLoader />;
  }
  if (location.startsWith("/music-mood") || location.startsWith("/starlit-speaker")) {
    return <MusicLoader />;
  }
  if (location.startsWith("/read")) {
    return <ReadLoader />;
  }
  if (location.startsWith("/whispers") || location.startsWith("/moon-messenger")) {
    return <WhispersLoader />;
  }
  if (location.startsWith("/explore") || location.startsWith("/mind-maze")) {
    return <ExploreLoader />;
  }

  // Default fallback for other routes
  return <DefaultLoader />;
}

// 1. Midnight Cafe Loader (Warm, coffee/ambient vibe)
function MidnightCafeLoader() {
  return (
    <div style={{ ...baseContainerStyle, backgroundImage: "radial-gradient(circle at center, rgba(120, 53, 15, 0.2) 0%, #030712 100%)" }}>
      <style>{`
        @keyframes steamUp {
          0% { transform: translateY(0) scaleX(1); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-40px) scaleX(2); opacity: 0; }
        }
        @keyframes cafePulse {
          0%, 100% { transform: scale(0.95); text-shadow: 0 0 10px rgba(217, 119, 6, 0.2); }
          50% { transform: scale(1.05); text-shadow: 0 0 20px rgba(252, 211, 77, 0.6); }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div style={{ position: "relative", width: 60, height: 60 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: "absolute",
              bottom: 20,
              left: 15 + i * 15,
              width: 4,
              height: 20,
              backgroundColor: "rgba(252, 211, 77, 0.4)",
              filter: "blur(4px)",
              animation: `steamUp 2s ease-in-out ${i * 0.4}s infinite`
            }} />
          ))}
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(252, 211, 77, 0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
          </svg>
        </div>
        <div style={{ color: "#fcd34d", fontSize: 16, letterSpacing: "0.15em", textTransform: "uppercase", animation: "cafePulse 3s infinite" }}>
          Brewing thoughts...
        </div>
      </div>
    </div>
  );
}

// 2. Circles / Mindful Loader (Nature / Breathing vibe)
function CirclesLoader() {
  return (
    <div style={{ ...baseContainerStyle, backgroundImage: "radial-gradient(circle at center, rgba(6, 78, 59, 0.3) 0%, #030712 100%)" }}>
      <style>{`
        @keyframes rippleOut {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes circleGlow {
          0%, 100% { text-shadow: 0 0 10px rgba(52, 211, 153, 0.3); }
          50% { text-shadow: 0 0 20px rgba(167, 243, 208, 0.6); }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <div style={{ position: "relative", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "2px solid #34d399",
              animation: `rippleOut 3s ease-out ${i * 1}s infinite`
            }} />
          ))}
          <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: "#a7f3d0", boxShadow: "0 0 20px #34d399" }} />
        </div>
        <div style={{ color: "#a7f3d0", fontSize: 15, letterSpacing: "0.2em", textTransform: "uppercase", animation: "circleGlow 3s infinite" }}>
          Gathering circle...
        </div>
      </div>
    </div>
  );
}

// 3. Journal / Diaries Loader (Page flipping / typing vibe)
function JournalLoader() {
  return (
    <div style={{ ...baseContainerStyle, backgroundImage: "radial-gradient(circle at center, rgba(30, 58, 138, 0.3) 0%, #030712 100%)" }}>
      <style>{`
        @keyframes blinkCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes writeSlide {
          0% { width: 0; }
          50% { width: 40px; }
          100% { width: 0; left: 100%; }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(96, 165, 250, 0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#93c5fd", fontSize: 15, letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Unlocking your thoughts
          <span style={{ width: 8, height: 18, backgroundColor: "#60a5fa", animation: "blinkCursor 1s step-end infinite" }} />
        </div>
      </div>
    </div>
  );
}

// 4. Music Mood Loader (Equalizer bars)
function MusicLoader() {
  return (
    <div style={{ ...baseContainerStyle, backgroundImage: "radial-gradient(circle at center, rgba(131, 24, 67, 0.3) 0%, #030712 100%)" }}>
      <style>{`
        @keyframes eqBar {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        @keyframes musicGlow {
          0%, 100% { text-shadow: 0 0 10px rgba(244, 114, 182, 0.3); }
          50% { text-shadow: 0 0 20px rgba(251, 113, 133, 0.8); }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 40 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              width: 8,
              height: "100%",
              backgroundColor: "#f472b6",
              borderRadius: 4,
              boxShadow: "0 0 10px #f472b6",
              transformOrigin: "bottom",
              animation: `eqBar 1.2s ease-in-out ${(i * 0.15)}s infinite`
            }} />
          ))}
        </div>
        <div style={{ color: "#fbcfe8", fontSize: 15, letterSpacing: "0.2em", textTransform: "uppercase", animation: "musicGlow 3s infinite" }}>
          Tuning frequencies...
        </div>
      </div>
    </div>
  );
}

// 5. Whispers / Moon Messenger (Waves/Particles)
function WhispersLoader() {
  return (
    <div style={{ ...baseContainerStyle, backgroundImage: "radial-gradient(circle at center, rgba(76, 29, 149, 0.3) 0%, #030712 100%)" }}>
      <style>{`
        @keyframes floatWhisper {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-15px) scale(1.5); opacity: 1; }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#c4b5fd",
              boxShadow: "0 0 15px #a78bfa",
              animation: `floatWhisper 2.5s ease-in-out ${i * 0.4}s infinite`
            }} />
          ))}
        </div>
        <div style={{ color: "#ddd6fe", fontSize: 15, letterSpacing: "0.2em", textTransform: "uppercase", textShadow: "0 0 12px rgba(167, 139, 250, 0.6)" }}>
          Catching whispers...
        </div>
      </div>
    </div>
  );
}

// 6. Reader Loader (Reading light)
function ReadLoader() {
  return (
    <div style={{ ...baseContainerStyle, backgroundImage: "radial-gradient(circle at top, rgba(254, 240, 138, 0.15) 0%, #030712 70%)" }}>
      <style>{`
        @keyframes pageTurn {
          0% { transform: perspective(400px) rotateY(0deg); opacity: 1; }
          100% { transform: perspective(400px) rotateY(-180deg); opacity: 0; }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div style={{ position: "relative", width: 60, height: 40, borderBottom: "2px solid #fef08a", display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
           <div style={{ width: "50%", height: "100%", backgroundColor: "rgba(254, 240, 138, 0.2)", border: "1px solid rgba(254, 240, 138, 0.5)", borderBottom: "none", transformOrigin: "left", animation: "pageTurn 2s linear infinite" }} />
        </div>
        <div style={{ color: "#fef08a", fontSize: 15, letterSpacing: "0.2em", textTransform: "uppercase", textShadow: "0 0 10px rgba(254, 240, 138, 0.4)" }}>
          Adjusting light...
        </div>
      </div>
    </div>
  );
}

// 7. Default Generic Loader (Minimalist)
function DefaultLoader() {
  return (
    <div style={{ ...baseContainerStyle }}>
      <style>{`
        @keyframes defaultPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2].map(i => (
             <div key={i} style={{
               width: 6,
               height: 6,
               borderRadius: "50%",
               backgroundColor: "#94a3b8",
               animation: `defaultPulse 1.5s ease-in-out ${i * 0.2}s infinite`
             }} />
          ))}
        </div>
      </div>
    </div>
  );
}
// 8. Explore / Mind Maze Loader (Compass / Navigation vibe)
function ExploreLoader() {
  return (
    <div style={{ ...baseContainerStyle, backgroundImage: "radial-gradient(circle at center, rgba(14, 165, 233, 0.2) 0%, #030712 100%)" }}>
      <style>{`
        @keyframes compassSpin {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(180deg); }
          50% { transform: rotate(180deg); }
          75% { transform: rotate(360deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes starGlow {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div style={{ position: "relative", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            position: "absolute",
            width: "100%", height: "100%",
            borderRadius: "50%",
            border: "2px dashed rgba(56, 189, 248, 0.4)",
            animation: "compassSpin 6s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite "
          }} />
          <div style={{
            position: "absolute",
            width: "80%", height: "80%",
            borderRadius: "50%",
            border: "1px solid rgba(14, 165, 233, 0.2)",
            animation: "compassSpin 4s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite reverse"
          }} />
          <div style={{
             width: 8, height: 8,
             backgroundColor: "#bae6fd",
             borderRadius: "50%",
             boxShadow: "0 0 15px #38bdf8",
             animation: "starGlow 2s ease-in-out infinite"
          }} />
          {/* Compass needle */}
          <div style={{
            position: "absolute",
            width: 2, height: 40,
            background: "linear-gradient(to bottom, #7dd3fc 50%, transparent 50%)",
            animation: "compassSpin 4s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite"
          }} />
        </div>
        <div style={{ color: "#7dd3fc", fontSize: 15, letterSpacing: "0.2em", textTransform: "uppercase", textShadow: "0 0 12px rgba(56, 189, 248, 0.5)" }}>
          Charting the night...
        </div>
      </div>
    </div>
  );
}
