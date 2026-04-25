import type { Express } from "express";
import { type Server } from "http";

/**
 * Legacy route registration function.
 * All API routes are now registered in server/index.ts via api/v1/index.ts.
 * This function is kept only because index.ts depends on it for server creation.
 */
export async function registerRoutes(app: Express, httpServer: Server): Promise<Server> {
  return httpServer;
}
