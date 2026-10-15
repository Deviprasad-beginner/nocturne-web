/**
 * Whispers Routes
 *
 * GET  /api/v1/whispers/feed        — Public + resonance whispers feed (used by whisper-connect)
 * GET  /api/v1/whispers/sanctuary   — Authenticated user's own whispers
 * POST /api/v1/whispers             — Create a whisper (content, mood, visibility)
 * POST /api/v1/whispers/:id/react   — React to a whisper (resonate/echo/absorb)
 * POST /api/v1/whispers/:id/heart   — Alias for resonate reaction (legacy compat)
 * DELETE /api/v1/whispers/:id       — Delete own whisper
 */

import { Router, Request, Response } from "express";
import { db } from "../../../db";
import {
  whispers,
  whisperInteractions,
  users,
  insertWhisperSchema,
  insertWhisperInteractionSchema,
  type WhisperMood,
  type WhisperVisibility,
} from "@shared/schema";
import { eq, desc, and, or, gt, sql } from "drizzle-orm";
import { requireAuth } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/error.middleware";
import { logger } from "../../../utils/logger";

const router = Router();

const WHISPER_TTL_HOURS = 24; // whispers expire after 24 h

// ─── GET /feed ────────────────────────────────────────────────────────────────
/**
 * Returns the most recent non-expired public (and resonance) whispers.
 * Anonymous-friendly — no auth required.
 * Response shape: { success: true, data: { whispers: [...] } }
 */
router.get(
  "/feed",
  asyncHandler(async (_req: Request, res: Response) => {
    const now = new Date();

    const rows = await db
      .select({
        id: whispers.id,
        content: whispers.content,
        mood: whispers.mood,
        visibility: whispers.visibility,
        createdAt: whispers.createdAt,
        expiresAt: whispers.expiresAt,
        hearts: sql<number>`COALESCE((
          SELECT COUNT(*) FROM whisper_interactions wi
          WHERE wi.whisper_id::text = ${whispers.id}::text AND wi.type = 'resonate'
        ), 0)`,
      })
      .from(whispers)
      .where(
        and(
          or(
            eq(whispers.visibility, "public"),
            eq(whispers.visibility, "resonance")
          ),
          gt(whispers.expiresAt, now)
        )
      )
      .orderBy(desc(whispers.createdAt))
      .limit(50);

    return res.json({ success: true, data: { whispers: rows } });
  })
);

// ─── GET /sanctuary ──────────────────────────────────────────────────────────
/**
 * Returns all whispers (including private) belonging to the authenticated user.
 */
router.get(
  "/sanctuary",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;

    const rows = await db
      .select({
        id: whispers.id,
        content: whispers.content,
        mood: whispers.mood,
        visibility: whispers.visibility,
        createdAt: whispers.createdAt,
        expiresAt: whispers.expiresAt,
        hearts: sql<number>`COALESCE((
          SELECT COUNT(*) FROM whisper_interactions wi
          WHERE wi.whisper_id::text = ${whispers.id}::text AND wi.type = 'resonate'
        ), 0)`,
      })
      .from(whispers)
      .where(eq(whispers.authorId, user.id))
      .orderBy(desc(whispers.createdAt))
      .limit(100);

    return res.json({ success: true, data: { whispers: rows } });
  })
);

// ─── POST / ──────────────────────────────────────────────────────────────────
/**
 * Create a new whisper.
 * Body: { content, mood, visibility? }
 * visibility defaults to "public".
 * Auth optional — anonymous whispers allowed.
 */
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;

    // Map incoming "community" -> "public" for whisper-connect compat
    const rawBody = { ...req.body };
    if (rawBody.visibility === "community") rawBody.visibility = "public";
    if (!rawBody.visibility) rawBody.visibility = "public";

    const parsed = insertWhisperSchema.safeParse({
      content: rawBody.content,
      mood: rawBody.mood,
      visibility: rawBody.visibility as WhisperVisibility,
      authorId: user?.id ?? null,
      expiresAt: new Date(Date.now() + WHISPER_TTL_HOURS * 60 * 60 * 1000),
    });

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid whisper data",
        errors: parsed.error.flatten(),
      });
    }

    const [whisper] = await db
      .insert(whispers)
      .values(parsed.data)
      .returning();

    logger.info(`[Whispers] Created whisper ${whisper.id} by user ${user?.id ?? "anonymous"}`);

    return res.status(201).json({ success: true, data: whisper });
  })
);

// ─── POST /:id/react ──────────────────────────────────────────────────────────
/**
 * React to a whisper.
 * Body: { type: "resonate" | "echo" | "absorb" }
 * Auth optional — anonymous reactions allowed.
 */
router.post(
  "/:id/react",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { type } = req.body;
    const user = (req as any).user;

    const validTypes = ["resonate", "echo", "absorb"];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Reaction type must be one of: ${validTypes.join(", ")}`,
      });
    }

    // Verify whisper exists
    const [whisper] = await db.select().from(whispers).where(eq(whispers.id, id)).limit(1);
    if (!whisper) {
      return res.status(404).json({ success: false, message: "Whisper not found" });
    }

    // Record interaction — if userId is null, use a no-op anonymous user (allows duplicates)
    if (user?.id) {
      await db
        .insert(whisperInteractions)
        .values({
          whisperId: whisper.id as unknown as number, // schema mismatch workaround
          userId: user.id,
          type,
          weight: 1,
        })
        .onConflictDoNothing();
    }

    // Return updated counts for all reaction types
    const [counts] = await db
      .select({
        resonateCount: sql<number>`COALESCE(SUM(CASE WHEN type = 'resonate' THEN 1 ELSE 0 END), 0)`,
        echoCount: sql<number>`COALESCE(SUM(CASE WHEN type = 'echo' THEN 1 ELSE 0 END), 0)`,
        absorbCount: sql<number>`COALESCE(SUM(CASE WHEN type = 'absorb' THEN 1 ELSE 0 END), 0)`,
      })
      .from(whisperInteractions)
      .where(eq(whisperInteractions.whisperId, whisper.id as unknown as number));

    return res.json({ success: true, data: counts ?? { resonateCount: 1, echoCount: 0, absorbCount: 0 } });
  })
);

// ─── POST /:id/heart ──────────────────────────────────────────────────────────
/**
 * Legacy heart alias — maps to a "resonate" reaction.
 * Keeps the `/whispers/:id/heart` endpoint alive for existing callers.
 */
router.post(
  "/:id/heart",
  asyncHandler(async (req: Request, res: Response) => {
    req.body = { ...req.body, type: "resonate" };
    // Forward to react handler logic inline
    const { id } = req.params;
    const user = (req as any).user;

    const [whisper] = await db.select().from(whispers).where(eq(whispers.id, id)).limit(1);
    if (!whisper) {
      return res.status(404).json({ success: false, message: "Whisper not found" });
    }

    if (user?.id) {
      await db
        .insert(whisperInteractions)
        .values({
          whisperId: whisper.id as unknown as number,
          userId: user.id,
          type: "resonate",
          weight: 1,
        })
        .onConflictDoNothing();
    }

    return res.json({ success: true, data: { hearted: true } });
  })
);

// ─── DELETE /:id ──────────────────────────────────────────────────────────────
/**
 * Delete an owned whisper.
 */
router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as any).user;

    const [whisper] = await db.select().from(whispers).where(eq(whispers.id, id)).limit(1);
    if (!whisper) {
      return res.status(404).json({ success: false, message: "Whisper not found" });
    }
    if (whisper.authorId !== user.id) {
      return res.status(403).json({ success: false, message: "Not your whisper" });
    }

    await db.delete(whispers).where(eq(whispers.id, id));

    return res.json({ success: true, data: { deleted: true } });
  })
);

export default router;
