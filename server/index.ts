import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { WebSocketManager } from "./websocket";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import apiV1Routes from "./routes/api/v1/index";
import { testDatabaseConnection } from "./config/database";
import { logger } from "./utils/logger";

const app = express();

// CORS configuration for production
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigin = process.env.FRONTEND_URL || (isProduction ? "*" : "http://localhost:5173");

app.use(cors({
  origin: allowedOrigin,
  credentials: true, // Allow cookies to be sent
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const httpServer = createServer(app);

  // Test database connection
  logger.info("Testing database connection...");
  await testDatabaseConnection();

  // Setup authentication
  await import("./auth").then(({ setupAuth }) => setupAuth(app));

  // Mount legacy routes (will be gradually migrated)
  const server = await registerRoutes(app, httpServer);

  // Mount new v1 API routes
  app.use("/api/v1", apiV1Routes);

  // Initialize WebSocket manager
  new WebSocketManager(httpServer);

  // IMPORTANT: Setup Vite/static serving BEFORE 404 handler
  // This allows Vite to handle frontend routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 404 handler for API routes only (after all API routes, before catch-all)
  // Note: Vite/static serving has its own 404 handling for frontend routes
  app.use("/api/*", notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  // Use provider-assigned PORT in production, default to 5000 locally
  const port = Number(process.env.PORT) || 5000;
  httpServer.listen(port, "0.0.0.0", () => {
    logger.info(`🚀 Server started on port ${port}`);
    logger.info(`📍 Environment: ${app.get("env")}`);
    logger.info(`🔗 API v1: http://localhost:${port}/api/v1`);
  });
})();