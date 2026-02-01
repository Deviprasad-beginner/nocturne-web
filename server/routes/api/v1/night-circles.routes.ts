/**
 * Night Circles Routes
 */

import { Router } from "express";
import { nightCirclesController } from "../../../controllers/night-circles.controller";
import { validate } from "../../../middleware/validation.middleware";
import { insertNightCircleSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// GET /api/v1/circles - Get all circles
router.get("/", nightCirclesController.getAll);

// GET /api/v1/circles/:id - Get circle by ID
router.get(
    "/:id",
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    nightCirclesController.getById
);

// POST /api/v1/circles - Create new circle
router.post(
    "/",
    validate(insertNightCircleSchema),
    nightCirclesController.create
);

// PATCH /api/v1/circles/:id/members - Update member count
router.patch(
    "/:id/members",
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    validate(z.object({ members: z.number() })),
    nightCirclesController.updateMembers
);

export default router;
