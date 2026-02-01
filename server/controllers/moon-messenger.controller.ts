/**
 * Moon Messenger Controller
 */

import { Request, Response } from "express";
import { moonMessengerService } from "../services/moon-messenger.service";
import { successResponse } from "../utils/api-response";
import { asyncHandler } from "../middleware/error.middleware";

export class MoonMessengerController {
    getMessages = asyncHandler(async (req: Request, res: Response) => {
        const sessionId = req.query.sessionId as string || req.params.sessionId;
        const messages = await moonMessengerService.getMessages(sessionId);
        res.json(successResponse(messages));
    });

    getSessions = asyncHandler(async (req: Request, res: Response) => {
        const sessions = await moonMessengerService.getActiveSessions();
        res.json(successResponse(sessions));
    });

    createMessage = asyncHandler(async (req: Request, res: Response) => {
        const message = await moonMessengerService.createMessage(req.body);
        res.status(201).json(successResponse(message));
    });
}

export const moonMessengerController = new MoonMessengerController();
