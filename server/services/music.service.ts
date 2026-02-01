/**
 * Music Service - Business Logic Layer
 */

import { storage } from "../storage";
import { NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";
import ytSearch from "yt-search";

export class MusicService {
    /**
     * Search for music stations
     */
    async searchMusic(query: string): Promise<any[]> {
        logger.debug(`Searching for music: ${query}`);

        if (!query) {
            throw new Error("Query parameter is required");
        }

        const r = await ytSearch(query + " live radio");
        const liveVideos = (r as any).live || [];

        const stations = liveVideos
            .slice(0, 10)
            .map((v: any) => ({
                id: v.videoId,
                name: v.title,
                youtubeId: v.videoId
            }));

        return stations;
    }

    /**
     * Toggle favorite station for user
     */
    async toggleFavorite(userId: number, stationId: string): Promise<boolean> {
        logger.info(`Toggling favorite station for user: ${userId}`, { stationId });
        return await storage.toggleSavedStation(userId, stationId);
    }

    /**
     * Get user's favorite stations
     */
    async getFavorites(userId: number): Promise<any[]> {
        logger.debug(`Fetching favorite stations for user: ${userId}`);
        return await storage.getSavedStations(userId);
    }
}

// Singleton instance
export const musicService = new MusicService();
