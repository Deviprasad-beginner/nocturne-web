import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Users, ArrowLeft } from 'lucide-react';
import { useWebSocket, type WebSocketMessage } from '@/hooks/use-websocket';
import { VideoChat } from './video-chat';

interface RandomChatProps {
  username: string;
  onBack: () => void;
}

export function RandomChat({ username, onBack }: RandomChatProps) {
  const [status, setStatus] = useState<'idle' | 'waiting' | 'paired'>('idle');
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const [waitingTime, setWaitingTime] = useState(0);

  const wsUrl = `ws://${window.location.host}/ws`;
  
  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'waiting_for_pair':
        setStatus('waiting');
        setWaitingTime(0);
        break;
      case 'random_paired':
        setStatus('paired');
        setCurrentRoomId(message.roomId);
        break;
    }
  };

  const { isConnected, sendMessage } = useWebSocket(wsUrl, handleWebSocketMessage);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'waiting') {
      interval = setInterval(() => {
        setWaitingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const startRandomPairing = () => {
    if (isConnected) {
      sendMessage({
        type: 'join_random',
        username
      });
    }
  };

  const stopWaiting = () => {
    setStatus('idle');
    setWaitingTime(0);
  };

  const handleLeaveChat = () => {
    setStatus('idle');
    setCurrentRoomId('');
    setWaitingTime(0);
  };

  if (status === 'paired' && currentRoomId) {
    return (
      <VideoChat
        roomId={currentRoomId}
        username={username}
        onLeave={handleLeaveChat}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={onBack}
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <Shuffle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Random Pairing</h1>
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-orange-900/30 rounded-lg border border-orange-700/50">
          <p className="text-sm text-orange-200">
            Connect with random strangers for spontaneous conversations. 
            Just like Omegle, but focused on meaningful nighttime connections.
          </p>
        </div>

        <div className="flex justify-center">
          <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Ready to Meet Someone?</CardTitle>
              <p className="text-gray-400">
                Get paired with another night owl for video chat
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {status === 'idle' && (
                <div className="space-y-4">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Your Username</span>
                      <Badge variant="secondary">{username}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      This is how others will see you during the chat
                    </p>
                  </div>
                  
                  <Button 
                    onClick={startRandomPairing}
                    disabled={!isConnected}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 py-3"
                  >
                    <Shuffle className="w-5 h-5 mr-2" />
                    Find Random Partner
                  </Button>
                  
                  {!isConnected && (
                    <p className="text-sm text-yellow-400 text-center">
                      Connecting to server...
                    </p>
                  )}
                </div>
              )}

              {status === 'waiting' && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Shuffle className="w-8 h-8 text-orange-400 animate-pulse" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Looking for a partner...</h3>
                    <p className="text-gray-400 mb-2">
                      Waiting time: {Math.floor(waitingTime / 60)}:{(waitingTime % 60).toString().padStart(2, '0')}
                    </p>
                    <p className="text-sm text-gray-500">
                      We're finding someone interesting for you to chat with
                    </p>
                  </div>

                  <Button 
                    onClick={stopWaiting}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel Search
                  </Button>
                </div>
              )}

              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/30">
                <h4 className="font-semibold text-blue-200 mb-2">Safety Tips</h4>
                <ul className="text-xs text-blue-300 space-y-1">
                  <li>• Don't share personal information</li>
                  <li>• Be respectful to your chat partner</li>
                  <li>• You can leave anytime if uncomfortable</li>
                  <li>• Report inappropriate behavior</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connection Status */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-400">
              {isConnected ? 'Connected to server' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}