import { Track } from "@/lib/youtubePlayer";
import { playlists } from "./playlists";

// Convert existing playlists/stations to Track format
export const tracks: Track[] = playlists.flatMap((playlist) =>
    playlist.stations.map((station, index) => ({
        id: station.id,
        title: station.name,
        artist: playlist.name,
        url: station.streamUrl,
        mood: mapMoodToCategory(playlist.mood),
        // Use placeholder cover arts based on mood
        coverArt: getMoodCoverArt(playlist.mood),
    }))
);

// Helper to map playlist moods to selector IDs
function mapMoodToCategory(originalMood: string): string {
    const map: Record<string, string> = {
        'Focus': 'focus',
        'Relaxation': 'relax',
        'Peaceful': 'relax',
        'Contemplative': 'lonely',
        'Melancholic': 'deep-night',
        'Energetic': 'coding'
    };
    return map[originalMood] || 'focus'; // Default to focus
}

// Helper to get cover art based on mood
function getMoodCoverArt(mood: string): string | undefined {
    const coverMap: Record<string, string> = {
        'Focus': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        'Relaxation': 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=400&fit=crop',
        'Contemplative': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
        'Energetic': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
        'Peaceful': 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop',
        'Melancholic': 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=400&fit=crop',
    };
    return coverMap[mood];
}

// Helper to filter tracks by mood
export const getTracksByMood = (mood: string | null): Track[] => {
    if (!mood) return tracks;
    return tracks.filter((track) => track.mood.toLowerCase() === mood.toLowerCase());
};

// Export moods from playlists
export const moods = Array.from(new Set(playlists.map(p => p.mood)));
