/**
 * Diaries Service - Business Logic Layer
 * Contains business logic for diaries feature
 */

import { storage } from "../storage";
import type { Diary, InsertDiary } from "@shared/schema";
import { NotFoundError, ForbiddenError } from "../utils/errors";
import { logger } from "../utils/logger";

export class DiariesService {
    /**
     * Get all public diaries
     */
    async getAllDiaries(): Promise<Diary[]> {
        logger.debug("Fetching all public diaries");
        return await storage.getDiaries(true); // true = public only
    }

    /**
     * Get diary by ID
     */
    async getDiaryById(id: number): Promise<Diary> {
        logger.debug(`Fetching diary with id: ${id}`);
        const diary = await storage.getDiary(id);

        if (!diary) {
            throw new NotFoundError(`Diary with id ${id} not found`);
        }

        return diary;
    }

    /**
     * Get diaries by user
     * Note: This functionality may need to be implemented in storage layer
     * For now, getDiaries returns all public diaries, not user-specific ones
     */
    async getUserDiaries(userId: number): Promise<Diary[]> {
        logger.debug(`Fetching diaries for user: ${userId}`);
        // TODO: Implement user-specific diary filtering in storage layer
        return await storage.getDiaries(false); // false = include private diaries
    }

    /**
     * Create a new diary
     */
    async createDiary(data: InsertDiary, userId: number): Promise<Diary> {
        logger.info("Creating new diary", { userId });

        const diaryData: InsertDiary = {
            ...data,
            authorId: userId,
        };

        return await storage.createDiary(diaryData);
    }

    /**
     * Delete a diary
     * Only the author can delete their diary
     */
    async deleteDiary(id: number, userId: number): Promise<void> {
        logger.info(`Deleting diary: ${id}`, { userId });

        const diary = await this.getDiaryById(id);

        // Check ownership
        if (diary.authorId !== userId) {
            throw new ForbiddenError("You can only delete your own diaries");
        }

        const success = await storage.deleteDiary(id);
        if (!success) {
            throw new Error("Failed to delete diary");
        }
    }
}

// Singleton instance
export const diariesService = new DiariesService();
