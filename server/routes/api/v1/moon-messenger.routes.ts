/**
 * Moon Messenger Routes
 */

import { Router } from "express";
import { moonMessengerController } from "../../../controllers/moon-messenger.controller";
import { validate } from "../../../middleware/validation.middleware";
import { insertMoonMessengerSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// GET /api/v1/messenger - Get active sessions
router.get("/", moonMessengerController.getSessions);

// GET /api/v1/messenger/:sessionId - Get messages for session
router.get(
    "/:sessionId",
    validate(z.object({ sessionId: z.string() }), "params"),
    moonMessengerController.getMessages
);

// POST /api/v1/messenger - Create new message
router.post(
    "/",
    validate(insertMoonMessengerSchema),
    moonMessengerController.createMessage
);

export default router;
