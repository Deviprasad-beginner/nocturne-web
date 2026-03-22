/**
 * Night Circles Routes 2.0
 */

import { Router } from "express";
import { nightCirclesService } from "../../../services/night-circles.service";
import { requireAuth } from "../../../middleware/auth.middleware";
import { z } from "zod";

const router = Router();

// GET /api/v1/circles - Get all active circles
router.get("/", async (req, res) => {
    try {
        const circles = await nightCirclesService.getAllCircles();
        res.json({ success: true, data: circles });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to fetch circles" });
    }
});

// POST /api/v1/circles - Create a new circle manually
router.post("/", requireAuth, async (req, res) => {
    try {
        const { name, description, maxMembers } = req.body;
        if (!name?.trim()) return res.status(400).json({ success: false, error: "Name is required" });

        const circle = await nightCirclesService.createCircle({ name, description, maxMembers });
        res.status(201).json({ success: true, data: circle });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to create circle" });
    }
});

// POST /api/v1/circles/quick-join - Smart match-based join
// ⚠️ MUST be registered before /:id routes — otherwise Express matches "quick-join" as an ID param
router.post("/quick-join", async (req, res) => {
    try {
        const { mood, preferredMode, preferredEmotion, size } = req.body;
        const userId = (req.user as any)?.id;

        const result = await nightCirclesService.quickJoin(userId, mood, preferredMode, preferredEmotion, size);
        res.json({ success: true, data: result });
    } catch (err: any) {
        console.error("QUICK JOIN ERROR:", err);
        res.status(500).json({ success: false, error: err.message || "Quick join failed" });
    }
});

// GET /api/v1/circles/:id - Get single circle (with members, messages, AI seed)
// ⚠️ Keep ALL static routes above this line
router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ success: false, error: "Invalid circle ID" });
        const circle = await nightCirclesService.getCircleById(id);
        const members = await nightCirclesService.getMembers(id);
        const messages = await nightCirclesService.getMessages(id, 50);
        const aiSeed = circle.currentMembers !== null && circle.currentMembers < 2
            ? nightCirclesService.getAiSeedMessage()
            : null;

        res.json({ success: true, data: { circle, members, messages, aiSeed } });
    } catch (err: any) {
        if (err.name === "NotFoundError") return res.status(404).json({ success: false, error: err.message });
        res.status(500).json({ success: false, error: "Failed to fetch circle" });
    }
});

// POST /api/v1/circles/:id/join - Join a specific circle
router.post("/:id/join", async (req, res) => {
    try {
        const circleId = parseInt(req.params.id);
        const mode = req.body.mode ?? "listener";
        const userId = (req.user as any)?.id;

        const member = await nightCirclesService.joinCircle(circleId, userId, mode);
        const circle = await nightCirclesService.getCircleById(circleId);
        const aiSeed = (circle.currentMembers ?? 0) < 2 ? nightCirclesService.getAiSeedMessage() : null;

        res.json({ success: true, data: { member, circle, aiSeed } });
    } catch (err: any) {
        const status = err.message?.includes("capacity") ? 409 : 500;
        res.status(status).json({ success: false, error: err.message || "Failed to join circle" });
    }
});

// POST /api/v1/circles/:id/leave - Leave a circle
router.post("/:id/leave", requireAuth, async (req, res) => {
    try {
        const circleId = parseInt(req.params.id);
        const userId = (req.user as any)?.id;

        await nightCirclesService.leaveCircle(circleId, userId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to leave circle" });
    }
});

// GET /api/v1/circles/:id/messages - Get messages
router.get("/:id/messages", async (req, res) => {
    try {
        const circleId = parseInt(req.params.id);
        const messages = await nightCirclesService.getMessages(circleId);
        res.json({ success: true, data: messages });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to fetch messages" });
    }
});

// POST /api/v1/circles/:id/messages - Send a message
router.post("/:id/messages", async (req, res) => {
    try {
        const circleId = parseInt(req.params.id);
        const { senderAlias, content } = req.body;

        if (!senderAlias?.trim() || !content?.trim()) {
            return res.status(400).json({ success: false, error: "Alias and content are required" });
        }

        const message = await nightCirclesService.sendMessage(circleId, senderAlias, content);
        res.status(201).json({ success: true, data: message });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to send message" });
    }
});

export default router;
