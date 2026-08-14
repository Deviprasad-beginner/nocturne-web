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

    /**
     * GET /api/v1/mind-maze/:id/sparks
     */
    getSparks = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const sparks = await mindMazeService.getSparks(id);
        res.json(successResponse(sparks));
    });

    /**
     * POST /api/v1/mind-maze/:id/sparks
     */
    createSpark = asyncHandler(async (req: Request, res: Response) => {
        const mazeId = parseInt(req.params.id);
        const { content, sparkType } = req.body;
        const authorId = (req.user as any)?.id || 1; // Fallback to 1 if anonymous test
        const spark = await mindMazeService.createSpark({ mazeId, content, sparkType, authorId });
        res.status(201).json(successResponse(spark));
    });

    /**
     * POST /api/v1/mind-maze/sparks/:sparkId/resonate
     */
    resonateSpark = asyncHandler(async (req: Request, res: Response) => {
        const sparkId = parseInt(req.params.sparkId);
        const raterId = (req.user as any)?.id || 1;
        await mindMazeService.resonateSpark(sparkId, raterId);
        res.json(successResponse({ message: "Spark resonated!" }));
    });
}

export const mindMazeController = new MindMazeController();
