import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware to validate request body against a Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Validation failed',
                        details: error.errors.map(err => ({
                            field: err.path.join('.'),
                            message: err.message,
                        })),
                    },
                });
            }
            next(error);
        }
    };
};

/**
 * Middleware to validate request query parameters against a Zod schema
 */
export const validateQuery = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.query = await schema.parseAsync(req.query);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Invalid query parameters',
                        details: error.errors.map(err => ({
                            field: err.path.join('.'),
                            message: err.message,
                        })),
                    },
                });
            }
            next(error);
        }
    };
};

/**
 * Middleware to validate request params against a Zod schema
 */
export const validateParams = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.params = await schema.parseAsync(req.params);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Invalid parameters',
                        details: error.errors.map(err => ({
                            field: err.path.join('.'),
                            message: err.message,
                        })),
                    },
                });
            }
            next(error);
        }
    };
};
