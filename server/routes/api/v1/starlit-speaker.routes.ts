/**
 * Starlit Speaker Routes
 */

import { Router } from "express";
import { starlitSpeakerController } from "../../../controllers/starlit-speaker.controller";
import { validate } from "../../../middleware/validation.middleware";
import { insertStarlitSpeakerSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

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

export default router;
