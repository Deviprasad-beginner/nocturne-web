/**
 * Whispers Service - Business Logic Layer
 * Contains business logic for whispers feature
 */

import { whispersRepository } from "../repositories/whispers.repository";
import { storage } from "../storage";
import type { Whisper, InsertWhisper } from "@shared/schema";
import { NotFoundError, ForbiddenError } from "../utils/errors";
import { logger } from "../utils/logger";
import { analyzeEmotion } from "./emotion-analyzer";

export class WhispersService {
    /**
     * Get all whispers
     */
    async getAllWhispers(limit?: number): Promise<Whisper[]> {
        logger.debug("Fetching all whispers");
        return await storage.getWhispers(limit);
    }

    /**
     * Get whisper by ID
     */
    async getWhisperById(id: number): Promise<Whisper> {
        logger.debug(`Fetching whisper with id: ${id}`);
        const whisper = await whispersRepository.getById(id);

        if (!whisper) {
            throw new NotFoundError(`Whisper with id ${id} not found`);
        }

        return whisper;
    }

    /**
     * Get whispers by user
     */
    async getUserWhispers(userId: number): Promise<Whisper[]> {
        logger.debug(`Fetching whispers for user: ${userId}`);
        return await whispersRepository.getByAuthorId(userId);
    }

    /**
     * Create a new whisper
     */
    async createWhisper(data: InsertWhisper, userId?: number): Promise<Whisper> {
        logger.info("Creating new whisper", { userId });

        const analysis = analyzeEmotion(data.content);

        const whisperData: InsertWhisper = {
            ...data,
            authorId: userId, // Link to user if logged in
            detectedEmotion: analysis.detectedEmotion,
            sentimentScore: analysis.sentimentScore,
            reflectionDepth: analysis.reflectionDepthScore,
        };

        return await whispersRepository.create(whisperData);
    }

    /**
     * Like a whisper (increment hearts)
     */
    async likeWhisper(id: number): Promise<void> {
        logger.info(`Incrementing hearts for whisper: ${id}`);

        // Verify whisper exists
        await this.getWhisperById(id);

        await whispersRepository.incrementHearts(id);
    }

    /**
     * Delete a whisper
     * Only the author can delete their whisper
     */
    async deleteWhisper(id: number, userId: number): Promise<void> {
        logger.info(`Deleting whisper: ${id}`, { userId });

        const whisper = await this.getWhisperById(id);

        // Check ownership
        if (whisper.authorId && whisper.authorId !== userId) {
            throw new ForbiddenError("You can only delete your own whispers");
        }

        await whispersRepository.delete(id);
    }
}

// Singleton instance
export const whispersService = new WhispersService();
