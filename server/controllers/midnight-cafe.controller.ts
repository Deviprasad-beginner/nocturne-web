
import { Request, Response } from "express";
import { midnightCafeService } from "../services/midnight-cafe.service";
import { insertMidnightCafeSchema, insertCafeReplySchema } from "@shared/schema";
import { logger } from "../utils/logger";

export class MidnightCafeController {
    /**
     * Get all posts
     */
    static async getAll(req: Request, res: Response) {
        try {
            const posts = await midnightCafeService.getAllPosts();
            res.json(posts);
        } catch (error) {
            logger.error("Error fetching all cafe posts", error);
            res.status(500).json({ error: "Failed to fetch posts" });
        }
    }

    /**
     * Get post by ID
     */
    static async getById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: "Invalid ID" });
            }
            const post = await midnightCafeService.getPostById(id);
            res.json(post);
        } catch (error: any) {
            if (error.name === "NotFoundError") {
                return res.status(404).json({ error: error.message });
            }
            logger.error(`Error fetching post ${req.params.id}`, error);
            res.status(500).json({ error: "Failed to fetch post" });
        }
    }

    /**
     * Create a post
     */
    static async create(req: Request, res: Response) {
        try {
            // Optional auth check, depending on requirements. Service handles null userId.
            const data = insertMidnightCafeSchema.parse(req.body);
            const post = await midnightCafeService.createPost(data, req.user?.id);
            res.status(201).json(post);
        } catch (error: any) {
            logger.error("Error creating post", error);
            if (error.name === "ZodError") {
                return res.status(400).json({ error: error.errors });
            }
            res.status(500).json({ error: "Failed to create post" });
        }
    }

    /**
     * Old reply endpoint (increment counter)
     * Kept for backward compatibility if needed, though we prefer real replies now.
     */
    static async reply(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: "Invalid ID" });
            }
            await midnightCafeService.incrementReplies(id);
            res.json({ success: true });
        } catch (error: any) {
            if (error.name === "NotFoundError") {
                return res.status(404).json({ error: error.message });
            }
            logger.error(`Error incrementing replies for ${req.params.id}`, error);
            res.status(500).json({ error: "Failed to increment replies" });
        }
    }

    /**
     * Get replies for a post
     */
    static async getReplies(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: "Invalid post ID" });
            }

            const replies = await midnightCafeService.getReplies(id);
            res.json(replies);
        } catch (error: any) {
            logger.error("Error fetching replies", error);
            res.status(500).json({ error: "Failed to fetch replies" });
        }
    }

    /**
     * Create a reply
     */
    static async createReply(req: Request, res: Response) {
        try {
            if (!req.isAuthenticated()) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const data = insertCafeReplySchema.parse(req.body);
            const reply = await midnightCafeService.createReply(data, req.user!.id);

            res.status(201).json(reply);
        } catch (error: any) {
            logger.error("Error creating reply", error);
            if (error.name === "ZodError") {
                return res.status(400).json({ error: error.errors });
            }
            res.status(500).json({ error: "Failed to create reply" });
        }
    }

    /**
     * Delete a post
     */
    static async deletePost(req: Request, res: Response) {
        try {
            if (!req.isAuthenticated()) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ error: "Invalid post ID" });
            }

            await midnightCafeService.deletePost(id, req.user!.id);
            res.sendStatus(200);
        } catch (error: any) {
            logger.error("Error deleting post", error);
            if (error.message === "You can only delete your own posts") {
                return res.status(403).json({ error: error.message });
            }
            if (error.name === "NotFoundError") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: "Failed to delete post" });
        }
    }
}
