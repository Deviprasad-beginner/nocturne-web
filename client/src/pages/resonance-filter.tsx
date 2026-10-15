import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Quote {
  id: number;
  text: string;
  author: string | null;
  philosophyTag: string | null;
}

// ─── Tag colour map ───────────────────────────────────────────────────────────
const TAG_COLORS: Record<string, string> = {
  Stoicism: "from-violet-900/40 to-purple-900/30 border-violet-500/30",
  Existentialism: "from-indigo-900/40 to-blue-900/30 border-indigo-500/30",
  Absurdism: "from-pink-900/40 to-rose-900/30 border-pink-500/30",
  Pragmatism: "from-emerald-900/40 to-teal-900/30 border-emerald-500/30",
  Transcendentalism: "from-amber-900/40 to-yellow-900/30 border-amber-500/30",
  "Depth Psychology": "from-cyan-900/40 to-sky-900/30 border-cyan-500/30",
  Deontology: "from-fuchsia-900/40 to-purple-900/30 border-fuchsia-500/30",
  Rationalism: "from-blue-900/40 to-indigo-900/30 border-blue-500/30",
  "Virtue Ethics": "from-lime-900/40 to-green-900/30 border-lime-500/30",
  Sufism: "from-orange-900/40 to-amber-900/30 border-orange-500/30",
  Heracliteanism: "from-red-900/40 to-rose-900/30 border-red-500/30",
};

function tagClass(tag: string | null) {
  return TAG_COLORS[tag ?? ""] ?? "from-gray-900/40 to-slate-900/30 border-gray-500/30";
}

// ─── SearchingOrb ─────────────────────────────────────────────────────────────
function SearchingOrb({ quote }: { quote: Quote }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030712]/90 backdrop-blur-xl">
      <style>{`
        @keyframes orbPulse {
          0%, 100% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 40px 10px rgba(139,92,246,0.3); }
          50% { transform: scale(1.08); opacity: 1; box-shadow: 0 0 80px 30px rgba(139,92,246,0.6); }
        }
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); opacity: 0.7; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* The orb */}
      <div className="relative w-48 h-48 flex items-center justify-center mb-10">
        {/* Radar rings */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-violet-500/20"
            style={{
              inset: `-${i * 22}px`,
              animation: `orbPulse 3s ease-in-out ${i * 0.4}s infinite`,
            }}
          />
        ))}

        {/* Rotating conic sweep */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 70%, rgba(139,92,246,0.6) 100%)",
            animation: "radarSweep 2s linear infinite",
          }}
        />

        {/* Core glow */}
        <div
          className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 z-10"
          style={{ animation: "orbPulse 2s ease-in-out infinite" }}
        />

        {/* Inner symbol */}
        <span className="absolute z-20 text-white text-3xl" style={{ animation: "floatUp 2.5s ease-in-out infinite" }}>
          ◎
        </span>
      </div>

      <p className="text-violet-300 text-xs tracking-widest font-light uppercase mb-4">
        Finding your resonance
      </p>

      {/* Loading dots */}
      <div className="flex gap-2 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-violet-400"
            style={{ animation: `dotPulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>

      {/* The selected quote */}
      <div className="max-w-sm mx-auto text-center px-6">
        <p className="text-white/70 text-sm italic leading-relaxed">"{quote.text}"</p>
        {quote.author && <p className="text-violet-400/60 text-xs mt-2">— {quote.author}</p>}
      </div>
    </div>
  );
}

// ─── QuoteCard ────────────────────────────────────────────────────────────────
function QuoteCard({ quote, onSelect, isSelected }: { quote: Quote; onSelect: () => void; isSelected: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`
        relative rounded-2xl border p-6 cursor-pointer transition-all duration-300 ease-out
        bg-gradient-to-br ${tagClass(quote.philosophyTag)}
        backdrop-blur-sm
        ${hovered ? "scale-[1.02] shadow-[0_0_40px_rgba(139,92,246,0.25)]" : "scale-100 shadow-none"}
        ${isSelected ? "ring-2 ring-violet-400 shadow-[0_0_60px_rgba(139,92,246,0.4)]" : ""}
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Subtle shine overlay on hover */}
      <div
        className={`absolute inset-0 rounded-2xl bg-white/[0.02] transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}
      />

      {/* Tag */}
      {quote.philosophyTag && (
        <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-4">
          <span className="w-1 h-1 rounded-full bg-violet-400 inline-block" />
          {quote.philosophyTag}
        </div>
      )}

      {/* Quote text */}
      <blockquote className="text-white/90 text-base leading-relaxed font-light italic mb-4">
        "{quote.text}"
      </blockquote>

      {/* Author */}
      {quote.author && (
        <p className="text-white/40 text-xs">— {quote.author}</p>
      )}

      {/* Connect button */}
      <button
        onClick={onSelect}
        className={`
          mt-5 w-full py-2.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-200
          ${hovered || isSelected
            ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/50"
            : "bg-white/5 text-white/50 border border-white/10"}
        `}
      >
        Connect through this thought
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ResonanceDeck() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/v1/resonance/quotes");
        const data = await res.json();
        if (data.success) setQuotes(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingQuotes(false);
      }
    })();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleSelectQuote = async (quote: Quote) => {
    if (!isAuthenticated) {
      setLocation("/auth");
      return;
    }

    setSelectedQuote(quote);
    setIsSearching(true);

    try {
      const res = await apiRequest("POST", "/api/v1/resonance/queue", {
        selectedQuoteId: quote.id,
      });
      const data = await res.json();

      if (data.data?.status === "matched") {
        setIsSearching(false);
        setLocation(`/resonance-chat/${data.data.chatId}`);
        return;
      }

      // Start polling for match
      pollRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch("/api/v1/resonance/queue/status");
          const pollData = await pollRes.json();
          if (pollData.data?.status === "matched") {
            clearInterval(pollRef.current!);
            setIsSearching(false);
            setLocation(`/resonance-chat/${pollData.data.chatId}`);
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 3000);
    } catch (e) {
      console.error(e);
      setIsSearching(false);
    }
  };

  const handleCancelSearch = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setIsSearching(false);
    setSelectedQuote(null);
  };

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .resonance-card { animation: fadeSlideUp 0.5s ease-out both; }
      `}</style>

      {/* Background nebula */}
      <div className="absolute inset-0 bg-gradient-radial from-violet-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-indigo-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Searching orb overlay */}
      {isSearching && selectedQuote && (
        <SearchingOrb quote={selectedQuote} />
      )}

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-violet-400/60 text-xs tracking-widest uppercase mb-6">
            <span className="w-8 h-px bg-violet-700" />
            Resonance Filter
            <span className="w-8 h-px bg-violet-700" />
          </div>
          <h1 className="text-4xl font-light text-white tracking-tight mb-3">
            Find your <span className="italic text-violet-300">kindred mind</span>
          </h1>
          <p className="text-white/40 text-sm leading-relaxed max-w-sm mx-auto">
            Choose a thought that feels true to you right now. We'll connect you with someone who resonated with the same idea.
          </p>
        </div>

        {/* Quotes */}
        {loadingQuotes ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-white/5 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {quotes.map((quote, i) => (
              <div
                key={quote.id}
                className="resonance-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <QuoteCard
                  quote={quote}
                  onSelect={() => handleSelectQuote(quote)}
                  isSelected={selectedQuote?.id === quote.id}
                />
              </div>
            ))}
          </div>
        )}

        {/* Cancel search */}
        {isSearching && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60]">
            <button
              onClick={handleCancelSearch}
              className="px-6 py-2.5 rounded-full border border-white/20 text-white/60 text-sm hover:border-white/40 hover:text-white/80 transition-all backdrop-blur-md bg-black/40"
            >
              Cancel search
            </button>
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-white/20 text-xs mt-12">
          ◌ Your real identity is never shared with your match.
        </p>
      </div>
    </div>
  );
}
