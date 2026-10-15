/**
 * Nocturne Core API & Real-Time Endpoints (Task 2)
 *
 * Implements:
 * 1. POST /api/whispers (rate limited, content safety checked, visibility routing)
 * 2. GET /api/whispers/feed (cursor pagination, public active only, zero author/UID leakage)
 * 3. GET /api/whispers/sanctuary (personal private journal whispers)
 * 4. POST /api/resonance/queue (mood-based matching engine, complementary moods, 45s window)
 * 5. POST /api/resonance/leave (leave matching queue)
 */

import { Router, Request, Response } from "express";
import type { Express } from "express";
import { type Server } from "http";
import { z } from "zod";
import { db } from "./db";
import { whispers, users, calculateNightCycleExpiry, generateMidnightAlias } from "@shared/schema";
import { eq, desc, and, gt, lt } from "drizzle-orm";
import { evaluateContentSafety } from "./services/content-safety.service";
import { resonanceQueueService } from "./services/resonance-queue.service";
import { logger } from "./utils/logger";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "nocturne-mobile-secret-change-in-prod";

// Rate limit store: in-memory sliding window (max 5 whispers per 10 minutes per user/IP)
const whisperRateLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_WHISPERS = 5;

function checkWhisperRateLimit(key: string): { allowed: boolean; remainingSeconds?: number } {
  const now = Date.now();
  const history = (whisperRateLimits.get(key) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (history.length >= RATE_LIMIT_MAX_WHISPERS) {
    const oldest = history[0];
    const remainingSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000);
    return { allowed: false, remainingSeconds };
  }
  history.push(now);
  whisperRateLimits.set(key, history);
  return { allowed: true };
}

// User resolution helper: resolves from session, JWT, Firebase UID, or generates midnight alias
export async function resolveUserFromRequest(req: Request): Promise<{
  id: string;
  anonymousHandle: string;
  firebaseUid?: string | null;
}> {
  // 1. Passport Session
  const sessionUser = (req as any).user;
  if (sessionUser && sessionUser.id) {
    return {
      id: String(sessionUser.id),
      anonymousHandle: sessionUser.anonymousHandle || generateMidnightAlias(),
      firebaseUid: sessionUser.firebaseUid || null,
    };
  }

  // 2. JWT Bearer token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded && decoded.sub) {
        const found = await db.select().from(users).where(eq(users.id, String(decoded.sub))).limit(1);
        if (found[0]) {
          return {
            id: found[0].id,
            anonymousHandle: found[0].anonymousHandle,
            firebaseUid: found[0].firebaseUid,
          };
        }
      }
    } catch {
      // Invalid token, fall through to alternate resolution
    }
  }

  // 3. Firebase UID header or body
  const firebaseUid = (req.headers["x-firebase-uid"] as string) || req.body?.firebaseUid;
  if (firebaseUid) {
    const found = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid)).limit(1);
    if (found[0]) {
      return {
        id: found[0].id,
        anonymousHandle: found[0].anonymousHandle,
        firebaseUid: found[0].firebaseUid,
      };
    }

    // Auto-create user linked to this Firebase UID
    const handle = generateMidnightAlias();
    const [created] = await db
      .insert(users)
      .values({
        firebaseUid,
        anonymousHandle: handle,
      })
      .returning();
    return {
      id: created.id,
      anonymousHandle: created.anonymousHandle,
      firebaseUid: created.firebaseUid,
    };
  }

  // 4. Client anonymous ID header
  const customUserId = req.headers["x-user-id"] as string;
  if (customUserId) {
    try {
      const found = await db.select().from(users).where(eq(users.id, customUserId)).limit(1);
      if (found[0]) {
        return {
          id: found[0].id,
          anonymousHandle: found[0].anonymousHandle,
          firebaseUid: found[0].firebaseUid,
        };
      }
    } catch {
      // Invalid UUID or not found
    }
  }

  // 5. Ephemeral midnight guest: create new record
  const handle = generateMidnightAlias();
  const [guest] = await db
    .insert(users)
    .values({
      anonymousHandle: handle,
    })
    .returning();

  return {
    id: guest.id,
    anonymousHandle: guest.anonymousHandle,
  };
}

// Zod schemas for endpoints
const postWhisperSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Whisper cannot be empty")
    .max(300, "Whisper cannot exceed 300 characters"),
  mood: z.enum(["lonely", "restless", "nostalgic", "inspired", "anxious", "grateful"]),
  visibility: z.enum(["private", "public", "resonance"]).default("public"),
  firebaseUid: z.string().optional(),
});

const resonanceQueueSchema = z.object({
  mood: z.enum(["lonely", "restless", "nostalgic", "inspired", "anxious", "grateful"]),
  whisperId: z.string().optional(),
  firebaseUid: z.string().optional(),
});

export const whispersRouter = Router();

/**
 * POST /api/whispers
 * - Rate limit: max 5 whispers per 10 minutes per user.
 * - Text safety check: reject or flag toxic / self-harm triggers.
 * - Save whisper according to visibility:
 *     private: visible only in author's Sanctuary
 *     public: enters global feed, expires at 6:00 AM local time
 *     resonance: enters matchmaking queue
 */
whispersRouter.post("/", async (req: Request, res: Response) => {
  try {
    const parseResult = postWhisperSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { content, mood, visibility } = parseResult.data;

    // Resolve author
    const user = await resolveUserFromRequest(req);

    // Rate limiting: 5 whispers per 10 minutes
    const rateLimitKey = user.id || req.ip || "unknown_client";
    const limitCheck = checkWhisperRateLimit(rateLimitKey);
    if (!limitCheck.allowed) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        message: `In the quiet of the night, please pause. You can whisper again in ${limitCheck.remainingSeconds} seconds. (Max 5 whispers per 10 minutes)`,
        retryAfter: limitCheck.remainingSeconds,
      });
    }

    // Text safety evaluation
    const safety = evaluateContentSafety(content);
    if (!safety.isSafe) {
      if (safety.flag === "self_harm") {
        return res.status(422).json({
          error: "Safety alert",
          message: safety.reason,
          crisisResources: safety.crisisResources,
        });
      }
      return res.status(400).json({
        error: "Content flagged",
        message: safety.reason || "Content violates Nocturne midnight community guidelines.",
      });
    }

    // Calculate ephemeral night cycle expiration (6:00 AM local)
    const expiresAt = calculateNightCycleExpiry();

    // Persist whisper in PostgreSQL
    const [newWhisper] = await db
      .insert(whispers)
      .values({
        authorId: user.id,
        content,
        mood,
        visibility,
        expiresAt,
      })
      .returning();

    // Visibility-specific routing
    let resonanceStatus: any = null;
    if (visibility === "resonance") {
      // Add directly into matchmaking queue
      resonanceStatus = await resonanceQueueService.enterQueue(
        user.id,
        user.anonymousHandle,
        mood,
        newWhisper.id
      );
    }

    // Return response without leaking author's real ID or Firebase UID
    return res.status(201).json({
      success: true,
      data: {
        id: newWhisper.id,
        content: newWhisper.content,
        mood: newWhisper.mood,
        visibility: newWhisper.visibility,
        createdAt: newWhisper.createdAt,
        expiresAt: newWhisper.expiresAt,
        anonymousHandle: user.anonymousHandle,
        resonance: resonanceStatus,
      },
    });
  } catch (error: any) {
    logger.error("Error creating whisper:", error);
    return res.status(500).json({ error: "Failed to share whisper. The night remains still." });
  }
});

/**
 * GET /api/whispers/feed
 * - Cursor-based pagination (cursor = createdAt ISO string, limit = 20)
 * - Only records where visibility = 'public' and expiresAt > NOW()
 * - Zero author leakage: never expose authorId or Firebase UID, only anonymousHandle & mood
 */
whispersRouter.get("/feed", async (req: Request, res: Response) => {
  try {
    const limitNum = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const cursorStr = req.query.cursor as string | undefined;
    const moodFilter = req.query.mood as string | undefined;

    const now = new Date();
    const conditions = [
      eq(whispers.visibility, "public"),
      gt(whispers.expiresAt, now),
    ];

    if (cursorStr) {
      const cursorDate = new Date(cursorStr);
      if (!isNaN(cursorDate.getTime())) {
        conditions.push(lt(whispers.createdAt, cursorDate));
      }
    }

    if (
      moodFilter &&
      ["lonely", "restless", "nostalgic", "inspired", "anxious", "grateful"].includes(moodFilter)
    ) {
      conditions.push(eq(whispers.mood, moodFilter as any));
    }

    // Fetch limitNum + 1 to check for next page
    const rows = await db
      .select({
        id: whispers.id,
        content: whispers.content,
        mood: whispers.mood,
        createdAt: whispers.createdAt,
        expiresAt: whispers.expiresAt,
        anonymousHandle: users.anonymousHandle,
      })
      .from(whispers)
      .innerJoin(users, eq(whispers.authorId, users.id))
      .where(and(...conditions))
      .orderBy(desc(whispers.createdAt))
      .limit(limitNum + 1);

    const hasMore = rows.length > limitNum;
    const items = hasMore ? rows.slice(0, limitNum) : rows;
    const nextCursor = items.length > 0 ? items[items.length - 1].createdAt.toISOString() : null;

    return res.json({
      items,
      nextCursor: hasMore ? nextCursor : null,
      hasMore,
      count: items.length,
    });
  } catch (error: any) {
    logger.error("Error retrieving feed whispers:", error);
    return res.status(500).json({ error: "Failed to fetch midnight feed." });
  }
});

/**
 * GET /api/whispers/sanctuary
 * Author's personal private whispers / journal
 */
whispersRouter.get("/sanctuary", async (req: Request, res: Response) => {
  try {
    const user = await resolveUserFromRequest(req);

    const items = await db
      .select({
        id: whispers.id,
        content: whispers.content,
        mood: whispers.mood,
        visibility: whispers.visibility,
        createdAt: whispers.createdAt,
        expiresAt: whispers.expiresAt,
      })
      .from(whispers)
      .where(and(eq(whispers.authorId, user.id), eq(whispers.visibility, "private")))
      .orderBy(desc(whispers.createdAt))
      .limit(50);

    return res.json({
      items,
      anonymousHandle: user.anonymousHandle,
    });
  } catch (error: any) {
    logger.error("Error fetching sanctuary whispers:", error);
    return res.status(500).json({ error: "Failed to fetch sanctuary whispers." });
  }
});

export const resonanceRouter = Router();

/**
 * POST /api/resonance/queue
 * - Add user to matchmaking queue based on selected mood and timestamp
 * - Matches complementary or identical emotional states
 * - Returns transient match token within 45s window or fallbacks gracefully
 */
resonanceRouter.post("/queue", async (req: Request, res: Response) => {
  try {
    const parseResult = resonanceQueueSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { mood, whisperId } = parseResult.data;
    const user = await resolveUserFromRequest(req);

    const matchResult = await resonanceQueueService.enterQueue(
      user.id,
      user.anonymousHandle,
      mood,
      whisperId
    );

    return res.json({
      success: true,
      userHandle: user.anonymousHandle,
      ...matchResult,
    });
  } catch (error: any) {
    logger.error("Error entering resonance queue:", error);
    return res.status(500).json({ error: "Resonance network temporarily quiet." });
  }
});

/**
 * POST /api/resonance/leave
 */
resonanceRouter.post("/leave", async (req: Request, res: Response) => {
  try {
    const user = await resolveUserFromRequest(req);
    resonanceQueueService.leaveQueue(user.id);
    return res.json({ success: true, message: "Left resonance queue." });
  } catch (error: any) {
    logger.error("Error leaving resonance queue:", error);
    return res.status(500).json({ error: "Failed to leave queue." });
  }
});

/**
 * Register API routes on Express app (for serverless environments or standalone API mounting)
 */
export function registerApiRoutes(app: Express): void {
  // Mount whispers endpoints under /api/whispers
  app.use("/api/whispers", whispersRouter);

  // Mount resonance endpoints under /api/resonance
  app.use("/api/resonance", resonanceRouter);

  // Also mount under /api/v1 for unified API clients
  app.use("/api/v1/whispers", whispersRouter);
  app.use("/api/v1/resonance", resonanceRouter);
}

/**
 * Register all routes on the Express app
 */
export async function registerRoutes(app: Express, httpServer: Server): Promise<Server> {
  registerApiRoutes(app);
  return httpServer;
}
