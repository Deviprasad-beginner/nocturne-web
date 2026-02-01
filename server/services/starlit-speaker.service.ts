/**
 * Starlit Speaker Service - Business Logic Layer
 */

import { storage } from "../storage";
import type { StarlitSpeaker, InsertStarlitSpeaker } from "@shared/schema";
import { NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";

export class StarlitSpeakerService {
    /**
     * Get all speaker rooms
     */
    async getAllRooms(): Promise<StarlitSpeaker[]> {
        logger.debug("Fetching all starlit speaker rooms");
        return await storage.getStarlitSpeaker();
    }

    /**
     * Create a new room
     */
    async createRoom(data: InsertStarlitSpeaker): Promise<StarlitSpeaker> {
        logger.info("Creating new starlit speaker room");
        return await storage.createStarlitSpeaker(data);
    }

    /**
     * Update participant count for a room
     */
    async updateParticipants(id: number, participants: number): Promise<void> {
        logger.info(`Updating participants for room: ${id}`, { participants });
        await storage.updateSpeakerParticipants(id, participants);
    }
}

// Singleton instance
export const starlitSpeakerService = new StarlitSpeakerService();
