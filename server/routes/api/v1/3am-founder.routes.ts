/**
 * 3AM Founder Routes
 */

import { Router } from "express";
import { amFounderController } from "../../../controllers/3am-founder.controller";
import { optionalAuth } from "../../../middleware/auth.middleware";
import { validate } from "../../../middleware/validation.middleware";
import { insertAmFounderSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// GET /api/v1/founder - Get all posts
router.get("/", amFounderController.getAll);

// POST /api/v1/founder - Create new post
router.post(
    "/",
    optionalAuth,
    validate(insertAmFounderSchema),
    amFounderController.create
);

// POST /api/v1/founder/:id/upvote - Upvote a post
router.post(
    "/:id/upvote",
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    amFounderController.upvote
);

// POST /api/v1/founder/:id/comment - Increment comment count
router.post(
    "/:id/comment",
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    amFounderController.comment
);

export default router;
