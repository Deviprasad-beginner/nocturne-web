import { db } from "../db";
import { users } from "@shared/schema";
import {
  type User,
  type InsertUser,
  type UpsertUser,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { logger } from "../utils/logger";

export async function getUser(id: number): Promise<User | undefined> {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  } catch (error) {
    logger.error("Error getting user:", error);
    return undefined;
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

export async function updateUserOnboarding(userId: number, completed: boolean): Promise<void> {
  await db
    .update(users)
    .set({ hasSeenOnboarding: completed })
    .where(eq(users.id, userId));
}

export async function updateUser(userId: number, data: Partial<User>): Promise<User | undefined> {
  try {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  } catch (error) {
    logger.error("Error updating user:", error);
    return undefined;
  }
}
