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

    /** Called when the speaker stops recording — marks room inactive */
    endRoom = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        await starlitSpeakerService.endRoom(id);
        res.json(successResponse({ message: "Room ended" }));
    });

    /** Real stats — replaces the hardcoded numbers on the frontend */
    getStats = asyncHandler(async (_req: Request, res: Response) => {
        const stats = await starlitSpeakerService.getStats();
        res.json(successResponse(stats));
    });
}

export const starlitSpeakerController = new StarlitSpeakerController();
