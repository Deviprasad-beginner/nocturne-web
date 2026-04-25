import { Router } from "express";
import { db } from "../../../db";
import { diaries, whispers, midnightCafe } from "@shared/schema";
import { desc } from "drizzle-orm";
import { logger } from "../../../utils/logger";

const router = Router();

// Get recent activity across the platform
router.get("/recent", async (req, res) => {
    const MAX_RETRIES = 2;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Three separate Drizzle ORM queries instead of fragile raw UNION ALL SQL
            // More resilient to Neon pooler cold-starts
            const [recentDiaries, recentWhispers, recentCafe] = await Promise.all([
                db
                    .select({ id: diaries.id, createdAt: diaries.createdAt })
                    .from(diaries)
                    .orderBy(desc(diaries.createdAt))
                    .limit(5),

                db
                    .select({ id: whispers.id, createdAt: whispers.createdAt })
                    .from(whispers)
                    .orderBy(desc(whispers.createdAt))
                    .limit(5),

                db
                    .select({ id: midnightCafe.id, createdAt: midnightCafe.createdAt, topic: midnightCafe.topic })
                    .from(midnightCafe)
                    .orderBy(desc(midnightCafe.createdAt))
                    .limit(5),
            ]);

            const combined = [
                ...recentDiaries.map((d) => ({
                    id: `post-${d.id}`,
                    type: "post",
                    user: "A Night Owl",
                    content: "shared a diary entry",
                    timestamp: d.createdAt,
                    category: "diaries",
                    link: "/diaries",
                })),
                ...recentWhispers.map((w) => ({
                    id: `whisper-${w.id}`,
                    type: "whisper",
                    user: "Anonymous",
                    content: "whispered into the night",
                    timestamp: w.createdAt,
                    category: "whispers",
                    link: "/whispers",
                })),
                ...recentCafe.map((m) => ({
                    id: `comment-${m.id}`,
                    type: "comment",
                    user: "A Night Wanderer",
                    content: `started a conversation about ${m.topic?.slice(0, 30) ?? "..."}`,
                    timestamp: m.createdAt,
                    category: "cafe",
                    link: "/midnight-cafe",
                })),
            ]
                .sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime())
                .slice(0, 20);

            return res.json({ success: true, data: combined });

        } catch (error: any) {
            const isNetworkError = ["ENOTFOUND", "ECONNREFUSED", "ETIMEDOUT"].includes(error.code);

            if (isNetworkError && attempt < MAX_RETRIES) {
                logger.warn(`[activity/recent] Network error on attempt ${attempt}, retrying...`);
                await new Promise((r) => setTimeout(r, 1000));
                continue;
            }

            // Return empty activity feed instead of crashing the page with 500
            logger.error(`[activity/recent] Failed after ${attempt} attempt(s): ${error.message}`);
            return res.json({ success: true, data: [] });
        }
    }
});

// Get activity stats
router.get("/stats", async (req, res) => {
    try {
        const [diaryCount, whisperCount, cafeCount] = await Promise.all([
            db.select({ id: diaries.id }).from(diaries).limit(1000),
            db.select({ id: whispers.id }).from(whispers).limit(1000),
            db.select({ id: midnightCafe.id }).from(midnightCafe).limit(1000),
        ]);

        res.json({
            success: true,
            data: {
                diaries_today: diaryCount.length,
                whispers_today: whisperCount.length,
                cafe_today: cafeCount.length,
                active_users_today: 0,
            },
        });
    } catch (error: any) {
        logger.error("Error fetching activity stats:", error);
        res.json({ success: true, data: { diaries_today: 0, whispers_today: 0, cafe_today: 0, active_users_today: 0 } });
    }
});

export default router;
