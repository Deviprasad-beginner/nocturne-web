import { db } from "../db";
import { nightCircles } from "@shared/schema";
import { type NightCircle, type InsertNightCircle } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { logger } from "../utils/logger";

const MAX_LIMIT = 100;

export async function createNightCircle(circle: InsertNightCircle): Promise<NightCircle> {
  const [newCircle] = await db.insert(nightCircles).values(circle).returning();
  return newCircle;
}

export async function getNightCircles(limit?: number): Promise<NightCircle[]> {
  try {
    return await db
      .select()
      .from(nightCircles)
      .orderBy(desc(nightCircles.createdAt))
      .limit(Math.min(limit ?? 20, MAX_LIMIT));
  } catch (error) {
    logger.error("Error getting night circles:", error);
    return [];
  }
}

export async function updateNightCircleMembers(id: number, members: number): Promise<void> {
  try {
    await db.update(nightCircles)
      .set({ currentMembers: members })
      .where(eq(nightCircles.id, id));
  } catch (error) {
    logger.error("Error updating night circle members:", error);
  }
}
