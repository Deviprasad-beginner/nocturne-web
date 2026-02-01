/**
 * Mind Maze Service - Business Logic Layer
 */

import { storage } from "../storage";
import type { MindMaze, InsertMindMaze } from "@shared/schema";
import { NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";

export class MindMazeService {
    /**
     * Get all mind maze questions
     */
    async getAllQuestions(): Promise<MindMaze[]> {
        logger.debug("Fetching all mind maze questions");
        return await storage.getMindMaze();
    }

    /**
     * Get question by ID
     */
    async getQuestionById(id: number): Promise<MindMaze> {
        logger.debug(`Fetching mind maze question with id: ${id}`);
        const questions = await storage.getMindMaze();
        const question = questions.find(q => q.id === id);

        if (!question) {
            throw new NotFoundError(`Question with id ${id} not found`);
        }

        return question;
    }

    /**
     * Create a new question
     */
    async createQuestion(data: InsertMindMaze): Promise<MindMaze> {
        logger.info("Creating new mind maze question");
        return await storage.createMindMaze(data);
    }

    /**
     * Increment response count for a question
     */
    async incrementResponses(id: number): Promise<void> {
        logger.info(`Incrementing responses for question: ${id}`);

        // Verify question exists
        await this.getQuestionById(id);

        await storage.incrementMindMazeResponses(id);
    }
}

// Singleton instance
export const mindMazeService = new MindMazeService();
