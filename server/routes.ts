import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import express from "express";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertDiarySchema, insertWhisperSchema, insertMindMazeSchema, insertNightCircleSchema, insertMidnightCafeSchema, insertAmFounderSchema, insertStarlitSpeakerSchema, insertMoonMessengerSchema } from "@shared/schema";

const router = express.Router();

// Diaries routes
router.get("/diaries", async (req, res) => {
  try {
    const diaries = await storage.getDiaries(true); // Filter public only
    res.json(diaries);
  } catch (error) {
    console.error("Error getting diaries:", error);
    res.status(500).json({ error: "Failed to fetch diaries" });
  }
});

router.post("/diaries", async (req, res) => {
  try {
    const diaryData = insertDiarySchema.parse(req.body);
    const diary = await storage.createDiary(diaryData);
    res.status(201).json(diary);
  } catch (error) {
    console.error("Error creating diary:", error);
    res.status(400).json({ error: "Invalid diary data" });
  }
});

// Whispers routes
router.get("/whispers", async (req, res) => {
  try {
    const whispers = await storage.getWhispers();
    res.json(whispers);
  } catch (error) {
    console.error("Error getting whispers:", error);
    res.status(500).json({ error: "Failed to fetch whispers" });
  }
});

router.post("/whispers", async (req, res) => {
  try {
    const whisperData = insertWhisperSchema.parse(req.body);
    const whisper = await storage.createWhisper(whisperData);
    res.status(201).json(whisper);
  } catch (error) {
    console.error("Error creating whisper:", error);
    res.status(400).json({ error: "Invalid whisper data" });
  }
});

router.patch("/whispers/:id/hearts", async (req, res) => {
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
router.get("/mindMaze", async (req, res) => {
  try {
    const mindMaze = await storage.getMindMaze();
    res.json(mindMaze);
  } catch (error) {
    console.error("Error getting mind maze:", error);
    res.status(500).json({ error: "Failed to fetch mind maze" });
  }
});

router.post("/mindMaze", async (req, res) => {
  try {
    const mindMazeData = insertMindMazeSchema.parse(req.body);
    const mindMaze = await storage.createMindMaze(mindMazeData);
    res.status(201).json(mindMaze);
  } catch (error) {
    console.error("Error creating mind maze:", error);
    res.status(400).json({ error: "Invalid mind maze data" });
  }
});

router.patch("/mindMaze/:id/responses", async (req, res) => {
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
router.get("/nightCircles", async (req, res) => {
  try {
    const nightCircles = await storage.getNightCircles();
    res.json(nightCircles);
  } catch (error) {
    console.error("Error getting night circles:", error);
    res.status(500).json({ error: "Failed to fetch night circles" });
  }
});

router.post("/nightCircles", async (req, res) => {
  try {
    const nightCircleData = insertNightCircleSchema.parse(req.body);
    const nightCircle = await storage.createNightCircle(nightCircleData);
    res.status(201).json(nightCircle);
  } catch (error) {
    console.error("Error creating night circle:", error);
    res.status(400).json({ error: "Invalid night circle data" });
  }
});

router.patch("/nightCircles/:id/members", async (req, res) => {
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
router.get("/midnightCafe", async (req, res) => {
  try {
    const midnightCafe = await storage.getMidnightCafe();
    res.json(midnightCafe);
  } catch (error) {
    console.error("Error getting midnight cafe:", error);
    res.status(500).json({ error: "Failed to fetch midnight cafe" });
  }
});

router.post("/midnightCafe", async (req, res) => {
  try {
    const midnightCafeData = insertMidnightCafeSchema.parse(req.body);
    const midnightCafe = await storage.createMidnightCafe(midnightCafeData);
    res.status(201).json(midnightCafe);
  } catch (error) {
    console.error("Error creating midnight cafe post:", error);
    res.status(400).json({ error: "Invalid midnight cafe data" });
  }
});

router.patch("/midnightCafe/:id/replies", async (req, res) => {
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
router.get("/amFounder", async (req, res) => {
  try {
    const founders = await storage.getAmFounder();
    res.json(founders);
  } catch (error) {
    console.error("Error getting 3AM founders:", error);
    res.status(500).json({ error: "Failed to fetch 3AM founders" });
  }
});

router.post("/amFounder", async (req, res) => {
  try {
    const founderData = insertAmFounderSchema.parse(req.body);
    const founder = await storage.createAmFounder(founderData);
    res.status(201).json(founder);
  } catch (error) {
    console.error("Error creating 3AM founder:", error);
    res.status(400).json({ error: "Invalid 3AM founder data" });
  }
});

router.patch("/amFounder/:id/upvotes", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.incrementFounderUpvotes(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error incrementing upvotes:", error);
    res.status(500).json({ error: "Failed to increment upvotes" });
  }
});

router.patch("/amFounder/:id/comments", async (req, res) => {
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
router.get("/starlitSpeaker", async (req, res) => {
  try {
    const speakers = await storage.getStarlitSpeaker();
    res.json(speakers);
  } catch (error) {
    console.error("Error getting starlit speakers:", error);
    res.status(500).json({ error: "Failed to fetch starlit speakers" });
  }
});

router.post("/starlitSpeaker", async (req, res) => {
  try {
    const speakerData = insertStarlitSpeakerSchema.parse(req.body);
    const speaker = await storage.createStarlitSpeaker(speakerData);
    res.status(201).json(speaker);
  } catch (error) {
    console.error("Error creating starlit speaker:", error);
    res.status(400).json({ error: "Invalid starlit speaker data" });
  }
});

router.patch("/starlitSpeaker/:id/participants", async (req, res) => {
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
router.get("/moonMessenger/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await storage.getMoonMessages(sessionId);
    res.json(messages);
  } catch (error) {
    console.error("Error getting moon messages:", error);
    res.status(500).json({ error: "Failed to fetch moon messages" });
  }
});

router.post("/moonMessenger", async (req, res) => {
  try {
    const messageData = insertMoonMessengerSchema.parse(req.body);
    const message = await storage.createMoonMessage(messageData);
    res.status(201).json(message);
  } catch (error) {
    console.error("Error creating moon message:", error);
    res.status(400).json({ error: "Invalid moon message data" });
  }
});

router.get("/moonMessenger", async (req, res) => {
  try {
    const sessions = await storage.getActiveSessions();
    res.json(sessions);
  } catch (error) {
    console.error("Error getting active sessions:", error);
    res.status(500).json({ error: "Failed to fetch active sessions" });
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  try {
    await setupAuth(app);
    console.log("Replit authentication configured successfully");
  } catch (error) {
    console.log("Replit auth not available, continuing without authentication");
  }

  // Auth routes - make them optional in case auth isn't configured
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Try to use authentication if available
      if (req.user && req.user.claims && req.user.claims.sub) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        if (user) {
          res.json(user);
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } else {
        // Return null if not authenticated (for development)
        res.json(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.json(null);
    }
  });

  // Use the API routes
  app.use("/api", router);

  const httpServer = createServer(app);

  // WebSocket server for real-time communication on a specific path
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });

  // Store active connections and room information
  const rooms = new Map<string, Set<WebSocket>>();
  const userRooms = new Map<WebSocket, string>();
  const waitingQueue: WebSocket[] = [];

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case 'join_room':
            joinRoom(ws, message.roomId, message.username);
            break;
          case 'leave_room':
            leaveRoom(ws);
            break;
          case 'chat_message':
            broadcastToRoom(ws, message);
            break;
          case 'video_offer':
          case 'video_answer':
          case 'ice_candidate':
            forwardVideoSignaling(ws, message);
            break;
          case 'join_random':
            joinRandomPairing(ws, message.username);
            break;
          case 'user_report':
            handleUserReport(ws, message);
            break;          case 'end_session':
            endSession(ws, message.sessionId);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      leaveRoom(ws);
      // Remove from waiting queue if present
      const queueIndex = waitingQueue.indexOf(ws);
      if (queueIndex > -1) {
        waitingQueue.splice(queueIndex, 1);
      }
    });
  });

  function joinRoom(ws: WebSocket, roomId: string, username: string) {
    // Leave current room if in one
    leaveRoom(ws);

    // Join new room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    rooms.get(roomId)!.add(ws);
    userRooms.set(ws, roomId);

    // Notify room members
    broadcastToRoom(ws, {
      type: 'user_joined',
      username,
      timestamp: new Date().toISOString()
    });

    // Send current room members to new user
    ws.send(JSON.stringify({
      type: 'room_joined',
      roomId,
      memberCount: rooms.get(roomId)!.size
    }));
  }

  function leaveRoom(ws: WebSocket) {
    const roomId = userRooms.get(ws);
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId)!;
      room.delete(ws);
      userRooms.delete(ws);

      if (room.size === 0) {
        rooms.delete(roomId);
      } else {
        // Notify remaining members
        room.forEach(client => {
          client.send(JSON.stringify({
            type: 'user_left',
            memberCount: room.size,
            timestamp: new Date().toISOString()
          }));
        });
      }
    }
  }

  function broadcastToRoom(sender: WebSocket, message: any) {
    const roomId = userRooms.get(sender);
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId)!;
      room.forEach(client => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }
  }

  function forwardVideoSignaling(sender: WebSocket, message: any) {
    const roomId = userRooms.get(sender);
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId)!;
      room.forEach(client => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }
  }

  function joinRandomPairing(ws: WebSocket, username: string) {
    if (waitingQueue.length > 0) {
      // Pair with someone from queue
      const partner = waitingQueue.shift()!;
      const roomId = `random_${Date.now()}`;

      // Add both to room
      joinRoom(ws, roomId, username);
      joinRoom(partner, roomId, 'Random User');

      // Notify both users they've been paired
      [ws, partner].forEach(client => {
        client.send(JSON.stringify({
          type: 'random_paired',
          roomId,
          timestamp: new Date().toISOString()
        }));
      });
    } else {
      // Add to waiting queue
      waitingQueue.push(ws);
      ws.send(JSON.stringify({
        type: 'waiting_for_pair',
        timestamp: new Date().toISOString()
      }));
    }
  }

  function handleUserReport(ws: WebSocket, message: any) {
    console.log('User report received:', message);
    // Log the report - in production, you'd save this to database
    const roomId = userRooms.get(ws);
    if (roomId) {
      // Optionally end the session for safety
      const room = rooms.get(roomId);
      if (room) {
        room.forEach(client => {
          client.send(JSON.stringify({
            type: 'session_ended',
            reason: 'reported',
            timestamp: new Date().toISOString()
          }));
        });
      }
    }
  }

  function endSession(ws: WebSocket, sessionId: string) {
    const roomId = userRooms.get(ws);
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId)!;
      room.forEach(client => {
        client.send(JSON.stringify({
          type: 'session_ended',
          reason: 'user_ended',
          timestamp: new Date().toISOString()
        }));
      });
      // Clean up the room
      rooms.delete(roomId);
      room.forEach(client => {
        userRooms.delete(client);
      });
    }
  }

  return httpServer;
}

export async function registerApiRoutes(app: Express): Promise<void> {
  try {
    await setupAuth(app);
    console.log("Replit authentication configured successfully");
  } catch (error) {
    console.log("Replit auth not available, continuing without authentication");
  }
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (req.user && req.user.claims && req.user.claims.sub) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        if (user) {
          res.json(user);
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.json(null);
    }
  });
  app.use("/api", router);
}
