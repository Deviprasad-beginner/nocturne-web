import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { SEO } from "@/components/SEO";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Quote {
  id: number;
  text: string;
  author: string | null;
  philosophyTag: string | null;
}

interface ChatMessage {
  id: number;
  chatId: number;
  senderId: string | null;
  content: string;
  isIcebreaker: boolean;
  createdAt: string;
}

interface ChatData {
  chat: {
    id: number;
    userOneId: string;
    userTwoId: string;
    quoteId: number | null;
    sharedTopic: string | null;
    sharedPrompt: string | null;
    sharedIntent: string | null;
    endedBy: string | null;
    isActive: boolean;
    createdAt: string;
  };
  quote: Quote | null;
  messages: ChatMessage[];
}

// ── Icebreaker / Shared Spark Banner ──────────────────────────────────────────
function IcebreakerBanner({
  quote,
  topic,
  intent,
}: {
  quote: Quote | null;
  topic?: string | null;
  intent?: string | null;
}) {
  const sparkText = quote?.text || topic || "What keeps returning in the quiet of the night?";
  const sparkTag = quote?.philosophyTag || intent || "Harmonic Spark";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-purple-950/20 to-indigo-950/30 backdrop-blur-md p-5 mb-6 mx-4 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <p className="text-violet-400 text-[10px] tracking-[0.25em] uppercase font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Shared Resonance Point
        </p>
        <span className="text-[10px] tracking-wider uppercase text-violet-300/60 border border-violet-500/20 rounded-full px-2.5 py-0.5 bg-violet-900/30">
          {sparkTag}
        </span>
      </div>

      <blockquote className="text-white/90 text-base sm:text-lg font-light italic leading-relaxed mb-2">
        "{sparkText}"
      </blockquote>

      {quote?.author && (
        <p className="text-violet-300/60 text-xs">— {quote.author}</p>
      )}

      {intent && (
        <p className="text-[11px] text-emerald-400/80 mt-2">
          Conversation intent: <span className="font-medium">{intent}</span>
        </p>
      )}
    </div>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  if (message.isIcebreaker) return null;
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`
          max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isOwn
            ? "bg-violet-700/80 text-white rounded-br-sm shadow-md shadow-violet-950/40"
            : "bg-white/[0.08] border border-white/10 text-white/90 rounded-bl-sm backdrop-blur-sm"
          }
        `}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p className={`text-[9px] mt-1.5 ${isOwn ? "text-violet-200/60 text-right" : "text-white/30"}`}>
          {time}
        </p>
      </div>
    </div>
  );
}

// ── Typing Indicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3 px-4">
      <div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1.5">
        <style>{`
          @keyframes typingDot {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
            40% { transform: translateY(-4px); opacity: 1; }
          }
        `}</style>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-violet-400"
            style={{ animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
        <span className="text-[10px] text-white/30 ml-1.5">Peer is typing...</span>
      </div>
    </div>
  );
}

// ── Main Chat Component ───────────────────────────────────────────────────────
export default function ResonanceChatRoom() {
  const { chatId } = useParams<{ chatId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [peerOnline, setPeerOnline] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  // Modals
  const [showEndModal, setShowEndModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("Inappropriate behavior");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingSentRef = useRef(false);

  const chatIdNum = parseInt(chatId || "0");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, peerTyping]);

  // Fetch initial chat info from REST
  const fetchChat = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/resonance/chat/${chatId}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setChatData(data.data);
      setMessages(data.data.messages.filter((m: ChatMessage) => !m.isIcebreaker));
      if (!data.data.chat.isActive) {
        setIsEnded(true);
      }
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load chat chamber";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  // WebSocket lifecycle
  useEffect(() => {
    fetchChat();

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      ws.send(JSON.stringify({ type: "RESONANCE_JOIN", chatId: chatIdNum, userId: user?.id ?? "guest" }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.chatId !== chatIdNum) return;

        switch (msg.type) {
          case "RESONANCE_JOINED":
          case "RESONANCE_PEER_ONLINE":
            setPeerOnline(msg.memberCount >= 2);
            break;

          case "RESONANCE_NEW_MESSAGE":
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.messageId)) return prev;
              return [
                ...prev,
                {
                  id: msg.messageId,
                  chatId: chatIdNum,
                  senderId: null,
                  content: msg.content,
                  isIcebreaker: false,
                  createdAt: msg.createdAt ?? new Date().toISOString(),
                },
              ];
            });
            setPeerTyping(false);
            break;

          case "RESONANCE_TYPING":
            setPeerTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setPeerTyping(false), 3000);
            break;

          case "RESONANCE_PEER_LEFT":
            setPeerOnline(false);
            setIsEnded(true);
            break;
        }
      } catch {}
    };

    ws.onclose = () => {
      setWsConnected(false);
      setPeerOnline(false);
      // Fallback polling every 5s if WS disconnects
      pollRef.current = setInterval(fetchChat, 5000);
    };

    ws.onerror = () => {
      setWsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "RESONANCE_LEAVE", chatId: chatIdNum }));
      }
      ws.close();
      if (pollRef.current) clearInterval(pollRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [chatId, chatIdNum, user?.id, fetchChat]);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || sending || isEnded) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    typingSentRef.current = false;

    // Optimistic message
    const optimisticId = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        chatId: chatIdNum,
        senderId: user?.id ?? null,
        content,
        isIcebreaker: false,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      const res = await apiRequest("POST", `/api/v1/resonance/chat/${chatId}/messages`, { content });
      const data = await res.json();

      if (data.success && data.data) {
        const saved = data.data;
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? { ...saved, isIcebreaker: false } : m))
        );

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "RESONANCE_MESSAGE",
              chatId: chatIdNum,
              content,
              messageId: saved.id,
              createdAt: saved.createdAt,
            })
          );
        }
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }

    // Typing broadcast throttled to once per 2s
    if (!typingSentRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
      typingSentRef.current = true;
      wsRef.current.send(JSON.stringify({ type: "RESONANCE_TYPING", chatId: chatIdNum }));
      setTimeout(() => { typingSentRef.current = false; }, 2000);
    }
  };

  // End conversation
  const handleLeaveConversation = async () => {
    try {
      await apiRequest("POST", `/api/v1/resonance/chat/${chatId}/leave`, {});
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "RESONANCE_LEAVE", chatId: chatIdNum }));
      }
    } catch {}
    setIsEnded(true);
    setShowEndModal(false);
    setLocation("/resonance");
  };

  // Report & Block peer
  const handleReportAndBlock = async () => {
    setReportSubmitting(true);
    try {
      await apiRequest("POST", `/api/v1/resonance/chat/${chatId}/report`, { reason: reportReason });
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "RESONANCE_LEAVE", chatId: chatIdNum }));
      }
      setIsEnded(true);
      setShowReportModal(false);
      setLocation("/resonance");
    } catch {
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <style>{`
          @keyframes orbPulse { 0%, 100% { opacity: 0.5; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }
        `}</style>
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 mx-auto mb-4"
            style={{ animation: "orbPulse 2s ease-in-out infinite" }}
          />
          <p className="text-violet-400 text-xs tracking-widest uppercase animate-pulse">
            Connecting Chamber...
          </p>
        </div>
      </div>
    );
  }

  if (error || !chatData) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-white/40 text-sm">{error || "Chat chamber not found or unauthorized."}</p>
        <button
          onClick={() => setLocation("/resonance")}
          className="text-violet-400 text-xs uppercase tracking-wider underline hover:text-violet-300"
        >
          Return to Resonance
        </button>
      </div>
    );
  }

  const { chat, quote } = chatData;

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col relative overflow-hidden">
      <SEO
        title="Resonance Chamber | Anonymous 1:1 Connection"
        description="An ephemeral, private conversation between two night kindred. Safe, thoughtful, and anonymous."
      />

      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-violet-950/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#030712] to-transparent pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#030712]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/resonance")}
            className="text-white/40 hover:text-white/80 transition-colors text-sm px-1.5 py-1"
            aria-label="Back"
          >
            ←
          </button>
          <div>
            <p className="text-white text-xs sm:text-sm font-medium">Resonance Chamber</p>
            <p className="text-violet-400/60 text-[10px] tracking-wider uppercase">
              1:1 Anonymous · Ephemeral
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isEnded
                  ? "bg-zinc-600"
                  : peerOnline
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-[11px] text-white/40 hidden sm:inline">
              {isEnded ? "Ended" : peerOnline ? "Peer attuned" : "Waiting for peer"}
            </span>
          </div>

          {!isEnded && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowEndModal(true)}
                className="px-2.5 py-1 rounded-lg border border-white/10 text-white/40 text-[11px] hover:text-white hover:border-white/20 transition-all"
              >
                End
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="px-2.5 py-1 rounded-lg border border-rose-500/20 text-rose-400/60 text-[11px] hover:text-rose-300 hover:border-rose-500/40 transition-all"
                title="Report or Block"
              >
                Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* End Conversation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b0b14] border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-lg font-light text-white mb-2">Leave Resonance Chamber?</h3>
            <p className="text-xs text-white/40 mb-6 leading-relaxed">
              This will gently close the connection for both participants. Your conversation history is ephemeral.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 text-xs hover:text-white"
              >
                Stay
              </button>
              <button
                onClick={handleLeaveConversation}
                className="flex-1 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-600 text-white text-xs font-semibold"
              >
                End Conversation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report & Block Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b0b14] border border-rose-500/30 rounded-2xl p-6 max-w-sm w-full text-left shadow-2xl">
            <h3 className="text-base font-medium text-white mb-1">Report & Block Peer</h3>
            <p className="text-xs text-white/40 mb-4 leading-relaxed">
              We take safety seriously. Reporting will instantly block this peer from future matching and submit their behavior for moderation.
            </p>

            <label className="text-[11px] text-white/60 uppercase tracking-wider block mb-1.5 font-medium">
              Reason
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full rounded-xl bg-black/60 border border-white/10 p-2.5 text-xs text-white mb-6 focus:outline-none focus:border-rose-500/50"
            >
              <option value="Inappropriate behavior">Inappropriate or abusive behavior</option>
              <option value="Harassment">Harassment or hate speech</option>
              <option value="Spam or solicitation">Spam, advertising, or bot</option>
              <option value="Safety concern">Self-harm or safety concern</option>
              <option value="Uncomfortable">Made me feel unsafe</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setShowReportModal(false)}
                disabled={reportSubmitting}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 text-xs hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReportAndBlock}
                disabled={reportSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold"
              >
                {reportSubmitting ? "Submitting..." : "Report & Block"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Messages Area */}
      <div className="relative z-10 flex-1 overflow-y-auto pb-32 pt-4">
        <div className="max-w-2xl mx-auto">
          {/* Shared Spark Banner */}
          <IcebreakerBanner
            quote={quote}
            topic={chat.sharedTopic}
            intent={chat.sharedIntent}
          />

          <div className="flex items-center gap-3 px-4 mb-4">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-white/20 text-[10px] tracking-widest uppercase">
              The conversation begins
            </span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Messages Stream */}
          <div className="px-4">
            {messages.length === 0 && (
              <p className="text-center text-white/30 text-xs my-8 italic">
                Break the silence. Share what brought you here tonight.
              </p>
            )}

            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === user?.id}
              />
            ))}

            {peerTyping && <TypingIndicator />}

            {/* Conversation ended notice */}
            {isEnded && (
              <div className="my-6 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-center max-w-sm mx-auto">
                <p className="text-white/80 text-xs font-medium mb-1">Resonance chamber concluded</p>
                <p className="text-white/30 text-[11px] leading-relaxed mb-3">
                  Safe travels through the nocturnal quiet.
                </p>
                <button
                  onClick={() => setLocation("/resonance")}
                  className="px-4 py-2 rounded-lg bg-violet-700/80 hover:bg-violet-600 text-white text-xs transition-colors"
                >
                  Find a New Resonance
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Message Composer Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 py-3 bg-[#030712]/90 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-2xl mx-auto flex items-end gap-2.5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isEnded}
            placeholder={isEnded ? "This conversation has ended." : "Share a genuine thought..."}
            rows={1}
            className="flex-1 resize-none bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white/90 text-sm placeholder-white/25 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all max-h-32 disabled:opacity-40"
            style={{ minHeight: "44px" }}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || sending || isEnded}
            className={`
              flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all
              ${input.trim() && !sending && !isEnded
                ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/50"
                : "bg-white/5 text-white/20 cursor-not-allowed"
              }
            `}
            aria-label="Send message"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M3.105 2.288a.75.75 0 00-.826.95l1.414 4.926A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.897 28.897 0 0015.293-7.155.75.75 0 000-1.114A28.897 28.897 0 003.105 2.288z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-center text-white/20 text-[10px] mt-1.5">
          Press Enter to send · Shift+Enter for newline · Identity is strictly anonymous
        </p>
      </div>
    </div>
  );
}