/**
 * Whispers Controller - Route Handlers
 * Thin layer that handles HTTP requests/responses
 */

import { Request, Response } from "express";
import { whispersService } from "../services/whispers.service";
import { successResponse } from "../utils/api-response";
import { asyncHandler } from "../middleware/error.middleware";

export class WhispersController {
    /**
     * GET /api/v1/whispers
     * Get all whispers
     */
    getAll = asyncHandler(async (req: Request, res: Response) => {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
        const whispers = await whispersService.getAllWhispers(limit);
        res.json(successResponse(whispers));
    });

    /**
     * GET /api/v1/whispers/:id
     * Get whisper by ID
     */
    getById = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const whisper = await whispersService.getWhisperById(id);
        res.json(successResponse(whisper));
    });

    /**
     * POST /api/v1/whispers
     * Create new whisper
     */
    create = asyncHandler(async (req: Request, res: Response) => {
        const whisper = await whispersService.createWhisper(
            req.body,
            req.user?.id
        );
        res.status(201).json(successResponse(whisper));
    });

    /**
     * POST /api/v1/whispers/:id/like
     * Like a whisper
     */
    like = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        await whispersService.likeWhisper(id);
        res.json(successResponse({ message: "Whisper liked successfully" }));
    });

    /**
     * DELETE /api/v1/whispers/:id
     * Delete whisper (requires auth)
     */
    delete = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        await whispersService.deleteWhisper(id, req.user!.id);
        res.json(successResponse({ message: "Whisper deleted successfully" }));
    });

    /**
     * POST /api/v1/whispers/:id/interaction
     * Interact with a whisper
     */
    interact = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const { type } = req.body;

        if (!['resonate', 'echo', 'absorb'].includes(type)) {
            res.status(400).json({ success: false, message: "Invalid interaction type" });
            return;
        }

        await whispersService.interact(req.user!.id, id, type);
        res.json(successResponse({ message: `Interaction ${type} recorded` }));
    });
}

export const whispersController = new WhispersController();
