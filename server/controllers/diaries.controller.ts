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
    /**
     * GET /api/v1/diaries/:id/comments
     * Get comments for a diary
     */
    getComments = asyncHandler(async (req: Request, res: Response) => {
        const diaryId = parseInt(req.params.id);
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
        // Need to import diary repository directly since service doesn't have it yet, 
        // or just use repository directly
        const { getDiaryComments } = await import("../repositories/diary.repository");
        const comments = await getDiaryComments(diaryId, limit);
        res.json(successResponse(comments));
    });

    /**
     * POST /api/v1/diaries/:id/comments
     * Add a comment to a diary
     */
    addComment = asyncHandler(async (req: Request, res: Response) => {
        const diaryId = parseInt(req.params.id);
        const { content } = req.body;
        const authorId = req.user!.id;
        
        if (!content) {
            res.status(400).json({ success: false, error: "Content is required" });
            return;
        }
        
        const { createDiaryComment } = await import("../repositories/diary.repository");
        const comment = await createDiaryComment({
            diaryId,
            content,
            authorId
        });
        
        // Return comment with author info
        const result = {
            ...comment,
            author: req.user
        };
        
        res.status(201).json(successResponse(result));
    });
}

export const diariesController = new DiariesController();
