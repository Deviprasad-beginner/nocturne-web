/**
 * Mind Maze Service - Business Logic Layer
 */

import { storage } from "../storage";
import type { MindMaze, InsertMindMaze, MindMazeSpark, InsertMindMazeSpark } from "@shared/schema";
import { NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";

export class MindMazeService {
    /**
     * Get all mind maze questions
     */
    async getAllQuestions(limit?: number): Promise<MindMaze[]> {
        logger.debug("Fetching all mind maze questions");
        return await storage.getMindMaze(limit);
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
        await this.getQuestionById(id);
        await storage.incrementMindMazeResponses(id);
    }

    /**
     * Submit a Spark (response) to a Maze
     */
    async createSpark(data: InsertMindMazeSpark): Promise<MindMazeSpark> {
        logger.info(`Creating spark for maze ${data.mazeId}`);
        // ensure maze exists
        await this.getQuestionById(data.mazeId);
        return await storage.createMindMazeSpark(data);
    }

    /**
     * Get sparks for a maze
     */
    async getSparks(mazeId: number): Promise<MindMazeSpark[]> {
        logger.debug(`Fetching sparks for maze ${mazeId}`);
        return await storage.getMindMazeSparks(mazeId);
    }

    /**
     * Resonate with a spark
     */
    async resonateSpark(sparkId: number, raterId: number): Promise<void> {
        logger.info(`User ${raterId} resonating with spark ${sparkId}`);
        await storage.incrementSparkResonance(sparkId);
    }
}

// Singleton instance
export const mindMazeService = new MindMazeService();
