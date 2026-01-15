import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Diary, InsertDiary } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Notebook, Lock, Globe } from "lucide-react";

export default function Diaries() {
  const [isCreating, setIsCreating] = useState(false);
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const { data: diaries = [], isLoading } = useQuery<Diary[]>({
    queryKey: ['/api/diaries'],
  });

  const createDiaryMutation = useMutation({
    mutationFn: async (newDiary: InsertDiary) => {
      console.log('Submitting diary:', newDiary);
      const response = await fetch('/api/diaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDiary),
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
      queryClient.invalidateQueries({ queryKey: ['/api/diaries'] });
      setContent("");
      setAuthor("");
      setIsPrivate(false);
      setIsCreating(false);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && author.trim()) {
      createDiaryMutation.mutate({
        content: content.trim(),
        mood: "contemplative",
        isPublic: !isPrivate,
        authorId: author.trim() || null
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
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
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Notebook className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Night Diaries</h1>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
          >
            {isCreating ? "Cancel" : "Write Entry"}
          </Button>
        </div>

        <div className="mb-6 p-4 bg-yellow-900/30 rounded-lg border border-yellow-700/50">
          <p className="text-sm text-yellow-200">
            <span className="font-medium">Neural Archive Protocol:</span> Secure cognitive data storage for nocturnal consciousness patterns. 
            Advanced sentiment analysis and privacy encryption ensure your midnight reflections remain authentically preserved.
          </p>
        </div>

        {/* Create Form */}
        {isCreating && (
          <Card className="mb-8 bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl">New Diary Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="author">Your Name</Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="How would you like to be known?"
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Your Thoughts</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your midnight musings..."
                    rows={4}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="private"
                    checked={isPrivate}
                    onCheckedChange={setIsPrivate}
                  />
                  <Label htmlFor="private" className="flex items-center space-x-2">
                    {isPrivate ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    <span>{isPrivate ? "Private Entry" : "Public Entry"}</span>
                  </Label>
                </div>
                <Button 
                  type="submit" 
                  disabled={!content.trim() || !author.trim() || createDiaryMutation.isPending}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                >
                  {createDiaryMutation.isPending ? "Publishing..." : "Publish Entry"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Diaries List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center text-gray-400 py-12">
              Loading diary entries...
            </div>
          ) : diaries.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <Notebook className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl mb-2">No diary entries yet</p>
              <p>Be the first to share your midnight thoughts!</p>
            </div>
          ) : (
            diaries.map((diary) => (
              <Card key={diary.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {diary.authorId ? diary.authorId.charAt(0).toUpperCase() : "A"}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{diary.authorId || "Anonymous"}</p>
                        <p className="text-sm text-gray-400">
                          {diary.createdAt ? new Date(diary.createdAt).toLocaleString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400">
                      {!diary.isPublic ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                      <span className="text-xs">{!diary.isPublic ? "Private" : "Public"}</span>
                    </div>
                  </div>
                  <p className="text-gray-200 leading-relaxed">{diary.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}