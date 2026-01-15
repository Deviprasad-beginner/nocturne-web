var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express3 from "express";
import { createServer as createServer2 } from "http";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import express from "express";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  amFounder: () => amFounder,
  diaries: () => diaries,
  insertAmFounderSchema: () => insertAmFounderSchema,
  insertDiarySchema: () => insertDiarySchema,
  insertMidnightCafeSchema: () => insertMidnightCafeSchema,
  insertMindMazeSchema: () => insertMindMazeSchema,
  insertMoonMessengerSchema: () => insertMoonMessengerSchema,
  insertNightCircleSchema: () => insertNightCircleSchema,
  insertStarlitSpeakerSchema: () => insertStarlitSpeakerSchema,
  insertUserSchema: () => insertUserSchema,
  insertWhisperSchema: () => insertWhisperSchema,
  midnightCafe: () => midnightCafe,
  mindMaze: () => mindMaze,
  moonMessenger: () => moonMessenger,
  nightCircles: () => nightCircles,
  sessions: () => sessions,
  starlitSpeaker: () => starlitSpeaker,
  upsertUserSchema: () => upsertUserSchema,
  users: () => users,
  whispers: () => whispers
});
import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  // Changed to varchar for Replit Auth compatibility
  username: varchar("username", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  firebaseUid: varchar("firebase_uid", { length: 255 }),
  // For Firebase users
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var diaries = pgTable("diaries", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  isPublic: boolean("is_public").default(false),
  mood: varchar("mood", { length: 100 }),
  authorId: varchar("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow()
});
var whispers = pgTable("whispers", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  hearts: integer("hearts").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var mindMaze = pgTable("mind_maze", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  options: text("options").array(),
  responses: integer("responses").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var nightCircles = pgTable("night_circles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  maxMembers: integer("max_members").default(8),
  currentMembers: integer("current_members").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var midnightCafe = pgTable("midnight_cafe", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  replies: integer("replies").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  id: z.string().optional()
});
var insertDiarySchema = createInsertSchema(diaries).omit({
  id: true,
  createdAt: true
});
var insertWhisperSchema = createInsertSchema(whispers).omit({
  id: true,
  hearts: true,
  createdAt: true
});
var insertMindMazeSchema = createInsertSchema(mindMaze).omit({
  id: true,
  responses: true,
  createdAt: true
});
var insertNightCircleSchema = createInsertSchema(nightCircles).omit({
  id: true,
  currentMembers: true,
  isActive: true,
  createdAt: true
});
var insertMidnightCafeSchema = createInsertSchema(midnightCafe).omit({
  id: true,
  replies: true,
  createdAt: true
});
var amFounder = pgTable("am_founder", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  upvotes: integer("upvotes").default(0),
  comments: integer("comments").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var starlitSpeaker = pgTable("starlit_speaker", {
  id: serial("id").primaryKey(),
  roomName: text("room_name").notNull(),
  description: text("description").notNull(),
  topic: text("topic").notNull(),
  maxParticipants: integer("max_participants").default(8),
  currentParticipants: integer("current_participants").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var moonMessenger = pgTable("moon_messenger", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  message: text("message").notNull(),
  sender: text("sender").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  isActive: boolean("is_active").default(true)
});
var insertAmFounderSchema = createInsertSchema(amFounder).omit({
  id: true,
  upvotes: true,
  comments: true,
  createdAt: true
});
var insertStarlitSpeakerSchema = createInsertSchema(starlitSpeaker).omit({
  id: true,
  currentParticipants: true,
  isActive: true,
  createdAt: true
});
var insertMoonMessengerSchema = createInsertSchema(moonMessenger).omit({
  id: true,
  isActive: true,
  timestamp: true
});

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
var { Pool } = pg;
var dbInstance;
if (process.env.DATABASE_URL) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  dbInstance = drizzle(pool, { schema: schema_exports });
}
var db = dbInstance;

// server/storage.ts
import { eq, desc, sql } from "drizzle-orm";
var MemoryStorage = class {
  users = [];
  diaries = [
    { id: 1, content: "The city never sleeps, and neither do I. There's something beautiful about the quiet hours when the world feels like it belongs to us night owls.", isPublic: true, mood: "contemplative", authorId: null, createdAt: /* @__PURE__ */ new Date() }
  ];
  whispers = [
    { id: 1, content: "Sometimes the darkest nights produce the brightest stars", hearts: 42, createdAt: /* @__PURE__ */ new Date() }
  ];
  mindMazes = [
    { id: 1, type: "philosophy", content: "If you could speak to your past self, what would you say?", options: ["Follow your dreams", "Trust your instincts", "Don't be afraid to fail", "Love yourself first"], responses: 127, createdAt: /* @__PURE__ */ new Date() }
  ];
  nightCircles = [
    { id: 1, name: "Midnight Philosophers", description: "Deep conversations under the stars", maxMembers: 6, currentMembers: 3, isActive: true, createdAt: /* @__PURE__ */ new Date() }
  ];
  midnightCafes = [
    { id: 1, topic: "Late Night Musings", content: "What's everyone's go-to midnight snack and why?", category: "food", replies: 23, createdAt: /* @__PURE__ */ new Date() }
  ];
  amFounders = [
    {
      id: 1,
      content: "3AM thought: Maybe the best business ideas come when your logical brain is tired and your creative mind takes over. Just had a breakthrough on user onboarding.",
      category: "idea",
      upvotes: 15,
      comments: 8,
      createdAt: /* @__PURE__ */ new Date()
    }
  ];
  starlitSpeakers = [
    {
      id: 1,
      roomName: "Night Owl Entrepreneurs",
      description: "Voice chat for founders burning the midnight oil",
      topic: "Building in public during late hours",
      maxParticipants: 8,
      currentParticipants: 3,
      isActive: true,
      createdAt: /* @__PURE__ */ new Date()
    }
  ];
  moonMessages = [];
  nextId = 100;
  async getUser(id) {
    return this.users.find((u) => u.id === id);
  }
  async getUserByUsername(username) {
    return this.users.find((u) => u.username === username);
  }
  async createUser(user) {
    const newUser = {
      id: (this.nextId++).toString(),
      username: user.username || null,
      email: user.email || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      profileImageUrl: user.profileImageUrl || null,
      firebaseUid: user.firebaseUid || null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.users.push(newUser);
    return newUser;
  }
  async upsertUser(user) {
    const existingUser = this.users.find((u) => u.id === user.id);
    if (existingUser) {
      existingUser.username = user.username || null;
      existingUser.email = user.email || null;
      existingUser.firstName = user.firstName || null;
      existingUser.lastName = user.lastName || null;
      existingUser.profileImageUrl = user.profileImageUrl || null;
      existingUser.firebaseUid = user.firebaseUid || null;
      existingUser.updatedAt = /* @__PURE__ */ new Date();
      return existingUser;
    } else {
      const newUser = {
        id: user.id,
        username: user.username || null,
        email: user.email || null,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        profileImageUrl: user.profileImageUrl || null,
        firebaseUid: user.firebaseUid || null,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.users.push(newUser);
      return newUser;
    }
  }
  // Diary operations
  async createDiary(diary) {
    const newDiary = {
      id: this.nextId++,
      content: diary.content,
      isPublic: diary.isPublic || false,
      mood: diary.mood || null,
      authorId: diary.authorId || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.diaries.push(newDiary);
    return newDiary;
  }
  async getDiaries(filterPublic = false) {
    let result = [...this.diaries];
    if (filterPublic) {
      result = result.filter((diary) => diary.isPublic);
    }
    return result.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  async getDiary(id) {
    return this.diaries.find((d) => d.id === id);
  }
  // Whisper operations
  async createWhisper(whisper) {
    const newWhisper = {
      id: this.nextId++,
      content: whisper.content,
      hearts: 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.whispers.push(newWhisper);
    return newWhisper;
  }
  async getWhispers() {
    return [...this.whispers].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  async incrementWhisperHearts(id) {
    const whisper = this.whispers.find((w) => w.id === id);
    if (whisper && whisper.hearts !== null) {
      whisper.hearts++;
    }
  }
  // Mind Maze operations
  async createMindMaze(mindMaze2) {
    const newMindMaze = {
      id: this.nextId++,
      type: mindMaze2.type,
      content: mindMaze2.content,
      options: mindMaze2.options || null,
      responses: 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.mindMazes.push(newMindMaze);
    return newMindMaze;
  }
  async getMindMaze() {
    return [...this.mindMazes].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  async incrementMindMazeResponses(id) {
    const mindMaze2 = this.mindMazes.find((m) => m.id === id);
    if (mindMaze2 && mindMaze2.responses !== null) {
      mindMaze2.responses++;
    }
  }
  // Night Circle operations
  async createNightCircle(nightCircle) {
    const newNightCircle = {
      id: this.nextId++,
      name: nightCircle.name,
      description: nightCircle.description || null,
      maxMembers: nightCircle.maxMembers || 8,
      currentMembers: 0,
      isActive: true,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.nightCircles.push(newNightCircle);
    return newNightCircle;
  }
  async getNightCircles() {
    return [...this.nightCircles].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  async updateNightCircleMembers(id, members) {
    const nightCircle = this.nightCircles.find((n) => n.id === id);
    if (nightCircle) {
      nightCircle.currentMembers = members;
    }
  }
  // Midnight Cafe operations
  async createMidnightCafe(midnightCafe2) {
    const newMidnightCafe = {
      id: this.nextId++,
      topic: midnightCafe2.topic,
      content: midnightCafe2.content,
      category: midnightCafe2.category || null,
      replies: 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.midnightCafes.push(newMidnightCafe);
    return newMidnightCafe;
  }
  async getMidnightCafe() {
    return [...this.midnightCafes].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  async incrementCafeReplies(id) {
    const cafe = this.midnightCafes.find((c) => c.id === id);
    if (cafe && cafe.replies !== null) {
      cafe.replies++;
    }
  }
  // 3AM Founder operations
  async createAmFounder(amFounder2) {
    const newFounder = {
      id: this.nextId++,
      ...amFounder2,
      upvotes: 0,
      comments: 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.amFounders.unshift(newFounder);
    return newFounder;
  }
  async getAmFounder() {
    return [...this.amFounders];
  }
  async incrementFounderUpvotes(id) {
    const founder = this.amFounders.find((f) => f.id === id);
    if (founder && founder.upvotes !== null) {
      founder.upvotes++;
    }
  }
  async incrementFounderComments(id) {
    const founder = this.amFounders.find((f) => f.id === id);
    if (founder && founder.comments !== null) {
      founder.comments++;
    }
  }
  // Starlit Speaker operations
  async createStarlitSpeaker(starlitSpeaker2) {
    const newSpeaker = {
      id: this.nextId++,
      ...starlitSpeaker2,
      maxParticipants: starlitSpeaker2.maxParticipants || 8,
      currentParticipants: 1,
      isActive: true,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.starlitSpeakers.unshift(newSpeaker);
    return newSpeaker;
  }
  async getStarlitSpeaker() {
    return [...this.starlitSpeakers];
  }
  async updateSpeakerParticipants(id, participants) {
    const speaker = this.starlitSpeakers.find((s) => s.id === id);
    if (speaker) {
      speaker.currentParticipants = participants;
    }
  }
  async joinStarlitSpeaker(id) {
    const speaker = this.starlitSpeakers.find((s) => s.id === id);
    if (speaker && speaker.currentParticipants !== null && speaker.maxParticipants !== null && speaker.currentParticipants < speaker.maxParticipants) {
      speaker.currentParticipants += 1;
      return speaker;
    }
    return null;
  }
  async leaveStarlitSpeaker(id) {
    const speaker = this.starlitSpeakers.find((s) => s.id === id);
    if (speaker && speaker.currentParticipants !== null && speaker.currentParticipants > 0) {
      speaker.currentParticipants -= 1;
      return speaker;
    }
    return null;
  }
  async updateStarlitSpeakerStatus(id, isActive) {
    const speaker = this.starlitSpeakers.find((s) => s.id === id);
    if (speaker) {
      speaker.isActive = isActive;
    }
  }
  // Moon Messenger operations
  async createMoonMessage(moonMessage) {
    const newMessage = {
      id: this.nextId++,
      ...moonMessage,
      timestamp: /* @__PURE__ */ new Date(),
      isActive: true
    };
    this.moonMessages.push(newMessage);
    return newMessage;
  }
  async getMoonMessages(sessionId) {
    return this.moonMessages.filter((m) => m.sessionId === sessionId);
  }
  async getActiveSessions() {
    const activeSessions = new Set(
      this.moonMessages.filter((m) => m.isActive).map((m) => m.sessionId)
    );
    return Array.from(activeSessions);
  }
};
var DatabaseStorage = class {
  memStorage = new MemoryStorage();
  async getUser(id) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || void 0;
    } catch (error) {
      console.error("Error getting user:", error);
      return void 0;
    }
  }
  async getUserByUsername(username) {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || void 0;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return void 0;
    }
  }
  async createUser(insertUser) {
    const userData = {
      id: insertUser.id || crypto.randomUUID(),
      username: insertUser.username,
      email: insertUser.email,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      profileImageUrl: insertUser.profileImageUrl,
      firebaseUid: insertUser.firebaseUid
    };
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      firebaseUid: userData.firebaseUid,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).onConflictDoUpdate({
      target: users.id,
      set: {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        firebaseUid: userData.firebaseUid,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Diary operations
  async createDiary(diary) {
    const [newDiary] = await db.insert(diaries).values(diary).returning();
    return newDiary;
  }
  async getDiaries(filterPublic = false) {
    try {
      let result = await db.select().from(diaries).orderBy(desc(diaries.createdAt));
      if (filterPublic) {
        return result.filter((diary) => diary.isPublic);
      }
      return result;
    } catch (error) {
      console.error("Error getting diaries:", error);
      const mockDiaries = [
        {
          id: 1,
          content: "The city never sleeps, and neither do I. Tonight I watched the rain create patterns on my window, each drop a tiny universe of reflection. There's something magical about 3 AM thoughts - they feel more honest, more raw. I wonder if anyone else is awake right now, sharing this quiet moment with the night.",
          authorId: "user_001",
          isPublic: true,
          mood: null,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1e3)
          // 2 hours ago
        },
        {
          id: 2,
          content: "Had the strangest dream about floating through a library made of stars. Each book contained a different lifetime, a different possibility. When I woke up, I felt like I'd lived a thousand lives in those few hours of sleep. Dreams are the night's way of showing us infinite potential.",
          authorId: "user_002",
          isPublic: true,
          mood: null,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1e3)
          // 4 hours ago
        },
        {
          id: 3,
          content: "Tonight's moon is a silver coin tossed into the velvet sky. I made myself some chamomile tea and sat on my balcony, just breathing. Sometimes the best therapy is silence and starlight. The world feels different at night - softer, more forgiving, full of possibilities.",
          authorId: "user_003",
          isPublic: true,
          mood: null,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1e3)
          // 6 hours ago
        },
        {
          id: 4,
          content: "Been thinking about time lately. How it moves differently in the dark. Minutes stretch like hours when you're lost in thought, but hours disappear like seconds when you're creating something beautiful. Tonight I wrote three poems and painted a small canvas. The night is my muse.",
          authorId: "user_004",
          isPublic: true,
          mood: null,
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1e3)
          // 8 hours ago
        },
        {
          id: 5,
          content: "There's a cat that visits my fire escape every night around midnight. Tonight I left out some milk and we shared a moment of understanding. Animals know something we've forgotten - how to simply exist without the weight of tomorrow's worries. Lessons from a midnight cat.",
          authorId: "user_005",
          isPublic: true,
          mood: null,
          createdAt: new Date(Date.now() - 10 * 60 * 60 * 1e3)
          // 10 hours ago
        },
        {
          id: 6,
          content: "Insomnia has become my unwanted companion again. But instead of fighting it, I've learned to dance with it. Tonight I reorganized my bookshelf by color, discovered a letter from my grandmother I'd forgotten about, and realized that sleepless nights can be gifts in disguise.",
          authorId: "user_006",
          isPublic: true,
          mood: null,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1e3)
          // 12 hours ago
        }
      ];
      if (filterPublic) {
        return mockDiaries.filter((diary) => diary.isPublic);
      }
      return mockDiaries;
    }
  }
  async getDiary(id) {
    try {
      const [diary] = await db.select().from(diaries).where(eq(diaries.id, id));
      return diary || void 0;
    } catch (error) {
      console.error("Error getting diary:", error);
      return void 0;
    }
  }
  // Whisper operations
  async createWhisper(whisper) {
    const [newWhisper] = await db.insert(whispers).values(whisper).returning();
    return newWhisper;
  }
  async getWhispers() {
    try {
      return await db.select().from(whispers).orderBy(desc(whispers.createdAt));
    } catch (error) {
      console.error("Error getting whispers:", error);
      return [
        {
          id: 1,
          content: "Sometimes the darkest nights produce the brightest stars \u2728",
          hearts: 23,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1e3)
        },
        {
          id: 2,
          content: "3 AM thoughts hit different... anyone else awake?",
          hearts: 45,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1e3)
        },
        {
          id: 3,
          content: "The sound of rain at night is nature's lullaby \u{1F327}\uFE0F",
          hearts: 67,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1e3)
        }
      ];
    }
  }
  async incrementWhisperHearts(id) {
    try {
      const [whisper] = await db.select().from(whispers).where(eq(whispers.id, id));
      if (whisper) {
        await db.update(whispers).set({ hearts: (whisper.hearts || 0) + 1 }).where(eq(whispers.id, id));
      }
    } catch (error) {
      console.error("Error incrementing whisper hearts:", error);
    }
  }
  // Mind Maze operations
  async createMindMaze(maze) {
    const [newMaze] = await db.insert(mindMaze).values(maze).returning();
    return newMaze;
  }
  async getMindMaze() {
    try {
      return await db.select().from(mindMaze).orderBy(desc(mindMaze.createdAt));
    } catch (error) {
      console.error("Error getting mind maze:", error);
      return [
        {
          id: 1,
          type: "philosophy",
          content: "If you could have dinner with any historical figure, who would it be and what would you ask them?",
          options: null,
          responses: 12,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1e3)
        },
        {
          id: 2,
          type: "puzzle",
          content: "A man lives on the 20th floor. Every morning he takes the elevator down. When he comes home, he takes the elevator to the 10th floor and walks the rest... unless it's raining. Why?",
          options: null,
          responses: 8,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1e3)
        }
      ];
    }
  }
  async incrementMindMazeResponses(id) {
    try {
      const [maze] = await db.select().from(mindMaze).where(eq(mindMaze.id, id));
      if (maze) {
        await db.update(mindMaze).set({ responses: (maze.responses || 0) + 1 }).where(eq(mindMaze.id, id));
      }
    } catch (error) {
      console.error("Error incrementing mind maze responses:", error);
    }
  }
  // Night Circle operations
  async createNightCircle(circle) {
    const [newCircle] = await db.insert(nightCircles).values(circle).returning();
    return newCircle;
  }
  async getNightCircles() {
    try {
      return await db.select().from(nightCircles).orderBy(desc(nightCircles.createdAt));
    } catch (error) {
      console.error("Error getting night circles:", error);
      return [
        {
          id: 1,
          name: "Midnight Philosophers",
          description: null,
          maxMembers: 50,
          currentMembers: 45,
          isActive: true,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1e3)
        },
        {
          id: 2,
          name: "Night Owls Unite",
          description: null,
          maxMembers: 100,
          currentMembers: 78,
          isActive: true,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1e3)
        },
        {
          id: 3,
          name: "Dream Sharers",
          description: null,
          maxMembers: 50,
          currentMembers: 32,
          isActive: false,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1e3)
        }
      ];
    }
  }
  async updateNightCircleMembers(id, members) {
    try {
      await db.update(nightCircles).set({ currentMembers: members }).where(eq(nightCircles.id, id));
    } catch (error) {
      console.error("Error updating night circle members:", error);
    }
  }
  // Midnight Cafe operations
  async createMidnightCafe(cafe) {
    const [newCafe] = await db.insert(midnightCafe).values(cafe).returning();
    return newCafe;
  }
  async getMidnightCafe() {
    try {
      return await db.select().from(midnightCafe).orderBy(desc(midnightCafe.createdAt));
    } catch (error) {
      console.error("Error getting midnight cafe:", error);
      return [
        {
          id: 1,
          content: "What's everyone's go-to late night snack? I'm currently obsessed with honey toast and chamomile tea \u{1F36F}",
          topic: "Late Night Foods",
          category: null,
          replies: 15,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1e3)
        },
        {
          id: 2,
          content: "Anyone else find that their best ideas come at 2 AM? Just had a breakthrough on a project I've been stuck on for weeks!",
          topic: "Creativity",
          category: null,
          replies: 8,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1e3)
        },
        {
          id: 3,
          content: "Watching the sunrise after staying up all night hits different. There's something magical about witnessing the world wake up \u{1F305}",
          topic: "Sunrise",
          category: null,
          replies: 22,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1e3)
        }
      ];
    }
  }
  async incrementCafeReplies(id) {
    try {
      const [cafe] = await db.select().from(midnightCafe).where(eq(midnightCafe.id, id));
      if (cafe) {
        await db.update(midnightCafe).set({ replies: (cafe.replies || 0) + 1 }).where(eq(midnightCafe.id, id));
      }
    } catch (error) {
      console.error("Error incrementing cafe replies:", error);
    }
  }
  // 3AM Founder operations
  async createAmFounder(founder) {
    try {
      const [newFounder] = await db.insert(amFounder).values(founder).returning();
      return newFounder;
    } catch (error) {
      console.error("Error creating amFounder:", error);
      return this.memStorage.createAmFounder(founder);
    }
  }
  async getAmFounder() {
    try {
      return await db.select().from(amFounder).orderBy(desc(amFounder.createdAt));
    } catch (error) {
      console.error("Error getting amFounder:", error);
      return this.memStorage.getAmFounder();
    }
  }
  async incrementFounderUpvotes(id) {
    try {
      await db.update(amFounder).set({ upvotes: sql`${amFounder.upvotes} + 1` }).where(eq(amFounder.id, id));
    } catch (error) {
      console.error("Error incrementing founder upvotes:", error);
      return this.memStorage.incrementFounderUpvotes(id);
    }
  }
  async incrementFounderComments(id) {
    try {
      await db.update(amFounder).set({ comments: sql`${amFounder.comments} + 1` }).where(eq(amFounder.id, id));
    } catch (error) {
      console.error("Error incrementing founder comments:", error);
      return this.memStorage.incrementFounderComments(id);
    }
  }
  // Starlit Speaker operations
  async createStarlitSpeaker(speaker) {
    try {
      const [newSpeaker] = await db.insert(starlitSpeaker).values(speaker).returning();
      return newSpeaker;
    } catch (error) {
      console.error("Error creating starlitSpeaker:", error);
      return this.memStorage.createStarlitSpeaker(speaker);
    }
  }
  async getStarlitSpeaker() {
    try {
      return await db.select().from(starlitSpeaker).orderBy(desc(starlitSpeaker.createdAt));
    } catch (error) {
      console.error("Error getting starlitSpeaker:", error);
      return this.memStorage.getStarlitSpeaker();
    }
  }
  async updateSpeakerParticipants(id, participants) {
    try {
      await db.update(starlitSpeaker).set({ currentParticipants: participants }).where(eq(starlitSpeaker.id, id));
    } catch (error) {
      console.error("Error updating speaker participants:", error);
      return this.memStorage.updateSpeakerParticipants(id, participants);
    }
  }
  // Moon Messenger operations
  async createMoonMessage(message) {
    try {
      const [newMessage] = await db.insert(moonMessenger).values(message).returning();
      return newMessage;
    } catch (error) {
      console.error("Error creating moon message:", error);
      return this.memStorage.createMoonMessage(message);
    }
  }
  async getMoonMessages(sessionId) {
    try {
      return await db.select().from(moonMessenger).where(eq(moonMessenger.sessionId, sessionId)).orderBy(moonMessenger.timestamp);
    } catch (error) {
      console.error("Error getting moon messages:", error);
      return this.memStorage.getMoonMessages(sessionId);
    }
  }
  async getActiveSessions() {
    try {
      const sessions2 = await db.selectDistinct({ sessionId: moonMessenger.sessionId }).from(moonMessenger).where(eq(moonMessenger.isActive, true));
      return sessions2.map((s) => s.sessionId);
    } catch (error) {
      console.error("Error getting active sessions:", error);
      return this.memStorage.getActiveSessions();
    }
  }
};
var useDatabase = Boolean(process.env.DATABASE_URL);
var storage = useDatabase ? new DatabaseStorage() : new MemoryStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
var AUTH_ENABLED = Boolean(
  process.env.REPLIT_DOMAINS && process.env.SESSION_SECRET && process.env.DATABASE_URL && process.env.REPL_ID
);
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  if (!AUTH_ENABLED) {
    return;
  }
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}

// server/routes.ts
var router = express.Router();
router.get("/diaries", async (req, res) => {
  try {
    const diaries2 = await storage.getDiaries(true);
    res.json(diaries2);
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
router.get("/whispers", async (req, res) => {
  try {
    const whispers2 = await storage.getWhispers();
    res.json(whispers2);
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
router.get("/mindMaze", async (req, res) => {
  try {
    const mindMaze2 = await storage.getMindMaze();
    res.json(mindMaze2);
  } catch (error) {
    console.error("Error getting mind maze:", error);
    res.status(500).json({ error: "Failed to fetch mind maze" });
  }
});
router.post("/mindMaze", async (req, res) => {
  try {
    const mindMazeData = insertMindMazeSchema.parse(req.body);
    const mindMaze2 = await storage.createMindMaze(mindMazeData);
    res.status(201).json(mindMaze2);
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
router.get("/nightCircles", async (req, res) => {
  try {
    const nightCircles2 = await storage.getNightCircles();
    res.json(nightCircles2);
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
router.get("/midnightCafe", async (req, res) => {
  try {
    const midnightCafe2 = await storage.getMidnightCafe();
    res.json(midnightCafe2);
  } catch (error) {
    console.error("Error getting midnight cafe:", error);
    res.status(500).json({ error: "Failed to fetch midnight cafe" });
  }
});
router.post("/midnightCafe", async (req, res) => {
  try {
    const midnightCafeData = insertMidnightCafeSchema.parse(req.body);
    const midnightCafe2 = await storage.createMidnightCafe(midnightCafeData);
    res.status(201).json(midnightCafe2);
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
    const sessions2 = await storage.getActiveSessions();
    res.json(sessions2);
  } catch (error) {
    console.error("Error getting active sessions:", error);
    res.status(500).json({ error: "Failed to fetch active sessions" });
  }
});
async function registerRoutes(app2) {
  try {
    await setupAuth(app2);
    console.log("Replit authentication configured successfully");
  } catch (error) {
    console.log("Replit auth not available, continuing without authentication");
  }
  app2.get("/api/auth/user", async (req, res) => {
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
  app2.use("/api", router);
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws"
  });
  const rooms = /* @__PURE__ */ new Map();
  const userRooms = /* @__PURE__ */ new Map();
  const waitingQueue = [];
  wss.on("connection", (ws) => {
    console.log("New WebSocket connection");
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        switch (message.type) {
          case "join_room":
            joinRoom(ws, message.roomId, message.username);
            break;
          case "leave_room":
            leaveRoom(ws);
            break;
          case "chat_message":
            broadcastToRoom(ws, message);
            break;
          case "video_offer":
          case "video_answer":
          case "ice_candidate":
            forwardVideoSignaling(ws, message);
            break;
          case "join_random":
            joinRandomPairing(ws, message.username);
            break;
          case "user_report":
            handleUserReport(ws, message);
            break;
          case "end_session":
            endSession(ws, message.sessionId);
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws.on("close", () => {
      leaveRoom(ws);
      const queueIndex = waitingQueue.indexOf(ws);
      if (queueIndex > -1) {
        waitingQueue.splice(queueIndex, 1);
      }
    });
  });
  function joinRoom(ws, roomId, username) {
    leaveRoom(ws);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, /* @__PURE__ */ new Set());
    }
    rooms.get(roomId).add(ws);
    userRooms.set(ws, roomId);
    broadcastToRoom(ws, {
      type: "user_joined",
      username,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    ws.send(JSON.stringify({
      type: "room_joined",
      roomId,
      memberCount: rooms.get(roomId).size
    }));
  }
  function leaveRoom(ws) {
    const roomId = userRooms.get(ws);
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.delete(ws);
      userRooms.delete(ws);
      if (room.size === 0) {
        rooms.delete(roomId);
      } else {
        room.forEach((client2) => {
          client2.send(JSON.stringify({
            type: "user_left",
            memberCount: room.size,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }));
        });
      }
    }
  }
  function broadcastToRoom(sender, message) {
    const roomId = userRooms.get(sender);
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.forEach((client2) => {
        if (client2 !== sender && client2.readyState === WebSocket.OPEN) {
          client2.send(JSON.stringify(message));
        }
      });
    }
  }
  function forwardVideoSignaling(sender, message) {
    const roomId = userRooms.get(sender);
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.forEach((client2) => {
        if (client2 !== sender && client2.readyState === WebSocket.OPEN) {
          client2.send(JSON.stringify(message));
        }
      });
    }
  }
  function joinRandomPairing(ws, username) {
    if (waitingQueue.length > 0) {
      const partner = waitingQueue.shift();
      const roomId = `random_${Date.now()}`;
      joinRoom(ws, roomId, username);
      joinRoom(partner, roomId, "Random User");
      [ws, partner].forEach((client2) => {
        client2.send(JSON.stringify({
          type: "random_paired",
          roomId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }));
      });
    } else {
      waitingQueue.push(ws);
      ws.send(JSON.stringify({
        type: "waiting_for_pair",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }));
    }
  }
  function handleUserReport(ws, message) {
    console.log("User report received:", message);
    const roomId = userRooms.get(ws);
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        room.forEach((client2) => {
          client2.send(JSON.stringify({
            type: "session_ended",
            reason: "reported",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }));
        });
      }
    }
  }
  function endSession(ws, sessionId) {
    const roomId = userRooms.get(ws);
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.forEach((client2) => {
        client2.send(JSON.stringify({
          type: "session_ended",
          reason: "user_ended",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }));
      });
      rooms.delete(roomId);
      room.forEach((client2) => {
        userRooms.delete(client2);
      });
    }
  }
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/websocket.ts
import { WebSocketServer as WebSocketServer2, WebSocket as WebSocket2 } from "ws";
var WebSocketManager = class {
  wss;
  rooms = /* @__PURE__ */ new Map();
  connections = /* @__PURE__ */ new Map();
  waitingForRandom = [];
  constructor(server) {
    this.wss = new WebSocketServer2({ server, path: "/ws" });
    this.setupWebSocket();
  }
  setupWebSocket() {
    this.wss.on("connection", (ws) => {
      console.log("WebSocket connection established");
      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      });
      ws.on("close", () => {
        this.handleDisconnection(ws);
      });
      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        this.handleDisconnection(ws);
      });
    });
  }
  handleMessage(ws, message) {
    switch (message.type) {
      case "join_random":
        this.handleJoinRandom(ws, message.username);
        break;
      case "chat_message":
        this.handleChatMessage(ws, message);
        break;
      case "leave_room":
        this.handleLeaveRoom(ws);
        break;
      case "join_room":
        this.handleJoinRoom(ws, message.roomId, message.username);
        break;
    }
  }
  handleJoinRandom(ws, username) {
    this.connections.set(ws, {
      ws,
      username,
      isSearching: true
    });
    if (this.waitingForRandom.length > 0) {
      const otherWs = this.waitingForRandom.shift();
      const otherConnection = this.connections.get(otherWs);
      if (otherConnection && otherWs.readyState === WebSocket2.OPEN) {
        const roomId = `random_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const room = {
          id: roomId,
          participants: /* @__PURE__ */ new Set([ws, otherWs]),
          type: "random"
        };
        this.rooms.set(roomId, room);
        this.connections.get(ws).roomId = roomId;
        this.connections.get(ws).isSearching = false;
        this.connections.get(otherWs).roomId = roomId;
        this.connections.get(otherWs).isSearching = false;
        this.sendToSocket(ws, {
          type: "random_paired",
          roomId,
          partnerUsername: otherConnection.username
        });
        this.sendToSocket(otherWs, {
          type: "random_paired",
          roomId,
          partnerUsername: username
        });
      } else {
        this.waitingForRandom.push(ws);
        this.sendToSocket(ws, { type: "random_waiting" });
      }
    } else {
      this.waitingForRandom.push(ws);
      this.sendToSocket(ws, { type: "random_waiting" });
    }
  }
  handleChatMessage(ws, message) {
    const connection = this.connections.get(ws);
    if (!connection || !connection.roomId) return;
    const room = this.rooms.get(connection.roomId);
    if (!room) return;
    room.participants.forEach((participant) => {
      if (participant !== ws && participant.readyState === WebSocket2.OPEN) {
        this.sendToSocket(participant, {
          type: "message_received",
          message: message.message
        });
      }
    });
  }
  handleJoinRoom(ws, roomId, username) {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = {
        id: roomId,
        participants: /* @__PURE__ */ new Set([ws]),
        type: "voice"
      };
      this.rooms.set(roomId, room);
    } else {
      room.participants.add(ws);
    }
    this.connections.set(ws, {
      ws,
      username,
      roomId
    });
    this.broadcastToRoom(roomId, {
      type: "user_joined",
      username,
      memberCount: room.participants.size
    }, ws);
    this.sendToSocket(ws, {
      type: "room_joined",
      roomId,
      memberCount: room.participants.size
    });
  }
  handleLeaveRoom(ws) {
    const connection = this.connections.get(ws);
    if (!connection || !connection.roomId) return;
    const room = this.rooms.get(connection.roomId);
    if (!room) return;
    room.participants.delete(ws);
    if (room.participants.size > 0) {
      this.broadcastToRoom(connection.roomId, {
        type: "user_left",
        memberCount: room.participants.size
      });
    } else {
      this.rooms.delete(connection.roomId);
    }
    if (room.type === "random" && room.participants.size === 1) {
      const remainingParticipant = Array.from(room.participants)[0];
      this.sendToSocket(remainingParticipant, {
        type: "partner_disconnected"
      });
      room.participants.clear();
      this.rooms.delete(connection.roomId);
    }
    this.connections.delete(ws);
  }
  handleDisconnection(ws) {
    const waitingIndex = this.waitingForRandom.indexOf(ws);
    if (waitingIndex > -1) {
      this.waitingForRandom.splice(waitingIndex, 1);
    }
    this.handleLeaveRoom(ws);
  }
  sendToSocket(ws, message) {
    if (ws.readyState === WebSocket2.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
  broadcastToRoom(roomId, message, excludeWs) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.participants.forEach((ws) => {
      if (ws !== excludeWs && ws.readyState === WebSocket2.OPEN) {
        this.sendToSocket(ws, message);
      }
    });
  }
};

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const httpServer = createServer2(app);
  const server = await registerRoutes(app);
  new WebSocketManager(httpServer);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = Number(process.env.PORT) || 5e3;
  httpServer.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
