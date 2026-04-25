import { db } from "../db";
import { users, nightlyPrompts, userReflections, personalReflections } from "@shared/schema";
import {
  type NightlyPrompt,
  type InsertNightlyPrompt,
  type UserReflection,
  type InsertUserReflection,
  type PersonalReflection,
  type InsertPersonalReflection,
} from "@shared/schema";
import { eq, desc, and, ne, sql } from "drizzle-orm";
import { logger } from "../utils/logger";

export async function createNightlyPrompt(prompt: InsertNightlyPrompt): Promise<NightlyPrompt> {
  try {
    const [newPrompt] = await db.insert(nightlyPrompts).values(prompt).returning();
    return newPrompt;
  } catch (error) {
    logger.error("Error creating nightly prompt:", error);
    throw error;
  }
}

export async function getActivePrompt(type?: "diary" | "inspection"): Promise<NightlyPrompt | undefined> {
  try {
    const now = new Date();
    const [activePrompt] = await db
      .select()
      .from(nightlyPrompts)
      .where(
        and(
          sql`${nightlyPrompts.expiresAt} > ${now}`,
          type === "diary"
            ? eq(nightlyPrompts.shiftMode, "diary")
            : ne(nightlyPrompts.shiftMode, "diary")
        )
      )
      .orderBy(desc(nightlyPrompts.createdAt))
      .limit(1);
    return activePrompt || undefined;
  } catch (error) {
    logger.error("Error getting active prompt:", error);
    return undefined;
  }
}

export async function getNightlyPrompt(id: number): Promise<NightlyPrompt | undefined> {
  try {
    const [prompt] = await db.select().from(nightlyPrompts).where(eq(nightlyPrompts.id, id));
    return prompt || undefined;
  } catch (error) {
    logger.error("Error getting nightly prompt:", error);
    return undefined;
  }
}

export async function createUserReflection(
  reflection: InsertUserReflection,
  aiEvaluation: any
): Promise<UserReflection> {
  try {
    const [newReflection] = await db
      .insert(userReflections)
      .values({ ...reflection, aiEvaluation })
      .returning();

    // Update streak logic
    if (reflection.userId) {
      try {
        const [user] = await db.select().from(users).where(eq(users.id, reflection.userId));
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
            if (diffDays === 1) newStreak++;
            else if (diffDays > 1) newStreak = 1;
          }

          if (!lastEntry || newStreak !== user.currentStreak || now.getDate() !== lastEntry.getDate()) {
            await db.update(users)
              .set({ currentStreak: newStreak, lastEntryDate: now })
              .where(eq(users.id, reflection.userId));
          }
        }
      } catch (error) {
        logger.error("Error updating user streak from reflection:", error);
      }
    }

    return newReflection;
  } catch (error) {
    logger.error("Error creating user reflection:", error);
    throw error;
  }
}

export async function getUserReflections(userId: number, limit = 20): Promise<UserReflection[]> {
  try {
    return await db
      .select()
      .from(userReflections)
      .where(eq(userReflections.userId, userId))
      .orderBy(desc(userReflections.createdAt))
      .limit(Math.min(limit, 100));
  } catch (error) {
    logger.error("Error getting user reflections:", error);
    return [];
  }
}

export async function createPersonalReflection(
  reflection: InsertPersonalReflection,
  aiReflection: string
): Promise<PersonalReflection> {
  try {
    const [newReflection] = await db
      .insert(personalReflections)
      .values({ ...reflection, aiReflection })
      .returning();
    return newReflection;
  } catch (error) {
    logger.error("Error creating personal reflection:", error);
    throw error;
  }
}

export async function getPersonalReflections(userId: number, limit = 20): Promise<PersonalReflection[]> {
  try {
    return await db
      .select()
      .from(personalReflections)
      .where(eq(personalReflections.userId, userId))
      .orderBy(desc(personalReflections.createdAt))
      .limit(Math.min(limit, 100));
  } catch (error) {
    logger.error("Error getting personal reflections:", error);
    return [];
  }
}
