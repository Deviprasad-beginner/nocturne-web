import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Play, Pause, Square, Timer, Star, Users, Trophy, Volume2, Heart, MessageSquare, Clock, Sparkles, Target, Award, Zap, Crown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { StarlitSpeaker, InsertStarlitSpeaker } from "@shared/schema";

export default function StarlitSpeakerPage() {
  const [speechText, setSpeechText] = useState("");
  const [topic, setTopic] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Query to fetch starlit speakers
  const { data: speakers = [] } = useQuery<StarlitSpeaker[]>({
    queryKey: ["/api/v1/speaker"],
  });

  // Mutation to create new speaker session
  const createSpeakerMutation = useMutation({
    mutationFn: (speakerData: InsertStarlitSpeaker) =>
      apiRequest("POST", "/api/v1/speaker", speakerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/speaker"] });
      setSpeechText("");
      setTopic("");
    },
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const topicOptions = [
    { value: "impromptu", label: "🎯 Impromptu Challenge", color: "bg-red-500/20 text-red-300 border-red-500/30", description: "Spontaneous speaking on random topics" },
    { value: "storytelling", label: "📚 Story Time", color: "bg-purple-500/20 text-purple-300 border-purple-500/30", description: "Share captivating stories and narratives" },
    { value: "debate", label: "⚖️ Devil's Advocate", color: "bg-orange-500/20 text-orange-300 border-orange-500/30", description: "Practice persuasive arguments" },
    { value: "presentation", label: "💼 Pitch Perfect", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", description: "Business presentations and pitches" },
    { value: "motivational", label: "🔥 Inspire & Ignite", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", description: "Motivational and inspirational talks" },
    { value: "technical", label: "🧠 Tech Talk", color: "bg-green-500/20 text-green-300 border-green-500/30", description: "Explain complex topics simply" },
    { value: "comedy", label: "😄 Comedy Corner", color: "bg-pink-500/20 text-pink-300 border-pink-500/30", description: "Humorous speeches and stand-up" },
    { value: "philosophical", label: "🤔 Deep Thoughts", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", description: "Philosophical discussions" }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = () => {
    if (!topic) return;

    setIsRecording(true);
    setRecordingTime(0);

    // Create a new speaker session
    createSpeakerMutation.mutate({
      roomName: `${getCategoryLabel(topic)} Session`,
      topic: topic,
      description: speechText || "Live speaking practice session",

      maxParticipants: 10,


    });
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const getRandomPrompt = () => {
    const prompts = [
      "Convince an alien why pizza is humanity's greatest invention",
      "Explain why socks disappearing in the laundry is a conspiracy",
      "Pitch a time machine rental business",
      "Describe your superhero alter ego's origin story",
      "Argue why midnight snacks are a fundamental human right",
      "Explain the internet to someone from the 1800s",
      "Pitch a reality show about introverts",
      "Describe your ideal world in 2050"
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  const getCategoryColor = (cat: string) => {
    return topicOptions.find(opt => opt.value === cat)?.color || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  const getCategoryLabel = (cat: string) => {
    return topicOptions.find(opt => opt.value === cat)?.label || cat;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse"></div>
        <div className="absolute top-60 right-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="relative">
              <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30">
                <Mic className="w-8 h-8 text-purple-400" />
              </div>
              <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                LIVE
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Starlit Speaker
              </h1>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {currentTime.toLocaleTimeString()} ✨ Your anonymous stage awaits
                </span>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-gray-300 mb-4">
              Practice public speaking in the safety of anonymity. No judgment, just growth under the starlit digital sky.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center space-x-2 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300">Anonymous Practice</span>
              </div>
              <div className="flex items-center space-x-2 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                <Star className="w-4 h-4 text-pink-400" />
                <span className="text-pink-300">Safe Space</span>
              </div>
              <div className="flex items-center space-x-2 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                <Trophy className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-300">Skill Building</span>
              </div>
            </div>
          </div>
        </div>

        {/* Practice Studio */}
        <Card className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-600 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Volume2 className="w-6 h-6 text-purple-400" />
                <span className="text-xl">Speaking Studio</span>
              </div>
              <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {getRandomPrompt()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topic Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-300">Choose your speaking challenge:</label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger className="bg-gray-700/50 border-gray-500 text-white h-12">
                  <SelectValue placeholder="What would you like to practice?" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {topicOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-base">{option.label}</span>
                        <span className="text-xs text-gray-400 ml-2">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Speech Preparation */}
            <div className="relative">
              <Textarea
                value={speechText}
                onChange={(e) => setSpeechText(e.target.value)}
                placeholder="Write down your key points, outline, or full speech here... Or just wing it! 🎤"
                rows={4}
                className="bg-gray-700/50 border-gray-500 text-white resize-none focus:border-purple-400 transition-colors text-lg leading-relaxed"
              />
            </div>

            {/* Recording Controls */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-center space-x-6">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!topic}
                  className={`${isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-purple-500 hover:bg-purple-600"
                    } text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  {isRecording ? (
                    <div className="flex items-center space-x-2">
                      <Square className="w-5 h-5" />
                      <span>Stop Recording</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Mic className="w-5 h-5" />
                      <span>Start Speaking</span>
                    </div>
                  )}
                </Button>

                <div className="flex items-center space-x-3">
                  <Timer className="w-5 h-5 text-gray-400" />
                  <span className="text-lg font-mono text-gray-300">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              </div>

              {isRecording && (
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-red-400">
                    <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Recording in progress... Speak with confidence!</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tips & Encouragement */}
            <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-700/30">
              <h4 className="font-medium text-purple-300 mb-2">💡 Speaking Tips:</h4>
              <ul className="text-sm text-purple-200 space-y-1">
                <li>• Take deep breaths and speak slowly</li>
                <li>• Make eye contact with your imaginary audience</li>
                <li>• Use gestures to emphasize your points</li>
                <li>• Practice makes progress, not perfection</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-300">847</div>
              <div className="text-sm text-gray-400">Active Speakers</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-500/10 to-cyan-500/10 border-pink-500/30">
            <CardContent className="p-6 text-center">
              <Mic className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-pink-300">2.1k</div>
              <div className="text-sm text-gray-400">Speeches Recorded</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-cyan-300">156</div>
              <div className="text-sm text-gray-400">Confidence Gained</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-300">4.8</div>
              <div className="text-sm text-gray-400">Average Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Practice Sessions */}
        <Card className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 border-gray-600 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Award className="w-6 h-6 text-purple-400" />
              <span className="text-xl">Recent Practice Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {speakers.slice(0, 3).map((session, index) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge className={getCategoryColor(session.topic)}>
                      {getCategoryLabel(session.topic)}
                    </Badge>
                    <div>
                      <h4 className="font-medium text-gray-200">{session.roomName}</h4>
                      <p className="text-sm text-gray-400">
                        Participants: {session.currentParticipants}/{session.maxParticipants}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 font-medium">{session.currentParticipants}</span>
                  </div>
                </div>
              ))}
              {speakers.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active speaking sessions yet.</p>
                  <p className="text-sm">Start recording to create your first session!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-purple-300 mb-4">
              Your Voice Matters
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Every great speaker started with fear. Take that first step in our anonymous, supportive environment.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 text-purple-300">
                <Target className="w-5 h-5" />
                <span>Build confidence</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-300">
                <Zap className="w-5 h-5" />
                <span>Practice safely</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-300">
                <Crown className="w-5 h-5" />
                <span>Find your voice</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}