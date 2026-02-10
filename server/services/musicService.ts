import { storage } from "../storage";
import { createRequire } from 'module';
import memoize from 'memoizee';

const require = createRequire(import.meta.url);
const soundcloud = require("soundcloud-scraper");
const client = new soundcloud.Client();

/**
 * Music Service - Handles music search and favorites with caching
 */
export class MusicService {
    // Cache music searches for 15 minutes to reduce external API calls
    private searchMusicCached = memoize(
        async (query: string) => {
            console.log(`[MusicService] Searching SoundCloud for: ${query}`);
            try {
                const results = await Promise.race([
                    client.search(query, "track"),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Search timeout')), 5000)
                    )
                ]);

                const tracks = (results as any[]) || [];
                return tracks.slice(0, 10).map((v: any) => ({
                    id: v.url,
                    name: v.name || v.title,
                    streamUrl: v.url,
                }));
            } catch (error) {
                console.error('[MusicService] Search failed:', error);
                // Return empty array instead of throwing to prevent 500 errors
                return [];
            }
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
        return await this.searchMusicCached(query);
    }

    async toggleFavorite(userId: number, stationId: string) {
        return await storage.toggleSavedStation(userId, stationId);
    }

    async getFavorites(userId: number) {
        return await storage.getSavedStations(userId);
    }
}

export const musicService = new MusicService();
