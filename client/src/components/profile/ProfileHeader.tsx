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
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl mb-6 p-6">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <Avatar className="w-32 h-32">
                            <AvatarImage src={user.profileImageUrl || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
                                {user.displayName?.charAt(0) || user.username.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <Button
                            onClick={onAvatarUpload}
                            size="sm"
                            className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 bg-purple-600 hover:bg-purple-700"
                        >
                            <Camera className="h-4 w-4" />
                        </Button>
                    </div>
                    <Badge className={`${getRarityColor(stats.level)} text-white`}>
                        Level {stats.level} Night Owl
                    </Badge>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white">{user.displayName || user.username}</h1>
                            <p className="text-gray-400">@{user.username}</p>
                        </div>
                        <Button
                            onClick={onEditToggle}
                            variant="outline"
                            className="border-slate-600 text-white hover:bg-slate-700"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            {isEditing ? "Cancel" : "Edit Profile"}
                        </Button>
                    </div>

                    <p className="text-gray-300">
                        {/* Bio would go here if we add it to the schema, for now placeholding or using a default */}
                        "A fellow insomniac exploring the depths of midnight thoughts."
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Active: {user.lastActiveTime ? format(new Date(user.lastActiveTime), "h:mm a") : "Late Night"}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Joined {user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Unknown"}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Trust Score Display */}
                            <span className="text-purple-400 font-semibold">Trust Score: {user.trustScore}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
