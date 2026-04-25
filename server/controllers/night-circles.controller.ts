/**
 * Night Circles Controller - Route Handlers (v2)
 * Routes are now handled directly in night-circles.routes.ts
 * This controller is kept for backwards compatibility but delegates to the service.
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
}

export const nightCirclesController = new NightCirclesController();
