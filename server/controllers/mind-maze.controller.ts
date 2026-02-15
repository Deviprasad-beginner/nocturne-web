/**
 * Mind Maze Controller - Route Handlers
 */

import { Request, Response } from "express";
import { mindMazeService } from "../services/mind-maze.service";
import { successResponse } from "../utils/api-response";
import { asyncHandler } from "../middleware/error.middleware";

export class MindMazeController {
    /**
     * GET /api/v1/mind-maze
     */
    getAll = asyncHandler(async (req: Request, res: Response) => {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
        const questions = await mindMazeService.getAllQuestions(limit);
        res.json(successResponse(questions));
    });

    /**
     * GET /api/v1/mind-maze/:id
     */
    getById = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const question = await mindMazeService.getQuestionById(id);
        res.json(successResponse(question));
    });

    /**
     * POST /api/v1/mind-maze
     */
    create = asyncHandler(async (req: Request, res: Response) => {
        const question = await mindMazeService.createQuestion(req.body);
        res.status(201).json(successResponse(question));
    });

    /**
     * POST /api/v1/mind-maze/:id/respond
     */
    respond = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        await mindMazeService.incrementResponses(id);
        res.json(successResponse({ message: "Response recorded" }));
    });
}

export const mindMazeController = new MindMazeController();
