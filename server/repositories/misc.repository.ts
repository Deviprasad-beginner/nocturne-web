import { db } from "../db";
import { mindMaze, mindMazeSparks, starlitSpeaker, moonMessenger, savedStations } from "@shared/schema";
import {
  type MindMaze,
  type InsertMindMaze,
  type MindMazeSpark,
  type InsertMindMazeSpark,
  type StarlitSpeaker,
  type InsertStarlitSpeaker,
  type MoonMessenger,
  type InsertMoonMessenger,
} from "@shared/schema";
import { eq, desc, sql, and, lt, count } from "drizzle-orm";
import { logger } from "../utils/logger";

const MAX_LIMIT = 20;
// Auto-expire rooms that have been open longer than this with no explicit end call
const STALE_ROOM_HOURS = 2;

// ── MindMaze ────────────────────────────────────────────────────────────────

export async function createMindMaze(maze: InsertMindMaze): Promise<MindMaze> {
  const [newMaze] = await db.insert(mindMaze).values(maze).returning();
  return newMaze;
}

export async function getMindMaze(limit?: number): Promise<MindMaze[]> {
  try {
    return await db
      .select()
      .from(mindMaze)
      .orderBy(desc(mindMaze.createdAt))
      .limit(Math.min(limit ?? 20, MAX_LIMIT));
  } catch (error) {
    logger.error("Error getting mind maze:", error);
    return [];
  }
}

export async function incrementMindMazeResponses(id: number): Promise<void> {
  try {
    await db.update(mindMaze)
      .set({ responses: sql`${mindMaze.responses} + 1` })
      .where(eq(mindMaze.id, id));
  } catch (error) {
    logger.error("Error incrementing mind maze responses:", error);
  }
}

export async function createMindMazeSpark(spark: InsertMindMazeSpark): Promise<MindMazeSpark> {
  const [newSpark] = await db.insert(mindMazeSparks).values(spark).returning();
  return newSpark;
}

export async function getMindMazeSparks(mazeId: number): Promise<MindMazeSpark[]> {
  try {
    return await db
      .select()
      .from(mindMazeSparks)
      .where(eq(mindMazeSparks.mazeId, mazeId))
      .orderBy(desc(mindMazeSparks.createdAt));
  } catch (error) {
    logger.error("Error getting mind maze sparks:", error);
    return [];
  }
}

export async function incrementSparkResonance(id: number): Promise<void> {
  try {
    await db.update(mindMazeSparks)
      .set({ resonance: sql`${mindMazeSparks.resonance} + 1` })
      .where(eq(mindMazeSparks.id, id));
  } catch (error) {
    logger.error("Error incrementing spark resonance:", error);
  }
}

// ── StarlitSpeaker ───────────────────────────────────────────────────────────

export async function createStarlitSpeaker(speaker: InsertStarlitSpeaker): Promise<StarlitSpeaker> {
  const [newSpeaker] = await db.insert(starlitSpeaker).values(speaker).returning();
  return newSpeaker;
}

/**
 * Fetch only active rooms, capped at MAX_LIMIT.
 * Stale rooms older than STALE_ROOM_HOURS are auto-deactivated first
 * so they don't pollute the list.
 */
export async function getStarlitSpeaker(limit = MAX_LIMIT): Promise<StarlitSpeaker[]> {
  try {
    // Sweep stale sessions before returning results
    await deactivateStaleRooms();

    return await db
      .select()
      .from(starlitSpeaker)
      .where(eq(starlitSpeaker.isActive, true))
      .orderBy(desc(starlitSpeaker.createdAt))
      .limit(Math.min(limit, MAX_LIMIT));
  } catch (error) {
    logger.error("Error getting starlitSpeaker:", error);
    return [];
  }
}

/** Mark a specific room as ended */
export async function deactivateRoom(id: number): Promise<void> {
  try {
    await db.update(starlitSpeaker)
      .set({ isActive: false, currentParticipants: 0 })
      .where(eq(starlitSpeaker.id, id));
  } catch (error) {
    logger.error("Error deactivating speaker room:", error);
  }
}

/**
 * Sweep any active room that was created more than STALE_ROOM_HOURS ago.
 * This handles crashes / tab-closes where the explicit PATCH /end was never sent.
 */
async function deactivateStaleRooms(): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - STALE_ROOM_HOURS * 60 * 60 * 1000);
    await db.update(starlitSpeaker)
      .set({ isActive: false, currentParticipants: 0 })
      .where(and(eq(starlitSpeaker.isActive, true), lt(starlitSpeaker.createdAt, cutoff)));
  } catch (error) {
    logger.error("Error deactivating stale rooms:", error);
  }
}

/** Real counts for the stats panel */
export async function getActiveSpeakerStats(): Promise<{ activeRooms: number; totalSessions: number }> {
  try {
    const [activeResult] = await db
      .select({ n: count() })
      .from(starlitSpeaker)
      .where(eq(starlitSpeaker.isActive, true));

    const [totalResult] = await db
      .select({ n: count() })
      .from(starlitSpeaker);

    return {
      activeRooms: Number(activeResult?.n ?? 0),
      totalSessions: Number(totalResult?.n ?? 0),
    };
  } catch (error) {
    logger.error("Error getting speaker stats:", error);
    return { activeRooms: 0, totalSessions: 0 };
  }
}

export async function updateSpeakerParticipants(id: number, participants: number): Promise<void> {
  try {
    await db.update(starlitSpeaker)
      .set({ currentParticipants: participants })
      .where(eq(starlitSpeaker.id, id));
  } catch (error) {
    logger.error("Error updating speaker participants:", error);
  }
}

// ── MoonMessenger ────────────────────────────────────────────────────────────

export async function createMoonMessage(message: InsertMoonMessenger): Promise<MoonMessenger> {
  const [newMessage] = await db.insert(moonMessenger).values(message).returning();
  return newMessage;
}

export async function getMoonMessages(sessionId: string): Promise<MoonMessenger[]> {
  try {
    return await db
      .select()
      .from(moonMessenger)
      .where(eq(moonMessenger.sessionId, sessionId))
      .orderBy(moonMessenger.timestamp);
  } catch (error) {
    logger.error("Error getting moon messages:", error);
    return [];
  }
}

export async function getActiveSessions(): Promise<string[]> {
  try {
    const sessions = await db
      .selectDistinct({ sessionId: moonMessenger.sessionId })
      .from(moonMessenger)
      .where(eq(moonMessenger.isActive, true));
    return sessions.map(s => s.sessionId);
  } catch (error) {
    logger.error("Error getting active sessions:", error);
    return [];
  }
}

// ── SavedStations ────────────────────────────────────────────────────────────

export async function toggleSavedStation(userId: number, stationId: string): Promise<boolean> {
  try {
    const [existing] = await db
      .select()
      .from(savedStations)
      .where(sql`${savedStations.userId} = ${userId} AND ${savedStations.stationId} = ${stationId}`);
    if (existing) {
      await db.delete(savedStations).where(eq(savedStations.id, existing.id));
      return false;
    } else {
      await db.insert(savedStations).values({ userId, stationId });
      return true;
    }
  } catch (error) {
    logger.error("Error toggling saved station:", error);
    return false;
  }
}

export async function getSavedStations(userId: number): Promise<string[]> {
  try {
    const stations = await db.select().from(savedStations).where(eq(savedStations.userId, userId));
    return stations.map(s => s.stationId);
  } catch (error) {
    logger.error("Error getting saved stations:", error);
    return [];
  }
}
