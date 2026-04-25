/**
 * Authentication middleware
 * Extracts authentication logic into reusable middleware
 */

import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";

/**
 * Require user to be authenticated
 * Throws UnauthorizedError if user is not logged in
 */
export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.isAuthenticated()) {
        throw new UnauthorizedError("Authentication required");
    }
    next();
}

/**
 * Require user to be authenticated (async version)
 * For use with asyncHandler
 */
export async function requireAuthAsync(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.isAuthenticated()) {
        throw new UnauthorizedError("Authentication required");
    }
    next();
}

/**
 * Optional authentication
 * Attaches user if authenticated, but doesn't require it
 */
export function optionalAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // User is attached by passport if authenticated
    // No action needed, just continue
    next();
}

/**
 * Require specific user (ownership check)
 * Useful for routes like DELETE /posts/:id where only the author can delete
 */
export function requireOwnership(userIdField: string = "authorId") {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.isAuthenticated()) {
            throw new UnauthorizedError("Authentication required");
        }

        const resourceUserId = (req as any)[userIdField];
        if (resourceUserId && resourceUserId !== req.user?.id) {
            throw new ForbiddenError("You don't have permission to perform this action");
        }

        next();
    };
}
