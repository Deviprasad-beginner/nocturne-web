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
        const whispers = await whispersService.getAllWhispers();
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
}

export const whispersController = new WhispersController();
