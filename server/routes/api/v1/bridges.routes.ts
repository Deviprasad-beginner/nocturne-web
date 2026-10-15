import { Router } from "express";
import { requireAuth } from "../../../middleware/auth.middleware";
import { db } from "../../../db";
import { mindMazeVotes, cafeThreads } from "../../../../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Require auth for all bridge actions
router.use(requireAuth);

/**
 * POST /api/v1/bridges/mind-maze/vote
 * The Thinker's Bridge (Mind Maze -> Midnight Cafe)
 */
router.post("/mind-maze/vote", async (req, res) => {
    try {
        const userId = (req as any).user.id;
        const { promptId, voteValue, promptText } = req.body;

        if (!promptId || !voteValue) {
            return res.status(400).json({ success: false, message: "Missing promptId or voteValue" });
        }

        // 1. Record the vote
        await db.insert(mindMazeVotes).values({
            userId,
            promptId,
            voteValue
        });

        // 2. Check if a relevant cafe thread exists for this prompt
        let [thread] = await db.select().from(cafeThreads).where(
            eq(cafeThreads.linkedPromptId, promptId)
        ).limit(1);

        // 3. Create one if it doesn't
        if (!thread) {
            const [newThread] = await db.insert(cafeThreads).values({
                title: `Deep Dive: ${promptText || 'Daily Philosophical Prompt'}`,
                linkedPromptId: promptId
            }).returning();
            thread = newThread;
        }

        // 4. Mock the distributions: "Dive deeper with 12 others who feel the same... and 3 who see it differently."
        const agreeCount = Math.floor(Math.random() * 15) + 5; 
        const disagreeCount = Math.floor(Math.random() * 5) + 1;

        res.json({
            success: true,
            data: {
                threadId: thread.id,
                agreeCount,
                disagreeCount
            }
        });
    } catch (error) {
        console.error("Error in Thinker's Bridge vote:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

/**
 * POST /api/v1/bridges/analyze-sentiment
 * The Atmospheric Bridge (Diaries -> Music Engine)
 */
router.post("/analyze-sentiment", async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ success: false, message: "Missing text" });
        }

        // Forward payload to Python FastAPI service
        try {
            const response = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            
            if (response.ok) {
                const data = await response.json();
                return res.json({ success: true, data });
            }
        } catch (fetchError) {
            console.warn("Python sentiment service not available, falling back to mock response.");
        }

        // Fallback mock if Python service is down or unreachable
        const lowerText = text.toLowerCase();
        let sentiment = "neutral";
        let score = 0.5;

        if (lowerText.includes("sad") || lowerText.includes("nostalgic") || lowerText.includes("miss") || lowerText.includes("lonely")) {
            sentiment = "nostalgic";
            score = 0.8;
        } else if (lowerText.includes("happy") || lowerText.includes("excited")) {
            sentiment = "joyful";
            score = 0.9;
        } else if (lowerText.includes("angry") || lowerText.includes("frustrated")) {
            sentiment = "turbulent";
            score = 0.2;
        }

        res.json({
            success: true,
            data: {
                sentiment,
                score
            }
        });

    } catch (error) {
        console.error("Error in Atmospheric Bridge analysis:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

export default router;
