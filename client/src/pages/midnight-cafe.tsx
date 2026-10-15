import { useState } from "react";
import { Link, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Coffee, Flame, Mic, Headphones, MessageSquare, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAudioRoom } from "@/context/AudioRoomContext";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// -- MAIN COMPONENT --
export default function MidnightCafe() {
    const { id } = useParams();
    const { joinRoom, currentRoomId } = useAudioRoom();

    if (!id) {
        return <CafeList />;
    }

    return <CafeDetail id={id} joinRoom={joinRoom} currentRoomId={currentRoomId} />;
}

// -- LIST VIEW --
function CafeList() {
    const { data: threads, isLoading } = useQuery<any[]>({
        queryKey: ["/api/v1/midnight-cafe"],
    });
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [isCreating, setIsCreating] = useState(false);
    const [newTopic, setNewTopic] = useState("");
    const [newContent, setNewContent] = useState("");

    const createMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/v1/midnight-cafe", {
                topic: newTopic,
                content: newContent,
                category: "general"
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/v1/midnight-cafe"] });
            setIsCreating(false);
            setNewTopic("");
            setNewContent("");
            toast({ title: "Conversation started" });
        },
        onError: (err: any) => {
            toast({ title: "Failed to start", description: err.message, variant: "destructive" });
        }
    });

    return (
        <div className="min-h-screen pb-24 text-gray-200 bg-[#030308]">
            <div className="max-w-3xl mx-auto pt-10 px-4">
                <div className="flex items-center justify-between mb-8">
                    <Link href="/">
                        <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
                            <ArrowLeft className="w-4 h-4" /> Back Home
                        </button>
                    </Link>
                    <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-widest text-sm">
                        <Coffee className="w-5 h-5" />
                        Midnight Cafe
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <p className="text-gray-400 text-lg leading-relaxed flex-1">
                        Step into the quiet hum of the night. Join ongoing discussions or start a new deep dive with fellow night owls.
                    </p>
                    <button 
                        onClick={() => setIsCreating(!isCreating)}
                        className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        {isCreating ? "Cancel" : "Start Conversation"}
                    </button>
                </div>

                <AnimatePresence>
                    {isCreating && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 overflow-hidden"
                        >
                            <div className="bg-[#111122] border border-white/10 rounded-2xl p-6">
                                <input 
                                    type="text" 
                                    placeholder="Conversation Topic" 
                                    value={newTopic}
                                    onChange={e => setNewTopic(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 mb-4 text-white focus:outline-none focus:border-amber-500"
                                />
                                <textarea 
                                    placeholder="What's on your mind?" 
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 mb-4 text-white focus:outline-none focus:border-amber-500"
                                />
                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => createMutation.mutate()}
                                        disabled={!newTopic.trim() || !newContent.trim() || createMutation.isPending}
                                        className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        {createMutation.isPending ? "Posting..." : "Post"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : threads?.length === 0 ? (
                    <div className="text-center p-12 bg-white/5 rounded-2xl border border-white/10 text-gray-400">
                        The cafe is empty tonight. Be the first to start a conversation.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {threads?.map((t) => (
                            <Link key={t.id} href={`/midnight-cafe/${t.id}`}>
                                <motion.div 
                                    whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.08)" }}
                                    className="p-6 rounded-2xl bg-white/5 border border-white/10 cursor-pointer transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-xl font-bold text-amber-100">{t.topic || t.title || "Late Night Thoughts"}</h3>
                                        {t.mood && <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">{t.mood}</span>}
                                    </div>
                                    <p className="text-gray-300 line-clamp-2 mb-4 text-sm leading-relaxed">{t.content}</p>
                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                        <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {t.replies || 0} Replies</span>
                                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}</span>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// -- DETAIL VIEW --
function CafeDetail({ id, joinRoom, currentRoomId }: { id: string, joinRoom: any, currentRoomId: any }) {
    const { data: thread, isLoading: isThreadLoading } = useQuery<any>({
        queryKey: [`/api/v1/midnight-cafe/${id}`],
    });

    const { data: repliesResponse, isLoading: isRepliesLoading } = useQuery<any>({
        queryKey: [`/api/v1/midnight-cafe/${id}/replies`],
    });
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [newReply, setNewReply] = useState("");

    const replyMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", `/api/v1/midnight-cafe/${id}/replies`, {
                content: newReply
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/v1/midnight-cafe/${id}/replies`] });
            setNewReply("");
        },
        onError: (err: any) => {
            toast({ title: "Failed to reply", description: err.message, variant: "destructive" });
        }
    });

    const replies = Array.isArray(repliesResponse) ? repliesResponse : (repliesResponse?.data || []);

    const isFastMoving = replies.length > 5;
    const repliesPerMinute = 2.5; // Conceptual placeholder logic

    const handleCreateRoom = () => joinRoom(Number(id), 'host');
    const handleJoinRoom = () => joinRoom(Number(id), 'listener');

    if (isThreadLoading) return <div className="min-h-screen bg-[#030308] flex items-center justify-center"><div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;
    if (!thread) return <div className="min-h-screen bg-[#030308] flex items-center justify-center text-white text-lg">Discussion not found.</div>;

    return (
        <div className="min-h-screen pb-24 text-gray-200 bg-transparent">
            <div className="max-w-2xl mx-auto pt-6 px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/midnight-cafe">
                        <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
                            <ArrowLeft className="w-4 h-4" /> Back to Cafe
                        </button>
                    </Link>
                    <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-widest text-xs">
                        <Coffee className="w-4 h-4" />
                        Midnight Cafe
                    </div>
                </div>

                {/* Velocity Bridge Banner */}
                <AnimatePresence>
                    {isFastMoving && !currentRoomId && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8"
                        >
                            <div className="p-5 rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-950/40 to-red-950/40 shadow-[0_0_30px_rgba(249,115,22,0.1)] relative overflow-hidden">
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full" />
                                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex flex-shrink-0 items-center justify-center">
                                            <Flame className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-orange-200 font-semibold flex items-center gap-2">
                                                This thread is moving fast!
                                                <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                                                    {repliesPerMinute.toFixed(1)} replies/min
                                                </span>
                                            </h4>
                                            <p className="text-sm text-orange-200/70 mt-1">Take the conversation live in a Starlit Room.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button 
                                            onClick={handleCreateRoom}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-orange-500/20"
                                        >
                                            <Mic className="w-4 h-4" /> Host Room
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Active Room Indicator */}
                <AnimatePresence>
                    {currentRoomId === Number(id) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 p-4 rounded-xl border border-green-500/30 bg-green-950/20 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </div>
                                <span className="text-green-400 text-sm font-medium">Live Audio Room is active</span>
                            </div>
                            <button 
                                onClick={handleJoinRoom}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Headphones className="w-4 h-4" /> Listen In
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>


                {/* Thread Content */}
                <div className="bg-[#111122] rounded-2xl p-6 border border-white/5">
                    <h1 className="text-2xl font-bold text-white mb-4">{thread.topic || thread.title || "Discussion"}</h1>
                    <p className="text-gray-300 leading-relaxed mb-8">{thread.content}</p>
                    
                    <div className="border-t border-white/5 pt-6 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Discussion ({replies.length} replies)
                        </h3>
                        
                        {isRepliesLoading ? (
                            <div className="animate-pulse space-y-4">
                                {[1,2,3].map(i => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex-shrink-0" />
                                        <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 w-full h-20" />
                                    </div>
                                ))}
                            </div>
                        ) : replies.length === 0 ? (
                            <div className="text-center p-8 bg-white/5 rounded-xl border border-white/10 text-gray-400 text-sm italic">
                                Be the first to share your thoughts...
                            </div>
                        ) : (
                            replies.map((r: any) => (
                                <div key={r.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex-shrink-0 flex items-center justify-center text-amber-200 text-xs font-bold">
                                        {r.author?.anonymousHandle?.charAt(0) || r.authorId?.toString().charAt(0) || "?"}
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 w-full">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-medium text-amber-400">
                                                {r.author?.anonymousHandle || "Anonymous"}
                                            </span>
                                            <span className="text-[10px] text-gray-500">
                                                {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed">{r.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        
                        {/* Reply Form */}
                        <div className="mt-6 flex gap-3 pt-4 border-t border-white/5">
                            <input 
                                type="text"
                                placeholder="Add your thoughts..."
                                value={newReply}
                                onChange={e => setNewReply(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && newReply.trim() && !replyMutation.isPending) {
                                        replyMutation.mutate();
                                    }
                                }}
                                className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                            />
                            <button
                                onClick={() => replyMutation.mutate()}
                                disabled={!newReply.trim() || replyMutation.isPending}
                                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
                            >
                                Reply
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
