/**
 * API v1 Routes Index
 * Aggregates all v1 API routes
 */

import { Router } from "express";
import whispersRoutes from "./whispers.routes";
import diariesRoutes from "./diaries.routes";
import midnightCafeRoutes from "./midnight-cafe.routes";
import nightCirclesRoutes from "./night-circles.routes";
import mindMazeRoutes from "./mind-maze.routes";
import musicRoutes from "./music.routes";
import amFounderRoutes from "./3am-founder.routes";
import starlitSpeakerRoutes from "./starlit-speaker.routes";
import moonMessengerRoutes from "./moon-messenger.routes";
import userRoutes from "./user.routes";
import onboardingRoutes from "./onboarding.routes";
import trendingRoutes from "./trending.routes";
import activityRoutes from "./activity.routes";
import profileRoutes from "./profile.routes";

const router = Router();

// Mount feature routes
router.use("/whispers", whispersRoutes);
router.use("/diaries", diariesRoutes);
router.use("/cafe", midnightCafeRoutes);
router.use("/circles", nightCirclesRoutes);
router.use("/mind-maze", mindMazeRoutes);
router.use("/music", musicRoutes);
router.use("/founder", amFounderRoutes);
router.use("/speaker", starlitSpeakerRoutes);
router.use("/messenger", moonMessengerRoutes);
router.use("/users", userRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/trending", trendingRoutes);
router.use("/activity", activityRoutes);
router.use("/profile", profileRoutes);

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
