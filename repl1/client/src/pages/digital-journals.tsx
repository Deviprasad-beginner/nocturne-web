import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, BookOpen, Star, Calendar, Palette, Lock, Globe } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  mood: string;
  category: string;
  isPrivate: boolean;
  favorited: boolean;
  author: string;
  createdAt: string;
  weather?: string;
}

export default function DigitalJournals() {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("neutral");
  const [category, setCategory] = useState("personal");
  const [isPrivate, setIsPrivate] = useState(true);
  const [author, setAuthor] = useState("");
  const [filter, setFilter] = useState("all");

  // Mock data for journal entries
  const journalEntries: JournalEntry[] = [
    {
      id: 1,
      title: "Midnight Reflections",
      content: "Tonight I found myself thinking about the paths we choose and the ones we don't. There's something profound about the quiet hours that makes everything seem more clear, more honest. The world feels different at 2 AM - like all the pretenses have been stripped away and what's left is just raw, authentic existence...",
      mood: "contemplative",
      category: "personal",
      isPrivate: false,
      favorited: true,
      author: "NightThinker",
      createdAt: new Date().toISOString(),
      weather: "Clear night"
    },
    {
      id: 2,
      title: "Creative Breakthrough",
      content: "Had an amazing breakthrough on my art project tonight! Sometimes the best ideas come when the world is sleeping. There's something about the silence that lets creativity flow freely...",
      mood: "excited",
      category: "creative",
      isPrivate: false,
      favorited: false,
      author: "ArtistSoul",
      createdAt: new Date().toISOString(),
      weather: "Rainy"
    },
    {
      id: 3,
      title: "Gratitude Practice",
      content: "Taking a moment to appreciate the small things: the sound of rain against my window, a warm cup of tea, the comfort of my favorite blanket. Sometimes happiness is found in the simplest moments.",
      mood: "grateful",
      category: "wellness",
      isPrivate: true,
      favorited: true,
      author: "GratefulHeart",
      createdAt: new Date().toISOString(),
      weather: "Rainy"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim() && author.trim()) {
      console.log("Creating journal entry:", { title, content, mood, category, isPrivate, author });
      setTitle("");
      setContent("");
      setAuthor("");
      setIsCreating(false);
    }
  };

  const handleFavorite = (id: number) => {
    console.log("Toggling favorite for entry:", id);
  };

  const getMoodColor = (mood: string) => {
    const colors = {
      happy: "from-yellow-400 to-orange-400",
      sad: "from-blue-400 to-blue-600",
      excited: "from-pink-400 to-red-500",
      calm: "from-green-400 to-teal-500",
      anxious: "from-purple-400 to-purple-600",
      grateful: "from-emerald-400 to-green-500",
      contemplative: "from-indigo-400 to-purple-500",
      neutral: "from-gray-400 to-gray-500"
    };
    return colors[mood as keyof typeof colors] || colors.neutral;
  };

  const getMoodEmoji = (mood: string) => {
    const emojis = {
      happy: "😊",
      sad: "😢",
      excited: "🎉",
      calm: "😌",
      anxious: "😰",
      grateful: "🙏",
      contemplative: "🤔",
      neutral: "😐"
    };
    return emojis[mood as keyof typeof emojis] || "😐";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "personal": return <BookOpen className="w-4 h-4" />;
      case "creative": return <Palette className="w-4 h-4" />;
      case "wellness": return <Star className="w-4 h-4" />;
      case "travel": return <Calendar className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const filteredEntries = journalEntries.filter(entry => {
    if (filter === "all") return true;
    if (filter === "private") return entry.isPrivate;
    if (filter === "public") return !entry.isPrivate;
    if (filter === "favorites") return entry.favorited;
    return entry.category === filter;
  });

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
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-3xl font-bold">Digital Journals</h1>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 w-full sm:w-auto"
          >
            {isCreating ? "Cancel" : "New Entry"}
          </Button>
        </div>

        <div className="mb-6 p-4 bg-amber-900/30 rounded-lg border border-amber-700/50">
          <p className="text-sm text-amber-200">
            <span className="font-medium">Biometric Memory Codex:</span> Advanced personal data archival system with emotional state monitoring. 
            Integrated sentiment analysis, privacy tokenization, and temporal clustering for comprehensive psychological documentation.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {["all", "private", "public", "favorites", "personal", "creative", "wellness"].map((filterOption) => (
              <Button
                key={filterOption}
                variant={filter === filterOption ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterOption)}
                className={filter === filterOption 
                  ? "bg-amber-600 hover:bg-amber-700" 
                  : "border-gray-600 text-gray-300 hover:bg-gray-700"
                }
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Create Form */}
        {isCreating && (
          <Card className="mb-8 bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl">New Journal Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="author">Author Name</Label>
                    <Input
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Your pen name"
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Entry Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What's this entry about?"
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="mood">Current Mood</Label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="happy">😊 Happy</SelectItem>
                        <SelectItem value="sad">😢 Sad</SelectItem>
                        <SelectItem value="excited">🎉 Excited</SelectItem>
                        <SelectItem value="calm">😌 Calm</SelectItem>
                        <SelectItem value="anxious">😰 Anxious</SelectItem>
                        <SelectItem value="grateful">🙏 Grateful</SelectItem>
                        <SelectItem value="contemplative">🤔 Contemplative</SelectItem>
                        <SelectItem value="neutral">😐 Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">📔 Personal</SelectItem>
                        <SelectItem value="creative">🎨 Creative</SelectItem>
                        <SelectItem value="wellness">💫 Wellness</SelectItem>
                        <SelectItem value="travel">✈️ Travel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="private"
                      checked={isPrivate}
                      onCheckedChange={setIsPrivate}
                    />
                    <Label htmlFor="private" className="flex items-center space-x-2">
                      {isPrivate ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                      <span>{isPrivate ? "Private" : "Public"}</span>
                    </Label>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="content">Your Thoughts</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Pour your heart onto the digital page..."
                    rows={6}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={!title.trim() || !content.trim() || !author.trim()}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 w-full sm:w-auto"
                >
                  Save Entry
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Journal Entries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getMoodColor(entry.mood)} text-white flex items-center space-x-1`}>
                        <span>{getMoodEmoji(entry.mood)}</span>
                        <span>{entry.mood}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-400">
                        {getCategoryIcon(entry.category)}
                        <span className="text-xs">{entry.category}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">{entry.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFavorite(entry.id)}
                      className={`${entry.favorited ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-400`}
                    >
                      <Star className={`w-4 h-4 ${entry.favorited ? 'fill-current' : ''}`} />
                    </Button>
                    {entry.isPrivate ? 
                      <Lock className="w-4 h-4 text-gray-400" /> : 
                      <Globe className="w-4 h-4 text-gray-400" />
                    }
                  </div>
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-4 line-clamp-3">
                  {entry.content}
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>by {entry.author}</span>
                    <span>•</span>
                    <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                    {entry.weather && (
                      <>
                        <span>•</span>
                        <span>{entry.weather}</span>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 w-full sm:w-auto"
                  >
                    Read More
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