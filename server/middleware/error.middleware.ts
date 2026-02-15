/**
 * Global error handling middleware
 * Converts all errors into standardized API responses
 */

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { errorResponse } from "../utils/api-response";
import { ZodError } from "zod";

/**
 * Global error handler middleware
 * Should be placed after all routes
 */
export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Log error for debugging
    if (process.env.NODE_ENV !== "production") {
        console.error("Error:", err);
    }

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        return res.status(400).json(
            errorResponse(
                "Validation failed",
                "VALIDATION_ERROR",
                err.errors.map((e) => ({
                    path: e.path.join("."),
                    message: e.message,
                }))
            )
        );
    }

    // Handle custom AppError instances
    if (err instanceof AppError) {
        return res.status(err.statusCode).json(
            errorResponse(err.message, err.code)
        );
    }

    // specific handling for passport deserialization error
    if (err.message === "Failed to deserialize user out of session") {
        res.clearCookie("connect.sid");
        return res.status(401).json(errorResponse("Session invalid, please login again", "UNAUTHORIZED"));
    }

    // Handle unexpected errors
    const statusCode = 500;
    const message =
        process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message;

    return res
        .status(statusCode)
        .json(errorResponse(message, "INTERNAL_ERROR"));
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * 404 Not Found handler
 * Should be placed after all routes but before error handler
 */
export function notFoundHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    res.status(404).json(
        errorResponse(
            `Route ${req.method} ${req.path} not found`,
            "ROUTE_NOT_FOUND"
        )
    );
}
