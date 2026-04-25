import { Request, Response } from "express";
import { ConsciousnessService } from "../services/consciousness.service";
import { successResponse } from "../utils/api-response";
import { asyncHandler } from "../middleware/error.middleware";

export class ConsciousnessController {
    /**
     * GET /api/v1/consciousness
     * Get global consciousness state
     */
    getState = asyncHandler(async (req: Request, res: Response) => {
        const state = await ConsciousnessService.getGlobalState();
        res.json(successResponse(state));
    });
}

export const consciousnessController = new ConsciousnessController();
