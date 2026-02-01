/**
 * User Service - Business Logic Layer
 */

import { storage } from "../storage";
import type { Whisper, MidnightCafe } from "@shared/schema";
import { logger } from "../utils/logger";

export class UserService {
    /**
     * Get user's whispers
     */
    async getUserWhispers(userId: number): Promise<Whisper[]> {
        logger.debug(`Fetching whispers for user: ${userId}`);
        return await storage.getUserWhispers(userId);
    }

    /**
     * Get user's cafe posts
     */
    async getUserCafePosts(userId: number): Promise<MidnightCafe[]> {
        logger.debug(`Fetching cafe posts for user: ${userId}`);
        return await storage.getUserCafePosts(userId);
    }

    /**
     * Get user's favorite music stations
     */
    async getUserFavoriteStations(userId: number): Promise<any[]> {
        logger.debug(`Fetching favorite stations for user: ${userId}`);
        return await storage.getSavedStations(userId);
    }
}

// Singleton instance
export const userService = new UserService();
