import type { Express } from "express";
import ytSearch from "yt-search";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import express from "express";
import { storage } from "./storage";
import { insertDiarySchema, insertWhisperSchema, insertMindMazeSchema, insertNightCircleSchema, insertMidnightCafeSchema, insertAmFounderSchema, insertStarlitSpeakerSchema, insertMoonMessengerSchema } from "@shared/schema";

const router = express.Router();

// Diaries routes
router.get("/v1/diaries", async (req, res) => {
  try {
    const diaries = await storage.getDiaries(true); // Filter public only
    res.json(diaries);
  } catch (error) {
    console.error("Error getting diaries:", error);
    res.status(500).json({ error: "Failed to fetch diaries" });
  }
});

router.post("/v1/diaries", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const diaryData = insertDiarySchema.parse({
      ...req.body,
      authorId: req.user!.id
    });
    const diary = await storage.createDiary(diaryData);
    res.status(201).json({ success: true, data: diary });
  } catch (error) {
    console.error("Error creating diary:", error);
    res.status(400).json({ error: "Invalid diary data" });
  }
});

router.delete("/v1/diaries/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const id = parseInt(req.params.id);
    const diary = await storage.getDiary(id);

    if (!diary) {
      return res.status(404).json({ error: "Diary not found" });
    }

    if (diary.authorId !== req.user!.id) {
      return res.status(403).json({ error: "Forbidden: You can only delete your own diaries" });
    }

    const success = await storage.deleteDiary(id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: "Failed to delete diary" });
    }
  } catch (error) {
    console.error("Error deleting diary:", error);
    res.status(500).json({ error: "Failed to delete diary" });
  }
});

// Whispers routes
router.get("/v1/whispers", async (req, res) => {
  try {
    const whispers = await storage.getWhispers();
    res.json({ success: true, data: whispers });
  } catch (error) {
    console.error("Error getting whispers:", error);
    res.status(500).json({ error: "Failed to fetch whispers" });
  }
});

router.post("/v1/whispers", async (req, res) => {
  try {
    const whisperData = insertWhisperSchema.parse({
      ...req.body,
      authorId: req.user?.id // Optional: link to user if logged in
    });
    const whisper = await storage.createWhisper(whisperData);
    res.status(201).json({ success: true, data: whisper });
  } catch (error) {
    console.error("Error creating whisper:", error);
    res.status(400).json({ error: "Invalid whisper data" });
  }
});

router.patch("/v1/whispers/:id/hearts", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.incrementWhisperHearts(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error incrementing hearts:", error);
    res.status(500).json({ error: "Failed to increment hearts" });
  }
});

// Mind Maze routes
router.get("/v1/mind-maze", async (req, res) => {
  try {
    const mindMaze = await storage.getMindMaze();
    res.json(mindMaze);
  } catch (error) {
    console.error("Error getting mind maze:", error);
    res.status(500).json({ error: "Failed to fetch mind maze" });
  }
});

router.post("/v1/mind-maze", async (req, res) => {
  try {
    const mindMazeData = insertMindMazeSchema.parse(req.body);
    const mindMaze = await storage.createMindMaze(mindMazeData);
    res.status(201).json(mindMaze);
  } catch (error) {
    console.error("Error creating mind maze:", error);
    res.status(400).json({ error: "Invalid mind maze data" });
  }
});

router.patch("/v1/mind-maze/:id/responses", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.incrementMindMazeResponses(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error incrementing responses:", error);
    res.status(500).json({ error: "Failed to increment responses" });
  }
});

// Night Circles routes
router.get("/v1/circles", async (req, res) => {
  try {
    const nightCircles = await storage.getNightCircles();
    res.json(nightCircles);
  } catch (error) {
    console.error("Error getting night circles:", error);
    res.status(500).json({ error: "Failed to fetch night circles" });
  }
});

router.post("/v1/circles", async (req, res) => {
  try {
    const nightCircleData = insertNightCircleSchema.parse(req.body);
    const nightCircle = await storage.createNightCircle(nightCircleData);
    res.status(201).json(nightCircle);
  } catch (error) {
    console.error("Error creating night circle:", error);
    res.status(400).json({ error: "Invalid night circle data" });
  }
});

router.patch("/v1/circles/:id/members", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { members } = req.body;
    await storage.updateNightCircleMembers(id, members);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating members:", error);
    res.status(500).json({ error: "Failed to update members" });
  }
});

// Midnight Cafe routes
router.get("/v1/cafe", async (req, res) => {
  try {
    const midnightCafe = await storage.getMidnightCafe();
    res.json(midnightCafe);
  } catch (error) {
    console.error("Error getting midnight cafe:", error);
    res.status(500).json({ error: "Failed to fetch midnight cafe" });
  }
});

router.post("/v1/cafe", async (req, res) => {
  try {
    const midnightCafeData = insertMidnightCafeSchema.parse({
      ...req.body,
      authorId: req.user?.id
    });
    const midnightCafe = await storage.createMidnightCafe(midnightCafeData);
    res.status(201).json({ success: true, data: midnightCafe });
  } catch (error) {
    console.error("Error creating midnight cafe post:", error);
    res.status(400).json({ error: "Invalid midnight cafe data" });
  }
});

router.patch("/v1/cafe/:id/reply", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.incrementCafeReplies(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error incrementing replies:", error);
    res.status(500).json({ error: "Failed to increment replies" });
  }
});

// 3AM Founder routes
router.get("/v1/founder", async (req, res) => {
  try {
    const founders = await storage.getAmFounder();
    res.json(founders);
  } catch (error) {
    console.error("Error getting 3AM founders:", error);
    res.status(500).json({ error: "Failed to fetch 3AM founders" });
  }
});

router.post("/v1/founder", async (req, res) => {
  try {
    const founderData = insertAmFounderSchema.parse({
      ...req.body,
      authorId: req.user?.id
    });
    const founder = await storage.createAmFounder(founderData);
    res.status(201).json({ success: true, data: founder });
  } catch (error) {
    console.error("Error creating 3AM founder:", error);
    res.status(400).json({ error: "Invalid 3AM founder data" });
  }
});

router.patch("/v1/founder/:id/upvote", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.incrementFounderUpvotes(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error incrementing upvotes:", error);
    res.status(500).json({ error: "Failed to increment upvotes" });
  }
});

router.patch("/v1/founder/:id/comments", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.incrementFounderComments(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error incrementing comments:", error);
    res.status(500).json({ error: "Failed to increment comments" });
  }
});

// Starlit Speaker routes
router.get("/v1/speaker", async (req, res) => {
  try {
    const speakers = await storage.getStarlitSpeaker();
    res.json(speakers);
  } catch (error) {
    console.error("Error getting starlit speakers:", error);
    res.status(500).json({ error: "Failed to fetch starlit speakers" });
  }
});

router.post("/v1/speaker", async (req, res) => {
  try {
    const speakerData = insertStarlitSpeakerSchema.parse(req.body);
    const speaker = await storage.createStarlitSpeaker(speakerData);
    res.status(201).json(speaker);
  } catch (error) {
    console.error("Error creating starlit speaker:", error);
    res.status(400).json({ error: "Invalid starlit speaker data" });
  }
});

router.patch("/v1/speaker/:id/participants", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { participants } = req.body;
    await storage.updateSpeakerParticipants(id, participants);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating participants:", error);
    res.status(500).json({ error: "Failed to update participants" });
  }
});

// Moon Messenger routes
router.get("/v1/messenger/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await storage.getMoonMessages(sessionId);
    res.json(messages);
  } catch (error) {
    console.error("Error getting moon messages:", error);
    res.status(500).json({ error: "Failed to fetch moon messages" });
  }
});

router.post("/v1/messenger", async (req, res) => {
  try {
    const messageData = insertMoonMessengerSchema.parse(req.body);
    const message = await storage.createMoonMessage(messageData);
    res.status(201).json(message);
  } catch (error) {
    console.error("Error creating moon message:", error);
    res.status(400).json({ error: "Invalid moon message data" });
  }
});

router.get("/v1/messenger", async (req, res) => {
  try {
    const sessions = await storage.getActiveSessions();
    res.json(sessions);
  } catch (error) {
    console.error("Error getting active sessions:", error);
    res.status(500).json({ error: "Failed to fetch active sessions" });
  }
});

// Music Search route

router.get("/music/search", async (req, res) => {
  try {
    const query = req.query.query as string;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const r = await ytSearch(query + " live radio");

    // Access the 'live' property which contains live streams
    // Cast to any because the types might be missing 'live' property on the main result interface
    const liveVideos = (r as any).live || [];

    const stations = liveVideos
      .slice(0, 10)
      .map((v: any) => ({
        id: v.videoId,
        name: v.title,
        youtubeId: v.videoId
      }));

    res.json(stations);
  } catch (error) {
    console.error("Error searching music:", error);
    res.status(500).json({ error: "Failed to search music" });
  }
});
// Saved Stations Routes
router.post("/music/favorites/:stationId", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  try {
    const saved = await storage.toggleSavedStation(req.user!.id, req.params.stationId);
    res.json({ saved });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle favorite" });
  }
});

router.get("/music/favorites", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  try {
    const stations = await storage.getSavedStations(req.user!.id);
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// User Profile Routes
router.get("/users/me/whispers", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  const data = await storage.getUserWhispers(req.user!.id);
  res.json(data);
});

router.get("/users/me/cafe", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  const data = await storage.getUserCafePosts(req.user!.id);
  res.json(data);
});




export async function registerRoutes(app: Express, httpServer: Server): Promise<Server> {
  // Setup authentication is handled in index.ts via server/auth.ts

  // Use the API routes
  app.use("/api", router);

  // WebSocket server is now handled by WebSocketManager in server/index.ts
  // Removed duplicate WebSocket initialization to prevent "handleUpgrade() called more than once" error

  return httpServer;
}



