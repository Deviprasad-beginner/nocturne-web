/**
 * API v1 Routes Index
 * Aggregates all v1 API routes
 */

import { Router } from "express";
import whispersRoutes from "./whispers.routes";

const router = Router();

// Mount feature routes
router.use("/whispers", whispersRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
    res.json({
        success: true,
        data: {
            status: "healthy",
            timestamp: new Date().toISOString(),
            version: "1.0.0",
        },
    });
});

export default router;
