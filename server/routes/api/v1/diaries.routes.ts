/**
 * Diaries Routes
 * Defines API routes for diaries feature
 */

import { Router } from "express";
import { diariesController } from "../../../controllers/diaries.controller";
import { requireAuth } from "../../../middleware/auth.middleware";
import { validate } from "../../../middleware/validation.middleware";
import { insertDiarySchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// GET /api/v1/diaries - Get all public diaries
router.get("/", diariesController.getAll);

// GET /api/v1/diaries/:id - Get diary by ID
router.get(
    "/:id",
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    diariesController.getById
);

// POST /api/v1/diaries - Create new diary
router.post(
    "/",
    requireAuth,
    validate(insertDiarySchema),
    diariesController.create
);

// DELETE /api/v1/diaries/:id - Delete diary (requires auth)
router.delete(
    "/:id",
    requireAuth,
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    diariesController.delete
);

export default router;
