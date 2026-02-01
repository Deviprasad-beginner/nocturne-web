/**
 * User Controller
 */

import { Request, Response } from "express";
import { userService } from "../services/user.service";
import { successResponse } from "../utils/api-response";
import { asyncHandler } from "../middleware/error.middleware";

export class UserController {
    getMyWhispers = asyncHandler(async (req: Request, res: Response) => {
        const whispers = await userService.getUserWhispers(req.user!.id);
        res.json(successResponse(whispers));
    });

    getMyCafePosts = asyncHandler(async (req: Request, res: Response) => {
        const posts = await userService.getUserCafePosts(req.user!.id);
        res.json(successResponse(posts));
    });

    getMyFavorites = asyncHandler(async (req: Request, res: Response) => {
        const stations = await userService.getUserFavoriteStations(req.user!.id);
        res.json(successResponse(stations));
    });
}

export const userController = new UserController();
