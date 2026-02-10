import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";

// Import route modules
import socialRoutes from "./routes/social.routes";
import musicRoutes from "./routes/music.routes";
import communityRoutes from "./routes/community.routes";
import userRoutes from "./routes/user.routes";
import reflectionRoutes from "./routes/reflections.routes";

const router = express.Router();

// Register all route modules under /v1 prefix
router.use("/v1", socialRoutes);
router.use("/v1/music", musicRoutes);
router.use("/v1", communityRoutes);
router.use("/users", userRoutes);

export async function registerRoutes(app: Express, httpServer: Server): Promise<Server> {
  // Setup authentication is handled in index.ts via server/auth.ts

  // Use the API routes
  app.use("/api", router);

  // Register reflection routes separately (already has /api/reflections prefix)
  app.use("/api/reflections", reflectionRoutes);

  // WebSocket server is now handled by WebSocketManager in server/index.ts
  // Removed duplicate WebSocket initialization to prevent \"handleUpgrade() called more than once\" error

  return httpServer;
}
