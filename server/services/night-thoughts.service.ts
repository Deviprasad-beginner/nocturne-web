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
import { aiAnalyzer, embeddingProvider } from './ai';
import { resonanceEngine } from './resonance-engine';
import { roomFormationPolicy } from './room-formation';
import { nightCircles, ephemeralCircles, ephemeralCircleMembers } from '@shared/schema';
import { logger } from '../utils/logger';

export class NightThoughtsService {
    /**
     * Smart categorization logic - auto-detect thought type based on content
     */
    private detectThoughtType(content: string, topic?: string | null): string {
        if (topic) return 'discussion';
        if (content.length <= 280) return 'whisper';
        return 'diary';
    }

    /**
     * Create a new night thought with AI Analysis and Resonance Pipeline
     */
    async create(thought: InsertNightThought): Promise<NightThought & { serendipityMatch?: any, aiAnalysis?: any }> {
        const thoughtType = thought.thoughtType || this.detectThoughtType(thought.content, thought.topic);
        const expiresAt = thoughtType === 'whisper' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

        let analysis = null;
        let embedding: number[] | null = null;
        let mood = thought.mood || null;

        // 1. Parallel AI Processing (Phase 13 requirement)
        if (thoughtType === 'whisper') {
            try {
                const results = await Promise.allSettled([
                    aiAnalyzer.analyzeWhisper(thought.content),
                    embeddingProvider.embed(thought.content)
                ]);

                if (results[0].status === 'fulfilled') {
                    analysis = results[0].value;
                    if (!thought.mood) mood = analysis.tone[0] || 'reflective';
                } else {
                    logger.error("AI Analysis failed", results[0].reason);
                }

                if (results[1].status === 'fulfilled') {
                    embedding = results[1].value;
                } else {
                    logger.error("Embedding generation failed", results[1].reason);
                }
            } catch (err) {
                logger.error("AI processing threw exception", err);
            }
        }

        // 2. Persist Whisper safely regardless of AI success
        const [newThought] = await db
            .insert(nightThoughts)
            .values({
                ...thought,
                thoughtType,
                expiresAt,
                mood,
                embedding: embedding && embedding.length > 0 ? embedding : null,
                aiMetadata: analysis
            })
            .returning();

        let serendipityMatch = null;

        // 3. Resonance and Room Policy Evaluation
        if (thoughtType === 'whisper' && newThought.embedding && analysis) {
            try {
                const candidates = await resonanceEngine.findResonance(
                    newThought.embedding, 
                    analysis, 
                    newThought.authorId
                );

                if (candidates.length > 0) {
                    const roomResult = await roomFormationPolicy.evaluateAndCreate(
                        newThought, 
                        analysis, 
                        candidates
                    );

                    if (roomResult.created && roomResult.circleId) {
                        serendipityMatch = {
                            type: 'create',
                            circleId: roomResult.circleId,
                            message: roomResult.message,
                            matchedUsersCount: roomResult.matchedUsersCount,
                            themeSummary: analysis.themes?.[0] || 'a shared feeling'
                        };
                    } else {
                        // Just returning resonance context
                        serendipityMatch = {
                            type: 'resonance',
                            message: "Your Whisper is resonating.",
                            score: candidates[0].resonanceScore,
                            reasons: candidates[0].reasons,
                            matchedCount: candidates.length
                        };
                    }
                }
            } catch (err) {
                logger.error("Resonance engine failed", err);
            }
        }

        return { ...newThought, serendipityMatch, aiAnalysis: analysis };
    }

    /**
     * Get all thoughts (with optional filters)
     */
    async getAll(filters?: {
        authorId?: string;
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
        const result = await db
            .delete(nightThoughts)
            .where(
                and(
                    sql`${nightThoughts.expiresAt} IS NOT NULL`,
                    sql`${nightThoughts.expiresAt} < NOW()`
                )
            )
            .returning({ id: nightThoughts.id });
        return result.length;
    }

    /**
     * Get semantic recommendations based on a whisper's text and mood
     */
    async getRecommendations(text: string, mood?: string) {
        const queryText = (text && text.trim().length >= 3)
            ? text.trim()
            : (mood ? `Feeling ${mood} in the quiet night hours. Looking for presence and shared thoughts.` : 'Late night contemplation');

        const embedText = `${mood ? `Feeling ${mood}. ` : ''}${queryText}`;
        let targetEmbedding: number[] = [];
        try {
            targetEmbedding = await embeddingProvider.embed(embedText);
        } catch (e) {
            logger.warn('Failed embedding query in getRecommendations:', e);
        }

        const recommendations: Array<{ type: 'circle' | 'discussion' | 'whisper', item: any, score: number }> = [];

        // 1. Fetch public whispers matching the vibe
        try {
            const publicWhispers = await db.select().from(nightThoughts)
                .where(
                    and(
                        eq(nightThoughts.isPrivate, false),
                        eq(nightThoughts.thoughtType, 'whisper')
                    )
                )
                .orderBy(desc(nightThoughts.createdAt))
                .limit(20);

            for (const whisper of publicWhispers) {
                let score = 0.70;
                if (whisper.mood && mood && whisper.mood.toLowerCase() === mood.toLowerCase()) {
                    score += 0.18;
                }
                if (targetEmbedding.length > 0 && whisper.embedding && Array.isArray(whisper.embedding)) {
                    const sim = this.cosineSimilarity(targetEmbedding, whisper.embedding as number[]);
                    score = Math.max(score, sim);
                } else if (whisper.content && queryText) {
                    const wWords = new Set(whisper.content.toLowerCase().split(/\s+/));
                    const qWords = queryText.toLowerCase().split(/\s+/);
                    const overlap = qWords.filter(w => wWords.has(w)).length;
                    if (overlap > 0) score += Math.min(0.15, overlap * 0.05);
                }
                const normalizedScore = Math.min(0.98, Math.max(0.62, Math.round(score * 100) / 100));
                recommendations.push({
                    type: 'whisper',
                    item: {
                        ...whisper,
                        mood: whisper.mood || mood || 'contemplative'
                    },
                    score: normalizedScore
                });
            }
        } catch (err) {
            logger.warn('Error fetching whispers for recommendations:', err);
        }

        // 2. Fetch active circles
        try {
            const circles = await db.select().from(nightCircles)
                .where(eq(nightCircles.isActive, true))
                .limit(10);

            for (const circle of circles) {
                const cText = `${circle.name} ${circle.description || ''} ${circle.topic || ''}`;
                let score = 0.75;
                if (targetEmbedding.length > 0) {
                    const emb = await embeddingProvider.embed(cText);
                    score = this.cosineSimilarity(targetEmbedding, emb);
                }
                recommendations.push({
                    type: 'circle',
                    item: circle,
                    score: Math.min(0.98, Math.max(0.65, Math.round(score * 100) / 100))
                });
            }
        } catch (err) {
            logger.warn('Error fetching circles for recommendations:', err);
        }

        // 3. Fallback nocturnal circles if none in DB yet
        if (recommendations.filter(r => r.type === 'circle').length === 0) {
            const defaultCircles = [
                {
                    id: 901,
                    name: '3 AM Solitude & Deep Thoughts',
                    topic: 'Midnight Reflections',
                    description: 'A quiet circle for insomniacs, night owls, and contemplative minds.',
                    mood: mood || 'lonely',
                    isActive: true,
                    memberCount: 14
                },
                {
                    id: 902,
                    name: 'Lo-Fi Echoes & Soft Static',
                    topic: 'Ambient Soundscape',
                    description: 'Sharing warm acoustic melodies and midnight ambient thoughts.',
                    mood: mood || 'nostalgic',
                    isActive: true,
                    memberCount: 22
                },
                {
                    id: 903,
                    name: 'Quiet Restless Souls',
                    topic: 'Nighttime Overthinking',
                    description: 'When the mind refuses to sleep, share your wandering whispers here.',
                    mood: mood || 'restless',
                    isActive: true,
                    memberCount: 9
                }
            ];

            defaultCircles.forEach((c, idx) => {
                recommendations.push({
                    type: 'circle',
                    item: c,
                    score: 0.88 - idx * 0.05
                });
            });
        }

        // 4. Sort by similarity score descending and return top 6
        recommendations.sort((a, b) => b.score - a.score);
        return recommendations.slice(0, 6);
    }

    /**
     * Get trending topics based on recent whispers' AI metadata
     */
    async getTrending() {
        const recentThoughts = await db.execute(sql`
            SELECT ai_metadata->>'vibeTags' as tags
            FROM night_thoughts
            WHERE created_at > NOW() - INTERVAL '24 hours'
              AND ai_metadata IS NOT NULL
        `);

        // Aggregate tags manually since jsonb array elements can be tricky in raw SQL based on version
        const tagCounts: Record<string, number> = {};
        for (const row of recentThoughts.rows) {
            try {
                const tagsStr = row.tags as string;
                if (!tagsStr) continue;
                const tags = JSON.parse(tagsStr);
                if (Array.isArray(tags)) {
                    for (const t of tags) {
                        const tag = String(t).toLowerCase();
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    }
                }
            } catch (e) {
                // Ignore parse errors
            }
        }

        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12);

        return sortedTags.map(([topic, count]) => ({
            topic,
            count
        }));
    }
    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}

export const nightThoughtsService = new NightThoughtsService();
