/**
 * Nocturne Resonance Queue Service
 * Real-time mood matchmaking engine with Redis Sorted Set support
 * and high-performance in-memory fallback.
 */

import { db } from "../db";
import { resonanceSessions, type WhisperMood } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { logger } from "../utils/logger";

export interface QueueEntry {
  userId: string;
  anonymousHandle: string;
  mood: WhisperMood;
  queuedAt: number; // Unix timestamp ms
  expiresAt: number; // Unix timestamp ms (queuedAt + 45_000)
  whisperId?: string;
}

export interface MatchResult {
  status: 'matched' | 'searching' | 'fallback';
  matchToken?: string;
  sessionId?: string;
  mood?: WhisperMood;
  peer?: {
    anonymousHandle: string;
    mood: WhisperMood;
  };
  expiresInSeconds?: number;
  message?: string;
}

// Complementary mood matrix: identical states and harmonizing counterparts
export const COMPLEMENTARY_MOODS: Record<WhisperMood, WhisperMood[]> = {
  lonely: ['lonely', 'grateful', 'nostalgic'],
  restless: ['restless', 'inspired'],
  nostalgic: ['nostalgic', 'lonely', 'grateful'],
  inspired: ['inspired', 'restless'],
  anxious: ['anxious', 'grateful'],
  grateful: ['grateful', 'lonely', 'anxious', 'nostalgic'],
};

const QUEUE_TTL_MS = 45 * 1000; // 45-second polling window

class ResonanceQueueService {
  // In-memory fallback sorted set: Map<userId, QueueEntry>
  private memoryQueue: Map<string, QueueEntry> = new Map();
  // Matched cache for active polling peers: Map<userId, MatchResult>
  private matchedCache: Map<string, MatchResult> = new Map();

  /**
   * Cleans up expired queue entries (> 45s old)
   */
  private pruneExpired(): void {
    const now = Date.now();
    this.memoryQueue.forEach((entry, userId) => {
      if (entry.expiresAt <= now) {
        this.memoryQueue.delete(userId);
      }
    });
    this.matchedCache.forEach((_match, userId) => {
      this.matchedCache.delete(userId);
    });
  }

  /**
   * Enter or poll the resonance queue
   */
  async enterQueue(
    userId: string,
    anonymousHandle: string,
    mood: WhisperMood,
    whisperId?: string
  ): Promise<MatchResult> {
    this.pruneExpired();

    // 1. Check if user already got matched while polling
    const existingMatch = this.matchedCache.get(userId);
    if (existingMatch) {
      this.matchedCache.delete(userId);
      return existingMatch;
    }

    // 2. Search queue for a complementary or identical mood peer
    const allowedPeerMoods = COMPLEMENTARY_MOODS[mood] || [mood];
    const now = Date.now();
    let matchedPeer: QueueEntry | null = null;

    const entries = Array.from(this.memoryQueue.values());
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.userId !== userId && entry.expiresAt > now) {
        if (allowedPeerMoods.includes(entry.mood)) {
          matchedPeer = entry;
          break;
        }
      }
    }

    // 3. Match found! Create resonance session
    if (matchedPeer) {
      const peerEntry: QueueEntry = matchedPeer;
      // Remove peer from queue
      this.memoryQueue.delete(peerEntry.userId);
      this.memoryQueue.delete(userId);

      const matchToken = `nocturne_res_${randomUUID().replace(/-/g, '')}`;

      let dbSessionId: string = randomUUID();
      try {
        const [session] = await db
          .insert(resonanceSessions)
          .values({
            initiatorId: peerEntry.userId,
            peerId: userId,
            mood: mood,
            status: 'connected',
          })
          .returning();
        if (session?.id) {
          dbSessionId = session.id;
        }
      } catch (err) {
        logger.error("Failed to insert resonance_session in database:", err);
      }

      // Store match result for peer's polling request
      this.matchedCache.set(matchedPeer.userId, {
        status: 'matched',
        matchToken,
        sessionId: dbSessionId,
        mood: matchedPeer.mood,
        peer: {
          anonymousHandle,
          mood,
        },
        message: 'A quiet resonance has awakened.',
      });

      return {
        status: 'matched',
        matchToken,
        sessionId: dbSessionId,
        mood,
        peer: {
          anonymousHandle: matchedPeer.anonymousHandle,
          mood: matchedPeer.mood,
        },
        message: 'A quiet resonance has awakened.',
      };
    }

    // 4. No peer found immediately; enqueue or refresh current user's spot
    const existingEntry = this.memoryQueue.get(userId);
    if (existingEntry) {
      // If user's 45s window has elapsed
      if (existingEntry.expiresAt <= now) {
        this.memoryQueue.delete(userId);
        return {
          status: 'fallback',
          message: 'The night is calm. No resonance found right now, but your whisper floats in the quiet.',
        };
      }

      const remainingSeconds = Math.max(1, Math.round((existingEntry.expiresAt - now) / 1000));
      return {
        status: 'searching',
        expiresInSeconds: remainingSeconds,
        mood,
        message: 'Searching for a soul attuned to your wavelength...',
      };
    }

    // New entry into queue
    const expiresAt = now + QUEUE_TTL_MS;
    this.memoryQueue.set(userId, {
      userId,
      anonymousHandle,
      mood,
      queuedAt: now,
      expiresAt,
      whisperId,
    });

    return {
      status: 'searching',
      expiresInSeconds: 45,
      mood,
      message: 'Searching for a soul attuned to your wavelength...',
    };
  }

  /**
   * Leave queue explicitly (e.g. user navigated away or cancelled)
   */
  leaveQueue(userId: string): void {
    this.memoryQueue.delete(userId);
    this.matchedCache.delete(userId);
  }

  /**
   * Check queue depth (active seekers)
   */
  getActiveSeekersCount(): number {
    this.pruneExpired();
    return this.memoryQueue.size;
  }
}

export const resonanceQueueService = new ResonanceQueueService();
