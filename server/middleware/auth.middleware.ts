/**
 * Authentication middleware
 * Supports both Passport.js session (web) and JWT Bearer token (mobile)
 */

import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import jwt from "jsonwebtoken";
import { storage } from "../storage";

const JWT_SECRET = process.env.JWT_SECRET || "nocturne-mobile-secret-change-in-prod";

/** Attach JWT user to req if a valid Bearer token is present */
async function attachJwtUser(req: Request): Promise<boolean> {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return false;
    try {
        const token = authHeader.slice(7);
        const payload = jwt.verify(token, JWT_SECRET) as unknown as { sub: number };
        const user = await storage.getUser(payload.sub);
        if (!user) return false;
        (req as any).user = user;
        return true;
    } catch {
        return false;
    }
}

/**
 * Require user to be authenticated
 * Throws UnauthorizedError if user is not logged in
 */
export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Fast path: Passport session (web clients)
    if (req.isAuthenticated()) return next();

    // JWT path: Bearer token (mobile clients)
    attachJwtUser(req).then((ok) => {
        if (ok) return next();
        throw new UnauthorizedError("Authentication required");
    }).catch(next);
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
    if (req.isAuthenticated()) return next();
    const ok = await attachJwtUser(req);
    if (!ok) throw new UnauthorizedError("Authentication required");
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
