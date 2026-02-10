import { Router } from "express";
import { db } from "../../../db";
import { diaries, whispers, midnightCafe, users } from "@shared/schema";
import { sql, desc } from "drizzle-orm";

const router = Router();

// Get recent activity across the platform
router.get("/recent", async (req, res) => {
    try {
        // Fetch recent activities from different sources
        const recentActivities = await db.execute(sql`
            -- Recent diary posts
            (SELECT 
                'post' as type,
                d.id,
                COALESCE(u.display_name, 'Anonymous') as username,
                'shared a diary entry' as action,
                d.created_at as timestamp,
                'diaries' as category,
                '/diaries' as link
            FROM ${diaries} d
            LEFT JOIN ${users} u ON d.author_id = u.id
            WHERE d.created_at > NOW() - INTERVAL '2 hours'
            ORDER BY d.created_at DESC
            LIMIT 5)

            UNION ALL

            -- Recent whispers
            (SELECT 
                'whisper' as type,
                w.id,
                'Anonymous' as username,
                'whispered into the night' as action,
                w.created_at as timestamp,
                'whispers' as category,
                '/whispers' as link
            FROM ${whispers} w
            WHERE w.created_at > NOW() - INTERVAL '2 hours'
            ORDER BY w.created_at DESC
            LIMIT 5)

            UNION ALL

            -- Recent cafe posts
            (SELECT 
                'comment' as type,
                m.id,
                COALESCE(u.display_name, 'Night Wanderer') as username,
                'started a conversation about ' || LEFT(m.topic, 30) as action,
                m.created_at as timestamp,
                'cafe' as category,
                '/midnight-cafe' as link
            FROM ${midnightCafe} m
            LEFT JOIN ${users} u ON m.author_id = u.id
            WHERE m.created_at > NOW() - INTERVAL '2 hours'
            ORDER BY m.created_at DESC
            LIMIT 5)

            -- Order all activities by timestamp
            ORDER BY timestamp DESC
            LIMIT 20
        `);

        // Format activities for frontend
        const formattedActivities = (recentActivities.rows || []).map((activity: any, index: number) => ({
            id: `${activity.type}-${activity.id}-${index}`,
            type: activity.type,
            user: activity.username || 'Anonymous',
            content: activity.action,
            timestamp: activity.timestamp,
            category: activity.category,
            link: activity.link
        }));

        res.json({
            success: true,
            data: formattedActivities
        });
    } catch (error: any) {
        console.error("Error fetching recent activity:", error);
        res.status(500).json({
            success: false,
            error: { message: error.message }
        });
    }
});

// Get activity stats (for potential future use)
router.get("/stats", async (req, res) => {
    try {
        const stats = await db.execute(sql`
            SELECT 
                (SELECT COUNT(*) FROM ${diaries} WHERE created_at > NOW() - INTERVAL '24 hours') as diaries_today,
                (SELECT COUNT(*) FROM ${whispers} WHERE created_at > NOW() - INTERVAL '24 hours') as whispers_today,
                (SELECT COUNT(*) FROM ${midnightCafe} WHERE created_at > NOW() - INTERVAL '24 hours') as cafe_today,
                (SELECT COUNT(DISTINCT author_id) FROM ${diaries} WHERE created_at > NOW() - INTERVAL '24 hours') as active_users_today
        `);

        res.json({
            success: true,
            data: stats.rows[0]
        });
    } catch (error: any) {
        console.error("Error fetching activity stats:", error);
        res.status(500).json({
            success: false,
            error: { message: error.message }
        });
    }
});

export default router;
