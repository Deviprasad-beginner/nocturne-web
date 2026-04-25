import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { MindMaze, InsertMindMaze } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Brain, MessageSquare, Lightbulb, Puzzle } from "lucide-react";

export default function MindMazePage() {
  const [isCreating, setIsCreating] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState<"puzzle" | "philosophy">("philosophy");

  const { data: mindMaze = [], isLoading } = useQuery<MindMaze[]>({
    queryKey: ['/api/mindMaze'],
  });

  const createMindMazeMutation = useMutation({
    mutationFn: async (newMindMaze: InsertMindMaze) => {
      const response = await fetch('/api/mindMaze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMindMaze),
      });
      if (!response.ok) throw new Error('Failed to create mind maze');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mindMaze'] });
      setContent("");
      setType("philosophy");
      setIsCreating(false);
    },
  });

  const respondMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/mindMaze/${id}/responses`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to respond');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mindMaze'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createMindMazeMutation.mutate({
        content: content.trim(),
        type
      });
    }
  };

  const handleRespond = (id: number) => {
    respondMutation.mutate(id);
  };

  const philosophyItems = mindMaze.filter(item => item.type === 'philosophy');
  const puzzleItems = mindMaze.filter(item => item.type === 'puzzle');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Mind Maze</h1>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
          >
            {isCreating ? "Cancel" : "Add Challenge"}
          </Button>
        </div>

        <div className="mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-700/50">
          <p className="text-sm text-purple-200">
            <span className="font-medium">Cognitive Labyrinth Engine:</span> Advanced philosophical reasoning challenges designed to stimulate 
            neural plasticity during peak nocturnal brain activity. Engage higher-order thinking protocols and expand consciousness parameters.
          </p>
        </div>

        {/* Create Form */}
        {isCreating && (
          <Card className="mb-8 bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl">Create Mind Challenge</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="type">Challenge Type</Label>
                  <Select value={type} onValueChange={(value: "puzzle" | "philosophy") => setType(value)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="philosophy">Philosophy Discussion</SelectItem>
                      <SelectItem value="puzzle">Logic Puzzle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content">
                    {type === 'puzzle' ? 'Puzzle Description' : 'Philosophical Question'}
                  </Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={type === 'puzzle' 
                      ? "Describe your logic puzzle or brain teaser..." 
                      : "Pose a thought-provoking philosophical question..."
                    }
                    rows={4}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!content.trim() || createMindMazeMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                >
                  {createMindMazeMutation.isPending ? "Creating..." : "Create Challenge"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Philosophy Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Lightbulb className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Philosophy Corner</h2>
              <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                {philosophyItems.length} discussions
              </span>
            </div>
            
            <div className="space-y-4">
              {philosophyItems.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No philosophical questions yet</p>
                  <p className="text-sm">Start a deep discussion!</p>
                </div>
              ) : (
                philosophyItems.map((item) => (
                  <Card key={item.id} className="bg-purple-900/20 border-purple-700/50 hover:bg-purple-900/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Lightbulb className="w-5 h-5 text-purple-400" />
                          <span className="text-sm font-medium text-purple-300">Philosophy</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                      <p className="text-gray-200 leading-relaxed mb-4">{item.content}</p>
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRespond(item.id)}
                          disabled={respondMutation.isPending}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {item.responses || 0} responses
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Puzzle Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Puzzle className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold">Logic Puzzles</h2>
              <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">
                {puzzleItems.length} puzzles
              </span>
            </div>
            
            <div className="space-y-4">
              {puzzleItems.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <Puzzle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No puzzles yet</p>
                  <p className="text-sm">Share a brain teaser!</p>
                </div>
              ) : (
                puzzleItems.map((item) => (
                  <Card key={item.id} className="bg-green-900/20 border-green-700/50 hover:bg-green-900/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Puzzle className="w-5 h-5 text-green-400" />
                          <span className="text-sm font-medium text-green-300">Logic Puzzle</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                      <p className="text-gray-200 leading-relaxed mb-4">{item.content}</p>
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRespond(item.id)}
                          disabled={respondMutation.isPending}
                          className="text-green-400 hover:text-green-300"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {item.responses || 0} solutions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}