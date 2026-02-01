/**
 * Midnight Cafe Service - Business Logic Layer
 * Contains business logic for forum/cafe posts feature
 */

import { storage } from "../storage";
import type { MidnightCafe, InsertMidnightCafe } from "@shared/schema";
import { NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";

export class MidnightCafeService {
    /**
     * Get all cafe posts
     */
    async getAllPosts(): Promise<MidnightCafe[]> {
        logger.debug("Fetching all midnight cafe posts");
        return await storage.getMidnightCafe();
    }

    /**
     * Get cafe post by ID
     */
    async getPostById(id: number): Promise<MidnightCafe> {
        logger.debug(`Fetching cafe post with id: ${id}`);
        const posts = await storage.getMidnightCafe();
        const post = posts.find(p => p.id === id);

        if (!post) {
            throw new NotFoundError(`Cafe post with id ${id} not found`);
        }

        return post;
    }

    /**
     * Get cafe posts by user
     */
    async getUserPosts(userId: number): Promise<MidnightCafe[]> {
        logger.debug(`Fetching cafe posts for user: ${userId}`);
        return await storage.getUserCafePosts(userId);
    }

    /**
     * Create a new cafe post
     */
    async createPost(data: InsertMidnightCafe, userId?: number): Promise<MidnightCafe> {
        logger.info("Creating new cafe post", { userId });

        const postData: InsertMidnightCafe = {
            ...data,
            authorId: userId,
        };

        return await storage.createMidnightCafe(postData);
    }

    /**
     * Increment reply count for a post
     */
    async incrementReplies(id: number): Promise<void> {
        logger.info(`Incrementing replies for cafe post: ${id}`);

        // Verify post exists
        await this.getPostById(id);

        await storage.incrementCafeReplies(id);
    }
}

// Singleton instance
export const midnightCafeService = new MidnightCafeService();
