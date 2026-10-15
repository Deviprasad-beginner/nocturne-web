import { db } from "../db";
import { nightCircles, circleMembers, NightThought } from "@shared/schema";
import { ResonanceCandidate } from "./resonance-engine";
import { sql, and, eq, inArray } from "drizzle-orm";
import { WhisperAnalysis } from "./ai/types";
import { logger } from "../utils/logger";

// Anonymous alias pool — never expose user IDs in circle aliases
const ROOM_ALIASES = [
  "Silent Moon", "Night Wanderer", "Unknown Voice", "Midnight Soul",
  "Fading Echo", "Lone Star", "Shadow Thinker", "Void Listener",
  "Quiet Storm", "Dreaming Spark", "Hollow Echo", "Misty Lantern",
];

function pickAlias(index: number): string {
  return ROOM_ALIASES[index % ROOM_ALIASES.length];
}

export interface RoomFormationResult {
  created: boolean;
  circleId?: number;
  message?: string;
  matchedUsersCount?: number;
}

export class RoomFormationPolicy {
  
  async evaluateAndCreate(
    sourceThought: NightThought,
    sourceAnalysis: WhisperAnalysis,
    candidates: ResonanceCandidate[]
  ): Promise<RoomFormationResult> {
    try {
      // 1. Filter out candidates without authorId or weak resonance
      const strongCandidates = candidates.filter(c => c.resonanceScore > 0.75 && c.thought.authorId !== null);
      
      if (strongCandidates.length === 0 || !sourceThought.authorId) {
        return { created: false };
      }

      // Collect user IDs
      const candidateUserIds = strongCandidates.map(c => c.thought.authorId as string);
      // Remove duplicates
      const uniqueUserIds = Array.from(new Set(candidateUserIds));
      
      const allUserIds = [sourceThought.authorId, ...uniqueUserIds];

      // 2. Prevent Duplicate Rooms
      // Check if these exact users are already in a forming/active room together created in the last 2 hours
      const recentCircles = await db.execute(sql`
        SELECT c.id 
        FROM night_circles c
        JOIN circle_members m1 ON c.id = m1.circle_id AND m1.user_id = ${sourceThought.authorId}
        JOIN circle_members m2 ON c.id = m2.circle_id AND m2.user_id = ${uniqueUserIds[0]}
        WHERE c.created_at > NOW() - INTERVAL '2 hours'
          AND c.is_active = true
        LIMIT 1
      `);

      if (recentCircles.rows.length > 0) {
        // A room already exists for this pair
        return { created: false, message: "A room already exists for these users." };
      }

      // 3. Room Creation
      const primaryEmotion = sourceAnalysis.tone?.[0] || 'reflective';
      const vibeScore = Math.floor(sourceAnalysis.reflectionDepth * 100);
      const roomTopic = sourceAnalysis.themes?.[0] || 'Late Night Thoughts';

      // We use a transaction to safely create room and members
      const newCircle = await db.transaction(async (tx) => {
        const [circle] = await tx.insert(nightCircles).values({
          name: `The ${primaryEmotion.charAt(0).toUpperCase() + primaryEmotion.slice(1)} Circle`,
          description: `A quiet space for ${roomTopic}.`,
          topic: roomTopic,
          category: primaryEmotion,
          roomType: 'resonance',
          maxMembers: 8,
          currentMembers: allUserIds.length,
          isActive: true,
          state: 'forming',
          primaryEmotion: primaryEmotion,
          vibeScore: vibeScore,
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours expiry
        }).returning();

        const memberInserts = allUserIds.map((uid, index) => ({
          circleId: circle.id,
          userId: uid as string,
          alias: pickAlias(index),   // anonymous — no user ID exposed
          mode: 'listener'
        }));

        await tx.insert(circleMembers).values(memberInserts);

        return circle;
      });

      return {
        created: true,
        circleId: newCircle.id,
        matchedUsersCount: uniqueUserIds.length,
        message: `${uniqueUserIds.length} other people are thinking about this exact feeling right now.`
      };

    } catch (error) {
      logger.error("Error evaluating room formation policy", error);
      return { created: false };
    }
  }
}

export const roomFormationPolicy = new RoomFormationPolicy();
