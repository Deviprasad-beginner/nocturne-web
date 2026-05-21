import { storage } from "../storage";
import memoize from 'memoizee';
import { logger } from "../utils/logger";

/**
 * Music Service - Handles music search and favorites with caching using Jamendo API v3.0
 */
export class MusicService {
    // Cache music searches for 15 minutes to reduce external API calls
    private searchMusicCached = memoize(
        async (query: string) => {
            const clientId = process.env.JAMENDO_CLIENT_ID || '0d325310';
            logger.debug(`[MusicService] Searching Jamendo for: ${query}`);
            
            // Try fetching by tags first for higher quality ambient matches (e.g. nature, ambient)
            let url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=50&tags=${encodeURIComponent(query)}&boost=downloads_month`;
            let response = await fetch(url);
            let data = await response.json();
            let tracks = data.results || [];
            
            // Fallback: If tag search yields nothing, do a text-based search
            if (tracks.length === 0) {
                logger.debug(`[MusicService] No tag matches for "${query}". Falling back to text search...`);
                url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=50&search=${encodeURIComponent(query)}&boost=downloads_month`;
                response = await fetch(url);
                data = await response.json();
                tracks = data.results || [];
            }
            
            if (tracks.length === 0) {
                throw new Error("No tracks found on Jamendo for these tags");
            }
            
            return tracks.map((track: any) => ({
                id: track.id,
                title: track.name,
                artist: track.artist_name || "Unknown Artist",
                url: track.audio,
                coverArt: track.album_image || track.image || null,
                mood: 'dynamic'
            }));
        },
        {
            maxAge: 1000 * 60 * 15, // 15 min cache
            promise: true,
            length: 1 // Cache based on query only
        }
    );

    async searchMusic(query: string) {
        if (!query || typeof query !== 'string') {
            throw new Error('Query parameter is required');
        }
        try {
            return await this.searchMusicCached(query);
        } catch (error) {
            // Invalidate cache entry on failure so next request retries fresh
            this.searchMusicCached.delete(query);
            logger.warn(`[MusicService] Search failed for "${query}", cache entry cleared`);
            return [];
        }
    }

    async toggleFavorite(userId: number, stationId: string) {
        logger.info(`Toggling favorite station for user: ${userId}`, { stationId });
        return await storage.toggleSavedStation(userId, stationId);
    }

    async getFavorites(userId: number) {
        logger.debug(`Fetching favorite stations for user: ${userId}`);
        return await storage.getSavedStations(userId);
    }
}

// Singleton instance
export const musicService = new MusicService();
