/**
 * Music Controller - Route Handlers
 */

import { Request, Response } from "express";
import { musicService } from "../services/music.service";
import { successResponse } from "../utils/api-response";
import { asyncHandler } from "../middleware/error.middleware";

export class MusicController {
    /**
     * GET /api/v1/music/search?query=
     */
    search = asyncHandler(async (req: Request, res: Response) => {
        const query = req.query.query as string;
        const stations = await musicService.searchMusic(query);
        res.json(successResponse(stations));
    });

    /**
     * POST /api/v1/music/favorites/:stationId
     */
    toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
        const { stationId } = req.params;
        const saved = await musicService.toggleFavorite(req.user!.id, stationId);
        res.json(successResponse({ saved }));
    });

    /**
     * GET /api/v1/music/favorites
     */
    getFavorites = asyncHandler(async (req: Request, res: Response) => {
        const stations = await musicService.getFavorites(req.user!.id);
        res.json(successResponse(stations));
    });
}

export const musicController = new MusicController();
