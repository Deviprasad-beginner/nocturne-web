/**
 * Nightcap Studio Routes
 *
 * POST /api/v1/nightcap/generate-script  — AI affirmation script generator
 * POST /api/v1/nightcap/formulas         — Save a formula (mix recipe)
 * GET  /api/v1/nightcap/formulas/feed    — Public feed with creator username
 */

import { Router, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { asyncHandler } from "../../../middleware/error.middleware";
import { requireAuth } from "../../../middleware/auth.middleware";
import { db } from "../../../db";
import { nightFormulas, users, MixSettings } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// ─── Gemini setup ─────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const scriptModel = genAI.getGenerativeModel({
  model: process.env.AI_ANALYSIS_MODEL || "gemini-2.5-flash",
  generationConfig: { temperature: 0.9 }, // Higher temp for creative affirmations
});

// ─── Validation schemas ───────────────────────────────────────────────────────
const generateScriptSchema = z.object({
  mood: z.string().min(2).max(300),
});

const saveFormulaSchema = z.object({
  title: z.string().min(1).max(120),
  aiScript: z.string().min(1),
  audioBlobUrl: z.string().url().optional().nullable(),
  mixSettings: z.object({
    voiceVolume: z.number().min(0).max(1),
    rainVolume: z.number().min(0).max(1),
    binauralFrequency: z.number().min(0.5).max(40),
  }),
  isPublic: z.boolean().default(false),
});

// ─── POST /generate-script ────────────────────────────────────────────────────
/**
 * Accepts a mood description and returns a 3-sentence optimised affirmation
 * script crafted for bedtime / Theta-state listening.
 */
router.post(
  "/generate-script",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = generateScriptSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
        errors: parsed.error.flatten(),
      });
    }

    const { mood } = parsed.data;

    const prompt = `You are a sleep and manifestation coach. 
The user is about to enter a Theta-brainwave meditation session and has described their current mood as: "${mood}".

Write a 3-sentence affirmation script optimised for subconscious absorption. Rules:
- Use first-person present tense ("I am", "I have", "I attract")
- Keep each sentence short, rhythmic, and emotionally resonant
- End with a calming, sleep-inviting statement
- Do NOT include numbering, bullet points, or headers — just 3 plain sentences separated by newlines

Respond with ONLY the 3 sentences. Nothing else.`;

    const result = await scriptModel.generateContent(prompt);
    const script = result.response.text().trim();

    return res.json({ success: true, data: { script } });
  })
);

// ─── POST /formulas ───────────────────────────────────────────────────────────
/**
 * Persists the full audio mix recipe (JSON metadata) to the database.
 * The audio blob itself is stored client-side or uploaded separately;
 * only the URL reference is saved here.
 */
router.post(
  "/formulas",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = saveFormulaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid formula data",
        errors: parsed.error.flatten(),
      });
    }

    const user = (req as any).user;
    const { title, aiScript, audioBlobUrl, mixSettings, isPublic } = parsed.data;

    const [formula] = await db
      .insert(nightFormulas)
      .values({
        userId: user.id,
        title,
        aiScript,
        audioBlobUrl: audioBlobUrl ?? null,
        mixSettings: mixSettings as unknown as MixSettings,
        isPublic,
      })
      .returning();

    return res.status(201).json({ success: true, data: formula });
  })
);

// ─── GET /formulas/feed ───────────────────────────────────────────────────────
/**
 * Returns the most recent 20 public formulas, joined with the creator's username.
 * No authentication required — guests can browse the feed.
 */
router.get(
  "/formulas/feed",
  asyncHandler(async (_req: Request, res: Response) => {
    const feed = await db
      .select({
        id: nightFormulas.id,
        title: nightFormulas.title,
        aiScript: nightFormulas.aiScript,
        mixSettings: nightFormulas.mixSettings,
        audioBlobUrl: nightFormulas.audioBlobUrl,
        createdAt: nightFormulas.createdAt,
        creatorUsername: users.username,
        creatorDisplayName: users.displayName,
        creatorAvatar: users.profileImageUrl,
      })
      .from(nightFormulas)
      .innerJoin(users, eq(nightFormulas.userId, users.id))
      .where(eq(nightFormulas.isPublic, true))
      .orderBy(desc(nightFormulas.createdAt))
      .limit(20);

    return res.json({ success: true, data: feed });
  })
);

// ─── GET /formulas/mine ───────────────────────────────────────────────────────
/**
 * Returns all formulas belonging to the authenticated user (public + private).
 */
router.get(
  "/formulas/mine",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;

    const mine = await db
      .select()
      .from(nightFormulas)
      .where(eq(nightFormulas.userId, user.id))
      .orderBy(desc(nightFormulas.createdAt));

    return res.json({ success: true, data: mine });
  })
);

// ─── DELETE /formulas/:id ─────────────────────────────────────────────────────
router.delete(
  "/formulas/:id",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const formulaId = parseInt(req.params.id, 10);
    if (isNaN(formulaId)) {
      return res.status(400).json({ success: false, message: "Invalid formula ID" });
    }

    const user = (req as any).user;

    const deleted = await db
      .delete(nightFormulas)
      .where(and(eq(nightFormulas.id, formulaId), eq(nightFormulas.userId, user.id)))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({ success: false, message: "Formula not found or not yours" });
    }

    return res.json({ success: true, data: { deleted: true } });
  })
);

export default router;
