import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import {
  Search, BookOpen, Library as LibraryIcon, Sparkles,
  BookMarked, RefreshCw, Moon, Loader2, Trash2, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface GutenbergBook {
  gutenbergId: number;
  title: string;
  author: string;
  coverUrl: string | null;
  epubUrl: string;
  downloadCount: number;
}

interface UserBook {
  id: number;
  gutenbergId: number;
  title: string;
  author: string | null;
  coverUrl: string | null;
  epubUrl: string;
  currentCfi: string | null;
  createdAt: string;
}

// ─── Topic Presets ─────────────────────────────────────────────────────────────
const TOPICS = [
  { label: "Philosophy", query: "philosophy", emoji: "🏛️" },
  { label: "Poetry", query: "poetry", emoji: "📜" },
  { label: "Mystery", query: "mystery detective", emoji: "🕵️" },
  { label: "Psychology", query: "psychology mind", emoji: "🧠" },
  { label: "Dreams", query: "dreams sleep", emoji: "🌙" },
  { label: "Astronomy", query: "astronomy stars", emoji: "🌌" },
  { label: "Stoicism", query: "stoicism marcus aurelius", emoji: "⚖️" },
  { label: "Occult", query: "occult mysticism", emoji: "🧿" },
];

// ─── Search Result Card ─────────────────────────────────────────────────────────
function SearchBookCard({
  book,
  savedBook,
  onReadNow,
  isLoading,
}: {
  book: GutenbergBook;
  savedBook: UserBook | undefined;
  onReadNow: (book: GutenbergBook) => void;
  isLoading: boolean;
}) {
  const isSaved = !!savedBook;

  return (
    <div
      className="group relative rounded-2xl overflow-hidden border bg-white/[0.02] border-white/5 hover:border-indigo-500/40 hover:bg-indigo-950/20 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] transition-all duration-300 flex flex-col h-full cursor-pointer"
      onClick={() => onReadNow(book)}
    >
      {/* Cover */}
      <div className="aspect-[2/3] relative overflow-hidden bg-[#0d0d14] flex-shrink-0">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            loading="lazy"
            className="w-full h-full object-cover opacity-55 group-hover:opacity-90 transition-opacity duration-500"
            style={{ filter: "saturate(0.6) brightness(0.85)" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950/50 to-purple-950/50">
            <BookOpen className="w-10 h-10 text-white/10 group-hover:text-indigo-400/40 transition-colors" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a10] via-black/20 to-transparent opacity-80" />

        {/* Hover play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-indigo-600/80 backdrop-blur-sm border border-indigo-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
            )}
          </div>
        </div>

        {/* Saved badge */}
        {isSaved && (
          <div className="absolute top-2 left-2 bg-emerald-500/25 backdrop-blur-sm border border-emerald-500/30 text-emerald-300 text-[9px] px-2 py-0.5 rounded-full font-medium">
            In Library
          </div>
        )}

        {/* Download count */}
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white/40 text-[9px] px-2 py-0.5 rounded-full">
          {(book.downloadCount / 1000).toFixed(0)}k reads
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-3 flex-1 flex flex-col justify-between bg-gradient-to-b from-[#0a0a10] to-[#0d0d16]">
        <div>
          <h3 className="text-[13px] font-serif text-white/85 group-hover:text-indigo-100 transition-colors line-clamp-2 leading-snug mb-1">
            {book.title}
          </h3>
          <p className="text-[11px] text-white/40 line-clamp-1">{book.author}</p>
        </div>

        {/* CTA button */}
        <div className="mt-3">
          {isSaved ? (
            <div className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium bg-purple-600/20 text-purple-300 border border-purple-500/20">
              <Play className="w-3 h-3" fill="currentColor" />
              {savedBook?.currentCfi ? "Continue Reading" : "Read Now"}
            </div>
          ) : (
            <div className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-medium bg-indigo-600/15 text-indigo-300/70 border border-indigo-500/15 group-hover:bg-indigo-600/30 group-hover:text-indigo-200 group-hover:border-indigo-500/30 transition-all">
              <BookOpen className="w-3 h-3" />
              {isLoading ? "Opening..." : "Add & Read"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── My Library Card ────────────────────────────────────────────────────────────
function MyBookCard({
  book,
  onRead,
  onRemove,
}: {
  book: UserBook;
  onRead: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="group relative rounded-2xl overflow-hidden border bg-white/[0.02] border-purple-500/10 hover:border-purple-500/40 hover:bg-purple-950/10 transition-all duration-300 flex flex-col h-full cursor-pointer"
      onClick={onRead}
    >
      {/* Cover */}
      <div className="aspect-[2/3] relative overflow-hidden bg-[#0d0d14] flex-shrink-0">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            loading="lazy"
            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-950/60 to-indigo-950/60">
            <Moon className="w-10 h-10 text-purple-400/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a10] via-black/10 to-transparent opacity-70" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-purple-600/80 backdrop-blur-sm border border-purple-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.4)]">
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          </div>
        </div>

        {book.currentCfi && (
          <div className="absolute bottom-2 left-2 right-2 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500/60 rounded-full w-1/3" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-3 flex-1 flex flex-col justify-between bg-gradient-to-b from-[#0a0a10] to-[#0d0d16]">
        <div>
          <h3 className="text-[13px] font-serif text-white/90 line-clamp-2 leading-snug mb-1">
            {book.title}
          </h3>
          <p className="text-[11px] text-white/40">{book.author ?? "Unknown"}</p>
        </div>
        <div className="mt-3 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onRead}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-medium bg-purple-600/20 text-purple-300 border border-purple-500/20 hover:bg-purple-600/35 hover:text-white transition-all"
          >
            <Play className="w-3 h-3" fill="currentColor" />
            {book.currentCfi ? "Continue" : "Read"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 rounded-lg text-white/20 hover:text-red-400/70 hover:bg-red-500/10 transition-all"
            title="Remove from library"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Library Page ──────────────────────────────────────────────────────────
export default function Library() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("philosophy");
  const [openingId, setOpeningId] = useState<number | null>(null);

  // ── Search results (Gutendex via our backend) ──────────────────────────────
  const { data: searchData, isLoading: isSearching, isError, refetch } = useQuery<{
    success: boolean;
    data: GutenbergBook[];
  }>({
    queryKey: ["/api/v1/user-books/search", activeQuery],
    queryFn: async () => {
      const res = await fetch(`/api/v1/user-books/search?query=${encodeURIComponent(activeQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: !!activeQuery,
    staleTime: 1000 * 60 * 10,
  });

  // ── User's saved library ────────────────────────────────────────────────────
  const { data: libraryData } = useQuery<{ success: boolean; data: UserBook[] }>({
    queryKey: ["/api/v1/user-books"],
    enabled: !!user,
    staleTime: 1000 * 30,
  });

  const myBooks: UserBook[] = libraryData?.data ?? [];
  // Map gutenbergId → saved UserBook for quick lookup
  const savedByGutId = new Map(myBooks.map((b) => [b.gutenbergId, b]));

  // ── Add to Library mutation ─────────────────────────────────────────────────
  const addBookMutation = useMutation({
    mutationFn: async (book: GutenbergBook) => {
      const res = await apiRequest("POST", "/api/v1/user-books", {
        gutenbergId: book.gutenbergId,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
        epubUrl: book.epubUrl,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/user-books"] });
    },
  });

  // ── Remove book mutation ────────────────────────────────────────────────────
  const removeBookMutation = useMutation({
    mutationFn: async (bookId: number) => {
      await apiRequest("DELETE", `/api/v1/user-books/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/user-books"] });
      toast({ title: "Removed from library" });
    },
  });

  // ── One-click Read Now ──────────────────────────────────────────────────────
  // If already in library → go straight to reader
  // If not → add first, then navigate
  const handleReadNow = useCallback(async (book: GutenbergBook) => {
    if (!user) {
      toast({
        title: "Sign in to read",
        description: "Create a free account to start reading.",
      });
      setLocation("/auth");
      return;
    }

    const existing = savedByGutId.get(book.gutenbergId);
    if (existing) {
      setLocation(`/ebook-reader/${existing.id}`);
      return;
    }

    // Not saved yet — add then navigate
    setOpeningId(book.gutenbergId);
    try {
      const result = await addBookMutation.mutateAsync(book);
      if (result.data?.id) {
        setLocation(`/ebook-reader/${result.data.id}`);
      }
    } catch {
      toast({ title: "Failed to open book", variant: "destructive" });
    } finally {
      setOpeningId(null);
    }
  }, [user, savedByGutId, addBookMutation, setLocation, toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) setActiveQuery(searchInput.trim());
  };

  const searchResults: GutenbergBook[] = searchData?.data ?? [];

  return (
    <div className="min-h-screen text-white pb-32 bg-transparent">
      <SEO
        title="Nocturne Library — Midnight Readings"
        description="Explore 70,000+ free public domain books from Project Gutenberg. Read in Nocturne's immersive dark reader."
      />

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="relative h-[38vh] min-h-[260px] w-full overflow-hidden flex items-end">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-indigo-900/15 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[120%] bg-purple-900/10 blur-[130px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050508] to-transparent z-10" />
        <div className="relative z-20 w-full pb-10 px-4 sm:px-8 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <LibraryIcon className="w-4 h-4 text-indigo-400" />
            <span className="text-[11px] uppercase tracking-widest text-indigo-200/80">Click any book to read instantly</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/50 tracking-wide mb-3">
            Midnight Readings
          </h1>
          <p className="text-sm text-white/40 max-w-lg mx-auto font-light tracking-wide">
            70,000+ public domain books from Project Gutenberg. Click any cover to start reading.
          </p>
        </div>
      </div>

      {/* ── Search Bar ────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-30 -mt-4 mb-10">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-2xl group-hover:bg-indigo-500/20 transition-colors duration-500" />
          <div className="relative flex items-center bg-[#0a0a12] border border-white/10 rounded-2xl p-1.5 shadow-2xl focus-within:border-indigo-500/50 transition-all">
            <Search className="absolute left-5 text-white/30 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              id="library-search"
              placeholder="Search by title or author..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-transparent border-none py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-0"
            />
            <Button
              type="submit"
              disabled={!searchInput.trim()}
              className="rounded-xl px-5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/20 transition-all disabled:opacity-40 h-11"
            >
              Search
            </Button>
          </div>
        </form>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14 relative z-20">

        {/* ── My Library ──────────────────────────────────── */}
        {user && myBooks.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
              <BookMarked className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-serif text-white/90">My Midnight Shelf</h2>
              <span className="text-xs text-white/25 bg-white/5 px-2 py-0.5 rounded-full">{myBooks.length} books</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {myBooks.map((book) => (
                <MyBookCard
                  key={book.id}
                  book={book}
                  onRead={() => setLocation(`/ebook-reader/${book.id}`)}
                  onRemove={() => removeBookMutation.mutate(book.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Topic Chips ──────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-white/25 uppercase tracking-widest">Browse by night mood</p>
          <div className="flex flex-wrap justify-center gap-2">
            {TOPICS.map((t) => (
              <button
                key={t.query}
                onClick={() => { setSearchInput(""); setActiveQuery(t.query); }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border text-xs transition-all duration-300 font-medium tracking-wide",
                  activeQuery === t.query
                    ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-200 shadow-[0_0_15px_rgba(79,70,229,0.15)]"
                    : "bg-white/[0.02] border-white/8 text-white/50 hover:text-white/90 hover:bg-white/5 hover:border-white/15"
                )}
              >
                <span>{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Search Results ───────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h2 className="text-lg font-serif text-white/90 capitalize">{activeQuery}</h2>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-white/25">
              <Play className="w-3 h-3" />
              Click any cover to read
            </div>
          </div>

          {isSearching ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
                  <div className="aspect-[2/3] bg-white/[0.03]" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-white/8 rounded w-3/4" />
                    <div className="h-2.5 bg-white/5 rounded w-1/2" />
                    <div className="h-7 bg-white/5 rounded-lg mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="py-20 text-center border border-white/5 bg-white/[0.01] rounded-3xl">
              <p className="text-white/40 mb-4 text-sm">The librarian is unavailable.</p>
              <button onClick={() => refetch()} className="flex items-center gap-2 mx-auto text-sm text-indigo-400 hover:text-indigo-300">
                <RefreshCw className="w-4 h-4" /> Try again
              </button>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-20 text-center border border-white/5 bg-white/[0.01] rounded-3xl">
              <Search className="w-8 h-8 text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No books found in the archives.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {searchResults.map((book) => (
                <SearchBookCard
                  key={book.gutenbergId}
                  book={book}
                  savedBook={savedByGutId.get(book.gutenbergId)}
                  onReadNow={handleReadNow}
                  isLoading={openingId === book.gutenbergId}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Sign-in CTA (guests only) ─────────────────────── */}
        {!user && (
          <div className="py-10 text-center border border-indigo-500/10 bg-indigo-950/10 rounded-3xl">
            <BookMarked className="w-10 h-10 text-indigo-400/30 mx-auto mb-3" />
            <p className="text-white/40 mb-4 text-sm">Sign in to save books and track your reading progress.</p>
            <Button
              onClick={() => setLocation("/auth")}
              className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30"
            >
              Sign In to Start Reading
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
