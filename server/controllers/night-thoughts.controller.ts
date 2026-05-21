import { Request, Response, NextFunction } from 'express';
import { nightThoughtsService } from '../services/night-thoughts.service';
import { insertNightThoughtSchema, insertNightThoughtReplySchema } from '@shared/schema';
import { z } from 'zod';
import { logger } from '../utils/logger';

export class NightThoughtsController {
    /**
     * GET /api/v1/thoughts
     * Get all night thoughts with optional filters
     */
    getAll = async (req: Request, res: Response, next: NextFunction) => {
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
        } catch (error) {
            logger.error('Error fetching thoughts:', error);
            next(error);
        }
    };

    /**
     * GET /api/v1/thoughts/:id
     * Get a single thought by ID
     */
    getById = async (req: Request, res: Response, next: NextFunction) => {
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
        } catch (error) {
            logger.error('Error fetching thought:', error);
            next(error);
        }
    };

    /**
     * POST /api/v1/thoughts
     * Create a new night thought
     */
    create = async (req: Request, res: Response, next: NextFunction) => {
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
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: 'Validation error', details: error.errors });
            }
            logger.error('Error creating thought:', error);
            next(error);
        }
    };

    /**
     * PATCH /api/v1/thoughts/:id
     * Update a thought
     */
    update = async (req: Request, res: Response, next: NextFunction) => {
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
        } catch (error) {
            logger.error('Error updating thought:', error);
            next(error);
        }
    };

    /**
     * DELETE /api/v1/thoughts/:id
     * Delete a thought
     */
    delete = async (req: Request, res: Response, next: NextFunction) => {
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
        } catch (error) {
            logger.error('Error deleting thought:', error);
            next(error);
        }
    };

    /**
     * POST /api/v1/thoughts/:id/heart
     * Add a heart to a thought
     */
    addHeart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            const thought = await nightThoughtsService.addHeart(id);
            res.json(thought);
        } catch (error) {
            logger.error('Error adding heart:', error);
            next(error);
        }
    };

    /**
     * GET /api/v1/thoughts/:id/replies
     * Fetch all replies for a thought
     */
    getReplies = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            const thought = await nightThoughtsService.getById(id);

            if (!thought) {
                return res.status(404).json({ error: 'Thought not found' });
            }

            if (thought.isPrivate && (!req.user || thought.authorId !== req.user.id)) {
                return res.status(403).json({ error: 'This thought is private' });
            }

            const replies = await nightThoughtsService.getReplies(id);
            res.json(replies);
        } catch (error) {
            logger.error('Error fetching replies:', error);
            next(error);
        }
    };

    /**
     * POST /api/v1/thoughts/:id/replies
     * Post a new reply to a thought
     */
    addReply = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            const thought = await nightThoughtsService.getById(id);

            if (!thought) {
                return res.status(404).json({ error: 'Thought not found' });
            }

            if (!thought.allowReplies) {
                return res.status(403).json({ error: 'Replies are disabled for this thought' });
            }

            if (thought.isPrivate && (!req.user || thought.authorId !== req.user.id)) {
                return res.status(403).json({ error: 'This thought is private' });
            }

            const validated = insertNightThoughtReplySchema.parse({
                thoughtId: id,
                content: req.body.content,
                authorId: req.user?.id ?? null,
            });

            const reply = await nightThoughtsService.addReply(validated);
            res.status(201).json(reply);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: 'Validation error', details: error.errors });
            }
            logger.error('Error posting reply:', error);
            next(error);
        }
    };
}

export const nightThoughtsController = new NightThoughtsController();
