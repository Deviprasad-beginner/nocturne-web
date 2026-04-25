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
        const emotion = analysis.detectedEmotion || 'neutral';

        // Emotion Frequency Map
        const EMOTION_FREQ_MAP: Record<string, number> = {
            loneliness: 396,
            curiosity: 432,
            peace: 528,
            anxiety: 741,
            mystery: 639,
            neutral: 444,
            joy: 528, // Map joy to peace/love freq
            sadness: 396, // Map sadness to loneliness/release
            love: 639, // Map love to connection
            ambition: 432, // Map ambition to change
            nostalgia: 417 // 417 is undoing situations/facilitating change
        };

        const frequency = EMOTION_FREQ_MAP[emotion] || 444;

        const whisperData: InsertWhisper = {
            ...data,
            authorId: userId, // Link to user if logged in
            detectedEmotion: emotion,
            sentimentScore: analysis.sentimentScore,
            reflectionDepth: analysis.reflectionDepthScore,
            audioFrequency: frequency,
            decayStage: 'fresh',
            decayProgress: 0,
            visibilityOpacity: 100,
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

    /**
     * Interact with a whisper (resonate, echo, absorb)
     */
    async interact(userId: number, whisperId: number, type: 'resonate' | 'echo' | 'absorb'): Promise<void> {
        logger.info(`Interaction: ${type} on whisper ${whisperId} by user ${userId}`);

        // Verify whisper exists
        await this.getWhisperById(whisperId);

        // Record interaction
        await whispersRepository.addInteraction(whisperId, userId, type, type === 'echo' ? 2 : 1);
    }
}

// Singleton instance
export const whispersService = new WhispersService();
