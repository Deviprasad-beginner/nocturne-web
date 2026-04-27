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

    /**
     * Update user settings
     */
    async updateUserSettings(userId: number, data: any): Promise<any> {
        logger.debug(`Updating settings for user: ${userId}`);
        
        // Extract top-level fields
        const { displayName, bio, location, nightPersona, ...preferences } = data;
        
        const updateData: any = {};
        if (displayName !== undefined) updateData.displayName = displayName;
        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;
        if (nightPersona !== undefined) updateData.nightPersona = nightPersona;
        
        // Get existing preferences
        const existingUser = await storage.getUser(userId);
        if (existingUser) {
            const currentPreferences = (existingUser.preferences as any) || {};
            updateData.preferences = { ...currentPreferences, ...preferences };
        } else {
            updateData.preferences = preferences;
        }

        const updatedUser = await storage.updateUser(userId, updateData);
        if (!updatedUser) {
            throw new Error("Failed to update user");
        }
        
        // Exclude sensitive info before returning
        const { password, googleId, ...safeUser } = updatedUser;
        return safeUser;
    }
}

// Singleton instance
export const userService = new UserService();
