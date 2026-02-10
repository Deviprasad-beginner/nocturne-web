import { storage } from "../storage";
import type { InsertAmFounder, InsertStarlitSpeaker, InsertMoonMessenger } from "@shared/schema";

/**
 * Community Service - Handles 3AM Founder, Starlit Speaker, and Moon Messenger
 */
export class CommunityService {
    // 3AM Founder
    async createFounderPost(data: InsertAmFounder) {
        return await storage.createAmFounder(data);
    }

    async getFounderPosts() {
        return await storage.getAmFounder();
    }

    async incrementFounderUpvotes(id: number) {
        return await storage.incrementFounderUpvotes(id);
    }

    async incrementFounderComments(id: number) {
        return await storage.incrementFounderComments(id);
    }

    // Starlit Speaker (Voice Rooms)
    async createSpeakerRoom(data: InsertStarlitSpeaker) {
        return await storage.createStarlitSpeaker(data);
    }

    async getSpeakerRooms() {
        return await storage.getStarlitSpeaker();
    }

    async updateSpeakerParticipants(id: number, participants: number) {
        return await storage.updateSpeakerParticipants(id, participants);
    }

    // Moon Messenger (Anonymous Chat)
    async createMessage(data: InsertMoonMessenger) {
        return await storage.createMoonMessage(data);
    }

    async getMessages(sessionId: string) {
        return await storage.getMoonMessages(sessionId);
    }

    async getActiveSessions() {
        return await storage.getActiveSessions();
    }
}

export const communityService = new CommunityService();
