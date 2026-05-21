/**
 * Playlist Controller - Route Handlers
 */

import { Request, Response } from "express";
import { storage } from "../storage";
import { successResponse } from "../utils/api-response";
import { asyncHandler } from "../middleware/error.middleware";

export class PlaylistController {
    /**
     * POST /api/v1/playlists
     */
    createPlaylist = asyncHandler(async (req: Request, res: Response) => {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Playlist name is required" });
        }
        const playlist = await storage.createPlaylist(req.user!.id, name.trim());
        res.json(successResponse(playlist));
    });

    /**
     * GET /api/v1/playlists
     */
    getUserPlaylists = asyncHandler(async (req: Request, res: Response) => {
        const playlists = await storage.getUserPlaylists(req.user!.id);
        res.json(successResponse(playlists));
    });

    /**
     * GET /api/v1/playlists/:playlistId/tracks
     */
    getPlaylistTracks = asyncHandler(async (req: Request, res: Response) => {
        const playlistId = parseInt(req.params.playlistId);
        if (isNaN(playlistId)) {
            return res.status(400).json({ error: "Invalid playlist ID" });
        }
        
        const playlist = await storage.getPlaylist(playlistId);
        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found" });
        }
        if (playlist.userId !== req.user!.id) {
            return res.status(403).json({ error: "Unauthorized access to playlist" });
        }

        const tracks = await storage.getPlaylistTracks(playlistId);
        res.json(successResponse(tracks));
    });

    /**
     * POST /api/v1/playlists/:playlistId/tracks
     */
    addTrackToPlaylist = asyncHandler(async (req: Request, res: Response) => {
        const playlistId = parseInt(req.params.playlistId);
        if (isNaN(playlistId)) {
            return res.status(400).json({ error: "Invalid playlist ID" });
        }

        const playlist = await storage.getPlaylist(playlistId);
        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found" });
        }
        if (playlist.userId !== req.user!.id) {
            return res.status(403).json({ error: "Unauthorized access to playlist" });
        }

        const { trackId, trackTitle, trackArtist, trackUrl, trackCoverArt } = req.body;
        if (!trackId || !trackTitle || !trackArtist || !trackUrl) {
            return res.status(400).json({ error: "Missing required track details" });
        }

        const track = await storage.addTrackToPlaylist(playlistId, {
            trackId: String(trackId),
            trackTitle,
            trackArtist,
            trackUrl,
            trackCoverArt: trackCoverArt || null
        });
        
        res.json(successResponse(track));
    });

    /**
     * DELETE /api/v1/playlists/:playlistId/tracks/:trackId
     */
    removeTrackFromPlaylist = asyncHandler(async (req: Request, res: Response) => {
        const playlistId = parseInt(req.params.playlistId);
        const { trackId } = req.params;
        if (isNaN(playlistId) || !trackId) {
            return res.status(400).json({ error: "Invalid parameters" });
        }

        const playlist = await storage.getPlaylist(playlistId);
        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found" });
        }
        if (playlist.userId !== req.user!.id) {
            return res.status(403).json({ error: "Unauthorized access to playlist" });
        }

        await storage.removeTrackFromPlaylist(playlistId, trackId);
        res.json(successResponse({ removed: true }));
    });

    /**
     * DELETE /api/v1/playlists/:playlistId
     */
    deletePlaylist = asyncHandler(async (req: Request, res: Response) => {
        const playlistId = parseInt(req.params.playlistId);
        if (isNaN(playlistId)) {
            return res.status(400).json({ error: "Invalid playlist ID" });
        }

        const playlist = await storage.getPlaylist(playlistId);
        if (!playlist) {
            return res.status(404).json({ error: "Playlist not found" });
        }
        if (playlist.userId !== req.user!.id) {
            return res.status(403).json({ error: "Unauthorized access to playlist" });
        }

        await storage.deletePlaylist(playlistId);
        res.json(successResponse({ deleted: true }));
    });
}

export const playlistController = new PlaylistController();
