/**
 * Midnight Cafe Controller - Route Handlers
 * Thin layer that handles HTTP requests/responses
 */

import { Request, Response } from "express";
import { midnightCafeService } from "../services/midnight-cafe.service";
import { successResponse } from "../utils/api-response";
import { asyncHandler } from "../middleware/error.middleware";

export class MidnightCafeController {
    /**
     * GET /api/v1/cafe
     * Get all cafe posts
     */
    getAll = asyncHandler(async (req: Request, res: Response) => {
        const posts = await midnightCafeService.getAllPosts();
        res.json(successResponse(posts));
    });

    /**
     * GET /api/v1/cafe/:id
     * Get cafe post by ID
     */
    getById = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const post = await midnightCafeService.getPostById(id);
        res.json(successResponse(post));
    });

    /**
     * POST /api/v1/cafe
     * Create new cafe post
     */
    create = asyncHandler(async (req: Request, res: Response) => {
        const post = await midnightCafeService.createPost(
            req.body,
            req.user?.id
        );
        res.status(201).json(successResponse(post));
    });

    /**
     * POST /api/v1/cafe/:id/reply
     * Increment reply count for a post
     */
    reply = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        await midnightCafeService.incrementReplies(id);
        res.json(successResponse({ message: "Reply count incremented" }));
    });
}

export const midnightCafeController = new MidnightCafeController();
