import { db } from "../db";
import { diaries, users } from "@shared/schema";
import {
  type Diary,
  type InsertDiary,
} from "@shared/schema";
import { eq, desc, or } from "drizzle-orm";
import { logger } from "../utils/logger";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function capLimit(limit?: number): number {
  return Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT);
}

export async function createDiary(diary: InsertDiary): Promise<Diary> {
  const [newDiary] = await db.insert(diaries).values(diary).returning();

  // Update streak logic
  if (diary.authorId) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, diary.authorId));
      if (user) {
        const now = new Date();
        const lastEntry = user.lastEntryDate ? new Date(user.lastEntryDate) : null;
        let newStreak = user.currentStreak || 0;

        if (!lastEntry) {
          newStreak = 1;
        } else {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const last = new Date(lastEntry.getFullYear(), lastEntry.getMonth(), lastEntry.getDate());
          const diffDays = Math.ceil(Math.abs(today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            newStreak++;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        }

        await db.update(users)
          .set({ currentStreak: newStreak, lastEntryDate: now })
          .where(eq(users.id, diary.authorId));
      }
    } catch (error) {
      logger.error("Error updating user streak:", error);
    }
  }

  return newDiary;
}

export async function getDiaries(viewerId?: number, limit?: number): Promise<Diary[]> {
  try {
    const safeLimit = capLimit(limit);
    if (viewerId) {
      const results = await db
        .select({ diary: diaries, author: users })
        .from(diaries)
        .leftJoin(users, eq(diaries.authorId, users.id))
        .where(or(eq(diaries.isPublic, true), eq(diaries.authorId, viewerId)))
        .orderBy(desc(diaries.createdAt))
        .limit(safeLimit);
      return results.map(r => ({ ...r.diary, author: r.author || undefined })) as any;
    } else {
      const results = await db
        .select({ diary: diaries, author: users })
        .from(diaries)
        .leftJoin(users, eq(diaries.authorId, users.id))
        .where(eq(diaries.isPublic, true))
        .orderBy(desc(diaries.createdAt))
        .limit(safeLimit);
      return results.map(r => ({ ...r.diary, author: r.author || undefined })) as any;
    }
  } catch (error) {
    logger.error("Error getting diaries:", error);
    return [];
  }
}

export async function getDiary(id: number): Promise<Diary | undefined> {
  try {
    const [diary] = await db.select().from(diaries).where(eq(diaries.id, id));
    return diary || undefined;
  } catch (error) {
    logger.error("Error getting diary:", error);
    return undefined;
  }
}

export async function deleteDiary(id: number): Promise<boolean> {
  try {
    const result = await db.delete(diaries).where(eq(diaries.id, id)).returning();
    return result.length > 0;
  } catch (error) {
    logger.error("Error deleting diary:", error);
    return false;
  }
}

export async function getUserDiaries(userId: number, limit?: number): Promise<Diary[]> {
  try {
    return await db
      .select()
      .from(diaries)
      .where(eq(diaries.authorId, userId))
      .orderBy(desc(diaries.createdAt))
      .limit(capLimit(limit));
  } catch (error) {
    logger.error("Error getting user diaries:", error);
    return [];
  }
}
