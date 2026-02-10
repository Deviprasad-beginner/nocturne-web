import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * 5000 requests per 15 minutes per IP (Greatly increased for dev)
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000, // Relaxed from 500
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
 * 1000 requests per 15 minutes per IP (Increased for dev)
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Relaxed from 100
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
