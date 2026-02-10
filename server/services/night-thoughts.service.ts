import { db } from '../db';
import { nightThoughts, type InsertNightThought, type NightThought } from '@shared/schema';
import { eq, desc, and, or, sql } from 'drizzle-orm';

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
    async create(thought: InsertNightThought): Promise<NightThought> {
        // Auto-detect thought type if not provided
        const thoughtType = thought.thoughtType || this.detectThoughtType(thought.content, thought.topic);

        // Set expiration for whisper-type thoughts (24 hours)
        const expiresAt = thoughtType === 'whisper'
            ? new Date(Date.now() + 24 * 60 * 60 * 1000)
            : null;

        const [newThought] = await db
            .insert(nightThoughts)
            .values({
                ...thought,
                thoughtType,
                expiresAt,
            })
            .returning();

        return newThought;
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
        const thought = await this.getById(id);
        if (!thought) throw new Error('Thought not found');

        const [updated] = await db
            .update(nightThoughts)
            .set({ hearts: (thought.hearts || 0) + 1 })
            .where(eq(nightThoughts.id, id))
            .returning();

        return updated;
    }

    async incrementReplies(id: number): Promise<NightThought> {
        const thought = await this.getById(id);
        if (!thought) throw new Error('Thought not found');

        const [updated] = await db
            .update(nightThoughts)
            .set({ replies: (thought.replies || 0) + 1 })
            .where(eq(nightThoughts.id, id))
            .returning();

        return updated;
    }

    async cleanupExpired(): Promise<number> {
        // For now, just return 0 - we can implement a proper cleanup later
        return 0;
    }
}

export const nightThoughtsService = new NightThoughtsService();
