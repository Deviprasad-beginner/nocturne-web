import { storage } from "../storage";
import type { InsertDiary, InsertWhisper, InsertMidnightCafe, InsertNightCircle, InsertMindMaze } from "@shared/schema";

/**
 * Social Service - Handles all social feature operations
 * (Diaries, Whispers, Cafe, Circles, Mind Maze)
 */
export class SocialService {
    // Diaries
    async createDiary(data: InsertDiary) {
        return await storage.createDiary(data);
    }

    async getDiaries(viewerId?: number) {
        return await storage.getDiaries(viewerId);
    }

    async getDiary(id: number) {
        return await storage.getDiary(id);
    }

    async deleteDiary(id: number) {
        return await storage.deleteDiary(id);
    }

    async getUserDiaries(userId: number) {
        return await storage.getUserDiaries(userId);
    }

    // Whispers
    async createWhisper(data: InsertWhisper) {
        return await storage.createWhisper(data);
    }

    async getWhispers() {
        return await storage.getWhispers();
    }

    async incrementWhisperHearts(id: number) {
        return await storage.incrementWhisperHearts(id);
    }

    async getUserWhispers(userId: number) {
        return await storage.getUserWhispers(userId);
    }

    // Midnight Cafe
    async createCafePost(data: InsertMidnightCafe) {
        return await storage.createMidnightCafe(data);
    }

    async getCafePosts() {
        return await storage.getMidnightCafe();
    }

    async incrementCafeReplies(id: number) {
        return await storage.incrementCafeReplies(id);
    }

    async getUserCafePosts(userId: number) {
        return await storage.getUserCafePosts(userId);
    }

    // Night Circles
    async createCircle(data: InsertNightCircle) {
        return await storage.createNightCircle(data);
    }

    async getCircles() {
        return await storage.getNightCircles();
    }

    async updateCircleMembers(id: number, members: number) {
        return await storage.updateNightCircleMembers(id, members);
    }

    // Mind Maze
    async createMindMaze(data: InsertMindMaze) {
        return await storage.createMindMaze(data);
    }

    async getMindMaze() {
        return await storage.getMindMaze();
    }

    async incrementMindMazeResponses(id: number) {
        return await storage.incrementMindMazeResponses(id);
    }
}

export const socialService = new SocialService();
