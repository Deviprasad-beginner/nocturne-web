import { Router } from "express";
import { db } from "../../../db";
import { users, diaries, whispers, midnightCafe } from "@shared/schema";
import { sql, eq, and, gte } from "drizzle-orm";

const router = Router();

// Get user's profile stats
router.get("/stats", async (req, res) => {
    try {
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({
                success: false,
                error: { message: "Authentication required" }
            });
        }

        const userId = req.user.id;

        // Calculate user statistics
        const stats = await db.execute(sql`
            SELECT 
                -- Total posts across all features
                COALESCE((SELECT COUNT(*) FROM ${diaries} WHERE author_id = ${userId}), 0) as diary_posts,
                COALESCE((SELECT COUNT(*) FROM ${whispers} WHERE author_id = ${userId}), 0) as whisper_posts,
                COALESCE((SELECT COUNT(*) FROM ${midnightCafe} WHERE author_id = ${userId}), 0) as cafe_posts,
                
                -- Total hearts received on whispers
                COALESCE((SELECT SUM(hearts) FROM ${whispers} WHERE author_id = ${userId}), 0) as total_hearts,
                
                -- Recent activity for streak calculation (posts in last 7 days)
                COALESCE((
                    SELECT COUNT(DISTINCT DATE(created_at))
                    FROM (
                        SELECT created_at FROM ${diaries} WHERE author_id = ${userId} AND created_at > NOW() - INTERVAL '7 days'
                        UNION ALL
                        SELECT created_at FROM ${whispers} WHERE author_id = ${userId} AND created_at > NOW() - INTERVAL '7 days'
                        UNION ALL
                        SELECT created_at FROM ${midnightCafe} WHERE author_id = ${userId} AND created_at > NOW() - INTERVAL '7 days'
                    ) as all_posts
                ), 0) as active_days_last_week,
                
                -- Account age in days
                COALESCE(EXTRACT(DAY FROM (NOW() - (SELECT created_at FROM ${users} WHERE id = ${userId}))), 0) as account_age_days
        `);

        const rawStats = stats.rows[0] as any;

        // Calculate derived stats - using Number() for type safety
        const totalPosts = Number(rawStats.diary_posts || 0) +
            Number(rawStats.whisper_posts || 0) +
            Number(rawStats.cafe_posts || 0);

        const totalHearts = Number(rawStats.total_hearts || 0);
        const activeDaysLastWeek = Number(rawStats.active_days_last_week || 0);
        const accountAgeDays = Number(rawStats.account_age_days || 0);

        // Calculate level based on activity
        // Level formula: (totalPosts * 10 + totalHearts * 2) / 100
        const experiencePoints = (totalPosts * 10) + (totalHearts * 2);
        const nightOwlLevel = Math.floor(experiencePoints / 100) || 1;

        // Current streak is approximated by active days in last week
        const streakDays = activeDaysLastWeek;

        res.json({
            success: true,
            data: {
                nightOwlLevel,
                totalHearts,
                postsShared: totalPosts,
                conversationsJoined: Number(rawStats.cafe_posts || 0),
                streakDays,
                experiencePoints,
                breakdown: {
                    diaryPosts: Number(rawStats.diary_posts || 0),
                    whisperPosts: Number(rawStats.whisper_posts || 0),
                    cafePosts: Number(rawStats.cafe_posts || 0)
                },
                accountAgeDays
            }
        });
    } catch (error: any) {
        console.error("Error fetching user stats:", error);
        res.status(500).json({
            success: false,
            error: { message: error.message }
        });
    }
});

// Get user's achievements
router.get("/achievements", async (req, res) => {
    try {
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({
                success: false,
                error: { message: "Authentication required" }
            });
        }

        const userId = req.user.id;

        // Check for various achievements
        const achievementChecks = await db.execute(sql`
            SELECT 
                EXISTS(SELECT 1 FROM ${diaries} WHERE author_id = ${userId} LIMIT 1) as has_first_diary,
                EXISTS(SELECT 1 FROM ${whispers} WHERE author_id = ${userId} LIMIT 1) as has_first_whisper,
                EXISTS(SELECT 1 FROM ${whispers} WHERE author_id = ${userId} AND hearts > 0 LIMIT 1) as has_first_heart,
                EXISTS(SELECT 1 FROM ${midnightCafe} WHERE author_id = ${userId} LIMIT 1) as has_first_cafe,
                (SELECT COUNT(*) FROM ${diaries} WHERE author_id = ${userId}) >= 10 as has_ten_diaries,
                (SELECT COUNT(*) FROM ${whispers} WHERE author_id = ${userId}) >= 10 as has_ten_whispers,
                (SELECT SUM(hearts) FROM ${whispers} WHERE author_id = ${userId}) >= 50 as has_fifty_hearts
        `);

        const checks = achievementChecks.rows[0];

        const achievements = [];

        if (checks.has_first_diary) {
            achievements.push({
                id: 'first_diary',
                icon: 'moon',
                title: 'Night Owl Initiate',
                description: 'Wrote your first diary entry',
                color: 'purple'
            });
        }

        if (checks.has_first_whisper) {
            achievements.push({
                id: 'first_whisper',
                icon: 'star',
                title: 'Whisper in the Dark',
                description: 'Shared your first whisper',
                color: 'pink'
            });
        }

        if (checks.has_first_heart) {
            achievements.push({
                id: 'first_heart',
                icon: 'heart',
                title: 'First Heart Received',
                description: 'Someone loved your whisper',
                color: 'red'
            });
        }

        if (checks.has_first_cafe) {
            achievements.push({
                id: 'first_cafe',
                icon: 'message',
                title: 'Conversation Starter',
                description: 'Started a cafe conversation',
                color: 'blue'
            });
        }

        if (checks.has_ten_diaries) {
            achievements.push({
                id: 'ten_diaries',
                icon: 'trophy',
                title: 'Dedicated Diarist',
                description: 'Wrote 10 diary entries',
                color: 'yellow'
            });
        }

        if (checks.has_ten_whispers) {
            achievements.push({
                id: 'ten_whispers',
                icon: 'trophy',
                title: 'Voice of the Night',
                description: 'Shared 10 whispers',
                color: 'purple'
            });
        }

        if (checks.has_fifty_hearts) {
            achievements.push({
                id: 'fifty_hearts',
                icon: 'trophy',
                title: 'Beloved Night Soul',
                description: 'Received 50 hearts total',
                color: 'gold'
            });
        }

        res.json({
            success: true,
            data: achievements
        });
    } catch (error: any) {
        console.error("Error fetching achievements:", error);
        res.status(500).json({
            success: false,
            error: { message: error.message }
        });
    }
});

export default router;
