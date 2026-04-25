/**
 * Diaries Controller - Route Handlers
 * Thin layer that handles HTTP requests/responses
 */

import { Request, Response } from "express";
import { diariesService } from "../services/diaries.service";
import { successResponse } from "../utils/api-response";
import { asyncHandler } from "../middleware/error.middleware";

export class DiariesController {
    /**
     * GET /api/v1/diaries
     * Get all public diaries
     */
    getAll = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
        const diaries = await diariesService.getAllDiaries(userId, limit);
        res.json(successResponse(diaries));
    });

    /**
     * GET /api/v1/diaries/:id
     * Get diary by ID
     */
    getById = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const diary = await diariesService.getDiaryById(id);
        res.json(successResponse(diary));
    });

    /**
     * POST /api/v1/diaries
     * Create new diary (requires auth)
     */
    create = asyncHandler(async (req: Request, res: Response) => {
        const diary = await diariesService.createDiary(
            req.body,
            req.user!.id
        );
        res.status(201).json(successResponse(diary));
    });

    /**
     * DELETE /api/v1/diaries/:id
     * Delete diary (requires auth)
     */
    delete = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        await diariesService.deleteDiary(id, req.user!.id);
        res.json(successResponse({ message: "Diary deleted successfully" }));
    });
}

export const diariesController = new DiariesController();
