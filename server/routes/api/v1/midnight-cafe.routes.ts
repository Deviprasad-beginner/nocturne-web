/**
 * Midnight Cafe Routes
 * Defines API routes for cafe/forum feature
 */

import { Router } from "express";
import { MidnightCafeController } from "../../../controllers/midnight-cafe.controller";
import { optionalAuth, requireAuth } from "../../../middleware/auth.middleware";
import { validate } from "../../../middleware/validation.middleware";
import { insertMidnightCafeSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// GET /api/v1/cafe - Get all cafe posts
router.get("/", MidnightCafeController.getAll);

// GET /api/v1/cafe/:id - Get cafe post by ID
router.get(
    "/:id",
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    MidnightCafeController.getById
);

// POST /api/v1/cafe - Create new cafe post
router.post(
    "/",
    optionalAuth,
    validate(insertMidnightCafeSchema),
    MidnightCafeController.create
);

// POST /api/v1/cafe/:id/reply - Increment reply count
router.post(
    "/:id/reply",
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    MidnightCafeController.reply
);

// New Routes
router.get("/:id/replies", MidnightCafeController.getReplies);
router.post("/replies", MidnightCafeController.createReply);
router.delete("/:id", requireAuth, MidnightCafeController.deletePost);

export default router;
