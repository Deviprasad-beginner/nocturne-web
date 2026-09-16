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

    /**
     * Check in the user for the Moon Phase streak
     */
    async checkInUser(userId: number): Promise<any> {
        logger.debug(`Checking in user: ${userId}`);
        const user = await storage.getUser(userId);
        if (!user) throw new Error("User not found");

        const now = new Date();
        const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn) : null;
        
        let newPhase = user.moonPhaseLevel || 0;
        let newStars = user.permanentStars || 0;
        let shouldUpdate = false;

        if (!lastCheckIn) {
            // First check in
            newPhase = 1; // From 0 (New Moon) to 1
            shouldUpdate = true;
        } else {
            // Compare UTC dates
            const lastDate = new Date(Date.UTC(lastCheckIn.getUTCFullYear(), lastCheckIn.getUTCMonth(), lastCheckIn.getUTCDate()));
            const currDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
            
            const diffTime = currDate.getTime() - lastDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Already checked in today
                return user; 
            } else if (diffDays === 1) {
                // Perfect streak
                if (newPhase < 7) {
                    newPhase += 1;
                } else if (newPhase === 7) {
                    newStars += 1;
                }
                shouldUpdate = true;
            } else if (diffDays === 2) {
                // Missed one day (Grace Period)
                newPhase = Math.max(0, newPhase - 1);
                shouldUpdate = true;
            } else {
                // Missed multiple days
                newPhase = 1; // Checked in today, so reset to 1
                shouldUpdate = true;
            }
        }

        if (shouldUpdate) {
            const updatedUser = await storage.updateUser(userId, {
                moonPhaseLevel: newPhase,
                permanentStars: newStars,
                lastCheckIn: now
            });
            return updatedUser;
        }

        return user;
    }

    /**
     * Delete user account (and all cascaded data)
     */
    async deleteAccount(userId: number): Promise<void> {
        logger.info(`Deleting account for user: ${userId}`);
        await storage.deleteUser(userId);
    }
}

// Singleton instance
export const userService = new UserService();
