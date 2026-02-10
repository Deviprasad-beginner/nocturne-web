import { Router } from 'express';
import { nightThoughtsService } from '../../../services/night-thoughts.service';
import { insertNightThoughtSchema } from '@shared/schema';
import { z } from 'zod';
import type { Request, Response } from 'express';

const router = Router();

/**
 * GET /api/v1/thoughts
 * Get all night thoughts with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const { thoughtType, isPrivate, authorId } = req.query;

        const filters: any = {};

        if (thoughtType) filters.thoughtType = thoughtType as string;
        if (isPrivate !== undefined) filters.isPrivate = isPrivate === 'true';
        if (authorId) filters.authorId = parseInt(authorId as string);

        // Only show public thoughts unless requesting own thoughts
        if (!authorId || (req.user && parseInt(authorId as string) !== req.user.id)) {
            filters.isPrivate = false;
        }

        const thoughts = await nightThoughtsService.getAll(filters);

        res.json(thoughts);
    } catch (error: any) {
        console.error('Error fetching thoughts:', error);
        res.status(500).json({ error: 'Failed to fetch thoughts' });
    }
});

/**
 * GET /api/v1/thoughts/:id
 * Get a single thought by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const thought = await nightThoughtsService.getById(id);

        if (!thought) {
            return res.status(404).json({ error: 'Thought not found' });
        }

        // Check privacy
        if (thought.isPrivate && (!req.user || thought.authorId !== req.user.id)) {
            return res.status(403).json({ error: 'This thought is private' });
        }

        res.json(thought);
    } catch (error: any) {
        console.error('Error fetching thought:', error);
        res.status(500).json({ error: 'Failed to fetch thought' });
    }
});

/**
 * POST /api/v1/thoughts
 * Create a new night thought
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const validatedData = insertNightThoughtSchema.parse({
            ...req.body,
            authorId: req.user.id
        });

        const thought = await nightThoughtsService.create(validatedData);

        res.status(201).json(thought);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        console.error('Error creating thought:', error);
        res.status(500).json({ error: 'Failed to create thought' });
    }
});

/**
 * PATCH /api/v1/thoughts/:id
 * Update a thought
 */
router.patch('/:id', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const id = parseInt(req.params.id);
        const existing = await nightThoughtsService.getById(id);

        if (!existing) {
            return res.status(404).json({ error: 'Thought not found' });
        }

        if (existing.authorId !== req.user.id) {
            return res.status(403).json({ error: 'You can only edit your own thoughts' });
        }

        const updated = await nightThoughtsService.update(id, req.body);

        res.json(updated);
    } catch (error: any) {
        console.error('Error updating thought:', error);
        res.status(500).json({ error: 'Failed to update thought' });
    }
});

/**
 * DELETE /api/v1/thoughts/:id
 * Delete a thought
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const id = parseInt(req.params.id);
        const existing = await nightThoughtsService.getById(id);

        if (!existing) {
            return res.status(404).json({ error: 'Thought not found' });
        }

        if (existing.authorId !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own thoughts' });
        }

        await nightThoughtsService.delete(id);

        res.json({ message: 'Thought deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting thought:', error);
        res.status(500).json({ error: 'Failed to delete thought' });
    }
});

/**
 * POST /api/v1/thoughts/:id/heart
 * Add a heart to a thought
 */
router.post('/:id/heart', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const thought = await nightThoughtsService.addHeart(id);

        res.json(thought);
    } catch (error: any) {
        console.error('Error adding heart:', error);
        res.status(500).json({ error: 'Failed to add heart' });
    }
});

/**
 * POST /api/v1/thoughts/:id/reply
 * Increment reply count (actual reply system would be separate)
 */
router.post('/:id/reply', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const thought = await nightThoughtsService.incrementReplies(id);

        res.json(thought);
    } catch (error: any) {
        console.error('Error incrementing replies:', error);
        res.status(500).json({ error: 'Failed to increment replies' });
    }
});

export default router;
