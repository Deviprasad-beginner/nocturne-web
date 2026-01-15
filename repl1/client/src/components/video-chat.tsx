import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Send, Users } from 'lucide-react';
import { useWebSocket, type WebSocketMessage } from '@/hooks/use-websocket';

interface ChatMessage {
  id: string;
  username: string;
  content: string;
  timestamp: string;
}

interface VideoChatProps {
  roomId: string;
  username: string;
  onLeave: () => void;
}

export function VideoChat({ roomId, username, onLeave }: VideoChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [memberCount, setMemberCount] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const wsUrl = `ws://${window.location.host}/ws`;
  
  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'room_joined':
        setMemberCount(message.memberCount);
        break;
      case 'user_joined':
        setMemberCount(prev => prev + 1);
        addSystemMessage(`${message.username} joined the room`);
        break;
      case 'user_left':
        setMemberCount(message.memberCount);
        addSystemMessage('Someone left the room');
        break;
      case 'chat_message':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          username: message.username,
          content: message.content,
          timestamp: message.timestamp
        }]);
        break;
      case 'video_offer':
        handleVideoOffer(message.offer);
        break;
      case 'video_answer':
        handleVideoAnswer(message.answer);
        break;
      case 'ice_candidate':
        handleIceCandidate(message.candidate);
        break;
    }
  };

  const { isConnected, sendMessage } = useWebSocket(wsUrl, handleWebSocketMessage);

  useEffect(() => {
    if (isConnected) {
      sendMessage({
        type: 'join_room',
        roomId,
        username
      });
    }
  }, [isConnected, roomId, username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addSystemMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      username: 'System',
      content,
      timestamp: new Date().toISOString()
    }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendChatMessage = () => {
    if (newMessage.trim() && isConnected) {
      const message = {
        type: 'chat_message',
        username,
        content: newMessage.trim(),
        timestamp: new Date().toISOString()
      };
      
      sendMessage(message);
      
      // Add to local messages
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        username,
        content: newMessage.trim(),
        timestamp: new Date().toISOString()
      }]);
      
      setNewMessage('');
    }
  };

  const initializePeerConnection = () => {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    };
    
    peerConnectionRef.current = new RTCPeerConnection(config);
    
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage({
          type: 'ice_candidate',
          candidate: event.candidate
        });
      }
    };
    
    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
  };

  const startVideo = async () => {
    try {
      setIsConnecting(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      
      initializePeerConnection();
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(track, stream);
        }
      });
      
      // Create offer
      const offer = await peerConnectionRef.current!.createOffer();
      await peerConnectionRef.current!.setLocalDescription(offer);
      
      sendMessage({
        type: 'video_offer',
        offer
      });
      
    } catch (error) {
      console.error('Error starting video:', error);
      addSystemMessage('Failed to start video. Please check camera permissions.');
    } finally {
      setIsConnecting(false);
    }
  };

  const stopVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleVideoOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) {
      initializePeerConnection();
    }
    
    await peerConnectionRef.current!.setRemoteDescription(offer);
    
    // Get user media if not already available
    if (!localStreamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        stream.getTracks().forEach(track => {
          peerConnectionRef.current!.addTrack(track, stream);
        });
        
        setIsVideoEnabled(true);
        setIsAudioEnabled(true);
      } catch (error) {
        console.error('Error getting user media:', error);
      }
    }
    
    const answer = await peerConnectionRef.current!.createAnswer();
    await peerConnectionRef.current!.setLocalDescription(answer);
    
    sendMessage({
      type: 'video_answer',
      answer
    });
  };

  const handleVideoAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(answer);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.addIceCandidate(candidate);
    }
  };

  const handleLeave = () => {
    stopVideo();
    sendMessage({
      type: 'leave_room'
    });
    onLeave();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-pink-400" />
              <h1 className="text-2xl font-bold">Night Circle: {roomId}</h1>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300">
              {memberCount} online
            </Badge>
          </div>
          <Button 
            onClick={handleLeave}
            variant="destructive"
            size="sm"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Leave
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Remote Video */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-black rounded-lg object-cover"
                />
                <div className="text-center mt-2 text-sm text-gray-400">
                  {isVideoEnabled ? 'Waiting for others to join...' : 'No video feed'}
                </div>
              </CardContent>
            </Card>

            {/* Local Video */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-32 bg-black rounded-lg object-cover"
                />
                <div className="text-center mt-2 text-sm text-gray-400">You</div>
              </CardContent>
            </Card>

            {/* Video Controls */}
            <div className="flex justify-center space-x-4">
              {!isVideoEnabled ? (
                <Button 
                  onClick={startVideo}
                  disabled={isConnecting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Video className="w-4 h-4 mr-2" />
                  {isConnecting ? 'Connecting...' : 'Start Video'}
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={stopVideo}
                    variant="destructive"
                  >
                    <VideoOff className="w-4 h-4 mr-2" />
                    Stop Video
                  </Button>
                  <Button 
                    onClick={toggleAudio}
                    variant={isAudioEnabled ? "default" : "destructive"}
                  >
                    {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 border-gray-700 h-96">
              <CardHeader>
                <CardTitle className="text-lg">Chat</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col h-full">
                <ScrollArea className="flex-1 mb-4 pr-4">
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`p-2 rounded-lg ${
                        msg.username === 'System' 
                          ? 'bg-blue-900/30 text-blue-200 text-sm' 
                          : msg.username === username
                          ? 'bg-pink-900/30 text-pink-200 ml-4'
                          : 'bg-gray-700/50 text-gray-200 mr-4'
                      }`}>
                        {msg.username !== 'System' && (
                          <div className="text-xs text-gray-400 mb-1">
                            {msg.username}
                          </div>
                        )}
                        <div>{msg.content}</div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-gray-700/50 border-gray-600 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <Button 
                    onClick={sendChatMessage}
                    size="sm"
                    disabled={!newMessage.trim() || !isConnected}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}