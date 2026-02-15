/**
 * Night Circles Service - Business Logic Layer
 * Contains business logic for night circles feature
 */

import { storage } from "../storage";
import type { NightCircle, InsertNightCircle } from "@shared/schema";
import { NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";

export class NightCirclesService {
    /**
     * Get all night circles
     */
    async getAllCircles(limit?: number): Promise<NightCircle[]> {
        logger.debug("Fetching all night circles");
        return await storage.getNightCircles(limit);
    }

    /**
     * Get night circle by ID
     */
    async getCircleById(id: number): Promise<NightCircle> {
        logger.debug(`Fetching night circle with id: ${id}`);
        const circles = await storage.getNightCircles();
        const circle = circles.find(c => c.id === id);

        if (!circle) {
            throw new NotFoundError(`Night circle with id ${id} not found`);
        }

        return circle;
    }

    /**
     * Create a new night circle
     */
    async createCircle(data: InsertNightCircle): Promise<NightCircle> {
        logger.info("Creating new night circle");
        return await storage.createNightCircle(data);
    }

    /**
     * Update member count for a circle
     */
    async updateMembers(id: number, members: number): Promise<void> {
        logger.info(`Updating members for circle: ${id}`, { members });

        // Verify circle exists
        await this.getCircleById(id);

        await storage.updateNightCircleMembers(id, members);
    }
}

// Singleton instance
export const nightCirclesService = new NightCirclesService();
