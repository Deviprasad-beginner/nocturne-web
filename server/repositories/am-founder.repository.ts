import { db } from "../db";
import { amFounder, amFounderReplies, users } from "@shared/schema";
import {
  type AmFounder,
  type InsertAmFounder,
  type AmFounderReply,
  type InsertAmFounderReply,
} from "@shared/schema";
import { eq, desc, asc, sql } from "drizzle-orm";
import { logger } from "../utils/logger";

const MAX_LIMIT = 100;

export async function createAmFounder(founder: InsertAmFounder): Promise<AmFounder> {
  const [newFounder] = await db.insert(amFounder).values(founder).returning();
  return newFounder;
}

export async function getAmFounder(): Promise<AmFounder[]> {
  try {
    const results = await db
      .select({ founder: amFounder, author: users })
      .from(amFounder)
      .leftJoin(users, eq(amFounder.authorId, users.id))
      .orderBy(desc(amFounder.createdAt));
    return results.map(r => ({ ...r.founder, author: r.author || undefined })) as any;
  } catch (error) {
    logger.error("Error getting amFounder:", error);
    return [];
  }
}

export async function incrementFounderUpvotes(id: number): Promise<void> {
  try {
    await db.update(amFounder)
      .set({ upvotes: sql`${amFounder.upvotes} + 1` })
      .where(eq(amFounder.id, id));
  } catch (error) {
    logger.error("Error incrementing founder upvotes:", error);
  }
}

export async function incrementFounderComments(id: number): Promise<void> {
  try {
    await db.update(amFounder)
      .set({ comments: sql`${amFounder.comments} + 1` })
      .where(eq(amFounder.id, id));
  } catch (error) {
    logger.error("Error incrementing founder comments:", error);
  }
}

export async function createAmFounderReply(reply: InsertAmFounderReply): Promise<AmFounderReply> {
  const [newReply] = await db.insert(amFounderReplies).values(reply).returning();
  return newReply;
}

export async function getAmFounderReplies(founderId: number): Promise<AmFounderReply[]> {
  try {
    return await db
      .select()
      .from(amFounderReplies)
      .where(eq(amFounderReplies.founderId, founderId))
      .orderBy(asc(amFounderReplies.createdAt));
  } catch (error) {
    logger.error("Error getting amFounder replies:", error);
    return [];
  }
}

export async function getUserFounders(userId: number, limit?: number): Promise<AmFounder[]> {
  try {
    return await db
      .select()
      .from(amFounder)
      .where(eq(amFounder.authorId, userId))
      .orderBy(desc(amFounder.createdAt))
      .limit(Math.min(limit ?? 20, MAX_LIMIT));
  } catch (error) {
    logger.error("Error getting user founder posts:", error);
    return [];
  }
}
