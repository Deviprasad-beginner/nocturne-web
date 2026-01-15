import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MessageSquare, Users, Heart, Reply } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface Conversation {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string;
  replies: number;
  likes: number;
  createdAt: string;
}

interface ConversationReply {
  id: number;
  conversationId: number;
  content: string;
  author: string;
  createdAt: string;
}

export default function NightConversations() {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [author, setAuthor] = useState("");

  // Mock data for now - in real app this would come from API
  const conversations: Conversation[] = [
    {
      id: 1,
      title: "Late Night Philosophy",
      content: "Do you ever wonder what dreams really mean? I've been having the most vivid dreams lately and can't shake the feeling they're trying to tell me something...",
      category: "philosophy",
      author: "DreamSeeker",
      replies: 12,
      likes: 24,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: "Night Shift Workers Unite",
      content: "Anyone else working the graveyard shift tonight? Let's chat and keep each other company. What's keeping you awake?",
      category: "community",
      author: "NightShiftNurse",
      replies: 8,
      likes: 15,
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      title: "3AM Thoughts on Creativity",
      content: "Why do the best ideas always come at 3AM? I swear my brain is most creative when the rest of the world is sleeping...",
      category: "creativity",
      author: "InsomniacArtist",
      replies: 19,
      likes: 31,
      createdAt: new Date().toISOString()
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim() && author.trim()) {
      // In real app, this would be a mutation
      console.log("Creating conversation:", { title, content, category, author });
      setTitle("");
      setContent("");
      setAuthor("");
      setIsCreating(false);
    }
  };

  const handleLike = (id: number) => {
    console.log("Liking conversation:", id);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: "from-blue-500 to-blue-600",
      philosophy: "from-purple-500 to-purple-600",
      community: "from-green-500 to-green-600",
      creativity: "from-orange-500 to-orange-600",
      support: "from-pink-500 to-pink-600"
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "philosophy": return "🤔";
      case "community": return "👥";
      case "creativity": return "🎨";
      case "support": return "💫";
      default: return "💬";
    }
  };

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
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-3xl font-bold">Night Conversations</h1>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full sm:w-auto"
          >
            {isCreating ? "Cancel" : "Start Conversation"}
          </Button>
        </div>

        <div className="mb-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700/50">
          <p className="text-sm text-blue-200">
            <span className="font-medium">Asynchronous Thought Exchange:</span> Multi-threaded discussion architecture for complex idea development. 
            Categorized discourse channels with engagement analytics to foster meaningful intellectual community formation.
          </p>
        </div>

        {/* Create Form */}
        {isCreating && (
          <Card className="mb-8 bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl">Start a New Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="author">Your Name</Label>
                    <Input
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Night owl username"
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">💬 General</SelectItem>
                        <SelectItem value="philosophy">🤔 Philosophy</SelectItem>
                        <SelectItem value="community">👥 Community</SelectItem>
                        <SelectItem value="creativity">🎨 Creativity</SelectItem>
                        <SelectItem value="support">💫 Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="title">Conversation Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's on your mind tonight?"
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Your Thoughts</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your late-night musings..."
                    rows={4}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!title.trim() || !content.trim() || !author.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full sm:w-auto"
                >
                  Start Conversation
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Conversations List */}
        <div className="grid grid-cols-1 gap-6">
          {conversations.map((conversation) => (
            <Card key={conversation.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getCategoryIcon(conversation.category)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(conversation.category)} text-white`}>
                        {conversation.category}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">{conversation.title}</h3>
                    <p className="text-gray-300 leading-relaxed mb-3">{conversation.content}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span>by {conversation.author}</span>
                      <span>•</span>
                      <span>{new Date(conversation.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Reply className="w-4 h-4" />
                      <span>{conversation.replies} replies</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{conversation.likes} likes</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(conversation.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Like
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Reply className="w-4 h-4 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}