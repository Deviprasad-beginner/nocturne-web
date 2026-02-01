/**
 * Moon Messenger Service - Business Logic Layer
 */

import { storage } from "../storage";
import type { MoonMessenger, InsertMoonMessenger } from "@shared/schema";
import { logger } from "../utils/logger";

export class MoonMessengerService {
    /**
     * Get messages for a session
     */
    async getMessages(sessionId: string): Promise<MoonMessenger[]> {
        logger.debug(`Fetching messages for session: ${sessionId}`);
        return await storage.getMoonMessages(sessionId);
    }

    /**
     * Get active sessions
     */
    async getActiveSessions(): Promise<any[]> {
        logger.debug("Fetching active sessions");
        return await storage.getActiveSessions();
    }

    /**
     * Create a new message
     */
    async createMessage(data: InsertMoonMessenger): Promise<MoonMessenger> {
        logger.info("Creating new moon message");
        return await storage.createMoonMessage(data);
    }
}

// Singleton instance
export const moonMessengerService = new MoonMessengerService();
