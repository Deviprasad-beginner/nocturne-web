/**
 * Request validation middleware using Zod schemas
 */

import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ValidationError } from "../utils/errors";

type ValidationTarget = "body" | "query" | "params";

/**
 * Validate request data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param target - Which part of the request to validate (body, query, or params)
 */
export function validate(schema: AnyZodObject, target: ValidationTarget = "body") {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req[target];
            const validated = await schema.parseAsync(data);
            req[target] = validated;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                next(error);
            } else {
                next(new ValidationError("Validation failed"));
            }
        }
    };
}

/**
 * Validate multiple parts of the request
 */
export function validateAll(schemas: {
    body?: AnyZodObject;
    query?: AnyZodObject;
    params?: AnyZodObject;
}) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schemas.body) {
                req.body = await schemas.body.parseAsync(req.body);
            }
            if (schemas.query) {
                req.query = await schemas.query.parseAsync(req.query);
            }
            if (schemas.params) {
                req.params = await schemas.params.parseAsync(req.params);
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                next(error);
            } else {
                next(new ValidationError("Validation failed"));
            }
        }
    };
}
