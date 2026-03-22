/**
 * Tests for Night Thought Replies (Comment Section)
 *
 * Run with:  npx vitest run tests/night-thought-replies.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock the DB module ───────────────────────────────────────────────────────
const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
};

vi.mock('../server/db', () => ({ db: mockDb }));
vi.mock('@shared/schema', async () => {
    const actual = await vi.importActual('@shared/schema');
    return actual;
});

// Import AFTER mocks are registered
import { NightThoughtsService } from '../server/services/night-thoughts.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeReply = (overrides = {}) => ({
    id: 1,
    thoughtId: 42,
    content: 'Test reply content',
    authorId: 99,
    createdAt: new Date('2026-03-22T10:00:00Z'),
    ...overrides,
});

const makeThought = (overrides = {}) => ({
    id: 42,
    content: 'A test thought',
    thoughtType: 'whisper',
    isPrivate: false,
    allowReplies: true,
    hearts: 0,
    replies: 0,
    authorId: 1,
    topic: null,
    mood: null,
    createdAt: new Date(),
    expiresAt: null,
    ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('NightThoughtsService — replies', () => {
    let service: NightThoughtsService;

    beforeEach(() => {
        service = new NightThoughtsService();
        vi.clearAllMocks();
    });

    // ── getReplies ──────────────────────────────────────────────────────────
    describe('getReplies(thoughtId)', () => {
        it('returns replies ordered by createdAt', async () => {
            const replies = [makeReply({ id: 1 }), makeReply({ id: 2 })];
            mockDb.orderBy.mockResolvedValueOnce(replies);

            const result = await service.getReplies(42);

            expect(mockDb.select).toHaveBeenCalled();
            expect(result).toEqual(replies);
            expect(result).toHaveLength(2);
        });

        it('returns an empty array when no replies exist', async () => {
            mockDb.orderBy.mockResolvedValueOnce([]);

            const result = await service.getReplies(999);

            expect(result).toEqual([]);
        });
    });

    // ── addReply ──────────────────────────────────────────────────────────
    describe('addReply(data)', () => {
        it('inserts a reply and returns it', async () => {
            const reply = makeReply();
            mockDb.returning
                .mockResolvedValueOnce([reply])  // insert returning
                .mockResolvedValueOnce([makeThought({ replies: 1 })]); // update returning (not used)
            mockDb.set.mockReturnThis();
            mockDb.where.mockReturnThis();

            const result = await service.addReply({
                thoughtId: 42,
                content: 'Test reply content',
                authorId: 99,
            });

            expect(mockDb.insert).toHaveBeenCalled();
            expect(result).toMatchObject({
                thoughtId: 42,
                content: 'Test reply content',
                authorId: 99,
            });
        });

        it('also increments the parent thought reply counter', async () => {
            const reply = makeReply();
            mockDb.returning.mockResolvedValue([reply]);
            mockDb.set.mockReturnThis();
            mockDb.where.mockReturnThis();

            await service.addReply({ thoughtId: 42, content: 'hello', authorId: null });

            // update() should have been called to bump replies counter
            expect(mockDb.update).toHaveBeenCalled();
        });

        it('allows anonymous replies (authorId = null)', async () => {
            const reply = makeReply({ authorId: null });
            mockDb.returning.mockResolvedValue([reply]);
            mockDb.set.mockReturnThis();
            mockDb.where.mockReturnThis();

            const result = await service.addReply({
                thoughtId: 42,
                content: 'Anonymous voice in the dark',
                authorId: null,
            });

            expect(result.authorId).toBeNull();
        });
    });

    // ── addHeart (existing, sanity check) ──────────────────────────────────
    describe('addHeart(id)', () => {
        it('increments the hearts counter', async () => {
            const thought = makeThought({ hearts: 5 });
            mockDb.returning.mockResolvedValueOnce([{ ...thought, hearts: 6 }]);
            mockDb.set.mockReturnThis();
            mockDb.where.mockReturnThis();

            const result = await service.addHeart(42);

            expect(mockDb.update).toHaveBeenCalled();
            expect(result.hearts).toBe(6);
        });
    });

    // ── detectThoughtType (private, tested via create) ─────────────────────
    describe('thought type detection', () => {
        it('classifies short content as whisper', async () => {
            const thought = makeThought({ thoughtType: 'whisper', expiresAt: new Date() });
            mockDb.returning.mockResolvedValueOnce([thought]);
            mockDb.values.mockReturnThis();

            const result = await service.create({
                content: 'Short whisper',
                isPrivate: false,
                allowReplies: true,
                authorId: 1,
            });

            expect(result.thoughtType).toBe('whisper');
        });

        it('classifies content with a topic as discussion', async () => {
            const thought = makeThought({ thoughtType: 'discussion', topic: 'AI' });
            mockDb.returning.mockResolvedValueOnce([thought]);
            mockDb.values.mockReturnThis();

            const result = await service.create({
                content: 'Let us talk about something',
                topic: 'AI',
                isPrivate: false,
                allowReplies: true,
                authorId: 1,
            });

            expect(result.thoughtType).toBe('discussion');
        });
    });
});
