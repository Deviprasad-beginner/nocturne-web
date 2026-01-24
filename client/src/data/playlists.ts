export interface Station {
    id: string;
    name: string;
    youtubeId: string;
}

export interface Playlist {
    id: string;
    name: string;
    description: string;
    mood: string;
    listeners: number;
    duration: string;
    tracks: number;
    color: string;
    stations: Station[];
}

export const playlists: Playlist[] = [
    {
        id: "midnight-study",
        name: "Midnight Study Beats",
        description: "Lo-fi hip hop for deep focus and concentration",
        mood: "Focus",
        listeners: 89,
        duration: "Live",
        tracks: 999,
        color: "from-blue-500 to-cyan-600",
        stations: [
            { id: "lofi-girl", name: "Lofi Girl", youtubeId: "jfKfPfyJRdk" },
            { id: "chillhop", name: "Chillhop Raccoon", youtubeId: "5yx6BWlEVcY" },
            { id: "steezy", name: "STEEZYASFUCK", youtubeId: "TURbeWK2wwg" },
            { id: "lofi-sleep", name: "Lofi Sleep / Rain", youtubeId: "DWcJFNfaw9c" },
            { id: "college-music", name: "College Music", youtubeId: "MCkTebktHVc" }
        ]
    },
    {
        id: "nocturne-ambient",
        name: "Nocturne Ambient",
        description: "Rain sounds mixed with gentle piano melodies",
        mood: "Relaxation",
        listeners: 67,
        duration: "Live",
        tracks: 18,
        color: "from-purple-500 to-indigo-600",
        stations: [
            { id: "space-ambient", name: "Space Ambient", youtubeId: "S4fyD158KqU" },
            { id: "rain-sounds", name: "Thunderstorm & Rain", youtubeId: "mPZkdNFkNps" },
            { id: "yellow-brick", name: "Healing/Sleep Music", youtubeId: "1ZYbU82GVz4" },
            { id: "dreamy-vibes", name: "Dreamy Vibes", youtubeId: "77ZtG628qQo" }
        ]
    },
    {
        id: "night-jazz",
        name: "After Hours Jazz",
        description: "Smooth jazz for late night contemplation",
        mood: "Contemplative",
        listeners: 34,
        duration: "Live",
        tracks: 56,
        color: "from-amber-500 to-orange-600",
        stations: [
            { id: "relaxing-jazz", name: "Relaxing Jazz Radio", youtubeId: "Dx5qFacha3o" },
            { id: "coffee-jazz", name: "Coffee Shop Jazz", youtubeId: "-5KAN9_CzSA" },
            { id: "jazz-cafe", name: "Jazz Cafe", youtubeId: "6uddGul0oAc" },
            { id: "night-jazz-bgm", name: "Night Jazz BGM", youtubeId: "21r7L8D8idI" }
        ]
    },
    {
        id: "synthwave-dreams",
        name: "Synthwave Dreams",
        description: "80s inspired electronic sounds for night drives",
        mood: "Energetic",
        listeners: 123,
        duration: "Live",
        tracks: 38,
        color: "from-pink-500 to-purple-600",
        stations: [
            { id: "synthwave-radio", name: "Synthwave Radio", youtubeId: "4xDzrJKXOOY" },
            { id: "retrowave", name: "Retrowave / Outrun", youtubeId: "Jv_C529-5R0" },
            { id: "night-drive", name: "Night Drive", youtubeId: "02q9pX2L4e0" }
        ]
    },
    {
        id: "classical-night",
        name: "Classical Nighttime",
        description: "Peaceful classical compositions for reflection",
        mood: "Peaceful",
        listeners: 45,
        duration: "Live",
        tracks: 74,
        color: "from-green-500 to-teal-600",
        stations: [
            { id: "classical-radio", name: "Classical Radio", youtubeId: "4tC77iFqZpY" },
            { id: "mozart", name: "Mozart Radio", youtubeId: "Rb0UmZRQX4I" },
            { id: "baroque", name: "Baroque Music", youtubeId: "2gOhtS1a9nc" }
        ]
    },
    {
        id: "indie-melancholy",
        name: "Indie Melancholy",
        description: "Introspective indie tracks for deep thoughts",
        mood: "Melancholic",
        listeners: 78,
        duration: "Live",
        tracks: 47,
        color: "from-gray-500 to-slate-600",
        stations: [
            { id: "indie-radio", name: "Indie / Chill / Pop", youtubeId: "BiZG8d92tqA" },
            { id: "bedroom-pop", name: "Bedroom Pop", youtubeId: "0TvWJZ3k3Ls" },
            { id: "nice-guys", name: "Nice Guys Chill", youtubeId: "oViO2q2k18g" }
        ]
    }
];
