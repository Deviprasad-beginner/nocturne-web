export interface Station {
    id: string;
    name: string;
    streamUrl: string;
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
        name: "Midnight Study Beats (SoundCloud)",
        description: "Lo-fi hip hop for deep focus - Powered by SoundCloud",
        mood: "Focus",
        listeners: 89,
        duration: "Live",
        tracks: 999,
        color: "from-slate-600 to-slate-700",
        stations: [
            { id: "lofi-girl", name: "Lofi Girl Radio", streamUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk" },
            { id: "chillhop", name: "Chillhop Raccoon", streamUrl: "https://www.youtube.com/watch?v=5yx6BWlEVcY" },
            { id: "coffee-shop", name: "Coffee Shop Vibes", streamUrl: "https://www.youtube.com/watch?v=lP26UCnoHg4" },
            { id: "synth-focus", name: "Synthwave Focus", streamUrl: "https://www.youtube.com/watch?v=4xDzrJKXOOY" },
            { id: "deep-focus", name: "Deep Focus", streamUrl: "https://www.youtube.com/watch?v=8XzxWhk3Wgs" }
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
        color: "from-slate-600 to-slate-700",
        stations: [
            { id: "space-ambient", name: "Space Ambient", streamUrl: "https://www.youtube.com/watch?v=S4fyD158KqU" },
            { id: "rain-sounds", name: "Thunderstorm & Rain", streamUrl: "https://www.youtube.com/watch?v=mPZkdNFkNps" },
            { id: "yellow-brick", name: "Healing/Sleep Music", streamUrl: "https://www.youtube.com/watch?v=1ZYbU82GVz4" },
            { id: "dreamy-vibes", name: "Dreamy Vibes", streamUrl: "https://www.youtube.com/watch?v=77ZtG628qQo" }
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
        color: "from-slate-600 to-slate-700",
        stations: [
            { id: "relaxing-jazz", name: "Relaxing Jazz Radio", streamUrl: "https://www.youtube.com/watch?v=Dx5qFacha3o" },
            { id: "coffee-jazz", name: "Coffee Shop Jazz", streamUrl: "https://www.youtube.com/watch?v=-5KAN9_CzSA" },
            { id: "jazz-cafe", name: "Jazz Cafe", streamUrl: "https://www.youtube.com/watch?v=6uddGul0oAc" },
            { id: "night-jazz-bgm", name: "Night Jazz BGM", streamUrl: "https://www.youtube.com/watch?v=21r7L8D8idI" }
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
        color: "from-slate-600 to-slate-700",
        stations: [
            { id: "synthwave-radio", name: "Synthwave Radio", streamUrl: "https://www.youtube.com/watch?v=4xDzrJKXOOY" },
            { id: "retrowave", name: "Retrowave / Outrun", streamUrl: "https://www.youtube.com/watch?v=Jv_C529-5R0" },
            { id: "night-drive", name: "Night Drive", streamUrl: "https://www.youtube.com/watch?v=02q9pX2L4e0" }
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
        color: "from-slate-600 to-slate-700",
        stations: [
            { id: "classical-radio", name: "Classical Radio", streamUrl: "https://www.youtube.com/watch?v=4tC77iFqZpY" },
            { id: "mozart", name: "Mozart Radio", streamUrl: "https://www.youtube.com/watch?v=Rb0UmZRQX4I" },
            { id: "baroque", name: "Baroque Music", streamUrl: "https://www.youtube.com/watch?v=2gOhtS1a9nc" }
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
        color: "from-slate-600 to-slate-700",
        stations: [
            { id: "indie-radio", name: "Indie / Chill / Pop", streamUrl: "https://www.youtube.com/watch?v=BiZG8d92tqA" },
            { id: "bedroom-pop", name: "Bedroom Pop", streamUrl: "https://www.youtube.com/watch?v=0TvWJZ3k3Ls" },
            { id: "nice-guys", name: "Nice Guys Chill", streamUrl: "https://www.youtube.com/watch?v=oViO2q2k18g" }
        ]
    }
];
