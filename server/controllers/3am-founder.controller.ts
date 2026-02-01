/**
 * 3AM Founder Controller - Route Handlers
 */

import { Request, Response } from "express";
import { amFounderService } from "../services/3am-founder.service";
import { successResponse } from "../utils/api-response";
import { asyncHandler } from "../middleware/error.middleware";

export class AmFounderController {
    /**
     * GET /api/v1/founder
     */
    getAll = asyncHandler(async (req: Request, res: Response) => {
        const posts = await amFounderService.getAllPosts();
        res.json(successResponse(posts));
    });

    /**
     * POST /api/v1/founder
     */
    create = asyncHandler(async (req: Request, res: Response) => {
        const post = await amFounderService.createPost(req.body, req.user?.id);
        res.status(201).json(successResponse(post));
    });

    /**
     * POST /api/v1/founder/:id/upvote
     */
    upvote = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        await amFounderService.incrementUpvotes(id);
        res.json(successResponse({ message: "Upvoted successfully" }));
    });

    /**
     * POST /api/v1/founder/:id/comment
     */
    comment = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        await amFounderService.incrementComments(id);
        res.json(successResponse({ message: "Comment count incremented" }));
    });
}

export const amFounderController = new AmFounderController();
