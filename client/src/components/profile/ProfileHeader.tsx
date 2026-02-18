import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, MapPin, Link as LinkIcon, Calendar, Clock, Camera } from "lucide-react";
import { User } from "@shared/schema";
import { format } from "date-fns";

interface ProfileHeaderProps {
    user: User;
    stats: {
        level: number;
        xp: number;
        nextLevelXp: number;
    };
    isEditing: boolean;
    onEditToggle: () => void;
    onAvatarUpload: () => void;
}

export default function ProfileHeader({
    user,
    stats,
    isEditing,
    onEditToggle,
    onAvatarUpload
}: ProfileHeaderProps) {

    const getRarityColor = (level: number) => {
        if (level < 5) return "bg-gray-600";
        if (level < 10) return "bg-blue-600";
        if (level < 20) return "bg-purple-600";
        return "bg-yellow-600";
    };

    return (
        <div className="glass-panel rounded-2xl mb-8 p-8 relative overflow-hidden group">
            {/* Ambient background light */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] -z-10 group-hover:bg-purple-600/20 transition-colors duration-700" />

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Avatar Section */}
                <div className="relative group/avatar">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-50 group-hover/avatar:opacity-75 transition duration-500 animate-pulse-glow"></div>
                    <div className="relative">
                        <Avatar className="w-32 h-32 border-4 border-slate-900 shadow-2xl">
                            <AvatarImage src={user.profileImageUrl || ""} className="object-cover" />
                            <AvatarFallback className="bg-slate-800 text-white text-3xl font-bold">
                                {user.displayName?.charAt(0) || user.username.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <Button
                            onClick={onAvatarUpload}
                            size="icon"
                            className="absolute bottom-0 right-0 rounded-full w-10 h-10 bg-purple-600 hover:bg-purple-500 shadow-lg border-2 border-slate-900 transition-transform hover:scale-110"
                        >
                            <Camera className="h-4 w-4 text-white" />
                        </Button>
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <Badge className={`${getRarityColor(stats.level)} text-white border-none shadow-lg px-3 py-1 text-xs uppercase tracking-wide`}>
                            Level {stats.level} Night Owl
                        </Badge>
                    </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-5 text-center md:text-left w-full">
                    <div className="flex flex-col md:flex-row items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 tracking-tight">
                                {user.displayName || user.username}
                            </h1>
                            <p className="text-slate-400 font-medium text-lg">@{user.username}</p>
                        </div>
                        <Button
                            onClick={onEditToggle}
                            variant="outline"
                            className="glass-card text-white hover:text-purple-300 border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            {isEditing ? "Cancel" : "Edit Profile"}
                        </Button>
                    </div>

                    <p className="text-slate-300 leading-relaxed max-w-2xl italic text-lg/6 font-light">
                        {/* Bio would go here if we add it to the schema, for now placeholding or using a default */}
                        "A fellow insomniac exploring the depths of midnight thoughts."
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div className="glass-card p-3 rounded-xl flex items-center justify-center md:justify-start gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <Clock className="h-5 w-5 text-indigo-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Active</p>
                                <p className="text-sm font-medium text-slate-200">{user.lastActiveTime ? format(new Date(user.lastActiveTime), "h:mm a") : "Late Night"}</p>
                            </div>
                        </div>

                        <div className="glass-card p-3 rounded-xl flex items-center justify-center md:justify-start gap-3">
                            <div className="p-2 bg-pink-500/20 rounded-lg">
                                <Calendar className="h-5 w-5 text-pink-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Joined</p>
                                <p className="text-sm font-medium text-slate-200">{user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Unknown"}</p>
                            </div>
                        </div>

                        <div className="glass-card p-3 rounded-xl flex items-center justify-center md:justify-start gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <div className="h-5 w-5 flex items-center justify-center text-purple-400 font-bold">TS</div>
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-slate-500 uppercase tracking-wider">Trust Score</p>
                                <p className="text-sm font-bold text-purple-300">{user.trustScore}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
