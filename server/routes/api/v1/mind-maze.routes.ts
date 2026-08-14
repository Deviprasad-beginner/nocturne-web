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

// GET /api/v1/mind-maze/:id/sparks - Get all sparks for a maze
router.get(
    "/:id/sparks",
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    mindMazeController.getSparks
);

// POST /api/v1/mind-maze/:id/sparks - Submit a spark
router.post(
    "/:id/sparks",
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    // Also requires validation of body: content, sparkType. 
    // Handled broadly in controller for now based on fast-iteration requirement.
    mindMazeController.createSpark
);

// POST /api/v1/mind-maze/sparks/:sparkId/resonate - Resonate a spark
router.post(
    "/sparks/:sparkId/resonate",
    validate(z.object({ sparkId: z.string().regex(/^\d+$/) }), "params"),
    mindMazeController.resonateSpark
);

export default router;
