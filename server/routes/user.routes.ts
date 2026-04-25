import express from "express";
import { socialService } from "../services/socialService";

const router = express.Router();

// ============================================================================
// USER PROFILE DATA
// ============================================================================

router.get("/me/whispers", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.sendStatus(401);
    }

    try {
        const data = await socialService.getUserWhispers(req.user!.id);
        res.json(data);
    } catch (error) {
        console.error("Error fetching user whispers:", error);
        res.status(500).json({ error: "Failed to fetch whispers" });
    }
});

router.get("/me/cafe", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.sendStatus(401);
    }

    try {
        const data = await socialService.getUserCafePosts(req.user!.id);
        res.json(data);
    } catch (error) {
        console.error("Error fetching user cafe posts:", error);
        res.status(500).json({ error: "Failed to fetch cafe posts" });
    }
});

router.get("/me/diaries", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.sendStatus(401);
    }

    try {
        const data = await socialService.getUserDiaries(req.user!.id);
        res.json(data);
    } catch (error) {
        console.error("Error fetching user diaries:", error);
        res.status(500).json({ error: "Failed to fetch diaries" });
    }
});

export default router;
