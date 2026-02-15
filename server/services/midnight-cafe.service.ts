/**
 * Midnight Cafe Service - Business Logic Layer
 * Contains business logic for forum/cafe posts feature
 */

import { storage } from "../storage";
import type { MidnightCafe, InsertMidnightCafe, CafeReply, InsertCafeReply } from "@shared/schema";
import { NotFoundError, ForbiddenError } from "../utils/errors";
import { logger } from "../utils/logger";

export class MidnightCafeService {
    /**
     * Get all cafe posts
     */
    async getAllPosts(limit?: number): Promise<MidnightCafe[]> {
        logger.debug("Fetching all midnight cafe posts");
        return await storage.getMidnightCafe(limit);
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

    /**
     * Get replies for a post
     */
    async getReplies(postId: number): Promise<CafeReply[]> {
        logger.debug(`Fetching replies for cafe post: ${postId}`);
        return await storage.getCafeReplies(postId);
    }

    /**
     * Create a reply
     */
    async createReply(data: InsertCafeReply, userId?: number): Promise<CafeReply> {
        logger.info("Creating new cafe reply", { userId, cafeId: data.cafeId });

        const replyData: InsertCafeReply = {
            ...data,
            authorId: userId,
        };

        const reply = await storage.createCafeReply(replyData);

        // Update the parent post's reply count
        await storage.incrementCafeReplies(data.cafeId);

        return reply;
    }

    /**
     * Delete a post
     */
    async deletePost(id: number, userId: number): Promise<void> {
        logger.info(`Deleting cafe post: ${id} by user: ${userId}`);

        const post = await this.getPostById(id);

        // Check ownership
        if (post.authorId !== userId) {
            throw new ForbiddenError("You can only delete your own posts");
        }

        await storage.deleteCafePost(id);
    }
}

// Singleton instance
export const midnightCafeService = new MidnightCafeService();
