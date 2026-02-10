import express from "express";
import { musicService } from "../services/musicService";

const router = express.Router();

// ============================================================================
// MUSIC SEARCH
// ============================================================================
router.get("/search", async (req, res) => {
    try {
        const query = req.query.query as string;

        if (!query) {
            return res.status(400).json({ error: "Query parameter is required" });
        }

        const stations = await musicService.searchMusic(query);
        res.json(stations);
    } catch (error: any) {
        console.error("Error searching music:", error);

        // Return user-friendly error instead of 500
        if (error.message === 'Query parameter is required') {
            return res.status(400).json({ error: error.message });
        }

        // For search failures, return empty array with warning
        res.json([]);
    }
});

// ============================================================================
// FAVORITES
// ============================================================================
router.post("/favorites/:stationId", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.sendStatus(401);
    }

    try {
        const saved = await musicService.toggleFavorite(req.user!.id, req.params.stationId);
        res.json({ saved });
    } catch (error) {
        console.error("Error toggling favorite:", error);
        res.status(500).json({ error: "Failed to toggle favorite" });
    }
});

router.get("/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.sendStatus(401);
    }

    try {
        const stations = await musicService.getFavorites(req.user!.id);
        res.json(stations);
    } catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).json({ error: "Failed to fetch favorites" });
    }
});

export default router;
