/**
 * Starlit Speaker Controller
 */

import { Request, Response } from "express";
import { starlitSpeakerService } from "../services/starlit-speaker.service";
import { successResponse } from "../utils/api-response";
import { asyncHandler } from "../middleware/error.middleware";

export class StarlitSpeakerController {
    getAll = asyncHandler(async (req: Request, res: Response) => {
        const rooms = await starlitSpeakerService.getAllRooms();
        res.json(successResponse(rooms));
    });

    create = asyncHandler(async (req: Request, res: Response) => {
        const room = await starlitSpeakerService.createRoom(req.body);
        res.status(201).json(successResponse(room));
    });

    updateParticipants = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const { participants } = req.body;
        await starlitSpeakerService.updateParticipants(id, participants);
        res.json(successResponse({ message: "Participants updated" }));
    });
}

export const starlitSpeakerController = new StarlitSpeakerController();
