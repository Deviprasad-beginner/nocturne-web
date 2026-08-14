import "dotenv/config"; // trigger restart
// Re-load .env with override:true so .env values ALWAYS win over
// any stale OS/system environment variables on this machine.
import { config } from "dotenv";
config({ override: true });
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { logger } from "./utils/logger";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { WebSocketManager } from "./websocket";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { apiLimiter } from "./middleware/rateLimiter";
import { requestId } from "./middleware/requestId.middleware";
import apiV1Routes from "./routes/api/v1/index";
import { testDatabaseConnection } from "./config/database";

import sitemapRouter from "./routes/sitemap.routes";


const app = express();

// Request correlation ID — must be first middleware
app.use(requestId);

// Security headers with helmet
const isProduction = process.env.NODE_ENV === "production";

// Warn if FRONTEND_URL is not set in production
if (isProduction && !process.env.FRONTEND_URL) {
  logger.warn("FRONTEND_URL not set in production — CORS will reject cross-origin requests. Set FRONTEND_URL to your domain.");
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com", "https://www.gstatic.com", "https://www.youtube.com", "https://replit.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https:", "wss:"],
      mediaSrc: ["'self'", "https:", "blob:"],
      frameSrc: ["'self'", "https://accounts.google.com", "https://*.firebaseapp.com", "https://www.youtube.com"],
      frameAncestors: ["'none'"],   // blocks clickjacking
      upgradeInsecureRequests: [], // force HTTPS sub-resources
    },
  },
  // HSTS — explicitly enabled for production HTTPS
  strictTransportSecurity: {
    maxAge: 31536000,        // 1 year
    includeSubDomains: true,
    preload: true,
  },
  // X-Frame-Options: DENY
  frameguard: { action: "deny" },
  // X-Content-Type-Options: nosniff
  noSniff: true,
  // X-XSS-Protection: 1; mode=block (legacy browsers)
  xssFilter: true,
  // Referrer-Policy
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  originAgentCluster: false,
}));

// Permissions-Policy — helmet doesn't set this; add manually
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
  );
  next();
});

// CORS configuration — explicit origin required in production
const allowedOrigin = process.env.FRONTEND_URL || (isProduction ? false : "http://localhost:5173");

// CORS — web browser origin + Expo/RN mobile dev origins
const mobileDevOrigins = [
  "http://localhost:8081",   // Expo Metro bundler
  "http://localhost:19000",  // Expo Go
  "http://localhost:19006",  // Expo web
  "http://10.0.2.2:5000",   // Android emulator → host
];

const allowedOrigins = [
  ...(allowedOrigin ? [allowedOrigin] : []),
  ...(!isProduction ? mobileDevOrigins : []),
];

app.use((req, res, next) => {
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (native mobile, curl, Postman)
      if (!origin) return cb(null, true);

      // Dynamically allow same-domain requests
      const host = req.get('host');
      if (host && origin.includes(host)) {
        return cb(null, true);
      }

      if (allowedOrigins.some(o => origin.startsWith(o)) || (!isProduction)) {
        return cb(null, true);
      }

      logger.warn(`CORS: origin ${origin} not allowed`);
      cb(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })(req, res, next);
});

// Enable Gzip compression for all responses
app.use(compression());

// Apply rate limiting to all API routes
app.use("/api", apiLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Structured HTTP request logging via pino-http
app.use(pinoHttp({ logger: logger._pino }));

// Health check endpoint (required for load balancers and deployment platforms)
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// SEO: serve sitemap.xml and robots.txt BEFORE any SPA catch-all or static middleware
// so Firebase/Vercel/Render rewrites never intercept them.
app.use("/", sitemapRouter);


(async () => {
  const httpServer = createServer(app);

  // Test database connection
  logger.info("Testing database connection...");
  await testDatabaseConnection();

  // Setup authentication
  await import("./auth").then(({ setupAuth }) => setupAuth(app));

  // Mount legacy routes (will be gradually migrated)
  const server = await registerRoutes(app, httpServer);

  // Prevent Edge caching (Vercel/Cloudflare) on API routes to avoid serving cached 401s
  app.use("/api", (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });

  // Mount new v1 API routes (includes auth + feature routes)
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