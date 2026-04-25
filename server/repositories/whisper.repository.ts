import { db } from "../db";
import { whispers, users } from "@shared/schema";
import { type Whisper, type InsertWhisper } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { logger } from "../utils/logger";

const MAX_LIMIT = 100;

export async function createWhisper(whisper: InsertWhisper): Promise<Whisper> {
  const [newWhisper] = await db.insert(whispers).values(whisper).returning();
  return newWhisper;
}

export async function getWhispers(limit?: number): Promise<Whisper[]> {
  try {
    const safeLimit = Math.min(limit ?? 20, MAX_LIMIT);
    const results = await db
      .select({ whisper: whispers, author: users })
      .from(whispers)
      .leftJoin(users, eq(whispers.authorId, users.id))
      .orderBy(desc(whispers.createdAt))
      .limit(safeLimit);
    return results.map(r => ({ ...r.whisper, author: r.author || undefined })) as any;
  } catch (error) {
    logger.error("Error getting whispers:", error);
    return [];
  }
}

export async function incrementWhisperHearts(id: number): Promise<void> {
  try {
    await db.update(whispers)
      .set({ hearts: sql`${whispers.hearts} + 1` })
      .where(eq(whispers.id, id));
  } catch (error) {
    logger.error("Error incrementing whisper hearts:", error);
  }
}

export async function getUserWhispers(userId: number, limit?: number): Promise<Whisper[]> {
  try {
    return await db
      .select()
      .from(whispers)
      .where(eq(whispers.authorId, userId))
      .orderBy(desc(whispers.createdAt))
      .limit(Math.min(limit ?? 20, MAX_LIMIT));
  } catch (error) {
    logger.error("Error getting user whispers:", error);
    return [];
  }
}
