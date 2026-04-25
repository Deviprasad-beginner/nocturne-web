/**
 * Request ID middleware
 * Attaches a unique correlation ID to every request for log tracing.
 */

import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestId(req: Request, res: Response, next: NextFunction) {
  req.id = randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
}
