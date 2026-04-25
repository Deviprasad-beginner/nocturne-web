/**
 * Starlit Speaker Routes
 */

import { Router } from "express";
import { starlitSpeakerController } from "../../../controllers/starlit-speaker.controller";
import { validate } from "../../../middleware/validation.middleware";
import { insertStarlitSpeakerSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// GET /api/v1/speaker/stats — must be before /:id routes to avoid clash
router.get("/stats", starlitSpeakerController.getStats);

router.get("/", starlitSpeakerController.getAll);

router.post(
    "/",
    validate(insertStarlitSpeakerSchema),
    starlitSpeakerController.create
);

router.patch(
    "/:id/participants",
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    validate(z.object({ participants: z.number() })),
    starlitSpeakerController.updateParticipants
);

// Called when speaker clicks Stop — marks room inactive in DB
router.patch(
    "/:id/end",
    validate(z.object({ id: z.string().regex(/^\d+$/) }), "params"),
    starlitSpeakerController.endRoom
);

export default router;
