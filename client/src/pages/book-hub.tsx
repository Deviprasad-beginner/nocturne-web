import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Star, Heart, Share2, BookOpen, MessageSquare, Plus, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function BookHub() {
    const { id } = useParams();
    const [_, setLocation] = useLocation();
    const { user } = useAuth();
    const [book, setBook] = useState<any>(null);
    const [discussions, setDiscussions] = useState<any[]>([]);
    const [quotes, setQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"reviews" | "quotes">("reviews");

    // New review state
    const [isWriting, setIsWriting] = useState(false);
    const [newReviewText, setNewReviewText] = useState("");
    const [newRating, setNewRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetchBookDetails();
        fetchCommunityData();
    }, [id]);

    const fetchBookDetails = async () => {
        try {
            let match = null;
            if (id?.startsWith('openlibrary_')) {
                const realId = id.replace('openlibrary_', '');
                const res = await fetch(`https://openlibrary.org/works/${realId}.json`);
                if (res.ok) {
                    const data = await res.json();
                    match = {
                        key: `/works/${realId}`,
                        title: data.title,
                        author_name: ["Unknown Author"], // Placeholder, fetched below
                        cover_i: data.covers ? data.covers[0] : null,
                        number_of_pages_median: null,
                    };
                    
                    if (data.authors && data.authors[0] && data.authors[0].author) {
                        try {
                            const authorRes = await fetch(`https://openlibrary.org${data.authors[0].author.key}.json`);
                            if (authorRes.ok) {
                                const authorData = await authorRes.json();
                                match.author_name = [authorData.name];
                            }
                        } catch(e) {}
                    }
                }
            } else {
                const res = await fetch(`/api/v1/books/search?query=${id}`);
                if (res.ok) {
                    const data = await res.json();
                    match = data.data.find((b: any) => b.id?.toString() === id) || data.data[0];
                }
            }
            setBook(match);
        } catch (e) {
            console.error("Failed to fetch book");
        } finally {
            setLoading(false);
        }
    };

    const fetchCommunityData = async () => {
        try {
            const [discRes, quotesRes] = await Promise.all([
                fetch(`/api/v1/books-social/${id}/discussions`),
                fetch(`/api/v1/books-social/${id}/quotes`)
            ]);

            if (discRes.ok) setDiscussions((await discRes.json()).data);
            if (quotesRes.ok) setQuotes((await quotesRes.json()).data);
        } catch (e) {
            console.error("Failed to fetch community data");
        }
    };

    const submitReview = async () => {
        if (!newReviewText.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/v1/books-social/${id}/discussions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookTitle: book?.title || "Unknown Book",
                    authorName: book?.author_name?.[0],
                    content: newReviewText,
                    rating: newRating
                })
            });
            if (res.ok) {
                setNewReviewText("");
                setIsWriting(false);
                fetchCommunityData(); // refresh
            }
        } catch (e) {
            console.error("Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white relative overflow-hidden font-sans bg-transparent">
            {/* Ambient Lighting */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/[0.02]">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setLocation("/library")} className="text-gray-400 hover:text-white hover:bg-white/5">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-medium tracking-wide text-white/90" style={{ fontFamily: 'Georgia, serif' }}>NOCTURNE</h1>
                </div>
                <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
                    <button onClick={() => setLocation("/library")} className="hover:text-white transition-colors">Discover</button>
                    <button className="text-white">Community</button>
                    {user && (
                        <div className="w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center">
                            {user.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt="avatar" className="w-8 h-8 rounded-full" />
                            ) : (
                                <span className="text-xs text-indigo-200">{user.username[0].toUpperCase()}</span>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 pt-32 pb-24 relative z-10 flex flex-col md:flex-row gap-12">
                {/* Left Column: Book Details */}
                <div className="md:w-1/3 flex flex-col items-center text-center">
                    <div className="relative mb-8 group">
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-2xl group-hover:bg-indigo-500/30 transition-all duration-700 pointer-events-none" />
                        {book?.cover_i ? (
                            <img
                                src={`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`}
                                alt="Cover"
                                className="relative z-10 w-64 h-96 object-cover rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/5"
                            />
                        ) : (
                            <div className="relative z-10 w-64 h-96 bg-zinc-900 rounded-xl border border-white/5 flex items-center justify-center shadow-2xl">
                                <BookOpen className="w-16 h-16 text-indigo-500/30" />
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl font-semibold mb-2 text-white/95 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                        {book?.title || "Unknown Title"}
                    </h1>
                    <h2 className="text-lg text-indigo-300/80 font-medium mb-6">
                        {book?.author_name?.[0] || "Unknown Author"}
                    </h2>

                    <Button 
                        className="w-64 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-full h-12 shadow-[0_0_20px_rgba(79,70,229,0.2)] transition-all font-medium text-base mb-4"
                        onClick={async () => {
                            if (!user) {
                                setLocation('/auth');
                                return;
                            }
                            try {
                                const res = await fetch("/api/v1/reads", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        title: book?.title || "Unknown Title",
                                        author: book?.author_name?.[0] || "Unknown Author",
                                        contentType: "curated",
                                        contentUrl: id?.startsWith('openlibrary_') ? `https://openlibrary.org${book.key}` : `https://gutenberg.org/ebooks/${id}`,
                                        intention: "think"
                                    })
                                });
                                if (res.ok) {
                                    const readData = await res.json();
                                    setLocation(`/reader/${readData.id}`);
                                }
                            } catch (e) {
                                console.error("Failed to start reading");
                            }
                        }}
                    >
                        <BookOpen className="w-4 h-4 mr-2" /> Read Now
                    </Button>
                    <div className="flex gap-4 text-sm text-gray-500 font-medium">
                        <span>{book?.number_of_pages_median ? `${book.number_of_pages_median} Pages` : "Unknown Pages"}</span>
                        <span>·</span>
                        <span>Fantasy</span>
                        <span>·</span>
                        <span className="flex items-center text-yellow-500/90"><Star className="w-3 h-3 mr-1 fill-current" /> 4.8/5</span>
                    </div>
                </div>

                {/* Right Column: Community Feed */}
                <div className="md:w-2/3">
                    <div className="bg-white/[0.015] border border-white/[0.04] rounded-3xl p-8 shadow-2xl relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

                        <div className="flex justify-between items-end mb-8 border-b border-white/[0.04] pb-6 relative z-10">
                            <div>
                                <h3 className="text-2xl font-semibold text-white/90" style={{ fontFamily: 'Georgia, serif' }}>NIGHT REVIEWS</h3>
                                <p className="text-gray-500 mt-1">Community Discussion</p>
                            </div>
                            <Button
                                variant="ghost"
                                className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 rounded-full"
                                onClick={() => setIsWriting(!isWriting)}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Write Review
                            </Button>
                        </div>

                        {/* Compose Review */}
                        {isWriting && (
                            <div className="mb-8 p-5 bg-black/40 border border-white/[0.05] rounded-2xl relative z-10 animate-fadeIn">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center">
                                            <span className="text-xs text-indigo-200">{user?.username?.[0]?.toUpperCase()}</span>
                                        </div>
                                        <span className="text-sm font-medium">{user?.username}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button key={star} onClick={() => setNewRating(star)}>
                                                <Star className={`w-5 h-5 ${star <= newRating ? "text-yellow-500 fill-yellow-500" : "text-gray-600"}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Textarea
                                    className="bg-transparent border-0 focus-visible:ring-0 resize-none text-white/80 placeholder:text-gray-600 h-24 p-0 text-sm"
                                    placeholder="Share your thoughts on this book..."
                                    value={newReviewText}
                                    onChange={e => setNewReviewText(e.target.value)}
                                />
                                <div className="flex justify-end mt-4">
                                    <Button
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-6"
                                        onClick={submitReview}
                                        disabled={submitting || !newReviewText.trim()}
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Feed Filter */}
                        <div className="flex gap-6 mb-6 relative z-10">
                            <button
                                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-indigo-500 text-indigo-300' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                onClick={() => setActiveTab('reviews')}
                            >
                                Reviews ({discussions.length})
                            </button>
                            <button
                                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'quotes' ? 'border-indigo-500 text-indigo-300' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                onClick={() => setActiveTab('quotes')}
                            >
                                Shared Quotes ({quotes.length})
                            </button>
                        </div>

                        {/* Reviews Feed */}
                        <div className="space-y-6 relative z-10">
                            {activeTab === "reviews" && (
                                discussions.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>No reviews yet. Be the first to share your thoughts.</p>
                                    </div>
                                ) : (
                                    discussions.map((disc) => (
                                        <div key={disc.id} className="p-5 bg-black/20 border border-white/[0.02] rounded-2xl hover:border-white/[0.05] transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full border border-indigo-500/30 overflow-hidden flex items-center justify-center bg-indigo-900/30">
                                                        {disc.author?.avatar ? (
                                                            <img src={disc.author.avatar} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-white/80">{disc.author?.username?.[0]?.toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white/90 text-sm">{disc.author?.displayName || disc.author?.username}</p>
                                                        <p className="text-xs text-gray-500">@{disc.author?.username}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex gap-0.5 mb-1 justify-end">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star key={star} className={`w-3.5 h-3.5 ${star <= (disc.rating || 5) ? "text-yellow-500 fill-yellow-500" : "text-gray-700"}`} />
                                                        ))}
                                                    </div>
                                                    <p className="text-[10px] text-gray-500">
                                                        {new Date(disc.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-300 leading-relaxed font-light">
                                                {disc.content}
                                            </p>
                                            <div className="flex gap-6 mt-5 text-gray-500">
                                                <button className="flex items-center gap-2 hover:text-pink-400 transition-colors text-xs">
                                                    <Heart className="w-4 h-4" /> 0
                                                </button>
                                                <button className="flex items-center gap-2 hover:text-white transition-colors text-xs">
                                                    <MessageSquare className="w-4 h-4" /> Reply
                                                </button>
                                                <button className="flex items-center gap-2 hover:text-white transition-colors text-xs ml-auto">
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )
                            )}

                            {/* Quotes Feed */}
                            {activeTab === "quotes" && (
                                quotes.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>No quotes shared yet. Read this book to highlight and share.</p>
                                    </div>
                                ) : (
                                    quotes.map((quote) => (
                                        <div key={quote.id} className="p-6 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl relative">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50 rounded-l-2xl" />
                                            <p className="text-lg text-indigo-100/90 leading-relaxed mb-4 italic" style={{ fontFamily: 'Georgia, serif' }}>
                                                "{quote.quoteText}"
                                            </p>

                                            {quote.notes && (
                                                <div className="mt-4 mb-4 p-4 bg-black/40 rounded-xl border border-white/[0.03]">
                                                    <p className="text-sm text-gray-400"><span className="text-indigo-400 font-medium">POV:</span> {quote.notes}</p>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.03]">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-900/50 flex items-center justify-center text-[10px]">
                                                        {quote.author?.username?.[0]?.toUpperCase()}
                                                    </div>
                                                    <span className="text-xs text-gray-400">Highlighted by @{quote.author?.username}</span>
                                                </div>
                                                <button className="text-gray-500 hover:text-pink-400 transition-colors">
                                                    <Heart className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
