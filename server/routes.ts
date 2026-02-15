import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";

// Import route modules


const router = express.Router();

// Register all route modules under /v1 prefix
// Routes are now registered in server/index.ts via api/v1/index.ts
// Keeping this file for potential future global middleware or utility routes

export async function registerRoutes(app: Express, httpServer: Server): Promise<Server> {
  // Setup authentication is handled in index.ts via server/auth.ts

  // Use the API routes
  app.use("/api", router);

  // WebSocket server is now handled by WebSocketManager in server/index.ts
  // Removed duplicate WebSocket initialization to prevent \"handleUpgrade() called more than once\" error

  return httpServer;
}
