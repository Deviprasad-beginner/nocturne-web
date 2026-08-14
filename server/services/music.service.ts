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

            // Therapy/ambient tags that benefit from fuzzytags param
            const therapyTags = new Set([
                'binaural', 'healing', 'meditation', 'relaxation', 'sleep',
                'ambient', 'nature', 'piano', 'relax', 'therapy', 'asmr'
            ]);
            const isTherapyQuery = therapyTags.has(query.toLowerCase());

            // Primary: tag-based search with fuzzytags for better coverage on niche tags
            const tagUrl = new URL('https://api.jamendo.com/v3.0/tracks/');
            tagUrl.searchParams.set('client_id', clientId);
            tagUrl.searchParams.set('format', 'json');
            tagUrl.searchParams.set('limit', '50');
            tagUrl.searchParams.set('tags', query);
            tagUrl.searchParams.set('fuzzytags', '1');
            tagUrl.searchParams.set('boost', 'popularity_week');
            tagUrl.searchParams.set('audioformat', 'mp32');
            // For therapy music: filter to instrumental-likely tracks only
            if (isTherapyQuery) {
                tagUrl.searchParams.set('vocalinstrumental', 'instrumental');
            }

            let response = await fetch(tagUrl.toString());
            let data = await response.json();
            let tracks = data.results || [];

            // Fallback: text-based search, also with instrumental filter for therapy tags
            if (tracks.length < 5) {
                logger.debug(`[MusicService] Low tag results for "${query}". Trying text search...`);
                const searchUrl = new URL('https://api.jamendo.com/v3.0/tracks/');
                searchUrl.searchParams.set('client_id', clientId);
                searchUrl.searchParams.set('format', 'json');
                searchUrl.searchParams.set('limit', '50');
                searchUrl.searchParams.set('search', query);
                searchUrl.searchParams.set('boost', 'popularity_week');
                searchUrl.searchParams.set('audioformat', 'mp32');
                if (isTherapyQuery) {
                    searchUrl.searchParams.set('vocalinstrumental', 'instrumental');
                }
                response = await fetch(searchUrl.toString());
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
            length: 1
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
