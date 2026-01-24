/**
 * Whispers Routes
 * Defines API routes for whispers feature
 */

import { Router } from "express";
import { whispersController } from "../../../controllers/whispers.controller";
import { requireAuth } from "../../../middleware/auth.middleware";
import { validate } from "../../../middleware/validation.middleware";
import { insertWhisperSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// GET /api/v1/whispers - Get all whispers
router.get("/", whispersController.getAll);

// GET /api/v1/whispers/:id - Get whisper by ID
router.get(
    "/:id",
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    whispersController.getById
);

// POST /api/v1/whispers - Create new whisper
router.post(
    "/",
    validate(insertWhisperSchema),
    whispersController.create
);

// POST /api/v1/whispers/:id/like - Like a whisper
router.post(
    "/:id/like",
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    whispersController.like
);

// DELETE /api/v1/whispers/:id - Delete whisper (requires auth)
router.delete(
    "/:id",
    requireAuth,
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    whispersController.delete
);

export default router;
