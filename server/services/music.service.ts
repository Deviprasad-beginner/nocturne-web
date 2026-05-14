import { storage } from "../storage";
import memoize from 'memoizee';
import { logger } from "../utils/logger";
// v2 — cache poisoning fix applied, memoizee now rejects empty results

/**
 * Music Service - Handles music search and favorites with caching
 */
export class MusicService {
    // Cache music searches for 15 minutes to reduce external API calls
    private searchMusicCached = memoize(
        async (query: string) => {
            logger.debug(`[MusicService] Searching Audius for: ${query}`);
            
            // Use Audius decentralized API for fast streaming
            const url = `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=nocturne-web`;
            
            const response = await fetch(url);
            if (!response.ok) {
                logger.error(`Audius API returned ${response.status} ${response.statusText}`);
                throw new Error("Failed to fetch from Audius API");
            }
            
            const data = await response.json();
            const tracks = data.data || [];

            if (tracks.length === 0) {
                throw new Error("No tracks found on Audius for these tags");
            }

            return tracks.map((track: any) => ({
                id: track.id,
                title: track.title,
                artist: track.user?.name || "Unknown Artist",
                url: `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream?app_name=nocturne-web`,
                coverArt: track.artwork?.['480x480'] || track.artwork?.['150x150'] || null,
                mood: 'dynamic'
            }));
        },
        {
            maxAge: 1000 * 60 * 10, // 10 min cache
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
