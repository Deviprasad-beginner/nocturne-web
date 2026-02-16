import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * General API rate limiter
 * Production: 200 requests per 15 minutes per IP
 * Development: 5000 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 5000 : 200,
    message: {
        success: false,
        error: {
            message: 'Too many requests from this IP, please try again later.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication routes
 * Production: 20 requests per 15 minutes per IP
 * Development: 1000 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 1000 : 20,
    message: {
        success: false,
        error: {
            message: 'Too many authentication attempts, please try again later.',
        },
    },
    skipSuccessfulRequests: true,
});

/**
 * Rate limiter for content creation
 * 20 posts per hour per IP
 */
export const createContentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: {
        success: false,
        error: {
            message: 'Too many posts created, please slow down.',
        },
    },
});
