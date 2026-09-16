import { db } from '../db';
import {
    nightThoughts,
    nightThoughtReplies,
    type InsertNightThought,
    type NightThought,
    type NightThoughtReply,
    type InsertNightThoughtReply,
} from '@shared/schema';
import { eq, desc, and, or, sql } from 'drizzle-orm';
import { analyzeEmotion } from './emotion-analyzer';
import { getEmbedding, cosineSimilarity } from '../utils/embeddings';
import { nightCircles, ephemeralCircles, ephemeralCircleMembers } from '@shared/schema';

export class NightThoughtsService {
    /**
     * Smart categorization logic - auto-detect thought type based on content
     */
    private detectThoughtType(content: string, topic?: string | null): string {
        // Explicit topic = discussion
        if (topic) {
            return 'discussion';
        }

        // Short content = whisper
        if (content.length <= 280) {
            return 'whisper';
        }

        // Long form = diary
        return 'diary';
    }

    /**
     * Create a new night thought with smart categorization
     */
    async create(thought: InsertNightThought): Promise<NightThought & { serendipityMatch?: any }> {
        // Auto-detect thought type if not provided
        const thoughtType = thought.thoughtType || this.detectThoughtType(thought.content, thought.topic);

        // Set expiration for whisper-type thoughts (24 hours)
        const expiresAt = thoughtType === 'whisper'
            ? new Date(Date.now() + 24 * 60 * 60 * 1000)
            : null;

        // Analyze emotion for mood
        const analysis = analyzeEmotion(thought.content || "");
        const mood = thought.mood || analysis.detectedEmotion;

        let embedding: number[] | null = null;
        if (thoughtType === 'whisper') {
            embedding = await getEmbedding(thought.content || "");
        }

        const [newThought] = await db
            .insert(nightThoughts)
            .values({
                ...thought,
                thoughtType,
                expiresAt,
                mood,
                embedding: embedding && embedding.length > 0 ? embedding : null
            })
            .returning();

        let serendipityMatch = null;

        // Serendipity Matching Logic
        if (thoughtType === 'whisper' && newThought.embedding && newThought.authorId) {
            // Find similar whispers in the last 3 hours
            const recentMatches = await db.execute(sql`
                SELECT id, author_id, 1 - (embedding <=> ${JSON.stringify(newThought.embedding)}::vector) as similarity
                FROM night_thoughts
                WHERE created_at > NOW() - INTERVAL '3 hours'
                  AND id != ${newThought.id}
                  AND author_id != ${newThought.authorId}
                  AND 1 - (embedding <=> ${JSON.stringify(newThought.embedding)}::vector) > 0.80
                ORDER BY similarity DESC
                LIMIT 5
            `);

            if (recentMatches.rows && recentMatches.rows.length > 0) {
                // We have matches. Check if any matched user is currently in an ephemeral circle with < 7 members
                const matchedUserIds = recentMatches.rows.map(r => r.author_id).filter(id => id !== null) as number[];
                
                if (matchedUserIds.length > 0) {
                    // Check for existing active ephemeral circles these users are in
                    const existingCircles = await db.execute(sql`
                        SELECT c.id, c.member_count 
                        FROM ephemeral_circles c
                        JOIN ephemeral_circle_members m ON c.id = m.circle_id
                        WHERE c.expires_at > NOW()
                          AND c.member_count < 7
                          AND m.user_id = ANY(${matchedUserIds}::int[])
                        ORDER BY c.member_count DESC
                        LIMIT 1
                    `);

                    if (existingCircles.rows && existingCircles.rows.length > 0) {
                        const circle = existingCircles.rows[0];
                        serendipityMatch = {
                            type: 'invite',
                            circleId: circle.id,
                            message: `${circle.member_count} other people are feeling this exact way right now. Form a Night Circle?`,
                            matchedUsersCount: circle.member_count
                        };
                    } else if (matchedUserIds.length >= 2) {
                        // No existing circle, but we found 2+ matches! Suggest creating a new one
                        serendipityMatch = {
                            type: 'create',
                            suggestedUserIds: matchedUserIds.slice(0, 7), // Up to 7
                            message: `${matchedUserIds.length} other people are feeling this exact way right now. Form a Night Circle?`,
                            themeSummary: analysis.detectedEmotion || 'a shared feeling'
                        };
                    }
                }
            }
        }

        return { ...newThought, serendipityMatch };
    }

    /**
     * Get all thoughts (with optional filters)
     */
    async getAll(filters?: {
        authorId?: number;
        thoughtType?: string;
        isPrivate?: boolean;
        includeExpired?: boolean;
    }): Promise<NightThought[]> {
        const conditions = [];

        if (filters?.authorId) {
            conditions.push(eq(nightThoughts.authorId, filters.authorId));
        }

        if (filters?.thoughtType) {
            conditions.push(eq(nightThoughts.thoughtType, filters.thoughtType));
        }

        if (filters?.isPrivate !== undefined) {
            conditions.push(eq(nightThoughts.isPrivate, filters.isPrivate));
        }

        // Filter out expired thoughts by default
        if (!filters?.includeExpired) {
            conditions.push(
                or(
                    eq(nightThoughts.expiresAt, null as any),
                    sql`${nightThoughts.expiresAt} > NOW()`
                )
            );
        }

        const query = conditions.length > 0
            ? db.select().from(nightThoughts).where(and(...conditions))
            : db.select().from(nightThoughts);

        return await query.orderBy(desc(nightThoughts.createdAt));
    }

    /**
     * Get a single thought by ID
     */
    async getById(id: number): Promise<NightThought | undefined> {
        const [thought] = await db
            .select()
            .from(nightThoughts)
            .where(eq(nightThoughts.id, id));

        return thought;
    }

    /**
     * Update a thought
     */
    async update(id: number, updates: Partial<InsertNightThought>): Promise<NightThought> {
        const [updated] = await db
            .update(nightThoughts)
            .set(updates)
            .where(eq(nightThoughts.id, id))
            .returning();

        return updated;
    }

    /**
     * Delete a thought
     */
    async delete(id: number): Promise<void> {
        await db.delete(nightThoughts).where(eq(nightThoughts.id, id));
    }

    async addHeart(id: number): Promise<NightThought> {
        const [updated] = await db
            .update(nightThoughts)
            .set({ hearts: sql`${nightThoughts.hearts} + 1` })
            .where(eq(nightThoughts.id, id))
            .returning();

        return updated;
    }

    async incrementReplies(id: number): Promise<NightThought> {
        const [updated] = await db
            .update(nightThoughts)
            .set({ replies: sql`${nightThoughts.replies} + 1` })
            .where(eq(nightThoughts.id, id))
            .returning();

        return updated;
    }

    /**
     * Get all replies for a thought, oldest first
     */
    async getReplies(thoughtId: number): Promise<NightThoughtReply[]> {
        return db
            .select()
            .from(nightThoughtReplies)
            .where(eq(nightThoughtReplies.thoughtId, thoughtId))
            .orderBy(nightThoughtReplies.createdAt);
    }

    /**
     * Create a reply and atomically increment the replies counter
     */
    async addReply(data: InsertNightThoughtReply): Promise<NightThoughtReply> {
        const [reply] = await db
            .insert(nightThoughtReplies)
            .values(data)
            .returning();

        // Increment the counter on the parent thought
        await db
            .update(nightThoughts)
            .set({ replies: sql`${nightThoughts.replies} + 1` })
            .where(eq(nightThoughts.id, data.thoughtId));

        return reply;
    }

    async cleanupExpired(): Promise<number> {
        // For now, just return 0 - we can implement a proper cleanup later
        return 0;
    }

    /**
     * Get semantic recommendations based on a whisper's text and mood
     */
    async getRecommendations(text: string, mood?: string) {
        if (!text || text.trim().length < 5) return [];

        const embedText = `${mood ? `Feeling ${mood}. ` : ''}${text}`;
        const targetEmbedding = await getEmbedding(embedText);
        
        if (targetEmbedding.length === 0) return [];

        // Fetch active circles
        const circles = await db.select().from(nightCircles)
            .where(eq(nightCircles.isActive, true))
            .limit(10);
        
        // Fetch recent discussions
        const discussions = await db.select().from(nightThoughts)
            .where(eq(nightThoughts.thoughtType, 'discussion'))
            .orderBy(desc(nightThoughts.createdAt))
            .limit(10);

        const recommendations: Array<{ type: 'circle' | 'discussion', item: any, score: number }> = [];

        // Compute similarity for circles
        await Promise.all(circles.map(async (circle) => {
            const cText = `${circle.name} ${circle.description || ''} ${circle.topic || ''}`;
            const emb = await getEmbedding(cText);
            const score = cosineSimilarity(targetEmbedding, emb);
            recommendations.push({ type: 'circle', item: circle, score });
        }));

        // Compute similarity for discussions
        await Promise.all(discussions.map(async (disc) => {
            const dText = `${disc.topic || ''} ${disc.content}`;
            const emb = await getEmbedding(dText);
            const score = cosineSimilarity(targetEmbedding, emb);
            recommendations.push({ type: 'discussion', item: disc, score });
        }));

        // Sort by similarity score descending
        recommendations.sort((a, b) => b.score - a.score);
        
        // Return top 3 recommendations
        return recommendations.slice(0, 3);
    }
}

export const nightThoughtsService = new NightThoughtsService();
