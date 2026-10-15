/**
 * Music Routes
 */

import { Router } from "express";
import { musicController } from "../../../controllers/music.controller";
import { requireAuth } from "../../../middleware/auth.middleware";
import { validate } from "../../../middleware/validation.middleware";
import { z } from "zod";

const router = Router();

// GET /api/v1/music/search?query= - Search for music
router.get("/search", validate(z.object({ query: z.string().optional().default("") }), "query"), musicController.search);

// POST /api/v1/music/favorites/:stationId - Toggle favorite
router.post("/favorites/:stationId", requireAuth, validate(z.object({ stationId: z.string() }), "params"), musicController.toggleFavorite);

// GET /api/v1/music/favorites - Get favorites
router.get("/favorites", requireAuth, musicController.getFavorites);

// GET /api/v1/music/favorites/tracks - Get favorite tracks
router.get("/favorites/tracks", requireAuth, musicController.getFavoriteTracks);

export default router;
