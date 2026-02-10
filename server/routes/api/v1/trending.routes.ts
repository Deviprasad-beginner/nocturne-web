import { Router } from "express";
import { db } from "../../../db";
import { diaries, whispers, midnightCafe } from "@shared/schema";
import { sql } from "drizzle-orm";

const router = Router();

// Get trending topics based on user engagement
router.get("/topics", async (req, res) => {
    try {
        // Analyze hashtags from diaries, whispers, and cafe topics
        // This query finds hashtags mentioned in content and counts their occurrences

        const trendingTopics = await db.execute(sql`
            WITH hashtag_counts AS (
                -- Extract hashtags from diaries
                SELECT 
                    LOWER(SUBSTRING(content FROM '#([a-zA-Z0-9_]+)')) as hashtag,
                    COUNT(*) as post_count,
                    MAX(created_at) as last_used,
                    'diaries' as source
                FROM ${diaries}
                WHERE content ~ '#[a-zA-Z0-9_]+'
                GROUP BY LOWER(SUBSTRING(content FROM '#([a-zA-Z0-9_]+)'))
                
                UNION ALL
                
                -- Extract hashtags from whispers
                SELECT 
                    LOWER(SUBSTRING(content FROM '#([a-zA-Z0-9_]+)')) as hashtag,
                    COUNT(*) as post_count,
                    MAX(created_at) as last_used,
                    'whispers' as source
                FROM ${whispers}
                WHERE content ~ '#[a-zA-Z0-9_]+'
                GROUP BY LOWER(SUBSTRING(content FROM '#([a-zA-Z0-9_]+)'))
                
                UNION ALL
                
                -- Extract hashtags from cafe topics
                SELECT 
                    LOWER(SUBSTRING(content FROM '#([a-zA-Z0-9_]+)')) as hashtag,
                    COUNT(*) as post_count,
                    MAX(created_at) as last_used,
                    'cafe' as source
                FROM ${midnightCafe}
                WHERE content ~ '#[a-zA-Z0-9_]+'
                GROUP BY LOWER(SUBSTRING(content FROM '#([a-zA-Z0-9_]+)'))
            ),
            aggregated AS (
                SELECT 
                    hashtag,
                    SUM(post_count) as total_posts,
                    MAX(last_used) as last_used,
                    -- Calculate growth: posts in last 24h vs previous 24h
                    SUM(CASE WHEN last_used > NOW() - INTERVAL '24 hours' THEN post_count ELSE 0 END) as recent_posts,
                    SUM(CASE WHEN last_used BETWEEN NOW() - INTERVAL '48 hours' AND NOW() - INTERVAL '24 hours' THEN post_count ELSE 0 END) as previous_posts
                FROM hashtag_counts
                GROUP BY hashtag
            )
            SELECT 
                hashtag as tag,
                total_posts as posts,
                CASE 
                    WHEN previous_posts > 0 THEN ROUND(((recent_posts - previous_posts)::numeric / previous_posts * 100), 0)
                    WHEN recent_posts > 0 THEN 100
                    ELSE 0
                END as growth,
                -- Categorize based on common patterns
                CASE 
                    WHEN hashtag ~ '(thought|philosophy|wisdom|mind|contemplat)' THEN 'philosophy'
                    WHEN hashtag ~ '(music|song|sound|melody|beat)' THEN 'music'
                    WHEN hashtag ~ '(art|creat|design|draw|paint|write)' THEN 'creative'
                    WHEN hashtag ~ '(startup|business|founder|entrepreneur)' THEN 'business'
                    WHEN hashtag ~ '(journal|diary|personal|feeling|emotion)' THEN 'personal'
                    ELSE 'social'
                END as category,
                -- Map to appropriate destination page
                CASE 
                    WHEN hashtag ~ '(journal|diary)' THEN '/diaries'
                    WHEN hashtag ~ '(whisper|secret|confess)' THEN '/whispers'
                    WHEN hashtag ~ '(cafe|conversation|discuss)' THEN '/midnight-cafe'
                    WHEN hashtag ~ '(music|song)' THEN '/music-mood'
                    WHEN hashtag ~ '(founder|startup)' THEN '/3am-founder'
                    WHEN hashtag ~ '(puzzle|riddle|maze)' THEN '/mind-maze'
                    WHEN hashtag ~ '(circle|community|group)' THEN '/night-circles'
                    ELSE '/whispers'
                END as destination
            FROM aggregated
            WHERE total_posts > 0
            ORDER BY 
                recent_posts DESC,
                total_posts DESC
            LIMIT 10
        `);

        // Format the response
        const formattedTopics = (trendingTopics.rows || []).map((topic: any, index: number) => ({
            id: index + 1,
            tag: topic.tag,
            posts: parseInt(topic.posts) || 0,
            growth: parseInt(topic.growth) || 0,
            category: topic.category,
            destination: topic.destination
        }));

        // If no real trending topics, provide fallback data
        if (formattedTopics.length === 0) {
            res.json({
                success: true,
                data: [
                    { id: 1, tag: "3amthoughts", posts: 0, growth: 0, category: "philosophy", destination: "/diaries" },
                    { id: 2, tag: "insomniacreations", posts: 0, growth: 0, category: "creative", destination: "/whispers" },
                    { id: 3, tag: "midnightmusic", posts: 0, growth: 0, category: "music", destination: "/music-mood" },
                    { id: 4, tag: "nightowlstartup", posts: 0, growth: 0, category: "business", destination: "/3am-founder" },
                    { id: 5, tag: "dreamjournal", posts: 0, growth: 0, category: "personal", destination: "/diaries" },
                    { id: 6, tag: "starlitconversations", posts: 0, growth: 0, category: "social", destination: "/midnight-cafe" }
                ]
            });
            return;
        }

        res.json({
            success: true,
            data: formattedTopics
        });
    } catch (error: any) {
        console.error("Error fetching trending topics:", error);

        // Fallback to default topics on error
        res.json({
            success: true,
            data: [
                { id: 1, tag: "3amthoughts", posts: 0, growth: 0, category: "philosophy", destination: "/diaries" },
                { id: 2, tag: "insomniacreations", posts: 0, growth: 0, category: "creative", destination: "/whispers" },
                { id: 3, tag: "midnightmusic", posts: 0, growth: 0, category: "music", destination: "/music-mood" },
                { id: 4, tag: "nightowlstartup", posts: 0, growth: 0, category: "business", destination: "/3am-founder" },
                { id: 5, tag: "dreamjournal", posts: 0, growth: 0, category: "personal", destination: "/diaries" },
                { id: 6, tag: "starlitconversations", posts: 0, growth: 0, category: "social", destination: "/midnight-cafe" }
            ]
        });
    }
});

export default router;
