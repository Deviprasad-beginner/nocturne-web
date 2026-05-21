/**
 * Playlist Routes
 */

import { Router } from "express";
import { playlistController } from "../../../controllers/playlist.controller";
import { requireAuth } from "../../../middleware/auth.middleware";
import { validate } from "../../../middleware/validation.middleware";
import { z } from "zod";

const router = Router();

// Protect all playlist endpoints — user must be authenticated
router.use(requireAuth);

// GET /api/v1/playlists - Get all playlists of current user
router.get("/", playlistController.getUserPlaylists);

// POST /api/v1/playlists - Create a new playlist
router.post(
    "/",
    validate(z.object({ name: z.string().min(1, "Playlist name is required") }), "body"),
    playlistController.createPlaylist
);

// DELETE /api/v1/playlists/:playlistId - Delete a playlist
router.delete("/:playlistId", playlistController.deletePlaylist);

// GET /api/v1/playlists/:playlistId/tracks - Get all tracks in a playlist
router.get("/:playlistId/tracks", playlistController.getPlaylistTracks);

// POST /api/v1/playlists/:playlistId/tracks - Add a track to a playlist
router.post(
    "/:playlistId/tracks",
    validate(
        z.object({
            trackId: z.union([z.string(), z.number()]),
            trackTitle: z.string(),
            trackArtist: z.string(),
            trackUrl: z.string(),
            trackCoverArt: z.string().optional().nullable(),
        }),
        "body"
    ),
    playlistController.addTrackToPlaylist
);

// DELETE /api/v1/playlists/:playlistId/tracks/:trackId - Remove track from a playlist
router.delete("/:playlistId/tracks/:trackId", playlistController.removeTrackFromPlaylist);

export default router;
