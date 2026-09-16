/**
 * EbookReader — Nocturne immersive EPUB reader
 *
 * Performance design:
 *  - react-reader (epubjs wrapper) is code-split via React.lazy() and only
 *    downloaded when this page is mounted — it's a large library (~300kb).
 *  - Reading progress (EpubCFI) is stored in local state for instant UI,
 *    but the PATCH API call is debounced 2000ms so we don't hammer the DB
 *    on every page flip.
 *  - The EPUB url points to our Express streaming proxy which bypasses CORS
 *    and caches for 1 year on the browser.
 *  - Text selection triggers a "Post to Whispers" floating button.
 */

import { lazy, Suspense, useState, useRef, useCallback, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Share2, X, Send, Loader2, BookOpen, Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── CODE-SPLIT: react-reader only loads when reader mounts ─────────────────
// This keeps the main bundle lean.
const ReactReader = lazy(() =>
  import("react-reader").then((mod) => ({ default: mod.ReactReader }))
);

// ─── Types ───────────────────────────────────────────────────────────────────
interface UserBook {
  id: number;
  gutenbergId: number;
  title: string;
  author: string | null;
  coverUrl: string | null;
  epubUrl: string;
  currentCfi: string | null;
}

// ─── Night-mode rendition theme for epubjs ──────────────────────────────────
const NIGHT_THEME = {
  body: {
    background: "#07070d",
    color: "#c8c8d8",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    lineHeight: "1.9",
    padding: "0 4%",
  },
  "p, div": {
    color: "#c8c8d8 !important",
    background: "transparent !important",
  },
  "h1, h2, h3, h4, h5, h6": {
    color: "#e8e8f0 !important",
    fontWeight: "600 !important",
  },
  a: {
    color: "#818cf8 !important",
  },
  "::selection": {
    background: "rgba(99,102,241,0.35) !important",
    color: "#fff !important",
  },
};

// ─── Loading Fallback ────────────────────────────────────────────────────────
function ReaderLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-screen bg-[#07070d]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border border-purple-500/30 animate-spin" style={{ animationDuration: "3s" }} />
        <Moon className="absolute inset-0 m-auto w-6 h-6 text-indigo-400/60" />
      </div>
      <p className="text-white/30 text-sm tracking-widest uppercase animate-pulse">
        Opening the pages...
      </p>
    </div>
  );
}

// ─── Whispers Modal ──────────────────────────────────────────────────────────
function WhisperModal({
  selectedText,
  bookTitle,
  onClose,
}: {
  selectedText: string;
  bookTitle: string;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [whisperText, setWhisperText] = useState(
    `"${selectedText}"\n— from ${bookTitle}`
  );

  const postWhisperMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/v1/thoughts", {
        content,
        thoughtType: "whisper",
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Whisper released",
        description: "Your quote is drifting into the night feed.",
        style: { background: "rgba(99,102,241,0.9)", color: "white" },
      });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to post whisper", variant: "destructive" });
    },
  });

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0d0d14] border border-indigo-500/20 rounded-2xl p-6 shadow-[0_0_60px_rgba(79,70,229,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-medium text-white/90">Post to Night Feed</h3>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quote preview */}
        <div className="bg-indigo-950/30 border-l-2 border-indigo-500/50 p-4 rounded-r-xl mb-4">
          <p className="text-indigo-100/80 text-sm leading-relaxed italic line-clamp-4 font-serif">
            "{selectedText}"
          </p>
        </div>

        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-indigo-500/50 resize-none h-28"
          value={whisperText}
          onChange={(e) => setWhisperText(e.target.value)}
          placeholder="Edit your whisper..."
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="text-sm text-white/40 hover:text-white/70 transition-colors px-3 py-2"
          >
            Cancel
          </button>
          <Button
            onClick={() => postWhisperMutation.mutate(whisperText)}
            disabled={postWhisperMutation.isPending || !whisperText.trim()}
            className="bg-indigo-600/80 hover:bg-indigo-600 text-white border-0 gap-2"
          >
            {postWhisperMutation.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</>
              : <><Send className="w-4 h-4" /> Release Whisper</>
            }
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Reader Component ───────────────────────────────────────────────────
export default function EbookReader() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Local CFI state — updated instantly for smooth UX
  const [currentCfi, setCurrentCfi] = useState<string | number | null>(null);
  const [totalLocations, setTotalLocations] = useState(0);

  // Quote sharing state
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [showWhisperModal, setShowWhisperModal] = useState(false);

  // epubjs rendition reference (for listening to selection events)
  const renditionRef = useRef<any>(null);

  // ── Fetch book from user's library by its DB id ──────────────────────────
  const { data: book, isLoading, error } = useQuery<UserBook>({
    queryKey: [`/api/v1/user-books/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/v1/user-books/${id}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch book");
      }
      const json = await res.json();
      return json.data;
    },
    enabled: !!user && !!id,
    staleTime: Infinity,
    gcTime: Infinity,
  });


  useEffect(() => {
    if (book?.currentCfi) {
      setCurrentCfi(book.currentCfi);
    }
  }, [book?.currentCfi]);

  // ── Debounced progress save — writes to DB max once per 2 seconds ────────
  const saveProgress = useDebouncedCallback(async (cfi: string) => {
    if (!id) return;
    try {
      await apiRequest("PATCH", `/api/v1/user-books/${id}/progress`, { epubCfi: cfi });
    } catch {
      // Non-critical — progress will save on next flip
    }
  }, 2000);

  // ── CFI location change handler ──────────────────────────────────────────
  const handleLocationChanged = useCallback((newCfi: string) => {
    setCurrentCfi(newCfi);
    saveProgress(newCfi);
  }, [saveProgress]);

  // ── Set epubjs theme + text selection listener ───────────────────────────
  const handleGetRendition = useCallback((rendition: any) => {
    renditionRef.current = rendition;

    // Apply dark night theme
    rendition.themes.register("nocturne-night", NIGHT_THEME);
    rendition.themes.select("nocturne-night");

    // Listen for text selections
    rendition.on("selected", (cfiRange: string, contents: any) => {
      try {
        const selection = contents?.window?.getSelection();
        const text = selection?.toString()?.trim();
        if (text && text.length > 10) {
          setSelectedText(text);
        }
      } catch {
        // iframe security may block in some browsers
      }
    });
  }, []);

  // ─── Guards ──────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-[#07070d] flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="w-12 h-12 text-indigo-400/40 mx-auto" />
          <p className="text-white/50">Sign in to read your books.</p>
          <Button onClick={() => setLocation("/auth")} className="bg-indigo-600/30 text-indigo-200 border border-indigo-500/30">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) return <ReaderLoader />;

  if (error || !book) {
    return (
      <div className="min-h-screen bg-[#07070d] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white/40">Book not found in your library.</p>
          <Button onClick={() => setLocation("/library")} variant="ghost" className="text-indigo-400">
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  // Build the proxy URL — streams EPUB through our server to bypass CORS
  const proxyUrl = `/api/v1/user-books/proxy?epubUrl=${encodeURIComponent(book.epubUrl)}`;

  return (
    <div className="h-screen bg-[#07070d] flex flex-col overflow-hidden">
      {/* ── Top Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#07070d]/95 backdrop-blur-md border-b border-white/[0.04] flex-shrink-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/library")}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Library</span>
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div className="min-w-0">
            <h1 className="text-sm font-medium text-white/80 truncate max-w-[200px] sm:max-w-sm">
              {book.title}
            </h1>
            {book.author && (
              <p className="text-[11px] text-white/30 truncate">{book.author}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quote sharing — appears when text is selected */}
          {selectedText && !showWhisperModal && (
            <button
              onClick={() => setShowWhisperModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 text-xs hover:bg-indigo-600/35 transition-all animate-in fade-in duration-200"
            >
              <Share2 className="w-3.5 h-3.5" />
              Post to Whispers
            </button>
          )}
          {selectedText && (
            <button
              onClick={() => setSelectedText(null)}
              className="p-1.5 text-white/20 hover:text-white/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Reader ─────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0">
        <Suspense fallback={<ReaderLoader />}>
          <ReactReader
            url={proxyUrl}
            location={currentCfi}
            locationChanged={handleLocationChanged}
            getRendition={handleGetRendition}
            epubOptions={{
              flow: "paginated",
              manager: "default",
            }}
            epubInitOptions={{
              openAs: "epub",
            }}
          />
        </Suspense>
      </div>

      {/* ── Whisper Modal ─────────────────────────────────────── */}
      {showWhisperModal && selectedText && (
        <WhisperModal
          selectedText={selectedText}
          bookTitle={book.title}
          onClose={() => {
            setShowWhisperModal(false);
            setSelectedText(null);
          }}
        />
      )}
    </div>
  );
}
