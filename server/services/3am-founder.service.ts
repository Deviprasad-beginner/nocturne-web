/**
 * 3AM Founder Service - Business Logic Layer
 */

import { storage } from "../storage";
import type { AmFounder, InsertAmFounder } from "@shared/schema";
import { NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";

export class AmFounderService {
    /**
     * Get all founder posts
     */
    async getAllPosts(): Promise<AmFounder[]> {
        logger.debug("Fetching all 3AM founder posts");
        return await storage.getAmFounder();
    }

    /**
     * Create a new founder post
     */
    async createPost(data: InsertAmFounder, userId?: number): Promise<AmFounder> {
        logger.info("Creating new 3AM founder post", { userId });

        const postData: InsertAmFounder = {
            ...data,
            authorId: userId,
        };

        return await storage.createAmFounder(postData);
    }

    /**
     * Increment upvote count
     */
    async incrementUpvotes(id: number): Promise<void> {
        logger.info(`Incrementing upvotes for founder post: ${id}`);
        await storage.incrementFounderUpvotes(id);
    }

    /**
     * Increment comment count
     */
    async incrementComments(id: number): Promise<void> {
        logger.info(`Incrementing comments for founder post: ${id}`);
        await storage.incrementFounderComments(id);
    }
    /**
     * Create a reply to a founder post
     */
    async createReply(founderId: number, content: string, userId?: number): Promise<void> {
        logger.info(`Creating reply for founder post: ${founderId}`, { userId });

        // optimize: parallelize
        await Promise.all([
            storage.createAmFounderReply({
                founderId,
                content,
                authorId: userId,
            }),
            storage.incrementFounderComments(founderId)
        ]);
    }

    /**
     * Get replies for a founder post
     */
    async getReplies(founderId: number) {
        logger.debug(`Fetching replies for founder post: ${founderId}`);
        return await storage.getAmFounderReplies(founderId);
    }
}

// Singleton instance
export const amFounderService = new AmFounderService();
