import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Music, Coffee, Heart, MessageSquare } from "lucide-react";
import { Whisper, MidnightCafe } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";

interface ContentTabsProps {
    whispers?: Whisper[];
    cafePosts?: MidnightCafe[];
    savedStations?: string[];
    whispersLoading: boolean;
    cafeLoading: boolean;
    stationsLoading: boolean;
    achievements: any[]; // Using any for now to simplify, ideally shared interface
}

export default function ContentTabs({
    whispers,
    cafePosts,
    savedStations,
    whispersLoading,
    cafeLoading,
    stationsLoading,
    achievements,
}: ContentTabsProps) {

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case "common": return "bg-gray-600";
            case "rare": return "bg-blue-600";
            case "epic": return "bg-purple-600";
            case "legendary": return "bg-yellow-600";
            default: return "bg-gray-600";
        }
    };

    return (
        <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border-slate-700">
                <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">Overview</TabsTrigger>
                <TabsTrigger value="music" className="data-[state=active]:bg-purple-600">Music</TabsTrigger>
                <TabsTrigger value="whispers" className="data-[state=active]:bg-purple-600">Whispers</TabsTrigger>
                <TabsTrigger value="cafe" className="data-[state=active]:bg-purple-600">Cafe</TabsTrigger>
                <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-600">Awards</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center text-gray-400">
                    <p>Welcome to your profile overview. Select a tab to view specific content.</p>
                </div>
            </TabsContent>

            <TabsContent value="music" className="mt-6 space-y-4">
                {stationsLoading ? (
                    <div className="text-center p-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" /></div>
                ) : savedStations && savedStations.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {savedStations.map((stationId) => (
                            <div key={stationId} className="p-4 rounded-xl bg-gray-800/40 border border-gray-700 flex items-center justify-between group hover:border-purple-500 transition-colors">
                                <span className="font-medium capitalize text-gray-200 group-hover:text-purple-400">{stationId.replace(/-/g, ' ')}</span>
                                <Music className="w-5 h-5 text-purple-500" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-12 text-gray-500 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
                        <Music className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No saved stations yet.</p>
                        <Link href="/music-mood">
                            <Button variant="link" className="text-purple-400 mt-2">Discover Music</Button>
                        </Link>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="whispers" className="mt-6 space-y-4">
                {whispersLoading ? (
                    <div className="text-center p-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" /></div>
                ) : whispers && whispers.length > 0 ? (
                    whispers.map((whisper) => (
                        <Card key={whisper.id} className="bg-gray-800/30 border-gray-700">
                            <CardContent className="p-4">
                                <p className="text-gray-300 italic mb-2">"{whisper.content}"</p>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{format(new Date(whisper.createdAt || ''), 'PP p')}</span>
                                    <div className="flex gap-4">
                                        {/* Display Emotion Tag if available */}
                                        {whisper.detectedEmotion && (
                                            <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400 capitalize">
                                                {whisper.detectedEmotion}
                                            </Badge>
                                        )}
                                        <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-pink-500" /> {whisper.hearts}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center p-12 text-gray-500 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>You haven't told any secrets to the night yet.</p>
                        <Link href="/whispers">
                            <Button variant="link" className="text-purple-400 mt-2">Share a Whisper</Button>
                        </Link>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="cafe" className="mt-6 space-y-4">
                {cafeLoading ? (
                    <div className="text-center p-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" /></div>
                ) : cafePosts && cafePosts.length > 0 ? (
                    cafePosts.map((post) => (
                        <Card key={post.id} className="bg-gray-800/30 border-gray-700">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base text-amber-200/80">{post.topic}</CardTitle>
                                    <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500">{post.category}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-gray-300 mb-2">{post.content}</p>
                                <div className="flex justify-between text-xs text-gray-500 mt-3">
                                    <span>{format(new Date(post.createdAt || ''), 'PP p')}</span>
                                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-blue-400" /> {post.replies} Replies</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center p-12 text-gray-500 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
                        <Coffee className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>The cafe is quiet. Start a conversation.</p>
                        <Link href="/midnight-cafe">
                            <Button variant="link" className="text-amber-400 mt-2">Enter Cafe</Button>
                        </Link>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white">Achievements</CardTitle>
                        <CardDescription className="text-gray-400">Your accomplishments and milestones</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {achievements.map((achievement) => (
                                <div key={achievement.id} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg border-l-4 border-purple-500">
                                    <div className="text-3xl">{achievement.icon}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-white font-semibold">{achievement.title}</h3>
                                            <Badge className={getRarityColor(achievement.rarity)}>
                                                {achievement.rarity}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-2">{achievement.description}</p>
                                        <p className="text-xs text-gray-500">
                                            Unlocked {achievement.unlockedAt.toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
