/**
 * Custom error classes for standardized error handling across the application
 */

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code: string,
        public isOperational = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found", code = "NOT_FOUND") {
        super(404, message, code);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class ValidationError extends AppError {
    constructor(message = "Validation failed", code = "VALIDATION_ERROR", public errors?: any) {
        super(400, message, code);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Authentication required", code = "UNAUTHORIZED") {
        super(401, message, code);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "Access forbidden", code = "FORBIDDEN") {
        super(403, message, code);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

export class ConflictError extends AppError {
    constructor(message = "Resource conflict", code = "CONFLICT") {
        super(409, message, code);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

export class TooManyRequestsError extends AppError {
    constructor(message = "Too many requests", code = "TOO_MANY_REQUESTS") {
        super(429, message, code);
        Object.setPrototypeOf(this, TooManyRequestsError.prototype);
    }
}

export class InternalServerError extends AppError {
    constructor(message = "Internal server error", code = "INTERNAL_ERROR") {
        super(500, message, code, false);
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}
