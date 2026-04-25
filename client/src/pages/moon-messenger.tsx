import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Moon, MessageCircle, Send, Users, Clock, Shuffle, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/use-websocket";
import type { MoonMessenger, InsertMoonMessenger } from "@shared/schema";

export default function MoonMessengerPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery<MoonMessenger[]>({
    queryKey: ["/api/v1/messenger", currentSessionId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/v1/messenger/${currentSessionId}`);
      const json = await res.json();
      return json.success ? json.data : json;
    },
    enabled: !!currentSessionId,
  });

  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
  const { sendMessage: sendWebSocketMessage, isConnected: wsConnected } = useWebSocket(wsUrl, (message) => {
    if (message.type === 'random_paired') {
      setCurrentSessionId(message.roomId);
      setIsConnected(true);
      setIsSearching(false);
    } else if (message.type === 'random_waiting') {
      setIsSearching(true);
    } else if (message.type === 'message_received') {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/messenger", currentSessionId] });
    } else if (message.type === 'partner_disconnected') {
      setIsConnected(false);
      setCurrentSessionId(null);
    }
  });

  const createMessageMutation = useMutation({
    mutationFn: async (newMessage: InsertMoonMessenger) => {
      const response = await apiRequest("POST", "/api/v1/messenger", newMessage);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/messenger", currentSessionId] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartChat = () => {
    if (!username.trim()) {
      alert("Please enter a username first");
      return;
    }

    if (!wsConnected) {
      alert("Connection not established. Please try again in a moment.");
      return;
    }

    setIsSearching(true);
    if (sendWebSocketMessage) {
      sendWebSocketMessage({
        type: 'join_random',
        username: username.trim()
      });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentSessionId || !username) return;

    const anonymousId = `anon_${Math.random().toString(36).substr(2, 9)}`;

    createMessageMutation.mutate({
      sessionId: currentSessionId,
      message: message.trim(),
      sender: anonymousId,
    });

    // Send via WebSocket for real-time delivery
    if (sendWebSocketMessage) {
      sendWebSocketMessage({
        type: 'chat_message',
        roomId: currentSessionId,
        message: {
          content: message.trim(),
          sender: anonymousId,
          timestamp: new Date().toISOString()
        }
      });
    }

    setMessage("");
  };

  const handleDisconnect = () => {
    if (sendWebSocketMessage && currentSessionId) {
      sendWebSocketMessage({
        type: 'leave_room'
      });
    }
    setIsConnected(false);
    setCurrentSessionId(null);
    setIsSearching(false);
  };

  const formatTime = (timestamp: string | Date | null) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full">
              <Moon className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Moon Messenger
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Connect with random strangers for anonymous text conversations under the digital moonlight. Share thoughts with complete anonymity.
          </p>
        </div>

        {/* Connection Setup */}
        {!isConnected && !isSearching && (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shuffle className="w-5 h-5 text-blue-400" />
                <span>Start Anonymous Chat</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a temporary username..."
                className="bg-gray-700/50 border-gray-600 text-white"
              />
              <Button
                onClick={handleStartChat}
                disabled={!username.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Find Random Chat Partner
              </Button>
              <p className="text-sm text-gray-400 text-center">
                You'll be matched with another random person for an anonymous conversation.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Searching State */}
        {isSearching && (
          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto">
                  <div className="w-full h-full border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-semibold">Searching for a chat partner...</h3>
                <p className="text-gray-400">
                  We're finding someone else who's also looking to chat under the stars.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSearching(false)}
                  className="border-gray-600"
                >
                  Cancel Search
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Chat */}
        {isConnected && currentSessionId && (
          <div className="space-y-4">
            {/* Chat Header */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-lg font-semibold">Anonymous Chat Active</span>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                      Connected
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
                    className="border-red-600 text-red-400 hover:bg-red-600/10"
                  >
                    Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p>Start your anonymous conversation...</p>
                    </div>
                  ) : (
                    messages.map((msg: MoonMessenger) => {
                      const isOwnMessage = msg.sender.includes(username.substring(0, 4));
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwnMessage
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                              : 'bg-gray-700 text-gray-200'
                              }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                                {isOwnMessage ? 'You' : 'Stranger'}
                              </span>
                              <span className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your anonymous message..."
                      className="bg-gray-700/50 border-gray-600 text-white flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={!message.trim() || createMessageMutation.isPending}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        <Card className="bg-gray-800/30 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>How Moon Messenger Works</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-300">Enter Username</h4>
                  <p className="text-gray-400">Choose a temporary username for the session</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-300">Get Matched</h4>
                  <p className="text-gray-400">We'll pair you with another anonymous user</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-300">Chat Freely</h4>
                  <p className="text-gray-400">Have meaningful anonymous conversations</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}