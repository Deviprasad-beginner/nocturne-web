import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Whisper, InsertWhisper } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MessageCircle, Heart } from "lucide-react";

export default function Whispers() {
  const [isCreating, setIsCreating] = useState(false);
  const [content, setContent] = useState("");

  const { data: whispers = [], isLoading } = useQuery<Whisper[]>({
    queryKey: ['/api/whispers'],
  });

  const createWhisperMutation = useMutation({
    mutationFn: async (newWhisper: InsertWhisper) => {
      console.log('Submitting whisper:', newWhisper);
      const response = await fetch('/api/whispers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWhisper),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Success result:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whispers'] });
      setContent("");
      setIsCreating(false);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    }
  });

  const likeWhisperMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('Liking whisper:', id);
      const response = await fetch(`/api/whispers/${id}/hearts`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Like success:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whispers'] });
    },
    onError: (error) => {
      console.error('Like error:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createWhisperMutation.mutate({
        content: content.trim()
      });
    }
  };

  const handleLike = (id: number) => {
    likeWhisperMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
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
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-3xl font-bold">Whispers</h1>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 w-full sm:w-auto"
          >
            {isCreating ? "Cancel" : "Share Whisper"}
          </Button>
        </div>

        <div className="mb-6 p-4 bg-indigo-900/30 rounded-lg border border-indigo-700/50">
          <p className="text-sm text-indigo-200">
            <span className="font-medium">Quantum Whisper Network:</span> Anonymous thought transmission system utilizing zero-knowledge cryptography. 
            Deploy unfiltered cognitive fragments into the collective subconscious with absolute identity protection.
          </p>
        </div>

        {/* Create Form */}
        {isCreating && (
          <Card className="mb-8 bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl">Share Anonymous Whisper</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What weighs on your mind tonight?"
                    rows={4}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!content.trim() || createWhisperMutation.isPending}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  {createWhisperMutation.isPending ? "Sharing..." : "Share Whisper"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Whispers List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-400 py-12">
              Loading whispers...
            </div>
          ) : whispers.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl mb-2">No whispers yet</p>
              <p>Be the first to share an anonymous thought!</p>
            </div>
          ) : (
            whispers.map((whisper) => (
              <Card key={whisper.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                <CardContent className="p-6">
                  <p className="text-gray-200 leading-relaxed mb-4">{whisper.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {new Date(whisper.createdAt).toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(whisper.id)}
                      disabled={likeWhisperMutation.isPending}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      {whisper.hearts || 0}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}