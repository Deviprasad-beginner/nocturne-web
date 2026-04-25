/**
 * Starlit Speaker Service - Business Logic Layer
 */

import { storage } from "../storage";
import * as MiscRepo from "../repositories/misc.repository";
import type { StarlitSpeaker, InsertStarlitSpeaker } from "@shared/schema";
import { logger } from "../utils/logger";

export class StarlitSpeakerService {
    /** Get active rooms only (stale rooms auto-swept inside the repo) */
    async getAllRooms(): Promise<StarlitSpeaker[]> {
        logger.debug("Fetching active starlit speaker rooms");
        return await storage.getStarlitSpeaker();
    }

    /** Create a new room */
    async createRoom(data: InsertStarlitSpeaker): Promise<StarlitSpeaker> {
        logger.info("Creating new starlit speaker room");
        return await storage.createStarlitSpeaker(data);
    }

    /** Update participant count */
    async updateParticipants(id: number, participants: number): Promise<void> {
        logger.info(`Updating participants for room: ${id}`, { participants });
        await storage.updateSpeakerParticipants(id, participants);
    }

    /** Mark a room as ended — called when speaker clicks Stop */
    async endRoom(id: number): Promise<void> {
        logger.info(`Ending speaker room: ${id}`);
        await MiscRepo.deactivateRoom(id);
    }

    /** Real counts for the stats panel (no fake numbers) */
    async getStats(): Promise<{ activeRooms: number; totalSessions: number }> {
        return await MiscRepo.getActiveSpeakerStats();
    }
}

// Singleton instance
export const starlitSpeakerService = new StarlitSpeakerService();
