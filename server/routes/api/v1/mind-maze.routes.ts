/**
 * Mind Maze Routes
 */

import { Router } from "express";
import { mindMazeController } from "../../../controllers/mind-maze.controller";
import { validate } from "../../../middleware/validation.middleware";
import { insertMindMazeSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// GET /api/v1/mind-maze - Get all questions
router.get("/", mindMazeController.getAll);

// GET /api/v1/mind-maze/:id - Get question by ID
router.get(
    "/:id",
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    mindMazeController.getById
);

// POST /api/v1/mind-maze - Create new question
router.post(
    "/",
    validate(insertMindMazeSchema),
    mindMazeController.create
);

// POST /api/v1/mind-maze/:id/respond - Increment response count
router.post(
    "/:id/respond",
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    mindMazeController.respond
);

export default router;
