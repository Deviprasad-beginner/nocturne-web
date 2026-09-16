import { Request, Response, NextFunction } from 'express';
import { midnightCafeService } from '../services/midnight-cafe.service';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { insertMidnightCafeSchema, insertCafeReplySchema } from '@shared/schema';

export class MidnightCafeController {
    /**
     * GET /api/v1/midnight-cafe
     */
    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
            const cafes = await midnightCafeService.getMidnightCafe(limit);
            res.json(cafes);
        } catch (error) {
            logger.error('Error fetching midnight cafes:', error);
            next(error);
        }
    };

    /**
     * GET /api/v1/midnight-cafe/:id
     */
    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            const cafe = await midnightCafeService.getMidnightCafeById(id);
            if (!cafe) {
                return res.status(404).json({ error: 'Cafe post not found' });
            }
            res.json(cafe);
        } catch (error) {
            logger.error('Error fetching midnight cafe by id:', error);
            next(error);
        }
    };

    /**
     * POST /api/v1/midnight-cafe
     */
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = insertMidnightCafeSchema.parse({
                ...req.body,
                authorId: req.user?.id || null,
            });
            const cafe = await midnightCafeService.createMidnightCafe(validatedData);
            res.status(201).json(cafe);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: 'Validation error', details: error.errors });
            }
            logger.error('Error creating cafe post:', error);
            next(error);
        }
    };

    /**
     * DELETE /api/v1/midnight-cafe/:id
     */
    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const id = parseInt(req.params.id);
            const existing = await midnightCafeService.getMidnightCafeById(id);
            
            if (!existing) {
                return res.status(404).json({ error: 'Cafe post not found' });
            }
            if (existing.authorId !== req.user.id) {
                return res.status(403).json({ error: 'You can only delete your own posts' });
            }
            await midnightCafeService.deleteCafePost(id);
            res.json({ message: 'Post deleted' });
        } catch (error) {
            logger.error('Error deleting cafe post:', error);
            next(error);
        }
    };

    /**
     * GET /api/v1/midnight-cafe/:id/replies
     */
    getReplies = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            const replies = await midnightCafeService.getCafeReplies(id);
            res.json(replies);
        } catch (error) {
            logger.error('Error fetching replies:', error);
            next(error);
        }
    };

    /**
     * POST /api/v1/midnight-cafe/:id/replies
     */
    addReply = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);
            const validated = insertCafeReplySchema.parse({
                cafeId: id,
                content: req.body.content,
                authorId: req.user?.id ?? null,
            });
            const reply = await midnightCafeService.createCafeReply(validated);
            res.status(201).json(reply);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: 'Validation error', details: error.errors });
            }
            logger.error('Error creating reply:', error);
            next(error);
        }
    };
}

export const midnightCafeController = new MidnightCafeController();
