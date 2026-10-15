import { db } from "../db";
import { users } from "@shared/schema";
import {
  type User,
  type InsertUser,
  type UpsertUser,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { logger } from "../utils/logger";

export async function getUser(id: string | number): Promise<User | undefined> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, String(id)));
      return user || undefined;
    } catch (error: any) {
      if (attempt === 1 && (error?.message?.includes("timeout") || error?.message?.includes("Connection terminated") || error?.code === "57P01")) {
        logger.warn(`getUser retry attempt 2 after DB connection timeout for id: ${id}`);
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      logger.error("Error getting user:", error);
      throw error; // Propagate error so passport.deserializeUser doesn't silently log out the user
    }
  }
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  try {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  } catch (error) {
    logger.error("Error getting user by username:", error);
    return undefined;
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  } catch (error) {
    logger.error("Error getting user by email:", error);
    return undefined;
  }
}

export async function getUserByGoogleId(googleId: string): Promise<User | undefined> {
  try {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  } catch (error) {
    logger.error("Error getting user by googleId:", error);
    return undefined;
  }
}

export async function createUser(insertUser: InsertUser): Promise<User> {
  const [user] = await db.insert(users).values(insertUser).returning();
  return user;
}

export async function upsertUser(_user: UpsertUser): Promise<User> {
  throw new Error("Upsert not implemented for standard auth");
}

export async function updateUserOnboarding(userId: string, completed: boolean): Promise<void> {
  await db
    .update(users)
    .set({ hasSeenOnboarding: completed })
    .where(eq(users.id, String(userId)));
}

export async function updateUser(userId: string, data: Partial<User>): Promise<User | undefined> {
  try {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, String(userId)))
      .returning();
    return updatedUser || undefined;
  } catch (error) {
    logger.error("Error updating user:", error);
    return undefined;
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    await db.delete(users).where(eq(users.id, String(userId)));
  } catch (error) {
    logger.error('Error deleting user:', error);
    throw error;
  }
}
