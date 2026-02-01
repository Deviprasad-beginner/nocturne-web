/**
 * Night Circles Controller - Route Handlers
 */

import { Request, Response } from "express";
import { nightCirclesService } from "../services/night-circles.service";
import { successResponse } from "../utils/api-response";
import { asyncHandler } from "../middleware/error.middleware";

export class NightCirclesController {
    /**
     * GET /api/v1/circles
     * Get all night circles
     */
    getAll = asyncHandler(async (req: Request, res: Response) => {
        const circles = await nightCirclesService.getAllCircles();
        res.json(successResponse(circles));
    });

    /**
     * GET /api/v1/circles/:id
     * Get circle by ID
     */
    getById = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const circle = await nightCirclesService.getCircleById(id);
        res.json(successResponse(circle));
    });

    /**
     * POST /api/v1/circles
     * Create new night circle
     */
    create = asyncHandler(async (req: Request, res: Response) => {
        const circle = await nightCirclesService.createCircle(req.body);
        res.status(201).json(successResponse(circle));
    });

    /**
     * PATCH /api/v1/circles/:id/members
     * Update member count for a circle
     */
    updateMembers = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const { members } = req.body;
        await nightCirclesService.updateMembers(id, members);
        res.json(successResponse({ message: "Members updated successfully" }));
    });
}

export const nightCirclesController = new NightCirclesController();
