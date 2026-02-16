import express from "express";
import { socialService } from "../services/socialService";
import { insertDiarySchema, insertWhisperSchema, insertMindMazeSchema, insertNightCircleSchema, insertMidnightCafeSchema } from "@shared/schema";
import { logger } from "../utils/logger";

const router = express.Router();

// ============================================================================
// DIARIES
// ============================================================================
router.get("/diaries", async (req, res) => {
    try {
        const diaries = await socialService.getDiaries(true);
        res.json(diaries);
    } catch (error) {
        logger.error("Error getting diaries:", error);
        res.status(500).json({ error: "Failed to fetch diaries" });
    }
});

router.post("/diaries", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const diaryData = insertDiarySchema.parse({
            ...req.body,
            authorId: req.user!.id
        });
        const diary = await socialService.createDiary(diaryData);
        res.status(201).json({ success: true, data: diary });
    } catch (error) {
        logger.error("Error creating diary:", error);
        res.status(400).json({ error: "Invalid diary data" });
    }
});

router.delete("/diaries/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const id = parseInt(req.params.id);
        const diary = await socialService.getDiary(id);

        if (!diary) {
            return res.status(404).json({ error: "Diary not found" });
        }

        if (diary.authorId !== req.user!.id) {
            return res.status(403).json({ error: "Forbidden: You can only delete your own diaries" });
        }

        const success = await socialService.deleteDiary(id);
        if (success) {
            res.json({ success: true });
        } else {
            res.status(500).json({ error: "Failed to delete diary" });
        }
    } catch (error) {
        logger.error("Error deleting diary:", error);
        res.status(500).json({ error: "Failed to delete diary" });
    }
});

// ============================================================================
// WHISPERS
// ============================================================================
router.get("/whispers", async (req, res) => {
    try {
        const whispers = await socialService.getWhispers();
        res.json({ success: true, data: whispers });
    } catch (error) {
        logger.error("Error getting whispers:", error);
        res.status(500).json({ error: "Failed to fetch whispers" });
    }
});

router.post("/whispers", async (req, res) => {
    try {
        const whisperData = insertWhisperSchema.parse({
            ...req.body,
            authorId: req.user?.id
        });
        const whisper = await socialService.createWhisper(whisperData);
        res.status(201).json({ success: true, data: whisper });
    } catch (error) {
        logger.error("Error creating whisper:", error);
        res.status(400).json({ error: "Invalid whisper data" });
    }
});

router.patch("/whispers/:id/hearts", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await socialService.incrementWhisperHearts(id);
        res.json({ success: true });
    } catch (error) {
        logger.error("Error incrementing hearts:", error);
        res.status(500).json({ error: "Failed to increment hearts" });
    }
});

// ============================================================================
// MIND MAZE
// ============================================================================
router.get("/mind-maze", async (req, res) => {
    try {
        const mindMaze = await socialService.getMindMaze();
        res.json(mindMaze);
    } catch (error) {
        logger.error("Error getting mind maze:", error);
        res.status(500).json({ error: "Failed to fetch mind maze" });
    }
});

router.post("/mind-maze", async (req, res) => {
    try {
        const mindMazeData = insertMindMazeSchema.parse(req.body);
        const mindMaze = await socialService.createMindMaze(mindMazeData);
        res.status(201).json(mindMaze);
    } catch (error) {
        logger.error("Error creating mind maze:", error);
        res.status(400).json({ error: "Invalid mind maze data" });
    }
});

router.patch("/mind-maze/:id/responses", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await socialService.incrementMindMazeResponses(id);
        res.json({ success: true });
    } catch (error) {
        logger.error("Error incrementing responses:", error);
        res.status(500).json({ error: "Failed to increment responses" });
    }
});

// ============================================================================
// NIGHT CIRCLES
// ============================================================================
router.get("/circles", async (req, res) => {
    try {
        const circles = await socialService.getCircles();
        res.json(circles);
    } catch (error) {
        logger.error("Error getting circles:", error);
        res.status(500).json({ error: "Failed to fetch circles" });
    }
});

router.post("/circles", async (req, res) => {
    try {
        const circleData = insertNightCircleSchema.parse(req.body);
        const circle = await socialService.createCircle(circleData);
        res.status(201).json(circle);
    } catch (error) {
        logger.error("Error creating circle:", error);
        res.status(400).json({ error: "Invalid circle data" });
    }
});

router.patch("/circles/:id/members", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { members } = req.body;
        await socialService.updateCircleMembers(id, members);
        res.json({ success: true });
    } catch (error) {
        logger.error("Error updating members:", error);
        res.status(500).json({ error: "Failed to update members" });
    }
});

// ============================================================================
// MIDNIGHT CAFE
// ============================================================================
router.get("/cafe", async (req, res) => {
    try {
        const cafePosts = await socialService.getCafePosts();
        res.json(cafePosts);
    } catch (error) {
        logger.error("Error getting cafe posts:", error);
        res.status(500).json({ error: "Failed to fetch cafe posts" });
    }
});

router.post("/cafe", async (req, res) => {
    try {
        const cafeData = insertMidnightCafeSchema.parse({
            ...req.body,
            authorId: req.user?.id
        });
        const cafe = await socialService.createCafePost(cafeData);
        res.status(201).json({ success: true, data: cafe });
    } catch (error) {
        logger.error("Error creating cafe post:", error);
        res.status(400).json({ error: "Invalid cafe data" });
    }
});

router.patch("/cafe/:id/reply", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await socialService.incrementCafeReplies(id);
        res.json({ success: true });
    } catch (error) {
        logger.error("Error incrementing replies:", error);
        res.status(500).json({ error: "Failed to increment replies" });
    }
});

export default router;
