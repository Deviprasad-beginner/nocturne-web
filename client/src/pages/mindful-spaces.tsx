import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Brain, Sparkles, Clock, Play, Pause, Volume2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface MindfulSession {
  id: number;
  title: string;
  description: string;
  type: "meditation" | "breathing" | "gratitude" | "reflection";
  duration: number; // in minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  createdAt: string;
  completions: number;
}

interface UserSession {
  id: number;
  sessionId: number;
  duration: number;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export default function MindfulSpaces() {
  const [isCreating, setIsCreating] = useState(false);
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState([10]);

  // Mock mindful sessions data
  const mindfulSessions: MindfulSession[] = [
    {
      id: 1,
      title: "Night Sky Meditation",
      description: "A guided meditation focusing on the vastness of the night sky and finding peace in the darkness. Perfect for late-night reflection and calming the mind.",
      type: "meditation",
      duration: 15,
      difficulty: "beginner",
      createdAt: new Date().toISOString(),
      completions: 342
    },
    {
      id: 2,
      title: "4-7-8 Breathing Technique",
      description: "A powerful breathing exercise to reduce anxiety and promote sleep. Inhale for 4, hold for 7, exhale for 8. Ideal for winding down after a long day.",
      type: "breathing",
      duration: 8,
      difficulty: "beginner",
      createdAt: new Date().toISOString(),
      completions: 567
    },
    {
      id: 3,
      title: "Midnight Gratitude Practice",
      description: "Reflect on the day's blessings and cultivate appreciation. A gentle practice to end your day with positivity and peace.",
      type: "gratitude",
      duration: 12,
      difficulty: "beginner",
      createdAt: new Date().toISOString(),
      completions: 234
    },
    {
      id: 4,
      title: "Shadow Work Reflection",
      description: "Deep introspective practice for exploring hidden aspects of yourself. Advanced technique for personal growth and self-understanding.",
      type: "reflection",
      duration: 25,
      difficulty: "advanced",
      createdAt: new Date().toISOString(),
      completions: 89
    },
    {
      id: 5,
      title: "Progressive Muscle Relaxation",
      description: "Systematic tension and release of muscle groups to achieve deep physical and mental relaxation. Perfect for stress relief.",
      type: "meditation",
      duration: 20,
      difficulty: "intermediate",
      createdAt: new Date().toISOString(),
      completions: 198
    }
  ];

  const getTypeColor = (type: string) => {
    const colors = {
      meditation: "from-purple-500 to-purple-600",
      breathing: "from-blue-500 to-blue-600",
      gratitude: "from-green-500 to-green-600",
      reflection: "from-orange-500 to-orange-600"
    };
    return colors[type as keyof typeof colors] || colors.meditation;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "meditation": return "🧘";
      case "breathing": return "🫁";
      case "gratitude": return "🙏";
      case "reflection": return "💭";
      default: return "🧘";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-green-400";
      case "intermediate": return "text-yellow-400";
      case "advanced": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const startSession = (sessionId: number, duration: number) => {
    setActiveSession(sessionId);
    setSessionTimer(duration * 60); // Convert to seconds
    setIsTimerRunning(true);
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const stopSession = () => {
    setActiveSession(null);
    setSessionTimer(0);
    setIsTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect would go here in a real implementation
  // useEffect(() => {
  //   let interval: NodeJS.Timeout;
  //   if (isTimerRunning && sessionTimer > 0) {
  //     interval = setInterval(() => {
  //       setSessionTimer(timer => timer - 1);
  //     }, 1000);
  //   }
  //   return () => clearInterval(interval);
  // }, [isTimerRunning, sessionTimer]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-3xl font-bold">Mindful Spaces</h1>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 w-full sm:w-auto"
          >
            {isCreating ? "Cancel" : "Create Session"}
          </Button>
        </div>

        <div className="mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-700/50">
          <p className="text-sm text-purple-200">
            <span className="font-medium">Neuroplasticity Optimization Suite:</span> Evidence-based meditation protocols with biofeedback integration. 
            Calibrated breathing algorithms and guided mindfulness sequences designed to enhance cognitive resilience and emotional regulation.
          </p>
        </div>

        {/* Active Session Timer */}
        {activeSession && (
          <Card className="mb-8 bg-gradient-to-r from-purple-800/50 to-pink-800/50 border-purple-600">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-semibold mb-2">
                    {mindfulSessions.find(s => s.id === activeSession)?.title}
                  </h3>
                  <div className="text-3xl font-mono text-purple-200">
                    {formatTime(sessionTimer)}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={toggleTimer}
                    variant="outline"
                    size="lg"
                    className="border-purple-400 text-purple-200 hover:bg-purple-700/50"
                  >
                    {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button
                    onClick={stopSession}
                    variant="outline"
                    className="border-red-400 text-red-200 hover:bg-red-700/50"
                  >
                    End Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Custom Session Creator */}
        {isCreating && (
          <Card className="mb-8 bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl">Create Custom Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Session Duration: {selectedDuration[0]} minutes</Label>
                  <Slider
                    value={selectedDuration}
                    onValueChange={setSelectedDuration}
                    max={60}
                    min={3}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => startSession(0, selectedDuration[0])}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Free Session
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 flex-1"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Ambient Sounds
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {["meditation", "breathing", "gratitude", "reflection"].map((type) => (
            <Card key={type} className="bg-gray-800/30 border-gray-700 hover:bg-gray-800/50 transition-colors cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{getTypeIcon(type)}</div>
                <h3 className="text-sm font-medium capitalize">{type}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {mindfulSessions.filter(s => s.type === type).length} sessions
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mindfulSessions.map((session) => (
            <Card key={session.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getTypeIcon(session.type)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTypeColor(session.type)} text-white`}>
                        {session.type}
                      </span>
                      <span className={`text-xs font-medium ${getDifficultyColor(session.difficulty)}`}>
                        {session.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">{session.title}</h3>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{session.duration}min</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {session.description}
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{session.completions} completions</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => startSession(session.id, session.duration)}
                    disabled={activeSession !== null}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 w-full sm:w-auto"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}