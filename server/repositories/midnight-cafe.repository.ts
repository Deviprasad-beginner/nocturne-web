import { db } from "../db";
import { midnightCafe, cafeReplies, users } from "@shared/schema";
import {
  type MidnightCafe,
  type InsertMidnightCafe,
  type CafeReply,
  type InsertCafeReply,
} from "@shared/schema";
import { eq, desc, asc, sql } from "drizzle-orm";
import { logger } from "../utils/logger";

const MAX_LIMIT = 100;

export async function createMidnightCafe(cafe: InsertMidnightCafe): Promise<MidnightCafe> {
  const [newCafe] = await db.insert(midnightCafe).values(cafe).returning();
  return newCafe;
}

export async function getMidnightCafe(limit?: number): Promise<MidnightCafe[]> {
  try {
    const safeLimit = Math.min(limit ?? 20, MAX_LIMIT);
    const results = await db
      .select({ cafe: midnightCafe, author: users })
      .from(midnightCafe)
      .leftJoin(users, eq(midnightCafe.authorId, users.id))
      .orderBy(desc(midnightCafe.createdAt))
      .limit(safeLimit);
    return results.map(r => ({ ...r.cafe, author: r.author || undefined })) as any;
  } catch (error) {
    logger.error("Error getting midnight cafe:", error);
    return [];
  }
}

export async function getMidnightCafeById(id: number): Promise<MidnightCafe | undefined> {
  try {
    const results = await db
      .select({ cafe: midnightCafe, author: users })
      .from(midnightCafe)
      .leftJoin(users, eq(midnightCafe.authorId, users.id))
      .where(eq(midnightCafe.id, id))
      .limit(1);
    if (results.length === 0) return undefined;
    const r = results[0];
    return { ...r.cafe, author: r.author || undefined } as any;
  } catch (error) {
    logger.error("Error getting midnight cafe by id:", error);
    return undefined;
  }
}

export async function incrementCafeReplies(id: number): Promise<void> {
  try {
    await db.update(midnightCafe)
      .set({ replies: sql`${midnightCafe.replies} + 1` })
      .where(eq(midnightCafe.id, id));
  } catch (error) {
    logger.error("Error incrementing cafe replies:", error);
  }
}

export async function getCafeReplies(cafeId: number): Promise<CafeReply[]> {
  try {
    return await db
      .select()
      .from(cafeReplies)
      .where(eq(cafeReplies.cafeId, cafeId))
      .orderBy(asc(cafeReplies.createdAt));
  } catch (error) {
    logger.error("Error getting cafe replies:", error);
    return [];
  }
}

export async function createCafeReply(reply: InsertCafeReply): Promise<CafeReply> {
  const [newReply] = await db.insert(cafeReplies).values(reply).returning();
  return newReply;
}

export async function deleteCafePost(id: number): Promise<void> {
  await db.delete(cafeReplies).where(eq(cafeReplies.cafeId, id));
  await db.delete(midnightCafe).where(eq(midnightCafe.id, id));
}

export async function deleteCafeReply(id: number): Promise<void> {
  await db.delete(cafeReplies).where(eq(cafeReplies.id, id));
}

export async function getUserCafePosts(userId: number, limit?: number): Promise<MidnightCafe[]> {
  try {
    return await db
      .select()
      .from(midnightCafe)
      .where(eq(midnightCafe.authorId, userId))
      .orderBy(desc(midnightCafe.createdAt))
      .limit(Math.min(limit ?? 20, MAX_LIMIT));
  } catch (error) {
    logger.error("Error getting user cafe posts:", error);
    return [];
  }
}
