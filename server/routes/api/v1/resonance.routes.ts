/**
 * Nocturne Resonance Service API Routes
 *
 * GET  /api/v1/resonance/starters       — Curated library of whisper topics & thought starter quotes
 * GET  /api/v1/resonance/quotes         — Random active quotes from DB
 * POST /api/v1/resonance/queue          — Join multi-factor resonance match queue
 * GET  /api/v1/resonance/queue/status   — Poll for match status
 * DELETE /api/v1/resonance/queue/leave  — Cancel search and leave queue
 * GET  /api/v1/resonance/chat/:chatId   — Fetch chat session with shared spark & messages
 * POST /api/v1/resonance/chat/:chatId/messages — Send chat message
 * POST /api/v1/resonance/chat/:chatId/leave — End conversation & close chamber
 * POST /api/v1/resonance/chat/:chatId/report — Report inappropriate behavior & auto-block
 * POST /api/v1/resonance/chat/:chatId/block  — Block peer from future matching
 */

import { Router, Request, Response } from "express";
import { db } from "../../../db";
import {
  resonanceQuotes,
  matchQueue,
  activeChats,
  resonanceChatMessages,
  userBlocks,
  userReports,
  users,
  type ResonanceQuote,
} from "@shared/schema";
import { eq, and, sql, desc, ne, or } from "drizzle-orm";
import { requireAuth } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/error.middleware";
import { logger } from "../../../utils/logger";
import { resonanceQueueService } from "../../../services/resonance-queue.service";
import { storage } from "../../../storage";

const router = Router();

// ─── Curated Topic & Quote Library ───────────────────────────────────────────
export interface WhisperStarterTopic {
  id: string;
  type: "topic";
  title: string;
  category: string;
  moods: string[];
  depth: "gentle" | "deep" | "exploratory";
}

export interface ThoughtQuoteStarter {
  id: string;
  type: "quote";
  prompt: string;
  author?: string;
  category: string;
  moods: string[];
  depth: "gentle" | "deep" | "exploratory";
}

export const CURATED_TOPICS: WhisperStarterTopic[] = [
  { id: "t1", type: "topic", title: "Things I Never Say Out Loud", category: "Vulnerability", moods: ["lonely", "reflective", "anxious"], depth: "deep" },
  { id: "t2", type: "topic", title: "Unfinished Dreams", category: "Aspiration", moods: ["inspired", "restless", "hopeful"], depth: "exploratory" },
  { id: "t3", type: "topic", title: "The Fear Behind My Ambition", category: "Growth", moods: ["restless", "curious", "anxious"], depth: "deep" },
  { id: "t4", type: "topic", title: "People I Still Think About", category: "Memory", moods: ["nostalgic", "lonely", "reflective"], depth: "deep" },
  { id: "t5", type: "topic", title: "Questions About Life", category: "Philosophy", moods: ["curious", "reflective", "inspired"], depth: "exploratory" },
  { id: "t6", type: "topic", title: "Things I Wish Someone Understood", category: "Connection", moods: ["lonely", "reflective", "anxious"], depth: "deep" },
  { id: "t7", type: "topic", title: "Memories That Changed Me", category: "Growth", moods: ["nostalgic", "grateful", "reflective"], depth: "deep" },
  { id: "t8", type: "topic", title: "Thoughts I Have at 2 AM", category: "Midnight", moods: ["restless", "lonely", "playful", "curious"], depth: "gentle" },
  { id: "t9", type: "topic", title: "Small Moments of Grace", category: "Gratitude", moods: ["grateful", "hopeful", "reflective"], depth: "gentle" },
  { id: "t10", type: "topic", title: "The Masks We Wear During the Day", category: "Identity", moods: ["reflective", "anxious", "lonely"], depth: "deep" },
];

export const CURATED_QUOTES: ThoughtQuoteStarter[] = [
  { id: "q1", type: "quote", prompt: "What is something you wish people understood about you without you having to explain it?", category: "Insight", moods: ["lonely", "reflective"], depth: "deep" },
  { id: "q2", type: "quote", prompt: "Do you miss a person, or the version of yourself you were around them?", category: "Nostalgia", moods: ["nostalgic", "reflective"], depth: "deep" },
  { id: "q3", type: "quote", prompt: "What is a dream you have never told anyone about?", category: "Secret", moods: ["inspired", "hopeful", "restless"], depth: "exploratory" },
  { id: "q4", type: "quote", prompt: "What is one question you wish someone would ask you tonight?", category: "Connection", moods: ["curious", "lonely", "reflective"], depth: "gentle" },
  { id: "q5", type: "quote", prompt: "What thought keeps returning when everything becomes quiet?", category: "Midnight", moods: ["reflective", "anxious", "lonely"], depth: "deep" },
  { id: "q6", type: "quote", prompt: "What was the most peacefully solitary moment you can remember?", category: "Peace", moods: ["grateful", "nostalgic"], depth: "gentle" },
  { id: "q7", type: "quote", prompt: "If tonight had no consequences, what would you give yourself permission to feel?", category: "Freedom", moods: ["playful", "restless", "curious"], depth: "exploratory" },
  { id: "q8", type: "quote", prompt: "What are you quietly proud of that went unnoticed by the world?", category: "Validation", moods: ["reflective", "hopeful", "grateful"], depth: "gentle" },
];

// ─── Seed quotes (static fallback if DB is empty) ────────────────────────────
const SEED_QUOTES: Omit<ResonanceQuote, "id" | "createdAt" | "isActive">[] = [
  { text: "You have power over your mind, not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", philosophyTag: "Stoicism" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", philosophyTag: "Existentialism" },
  { text: "I think, therefore I am.", author: "René Descartes", philosophyTag: "Rationalism" },
  { text: "The unexamined life is not worth living.", author: "Socrates", philosophyTag: "Virtue Ethics" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", philosophyTag: "Virtue Ethics" },
  { text: "Existence precedes essence.", author: "Jean-Paul Sartre", philosophyTag: "Existentialism" },
  { text: "Amor fati — love your fate.", author: "Friedrich Nietzsche", philosophyTag: "Stoicism" },
  { text: "To live is to suffer, to survive is to find some meaning in the suffering.", author: "Nietzsche", philosophyTag: "Existentialism" },
  { text: "The present moment always will have been.", author: "Anonymous", philosophyTag: "Stoicism" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", philosophyTag: "Pragmatism" },
  { text: "The obstacle is the way.", author: "Marcus Aurelius", philosophyTag: "Stoicism" },
  { text: "Act only according to that maxim whereby you can at the same time will that it should become a universal law.", author: "Immanuel Kant", philosophyTag: "Deontology" },
  { text: "I am not what happened to me, I am what I choose to become.", author: "Carl Jung", philosophyTag: "Depth Psychology" },
  { text: "One must imagine Sisyphus happy.", author: "Albert Camus", philosophyTag: "Absurdism" },
  { text: "This too shall pass.", author: "Attar of Nishapur", philosophyTag: "Sufism" },
  { text: "Man is condemned to be free.", author: "Jean-Paul Sartre", philosophyTag: "Existentialism" },
  { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson", philosophyTag: "Transcendentalism" },
  { text: "It is not death that a man should fear, but he should fear never beginning to live.", author: "Marcus Aurelius", philosophyTag: "Stoicism" },
  { text: "No man steps in the same river twice.", author: "Heraclitus", philosophyTag: "Heracliteanism" },
  { text: "The only way out is through.", author: "Robert Frost", philosophyTag: "Pragmatism" },
];

async function ensureQuotesSeeded() {
  const existing = await db.select({ id: resonanceQuotes.id }).from(resonanceQuotes).limit(1);
  if (existing.length > 0) return;

  logger.info("[Resonance] Seeding resonance quotes...");
  await db.insert(resonanceQuotes).values(
    SEED_QUOTES.map((q) => ({ ...q, isActive: true }))
  );
  logger.info("[Resonance] Quotes seeded.");
}

// ─── GET /api/v1/resonance/starters ──────────────────────────────────────────
// Returns whisper topics and thought starter quotes, optionally prioritized by mood
router.get(
  "/starters",
  asyncHandler(async (req: Request, res: Response) => {
    const mood = typeof req.query.mood === "string" ? req.query.mood.toLowerCase() : undefined;

    let topics = [...CURATED_TOPICS];
    let quotes = [...CURATED_QUOTES];

    if (mood) {
      topics.sort((a, b) => (b.moods.includes(mood) ? 1 : 0) - (a.moods.includes(mood) ? 1 : 0));
      quotes.sort((a, b) => (b.moods.includes(mood) ? 1 : 0) - (a.moods.includes(mood) ? 1 : 0));
    }

    res.json({
      success: true,
      data: {
        topics,
        quotes,
        mood,
      },
    });
  })
);

// ─── GET /api/v1/resonance/quotes ────────────────────────────────────────────
// Returns a randomized daily selection of 5 active quotes.
router.get(
  "/quotes",
  asyncHandler(async (_req: Request, res: Response) => {
    await ensureQuotesSeeded();

    const quotes = await db
      .select()
      .from(resonanceQuotes)
      .where(eq(resonanceQuotes.isActive, true))
      .orderBy(sql`RANDOM()`)
      .limit(6);

    res.json({ success: true, data: quotes });
  })
);

// ─── POST /api/v1/resonance/queue ─────────────────────────────────────────────
// Real multi-factor resonance matchmaking:
// Ranks candidates based on:
// - Topic compatibility (40%)
// - Conversation intent (25%)
// - Mood harmony (20%)
// - Depth / personal reflection (15%)
router.post(
  "/queue",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as { id: string };
    const { mood, selectedQuoteId, topicText, conversationIntent, personalWhisper } = req.body;

    // Sanitize and validate inputs
    const sanitizedTopic = typeof topicText === "string" ? topicText.trim().slice(0, 300) : undefined;
    const sanitizedWhisper = typeof personalWhisper === "string" ? personalWhisper.trim().slice(0, 300) : undefined;
    const sanitizedIntent = typeof conversationIntent === "string" ? conversationIntent.trim().slice(0, 100) : undefined;
    const sanitizedMood = typeof mood === "string" ? mood.trim().slice(0, 50) : undefined;
    const quoteIdNum = typeof selectedQuoteId === "number" && !isNaN(selectedQuoteId) ? selectedQuoteId : undefined;

    // 1. Check if user is ALREADY in an active chat
    const activeChat = await db
      .select()
      .from(activeChats)
      .where(
        and(
          eq(activeChats.isActive, true),
          or(eq(activeChats.userOneId, user.id), eq(activeChats.userTwoId, user.id))
        )
      )
      .orderBy(desc(activeChats.createdAt))
      .limit(1);

    if (activeChat.length > 0) {
      return res.json({
        success: true,
        data: {
          status: "matched",
          chatId: activeChat[0].id,
          sharedTopic: activeChat[0].sharedTopic,
          sharedPrompt: activeChat[0].sharedPrompt,
        },
        message: "Active resonance conversation found."
      });
    }

    // 2. Fetch blocked users to exclude
    const blockRows = await db
      .select()
      .from(userBlocks)
      .where(or(eq(userBlocks.blockerId, user.id), eq(userBlocks.blockedId, user.id)));
    const blockedSet = new Set<string>();
    for (const b of blockRows) {
      blockedSet.add(b.blockerId);
      blockedSet.add(b.blockedId);
    }

    // 3. Clear previous searching records for this user
    await db
      .delete(matchQueue)
      .where(and(eq(matchQueue.userId, user.id), eq(matchQueue.status, "searching")));

    // 4. Fetch waiting candidates (created in the last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const waitingCandidates = await db
      .select()
      .from(matchQueue)
      .where(
        and(
          eq(matchQueue.status, "searching"),
          ne(matchQueue.userId, user.id),
          sql`${matchQueue.createdAt} > ${fiveMinutesAgo.toISOString()}`
        )
      );

    const eligible = waitingCandidates.filter((c) => !blockedSet.has(c.userId));

    if (eligible.length > 0) {
      const COMPLEMENTARY_MOODS: Record<string, string[]> = {
        lonely: ["lonely", "grateful", "nostalgic", "reflective"],
        restless: ["restless", "inspired", "curious", "playful"],
        nostalgic: ["nostalgic", "lonely", "grateful", "reflective"],
        curious: ["curious", "inspired", "restless", "playful"],
        inspired: ["inspired", "restless", "hopeful", "curious"],
        anxious: ["anxious", "grateful", "hopeful", "reflective"],
        grateful: ["grateful", "lonely", "anxious", "nostalgic", "hopeful"],
        hopeful: ["hopeful", "inspired", "grateful", "reflective"],
        reflective: ["reflective", "nostalgic", "lonely", "grateful"],
        playful: ["playful", "curious", "restless"],
      };

      // Score each candidate
      const scored = eligible.map((c) => {
        // Topic score (40%)
        let topicScore = 0.4;
        if (quoteIdNum && c.selectedQuoteId && quoteIdNum === c.selectedQuoteId) {
          topicScore = 1.0;
        } else if (sanitizedTopic && c.topicText && sanitizedTopic.toLowerCase() === c.topicText.trim().toLowerCase()) {
          topicScore = 1.0;
        } else if (sanitizedTopic && c.topicText) {
          const wordsA = new Set(sanitizedTopic.toLowerCase().split(/\s+/));
          const hasCommon = c.topicText.toLowerCase().split(/\s+/).some((w) => w.length > 3 && wordsA.has(w));
          topicScore = hasCommon ? 0.75 : 0.4;
        }

        // Intent score (25%)
        let intentScore = 0.5;
        if (sanitizedIntent && c.conversationIntent) {
          if (sanitizedIntent === c.conversationIntent) {
            intentScore = 1.0;
          } else if (sanitizedIntent === "I'm open to anything." || c.conversationIntent === "I'm open to anything.") {
            intentScore = 0.85;
          } else {
            intentScore = 0.4;
          }
        } else {
          intentScore = 0.7;
        }

        // Mood score (20%)
        let moodScore = 0.5;
        if (sanitizedMood && c.mood) {
          if (sanitizedMood === c.mood) {
            moodScore = 1.0;
          } else if (COMPLEMENTARY_MOODS[sanitizedMood]?.includes(c.mood)) {
            moodScore = 0.8;
          } else {
            moodScore = 0.4;
          }
        }

        // Depth score (15%)
        let depthScore = 0.5;
        const hasSelfWhisper = Boolean(sanitizedWhisper);
        const hasPeerWhisper = Boolean(c.personalWhisper?.trim());
        if (hasSelfWhisper && hasPeerWhisper) {
          depthScore = 1.0;
        } else if (hasSelfWhisper || hasPeerWhisper) {
          depthScore = 0.75;
        }

        const totalScore = topicScore * 0.40 + intentScore * 0.25 + moodScore * 0.20 + depthScore * 0.15;
        return { candidate: c, score: totalScore };
      });

      scored.sort((a, b) => b.score - a.score);
      const partner = scored[0].candidate;

      // Determine shared prompt and topic
      let promptText = sanitizedTopic || partner.topicText || "";
      if (!promptText && (quoteIdNum || partner.selectedQuoteId)) {
        const qId = quoteIdNum || partner.selectedQuoteId;
        const [q] = await db.select().from(resonanceQuotes).where(eq(resonanceQuotes.id, qId!));
        if (q) promptText = `"${q.text}"${q.author ? ` — ${q.author}` : ""}`;
      }
      if (!promptText) promptText = "What thought keeps returning when everything becomes quiet?";

      const sharedTopicName = sanitizedTopic || partner.topicText || "Quiet Night Resonance";
      const sharedIntentName = sanitizedIntent || partner.conversationIntent || "A thoughtful conversation";

      // Create active chat
      const [chat] = await db
        .insert(activeChats)
        .values({
          userOneId: user.id,
          userTwoId: partner.userId,
          quoteId: quoteIdNum || partner.selectedQuoteId || null,
          sharedTopic: sharedTopicName,
          sharedPrompt: promptText,
          sharedIntent: sharedIntentName,
          isActive: true,
        })
        .returning();

      // Insert icebreaker
      await db.insert(resonanceChatMessages).values({
        chatId: chat.id,
        senderId: null,
        content: promptText,
        isIcebreaker: true,
      });

      // Mark partner queue item as matched
      await db.update(matchQueue).set({ status: "matched" }).where(eq(matchQueue.id, partner.id));

      return res.status(201).json({
        success: true,
        data: {
          status: "matched",
          chatId: chat.id,
          sharedTopic: sharedTopicName,
          sharedPrompt: promptText,
          sharedIntent: sharedIntentName,
          peerMood: partner.mood,
        },
        message: "Resonance found!",
      });
    }

    // 5. No eligible candidate ready immediately: add to queue
    const [queueEntry] = await db
      .insert(matchQueue)
      .values({
        userId: user.id,
        selectedQuoteId: quoteIdNum || null,
        topicText: sanitizedTopic || null,
        mood: sanitizedMood || null,
        conversationIntent: sanitizedIntent || null,
        personalWhisper: sanitizedWhisper || null,
        status: "searching",
      })
      .returning();

    return res.status(202).json({
      success: true,
      data: {
        status: "searching",
        queueId: queueEntry.id,
        mood,
      },
      message: "Added to queue. Scanning frequencies...",
    });
  })
);

// ─── DELETE /api/v1/resonance/queue/leave ────────────────────────────────────
// Explicitly cancel search and remove user from queue
router.delete(
  "/queue/leave",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    await db
      .delete(matchQueue)
      .where(and(eq(matchQueue.userId, user.id), eq(matchQueue.status, "searching")));
    resonanceQueueService.leaveQueue(user.id);
    return res.json({ success: true, data: { left: true } });
  })
);

// ─── GET /api/v1/resonance/queue/status ───────────────────────────────────────
// Polling endpoint for frontend to check match status
router.get(
  "/queue/status",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;

    // Check if matched into an active chat
    const chat = await db
      .select()
      .from(activeChats)
      .where(
        and(
          eq(activeChats.isActive, true),
          or(eq(activeChats.userOneId, user.id), eq(activeChats.userTwoId, user.id))
        )
      )
      .orderBy(desc(activeChats.createdAt))
      .limit(1);

    if (chat.length > 0) {
      return res.json({
        success: true,
        data: {
          status: "matched",
          chatId: chat[0].id,
          sharedTopic: chat[0].sharedTopic,
          sharedPrompt: chat[0].sharedPrompt,
        },
      });
    }

    // Check if still searching
    const [queueEntry] = await db
      .select()
      .from(matchQueue)
      .where(and(eq(matchQueue.userId, user.id), eq(matchQueue.status, "searching")));

    if (queueEntry) {
      // If waiting longer than 60s, mark fallback
      const ageMs = Date.now() - new Date(queueEntry.createdAt!).getTime();
      if (ageMs > 60 * 1000) {
        await db.update(matchQueue).set({ status: "fallback" }).where(eq(matchQueue.id, queueEntry.id));
        return res.json({ success: true, data: { status: "fallback" } });
      }
      return res.json({ success: true, data: { status: "searching", queueId: queueEntry.id } });
    }

    return res.json({ success: true, data: { status: "idle" } });
  })
);

// ─── GET /api/v1/resonance/chat/:chatId ───────────────────────────────────────
// Returns chat details, shared spark, authorization check, and full message history
router.get(
  "/chat/:chatId",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const chatId = parseInt(req.params.chatId);

    if (isNaN(chatId)) {
      return res.status(400).json({ success: false, message: "Invalid chat id" });
    }

    const [chat] = await db
      .select()
      .from(activeChats)
      .where(eq(activeChats.id, chatId));

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Verify authorized participant
    if (chat.userOneId !== user.id && chat.userTwoId !== user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Fetch quote if associated
    let quote = null;
    if (chat.quoteId) {
      const [q] = await db
        .select()
        .from(resonanceQuotes)
        .where(eq(resonanceQuotes.id, chat.quoteId));
      quote = q ?? null;
    }

    // If no quote record, synthesize quote object from sharedPrompt so UI renders smoothly
    if (!quote && chat.sharedPrompt) {
      quote = {
        id: 0,
        text: chat.sharedPrompt,
        author: chat.sharedTopic ? `${chat.sharedTopic}` : null,
        philosophyTag: chat.sharedIntent ?? "Resonance",
        isActive: true,
        createdAt: chat.createdAt,
      };
    }

    // Fetch messages
    const messages = await db
      .select()
      .from(resonanceChatMessages)
      .where(eq(resonanceChatMessages.chatId, chatId))
      .orderBy(resonanceChatMessages.createdAt);

    res.json({
      success: true,
      data: {
        chat,
        quote,
        messages,
      },
    });
  })
);

// ─── POST /api/v1/resonance/chat/:chatId/messages ─────────────────────────────
// Send a message inside the chat
router.post(
  "/chat/:chatId/messages",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as { id: string };
    const chatId = parseInt(req.params.chatId);
    const { content } = req.body;

    if (isNaN(chatId)) {
      return res.status(400).json({ success: false, message: "Invalid chat id" });
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ success: false, message: "Message content is required" });
    }

    const sanitizedContent = content.trim().slice(0, 1000);

    const [chat] = await db.select().from(activeChats).where(eq(activeChats.id, chatId));

    if (!chat || (chat.userOneId !== user.id && chat.userTwoId !== user.id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    if (!chat.isActive) {
      return res.status(400).json({ success: false, message: "This resonance conversation has ended." });
    }

    const [message] = await db
      .insert(resonanceChatMessages)
      .values({ chatId, senderId: user.id, content: sanitizedContent, isIcebreaker: false })
      .returning();

    res.status(201).json({ success: true, data: message });
  })
);

// ─── POST /api/v1/resonance/chat/:chatId/leave ────────────────────────────────
// End the conversation and close the resonance chamber
router.post(
  "/chat/:chatId/leave",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as { id: string };
    const chatId = parseInt(req.params.chatId);

    const [chat] = await db.select().from(activeChats).where(eq(activeChats.id, chatId));
    if (!chat || (chat.userOneId !== user.id && chat.userTwoId !== user.id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await db
      .update(activeChats)
      .set({ isActive: false, endedBy: user.id })
      .where(eq(activeChats.id, chatId));

    res.json({ success: true, message: "Conversation ended." });
  })
);

// ─── POST /api/v1/resonance/chat/:chatId/report ───────────────────────────────
// Report abusive behavior and automatically block the peer
router.post(
  "/chat/:chatId/report",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as { id: string };
    const chatId = parseInt(req.params.chatId);
    const { reason } = req.body;

    const [chat] = await db.select().from(activeChats).where(eq(activeChats.id, chatId));
    if (!chat || (chat.userOneId !== user.id && chat.userTwoId !== user.id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const peerId = chat.userOneId === user.id ? chat.userTwoId : chat.userOneId;
    const sanitizedReason = typeof reason === "string" ? reason.trim().slice(0, 200) : "Inappropriate behavior";

    // Record report
    await db.insert(userReports).values({
      reporterId: user.id,
      reportedId: peerId,
      chatId,
      reason: sanitizedReason,
    });

    // Automatically block
    await db.insert(userBlocks).values({
      blockerId: user.id,
      blockedId: peerId,
    });

    // Close chat
    await db
      .update(activeChats)
      .set({ isActive: false, endedBy: user.id })
      .where(eq(activeChats.id, chatId));

    // Increment reported user's reportCount
    await db
      .update(users)
      .set({ reportCount: sql`${users.reportCount} + 1` })
      .where(eq(users.id, peerId));

    res.json({ success: true, message: "Report submitted. Peer has been blocked." });
  })
);

// ─── POST /api/v1/resonance/chat/:chatId/block ────────────────────────────────
// Explicit block without reporting
router.post(
  "/chat/:chatId/block",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as { id: string };
    const chatId = parseInt(req.params.chatId);

    const [chat] = await db.select().from(activeChats).where(eq(activeChats.id, chatId));
    if (!chat || (chat.userOneId !== user.id && chat.userTwoId !== user.id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const peerId = chat.userOneId === user.id ? chat.userTwoId : chat.userOneId;

    await db.insert(userBlocks).values({
      blockerId: user.id,
      blockedId: peerId,
    });

    await db
      .update(activeChats)
      .set({ isActive: false, endedBy: user.id })
      .where(eq(activeChats.id, chatId));

    res.json({ success: true, message: "Peer blocked." });
  })
);

export default router;
