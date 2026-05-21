import { db } from "../db";
import { playlists, playlistTracks } from "@shared/schema";
import {
  type Playlist,
  type PlaylistTrack,
  type InsertPlaylistTrack,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "../utils/logger";

export async function createPlaylist(userId: number, name: string): Promise<Playlist> {
  const [newPlaylist] = await db.insert(playlists).values({ userId, name }).returning();
  return newPlaylist;
}

export async function getUserPlaylists(userId: number): Promise<Playlist[]> {
  try {
    return await db.select().from(playlists).where(eq(playlists.userId, userId));
  } catch (error) {
    logger.error("Error getting user playlists:", error);
    return [];
  }
}

export async function getPlaylist(playlistId: number): Promise<Playlist | undefined> {
  try {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, playlistId));
    return playlist;
  } catch (error) {
    logger.error("Error getting playlist by ID:", error);
    return undefined;
  }
}

export async function addTrackToPlaylist(
  playlistId: number,
  track: Omit<InsertPlaylistTrack, "playlistId">
): Promise<PlaylistTrack> {
  const [newTrack] = await db
    .insert(playlistTracks)
    .values({
      playlistId,
      trackId: track.trackId,
      trackTitle: track.trackTitle,
      trackArtist: track.trackArtist,
      trackUrl: track.trackUrl,
      trackCoverArt: track.trackCoverArt,
    })
    .returning();
  return newTrack;
}

export async function removeTrackFromPlaylist(playlistId: number, trackId: string): Promise<void> {
  try {
    await db
      .delete(playlistTracks)
      .where(and(eq(playlistTracks.playlistId, playlistId), eq(playlistTracks.trackId, trackId)));
  } catch (error) {
    logger.error("Error removing track from playlist:", error);
  }
}

export async function getPlaylistTracks(playlistId: number): Promise<PlaylistTrack[]> {
  try {
    return await db.select().from(playlistTracks).where(eq(playlistTracks.playlistId, playlistId));
  } catch (error) {
    logger.error("Error getting playlist tracks:", error);
    return [];
  }
}

export async function deletePlaylist(playlistId: number): Promise<void> {
  try {
    await db.delete(playlists).where(eq(playlists.id, playlistId));
  } catch (error) {
    logger.error("Error deleting playlist:", error);
  }
}
