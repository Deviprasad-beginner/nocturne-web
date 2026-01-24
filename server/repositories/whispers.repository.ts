/**
 * Whispers Repository - Data Access Layer
 * Handles all database operations for whispers
 */

import { db } from "../config/database";
import { whispers, type Whisper, type InsertWhisper } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export class WhispersRepository {
    /**
     * Get all whispers, ordered by newest first
     */
    async getAll(): Promise<Whisper[]> {
        return await db
            .select()
            .from(whispers)
            .orderBy(desc(whispers.createdAt));
    }

    /**
     * Get whisper by ID
     */
    async getById(id: number): Promise<Whisper | undefined> {
        const result = await db
            .select()
            .from(whispers)
            .where(eq(whispers.id, id))
            .limit(1);

        return result[0];
    }

    /**
     * Get whispers by author ID
     */
    async getByAuthorId(authorId: number): Promise<Whisper[]> {
        return await db
            .select()
            .from(whispers)
            .where(eq(whispers.authorId, authorId))
            .orderBy(desc(whispers.createdAt));
    }

    /**
     * Create a new whisper
     */
    async create(data: InsertWhisper): Promise<Whisper> {
        const result = await db
            .insert(whispers)
            .values(data)
            .returning();

        return result[0];
    }

    /**
     * Increment hearts count for a whisper
     */
    async incrementHearts(id: number): Promise<void> {
        await db
            .update(whispers)
            .set({ hearts: (whispers.hearts as any) + 1 })
            .where(eq(whispers.id, id));
    }

    /**
     * Delete a whisper
     */
    async delete(id: number): Promise<void> {
        await db
            .delete(whispers)
            .where(eq(whispers.id, id));
    }
}

// Singleton instance
export const whispersRepository = new WhispersRepository();
