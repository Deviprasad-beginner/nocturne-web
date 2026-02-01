/**
 * Midnight Cafe Routes
 * Defines API routes for cafe/forum feature
 */

import { Router } from "express";
import { midnightCafeController } from "../../../controllers/midnight-cafe.controller";
import { optionalAuth } from "../../../middleware/auth.middleware";
import { validate } from "../../../middleware/validation.middleware";
import { insertMidnightCafeSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// GET /api/v1/cafe - Get all cafe posts
router.get("/", midnightCafeController.getAll);

// GET /api/v1/cafe/:id - Get cafe post by ID
router.get(
    "/:id",
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    midnightCafeController.getById
);

// POST /api/v1/cafe - Create new cafe post
router.post(
    "/",
    optionalAuth,
    validate(insertMidnightCafeSchema),
    midnightCafeController.create
);

// POST /api/v1/cafe/:id/reply - Increment reply count
router.post(
    "/:id/reply",
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    midnightCafeController.reply
);

export default router;
