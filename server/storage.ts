
import {
  users,
  diaries,
  whispers,
  mindMaze,
  nightCircles,
  midnightCafe,
  cafeReplies,
  amFounder,
  starlitSpeaker,
  moonMessenger,
  nightlyPrompts,
  userReflections,
  personalReflections,
  type User,
  type UpsertUser,
  type InsertUser,
  type Diary,
  type InsertDiary,
  type Whisper,
  type InsertWhisper,
  type MindMaze,
  type InsertMindMaze,
  type NightCircle,
  type InsertNightCircle,
  type MidnightCafe,
  type InsertMidnightCafe,
  type AmFounder,
  type InsertAmFounder,
  type StarlitSpeaker,
  type InsertStarlitSpeaker,
  type MoonMessenger,
  type InsertMoonMessenger,
  type NightlyPrompt,
  type InsertNightlyPrompt,
  type UserReflection,
  type InsertUserReflection,
  type PersonalReflection,
  type InsertPersonalReflection,
  type SavedStation,
  type InsertSavedStation,
  type CafeReply,
  type InsertCafeReply,
  savedStations,
  amFounderReplies,
  type AmFounderReply,
  type InsertAmFounderReply,

} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, or, and, ne } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { logger } from "./utils/logger";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserOnboarding(userId: number, completed: boolean): Promise<void>;

  // Diary operations
  createDiary(diary: InsertDiary): Promise<Diary>;
  getDiaries(viewerId?: number, limit?: number): Promise<Diary[]>;
  getDiary(id: number): Promise<Diary | undefined>;
  deleteDiary(id: number): Promise<boolean>;

  // Whisper operations
  createWhisper(whisper: InsertWhisper): Promise<Whisper>;
  getWhispers(limit?: number): Promise<Whisper[]>;
  incrementWhisperHearts(id: number): Promise<void>;

  // Mind Maze operations
  createMindMaze(mindMaze: InsertMindMaze): Promise<MindMaze>;
  getMindMaze(limit?: number): Promise<MindMaze[]>;
  incrementMindMazeResponses(id: number): Promise<void>;

  // Night Circle operations
  createNightCircle(nightCircle: InsertNightCircle): Promise<NightCircle>;
  getNightCircles(limit?: number): Promise<NightCircle[]>;
  updateNightCircleMembers(id: number, members: number): Promise<void>;

  // Midnight Cafe operations
  createMidnightCafe(midnightCafe: InsertMidnightCafe): Promise<MidnightCafe>;
  getMidnightCafe(limit?: number): Promise<MidnightCafe[]>;
  incrementCafeReplies(id: number): Promise<void>;
  createCafeReply(reply: InsertCafeReply): Promise<CafeReply>;
  getCafeReplies(cafeId: number): Promise<CafeReply[]>;
  deleteCafePost(id: number): Promise<void>;
  deleteCafeReply(id: number): Promise<void>;

  // 3AM Founder operations
  createAmFounder(amFounder: InsertAmFounder): Promise<AmFounder>;
  getAmFounder(): Promise<AmFounder[]>;
  incrementFounderUpvotes(id: number): Promise<void>;
  incrementFounderComments(id: number): Promise<void>;
  createAmFounderReply(reply: InsertAmFounderReply): Promise<AmFounderReply>;
  getAmFounderReplies(founderId: number): Promise<AmFounderReply[]>;


  // Starlit Speaker operations
  createStarlitSpeaker(starlitSpeaker: InsertStarlitSpeaker): Promise<StarlitSpeaker>;
  getStarlitSpeaker(): Promise<StarlitSpeaker[]>;
  updateSpeakerParticipants(id: number, participants: number): Promise<void>;

  // Moon Messenger operations
  createMoonMessage(moonMessage: InsertMoonMessenger): Promise<MoonMessenger>;
  getMoonMessages(sessionId: string): Promise<MoonMessenger[]>;
  getMoonMessages(sessionId: string): Promise<MoonMessenger[]>;
  getActiveSessions(): Promise<string[]>;

  // Saved Stations
  toggleSavedStation(userId: number, stationId: string): Promise<boolean>; // Returns true if saved, false if removed
  getSavedStations(userId: number): Promise<string[]>;

  // User specific getters
  getUserWhispers(userId: number): Promise<Whisper[]>;
  getUserCafePosts(userId: number): Promise<MidnightCafe[]>;
  getUserDiaries(userId: number): Promise<Diary[]>;
  getUserFounders(userId: number): Promise<AmFounder[]>;

  // Nightly Reflection operations
  createNightlyPrompt(prompt: InsertNightlyPrompt): Promise<NightlyPrompt>;
  getActivePrompt(type?: 'diary' | 'inspection'): Promise<NightlyPrompt | undefined>; // Get non-expired prompt
  getNightlyPrompt(id: number): Promise<NightlyPrompt | undefined>;
  createUserReflection(reflection: InsertUserReflection, aiEvaluation: any): Promise<UserReflection>;
  getUserReflections(userId: number, limit?: number): Promise<UserReflection[]>;
  createPersonalReflection(reflection: InsertPersonalReflection, aiReflection: string): Promise<PersonalReflection>;
  getPersonalReflections(userId: number, limit?: number): Promise<PersonalReflection[]>;
}

// In-memory storage implementation
export class MemoryStorage implements IStorage {
  sessionStore: session.Store;
  users: User[];
  diaries: Diary[];
  whispers: Whisper[];
  mindMazes: MindMaze[];
  nightCircles: NightCircle[];
  midnightCafes: MidnightCafe[];
  amFounders: AmFounder[];
  amFounderReplies: AmFounderReply[];
  starlitSpeakers: StarlitSpeaker[];
  moonMessages: MoonMessenger[];
  savedStations: SavedStation[];
  private nextId = 1;

  constructor() {
    this.sessionStore = new session.MemoryStore();
    this.users = [];
    this.diaries = [];
    this.whispers = [];
    this.mindMazes = [];
    this.nightCircles = [];
    this.midnightCafes = [];
    this.amFounders = [];
    this.amFounderReplies = [];
    this.starlitSpeakers = [];
    this.moonMessages = [];
    this.savedStations = [];
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return this.users.find(u => u.googleId === googleId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextId++;
    const user: User = {
      ...insertUser,
      id,
      password: insertUser.password || null,
      googleId: insertUser.googleId || null,
      displayName: insertUser.displayName || null,
      email: insertUser.email || null,
      profileImageUrl: insertUser.profileImageUrl || null,
      hasSeenOnboarding: insertUser.hasSeenOnboarding ?? null,
      currentStreak: 0,
      lastEntryDate: null,
      nightStreak: insertUser.nightStreak ?? 0,
      meaningfulReplies: 0,
      reportCount: 0,
      trustScore: 100,
      lastActiveTime: null,
      createdAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    throw new Error("Upsert not implemented for MemoryStorage");
  }

  async updateUserOnboarding(userId: number, completed: boolean): Promise<void> {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.hasSeenOnboarding = completed;
    }
  }

  // Diary operations
  async createDiary(diary: InsertDiary): Promise<Diary> {
    const newDiary: Diary = {
      id: this.nextId++,
      content: diary.content,
      isPublic: diary.isPublic || false,
      mood: diary.mood || null,
      authorId: diary.authorId || null,
      detectedEmotion: diary.detectedEmotion || null,
      sentimentScore: diary.sentimentScore || null,
      reflectionDepth: diary.reflectionDepth || null,
      createdAt: new Date()
    };
    this.diaries.push(newDiary);

    // Update streak (Memory)
    if (diary.authorId) {
      const user = this.users.find(u => u.id === diary.authorId);
      if (user) {
        const now = new Date();
        const lastEntry = user.lastEntryDate ? new Date(user.lastEntryDate) : null;

        if (!lastEntry) {
          user.currentStreak = 1;
        } else {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const last = new Date(lastEntry.getFullYear(), lastEntry.getMonth(), lastEntry.getDate());
          const diffTime = Math.abs(today.getTime() - last.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            user.currentStreak = (user.currentStreak || 0) + 1;
          } else if (diffDays > 1) {
            user.currentStreak = 1;
          }
        }
        user.lastEntryDate = now;
      }
    }

    return newDiary;
  }

  async getDiaries(viewerId?: number, limit?: number): Promise<Diary[]> {
    const diaries = Array.from(this.diaries.values())
      .filter((diary) => diary.isPublic || (viewerId && diary.authorId === viewerId))
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));

    return limit ? diaries.slice(0, limit) : diaries;
  }

  async getDiary(id: number): Promise<Diary | undefined> {
    return this.diaries.find(d => d.id === id);
  }

  async deleteDiary(id: number): Promise<boolean> {
    const index = this.diaries.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.diaries.splice(index, 1);
    return true;
  }

  // Whisper operations
  async createWhisper(whisper: InsertWhisper): Promise<Whisper> {
    const newWhisper: Whisper = {
      id: this.nextId++,
      content: whisper.content,
      hearts: 0,
      authorId: whisper.authorId || null,
      detectedEmotion: whisper.detectedEmotion || null,
      sentimentScore: whisper.sentimentScore || null,
      reflectionDepth: whisper.reflectionDepth || null,
      createdAt: new Date()
    };
    this.whispers.push(newWhisper);
    return newWhisper;
  }

  async getWhispers(limit?: number): Promise<Whisper[]> {
    const whispers = [...this.whispers].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    return limit ? whispers.slice(0, limit) : whispers;
  }

  async incrementWhisperHearts(id: number): Promise<void> {
    const whisper = this.whispers.find(w => w.id === id);
    if (whisper && whisper.hearts !== null) {
      whisper.hearts++;
    }
  }

  // Mind Maze operations
  async createMindMaze(mindMaze: InsertMindMaze): Promise<MindMaze> {
    const newMindMaze: MindMaze = {
      id: this.nextId++,
      type: mindMaze.type,
      content: mindMaze.content,
      options: mindMaze.options || null,
      responses: 0,
      createdAt: new Date()
    };
    this.mindMazes.push(newMindMaze);
    return newMindMaze;
  }

  async getMindMaze(limit?: number): Promise<MindMaze[]> {
    const mindMazes = [...this.mindMazes].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    return limit ? mindMazes.slice(0, limit) : mindMazes;
  }

  async incrementMindMazeResponses(id: number): Promise<void> {
    const mindMaze = this.mindMazes.find(m => m.id === id);
    if (mindMaze && mindMaze.responses !== null) {
      mindMaze.responses++;
    }
  }

  // Night Circle operations
  async createNightCircle(nightCircle: InsertNightCircle): Promise<NightCircle> {
    const newNightCircle: NightCircle = {
      id: this.nextId++,
      name: nightCircle.name,
      description: nightCircle.description || null,
      maxMembers: nightCircle.maxMembers || 8,
      currentMembers: 0,
      isActive: true,
      createdAt: new Date()
    };
    this.nightCircles.push(newNightCircle);
    return newNightCircle;
  }

  async getNightCircles(limit?: number): Promise<NightCircle[]> {
    const circles = [...this.nightCircles].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    return limit ? circles.slice(0, limit) : circles;
  }

  async updateNightCircleMembers(id: number, members: number): Promise<void> {
    const nightCircle = this.nightCircles.find(n => n.id === id);
    if (nightCircle) {
      nightCircle.currentMembers = members;
    }
  }

  // Midnight Cafe operations
  async createMidnightCafe(midnightCafe: InsertMidnightCafe): Promise<MidnightCafe> {
    const newMidnightCafe: MidnightCafe = {
      id: this.nextId++,
      topic: midnightCafe.topic,
      content: midnightCafe.content,
      category: midnightCafe.category || null,
      replies: 0,
      authorId: midnightCafe.authorId || null,
      createdAt: new Date()
    };
    this.midnightCafes.push(newMidnightCafe);
    return newMidnightCafe;
  }

  async getMidnightCafe(limit?: number): Promise<MidnightCafe[]> {
    const cafes = [...this.midnightCafes].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    return limit ? cafes.slice(0, limit) : cafes;
  }

  async incrementCafeReplies(id: number): Promise<void> {
    const cafe = this.midnightCafes.find(c => c.id === id);
    if (cafe && cafe.replies !== null) {
      cafe.replies++;
    }
  }

  async createCafeReply(reply: InsertCafeReply): Promise<CafeReply> {
    const id = this.nextId++;
    const newReply: CafeReply = {
      ...reply,
      id,
      authorId: reply.authorId || null,
      createdAt: new Date()
    };
    return newReply;
  }

  async getCafeReplies(cafeId: number): Promise<CafeReply[]> {
    return []; // Mock
  }

  async deleteCafePost(id: number): Promise<void> {
    const index = this.midnightCafes.findIndex(c => c.id === id);
    if (index !== -1) {
      this.midnightCafes.splice(index, 1);
    }
  }

  async deleteCafeReply(id: number): Promise<void> {
    // No-op
  }

  // 3AM Founder operations
  async createAmFounder(amFounder: InsertAmFounder): Promise<AmFounder> {
    const newFounder: AmFounder = {
      id: this.nextId++,
      ...amFounder,
      upvotes: 0,
      comments: 0,
      authorId: amFounder.authorId || null,
      createdAt: new Date()
    };
    this.amFounders.unshift(newFounder);
    return newFounder;
  }

  async getAmFounder(): Promise<AmFounder[]> {
    return [...this.amFounders];
  }

  async incrementFounderUpvotes(id: number): Promise<void> {
    const founder = this.amFounders.find(f => f.id === id);
    if (founder && founder.upvotes !== null) {
      founder.upvotes++;
    }
  }

  async incrementFounderComments(id: number): Promise<void> {
    const founder = this.amFounders.find(f => f.id === id);
    if (founder && founder.comments !== null) {
      founder.comments++;
    }
  }

  // Starlit Speaker operations
  async createStarlitSpeaker(starlitSpeaker: InsertStarlitSpeaker): Promise<StarlitSpeaker> {
    const newSpeaker: StarlitSpeaker = {
      id: this.nextId++,
      ...starlitSpeaker,
      maxParticipants: starlitSpeaker.maxParticipants || 8,
      currentParticipants: 1,
      isActive: true,
      createdAt: new Date()
    };
    this.starlitSpeakers.unshift(newSpeaker);
    return newSpeaker;
  }

  async getStarlitSpeaker(): Promise<StarlitSpeaker[]> {
    return [...this.starlitSpeakers];
  }

  async updateSpeakerParticipants(id: number, participants: number): Promise<void> {
    const speaker = this.starlitSpeakers.find(s => s.id === id);
    if (speaker) {
      speaker.currentParticipants = participants;
    }
  }

  async joinStarlitSpeaker(id: number): Promise<StarlitSpeaker | null> {
    const speaker = this.starlitSpeakers.find(s => s.id === id);
    if (speaker && speaker.currentParticipants !== null && speaker.maxParticipants !== null && speaker.currentParticipants < speaker.maxParticipants) {
      speaker.currentParticipants += 1;
      return speaker;
    }
    return null;
  }

  async leaveStarlitSpeaker(id: number): Promise<StarlitSpeaker | null> {
    const speaker = this.starlitSpeakers.find(s => s.id === id);
    if (speaker && speaker.currentParticipants !== null && speaker.currentParticipants > 0) {
      speaker.currentParticipants -= 1;
      return speaker;
    }
    return null;
  }

  async updateStarlitSpeakerStatus(id: number, isActive: boolean): Promise<void> {
    const speaker = this.starlitSpeakers.find(s => s.id === id);
    if (speaker) {
      speaker.isActive = isActive;
    }
  }

  async createAmFounderReply(reply: InsertAmFounderReply): Promise<AmFounderReply> {
    const newReply: AmFounderReply = {
      id: this.nextId++,
      ...reply,
      authorId: reply.authorId ?? null,
      createdAt: new Date()
    };
    this.amFounderReplies.push(newReply);
    return newReply;
  }

  async getAmFounderReplies(founderId: number): Promise<AmFounderReply[]> {
    return this.amFounderReplies
      .filter(r => r.founderId === founderId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  // Moon Messenger operations
  async createMoonMessage(moonMessage: InsertMoonMessenger): Promise<MoonMessenger> {
    const newMessage: MoonMessenger = {
      id: this.nextId++,
      ...moonMessage,
      timestamp: new Date(),
      isActive: true
    };
    this.moonMessages.push(newMessage);
    return newMessage;
  }

  async getMoonMessages(sessionId: string): Promise<MoonMessenger[]> {
    return this.moonMessages.filter(m => m.sessionId === sessionId);
  }

  async getActiveSessions(): Promise<string[]> {
    const activeSessions = new Set(
      this.moonMessages
        .filter(m => m.isActive)
        .map(m => m.sessionId)
    );
    return Array.from(activeSessions);
  }

  // Saved Stations
  async toggleSavedStation(userId: number, stationId: string): Promise<boolean> {
    const existingIndex = this.savedStations.findIndex(s => s.userId === userId && s.stationId === stationId);
    if (existingIndex >= 0) {
      this.savedStations.splice(existingIndex, 1);
      return false;
    } else {
      this.savedStations.push({
        id: this.nextId++,
        userId,
        stationId,
        createdAt: new Date()
      });
      return true;
    }
  }

  async getSavedStations(userId: number): Promise<string[]> {
    return this.savedStations
      .filter(s => s.userId === userId)
      .map(s => s.stationId);
  }

  async getUserWhispers(userId: number): Promise<Whisper[]> {
    return this.whispers.filter(w => w.authorId === userId);
  }

  async getUserCafePosts(userId: number): Promise<MidnightCafe[]> {
    return this.midnightCafes.filter(c => c.authorId === userId);
  }

  async getUserDiaries(userId: number): Promise<Diary[]> {
    return this.diaries.filter(diary => diary.authorId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getUserFounders(userId: number): Promise<AmFounder[]> {
    return this.amFounders.filter(f => f.authorId === userId);
  }



  // Nightly Reflection operations
  async createNightlyPrompt(prompt: InsertNightlyPrompt): Promise<NightlyPrompt> {
    const newPrompt: NightlyPrompt = {
      id: this.nextId++,
      ...prompt,
      createdAt: new Date()
    };
    // Note: MemoryStorage doesn't persist between restarts, for testing only
    return newPrompt;
  }

  async getActivePrompt(type?: 'diary' | 'inspection'): Promise<NightlyPrompt | undefined> {
    const now = new Date();
    // In memory storage doesn't actually store prompts, so return undefined
    // This will trigger generation of new prompts
    return undefined;
  }

  async getNightlyPrompt(id: number): Promise<NightlyPrompt | undefined> {
    // For memory storage, return a fixed prompt for testing
    const prompts = [
      "Something you felt today but didn't say.",
      "A moment that stayed with you today.",
      "What are you avoiding right now?",
      "What felt heavy today?"
    ];
    // Deterministic rotation based on day
    const dayIndex = new Date().getDate() % prompts.length;

    return {
      id: 1,
      content: prompts[dayIndex],
      shiftMode: "silence_variable",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  }

  async createUserReflection(reflection: InsertUserReflection, aiEvaluation: any): Promise<UserReflection> {
    const newReflection: UserReflection = {
      id: this.nextId++,
      ...reflection,
      aiEvaluation,
      createdAt: new Date()
    };
    return newReflection;
  }

  async getUserReflections(userId: number, limit = 20): Promise<UserReflection[]> {
    // In memory storage doesn't persist reflections
    return [];
  }

  async createPersonalReflection(reflection: InsertPersonalReflection, aiReflection: string): Promise<PersonalReflection> {
    const newReflection: PersonalReflection = {
      id: this.nextId++,
      ...reflection,
      aiReflection,
      createdAt: new Date()
    };
    return newReflection;
  }

  async getPersonalReflections(userId: number, limit = 20): Promise<PersonalReflection[]> {
    // In memory storage doesn't persist personal reflections
    return [];
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true, // Session table doesn't exist yet, let it be created
      errorLog: (error: Error) => {
        // Suppress "index/table already exists" errors (code 42P07)
        // These are harmless - it means the session infrastructure is already set up
        if ('code' in error && error.code === '42P07') {
          return; // Silently ignore
        }
        // Log all other errors
        console.error('Session store error:', error);
      }
    });
  }
  private memStorage = new MemoryStorage();

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return undefined;
    }
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
      return user || undefined;
    } catch (error) {
      console.error("Error getting user by googleId:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    throw new Error("Upsert not implemented for standard auth");
  }

  async updateUserOnboarding(userId: number, completed: boolean): Promise<void> {
    await db
      .update(users)
      .set({ hasSeenOnboarding: completed })
      .where(eq(users.id, userId));
  }


  // Diary operations
  async createDiary(diary: InsertDiary): Promise<Diary> {
    const [newDiary] = await db.insert(diaries).values(diary).returning();

    // Update streak logic
    if (diary.authorId) {
      try {
        const user = await this.getUser(diary.authorId);
        if (user) {
          const now = new Date();
          const lastEntry = user.lastEntryDate ? new Date(user.lastEntryDate) : null;
          let newStreak = user.currentStreak || 0;

          if (!lastEntry) {
            newStreak = 1;
          } else {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const last = new Date(lastEntry.getFullYear(), lastEntry.getMonth(), lastEntry.getDate());

            const diffTime = Math.abs(today.getTime() - last.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              newStreak++;
            } else if (diffDays > 1) {
              newStreak = 1;
            }
          }

          await db.update(users)
            .set({ currentStreak: newStreak, lastEntryDate: now })
            .where(eq(users.id, diary.authorId));
        }
      } catch (error) {
        console.error("Error updating user streak:", error);
      }
    }

    return newDiary;
  }

  async getDiary(id: number): Promise<Diary | undefined> {
    try {
      const [diary] = await db.select().from(diaries).where(eq(diaries.id, id));
      return diary || undefined;
    } catch (error) {
      console.error("Error getting diary:", error);
      return undefined;
    }
  }

  async getDiaries(viewerId?: number, limit?: number): Promise<Diary[]> {
    try {
      // FIX: Use LEFT JOIN to include author info (prevents N+1 queries)
      if (viewerId) {
        // Authenticated: Public OR Own Private
        const results = await db
          .select({
            diary: diaries,
            author: users
          })
          .from(diaries)
          .leftJoin(users, eq(diaries.authorId, users.id))
          .where(
            or(
              eq(diaries.isPublic, true),
              eq(diaries.authorId, viewerId)
            )
          )
          .orderBy(desc(diaries.createdAt))
          .limit(limit || 1000);

        // Flatten and add author info to diary objects
        return results.map(r => ({
          ...r.diary,
          author: r.author || undefined
        })) as any;
      } else {
        // Guest: Public Only
        const results = await db
          .select({
            diary: diaries,
            author: users
          })
          .from(diaries)
          .leftJoin(users, eq(diaries.authorId, users.id))
          .where(eq(diaries.isPublic, true))
          .orderBy(desc(diaries.createdAt))
          .limit(limit || 1000);

        return results.map(r => ({
          ...r.diary,
          author: r.author || undefined
        })) as any;
      }
    } catch (error) {
      console.error("Error getting diaries:", error);
      return [];
    }
  }



  async deleteDiary(id: number): Promise<boolean> {
    try {
      const result = await db.delete(diaries).where(eq(diaries.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting diary:", error);
      return false;
    }
  }

  // Whisper operations
  async createWhisper(whisper: InsertWhisper): Promise<Whisper> {
    const [newWhisper] = await db.insert(whispers).values(whisper).returning();
    return newWhisper;
  }

  async getWhispers(limit?: number): Promise<Whisper[]> {
    try {
      // FIX: Use LEFT JOIN to include author info (prevents N+1 queries)
      const results = await db
        .select({
          whisper: whispers,
          author: users
        })
        .from(whispers)
        .leftJoin(users, eq(whispers.authorId, users.id))
        .orderBy(desc(whispers.createdAt))
        .limit(limit || 1000);

      return results.map(r => ({
        ...r.whisper,
        author: r.author || undefined
      })) as any;
    } catch (error) {
      console.error("Error getting whispers:", error);
      // Return mock whispers
      return [
        {
          id: 1,
          content: "Sometimes the darkest nights produce the brightest stars ✨",
          hearts: 23,
          authorId: null,
          detectedEmotion: "hope",
          sentimentScore: 3,
          reflectionDepth: 8,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
        },
        {
          id: 2,
          content: "3 AM thoughts hit different... anyone else awake?",
          hearts: 45,
          authorId: null,
          detectedEmotion: "lonely",
          sentimentScore: -2,
          reflectionDepth: 6,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
        },
        {
          id: 3,
          content: "The sound of rain at night is nature's lullaby 🌧️",
          hearts: 67,
          authorId: null,
          detectedEmotion: "peaceful",
          sentimentScore: 4,
          reflectionDepth: 7,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
        }
      ];
    }
  }

  async incrementWhisperHearts(id: number): Promise<void> {
    try {
      const [whisper] = await db.select().from(whispers).where(eq(whispers.id, id));
      if (whisper) {
        await db.update(whispers)
          .set({ hearts: (whisper.hearts || 0) + 1 })
          .where(eq(whispers.id, id));
      }
    } catch (error) {
      console.error("Error incrementing whisper hearts:", error);
    }
  }

  // Mind Maze operations
  async createMindMaze(maze: InsertMindMaze): Promise<MindMaze> {
    const [newMaze] = await db.insert(mindMaze).values(maze).returning();
    return newMaze;
  }

  async getMindMaze(limit?: number): Promise<MindMaze[]> {
    try {
      let query = db.select().from(mindMaze).orderBy(desc(mindMaze.createdAt));
      if (limit) {
        // @ts-ignore
        query = query.limit(limit);
      }
      return await query;
    } catch (error) {
      console.error("Error getting mind maze:", error);
      // Return mock mind maze data
      return [
        {
          id: 1,
          type: "philosophy",
          content: "If you could have dinner with any historical figure, who would it be and what would you ask them?",
          options: null,
          responses: 12,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: 2,
          type: "puzzle",
          content: "A man lives on the 20th floor. Every morning he takes the elevator down. When he comes home, he takes the elevator to the 10th floor and walks the rest... unless it's raining. Why?",
          options: null,
          responses: 8,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }
      ];
    }
  }

  async incrementMindMazeResponses(id: number): Promise<void> {
    try {
      const [maze] = await db.select().from(mindMaze).where(eq(mindMaze.id, id));
      if (maze) {
        await db.update(mindMaze)
          .set({ responses: (maze.responses || 0) + 1 })
          .where(eq(mindMaze.id, id));
      }
    } catch (error) {
      console.error("Error incrementing mind maze responses:", error);
    }
  }

  // Night Circle operations
  async createNightCircle(circle: InsertNightCircle): Promise<NightCircle> {
    const [newCircle] = await db.insert(nightCircles).values(circle).returning();
    return newCircle;
  }

  async getNightCircles(limit?: number): Promise<NightCircle[]> {
    try {
      let query = db.select().from(nightCircles).orderBy(desc(nightCircles.createdAt));
      if (limit) {
        // @ts-ignore
        query = query.limit(limit);
      }
      return await query;
    } catch (error) {
      console.error("Error getting night circles:", error);
      // Return mock night circles data
      return [
        {
          id: 1,
          name: "Midnight Philosophers",
          description: null,
          maxMembers: 50,
          currentMembers: 45,
          isActive: true,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
        },
        {
          id: 2,
          name: "Night Owls Unite",
          description: null,
          maxMembers: 100,
          currentMembers: 78,
          isActive: true,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
        },
        {
          id: 3,
          name: "Dream Sharers",
          description: null,
          maxMembers: 50,
          currentMembers: 32,
          isActive: false,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
        }
      ];
    }
  }

  async updateNightCircleMembers(id: number, members: number): Promise<void> {
    try {
      await db.update(nightCircles)
        .set({ currentMembers: members })
        .where(eq(nightCircles.id, id));
    } catch (error) {
      console.error("Error updating night circle members:", error);
    }
  }

  // Midnight Cafe operations
  async createMidnightCafe(cafe: InsertMidnightCafe): Promise<MidnightCafe> {
    const [newCafe] = await db.insert(midnightCafe).values(cafe).returning();
    return newCafe;
  }

  async getMidnightCafe(limit?: number): Promise<MidnightCafe[]> {
    try {
      // FIX: Use LEFT JOIN to include author info (prevents N+1 queries)
      const results = await db
        .select({
          cafe: midnightCafe,
          author: users
        })
        .from(midnightCafe)
        .leftJoin(users, eq(midnightCafe.authorId, users.id))
        .orderBy(desc(midnightCafe.createdAt))
        .limit(limit || 1000);

      return results.map(r => ({
        ...r.cafe,
        author: r.author || undefined
      })) as any;
    } catch (error) {
      console.error("Error getting midnight cafe:", error);
      // Return mock midnight cafe data
      return [
        {
          id: 1,
          content: "What's everyone's go-to late night snack? I'm currently obsessed with honey toast and chamomile tea 🍯",
          topic: "Late Night Foods",
          category: null,
          replies: 15,
          authorId: null,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
        },
        {
          id: 2,
          content: "Anyone else find that their best ideas come at 2 AM? Just had a breakthrough on a project I've been stuck on for weeks!",
          topic: "Creativity",
          category: null,
          replies: 8,
          authorId: null,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
        },
        {
          id: 3,
          content: "Watching the sunrise after staying up all night hits different. There's something magical about witnessing the world wake up 🌅",
          topic: "Sunrise",
          category: null,
          replies: 22,
          authorId: null,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      ];
    }
  }

  async incrementCafeReplies(id: number): Promise<void> {
    try {
      const [cafe] = await db.select().from(midnightCafe).where(eq(midnightCafe.id, id));
      if (cafe) {
        await db.update(midnightCafe)
          .set({ replies: (cafe.replies || 0) + 1 })
          .where(eq(midnightCafe.id, id));
      }
    } catch (error) {
      console.error("Error incrementing cafe replies:", error);
    }
  }

  // 3AM Founder operations
  // 3AM Founder operations
  async createAmFounder(founder: InsertAmFounder): Promise<AmFounder> {
    const [newFounder] = await db.insert(amFounder).values(founder).returning();
    return newFounder;
  }

  async getAmFounder(): Promise<AmFounder[]> {
    try {
      // FIX: Use LEFT JOIN to include author info (prevents N+1 queries)
      const results = await db
        .select({
          founder: amFounder,
          author: users
        })
        .from(amFounder)
        .leftJoin(users, eq(amFounder.authorId, users.id))
        .orderBy(desc(amFounder.createdAt));

      return results.map(r => ({
        ...r.founder,
        author: r.author || undefined
      })) as any;
    } catch (error) {
      console.error("Error getting amFounder:", error);
      return [];
    }
  }

  async incrementFounderUpvotes(id: number): Promise<void> {
    try {
      await db
        .update(amFounder)
        .set({ upvotes: sql`${amFounder.upvotes} + 1` })
        .where(eq(amFounder.id, id));
    } catch (error) {
      console.error("Error incrementing founder upvotes:", error);
    }
  }

  async incrementFounderComments(id: number): Promise<void> {
    try {
      await db
        .update(amFounder)
        .set({ comments: sql`${amFounder.comments} + 1` })
        .where(eq(amFounder.id, id));
    } catch (error) {
      console.error("Error incrementing founder comments:", error);
    }
  }

  async createAmFounderReply(reply: InsertAmFounderReply): Promise<AmFounderReply> {
    const [newReply] = await db.insert(amFounderReplies).values(reply).returning();
    return newReply;
  }

  async getAmFounderReplies(founderId: number): Promise<AmFounderReply[]> {
    try {
      return await db
        .select()
        .from(amFounderReplies)
        .where(eq(amFounderReplies.founderId, founderId))
        .orderBy(asc(amFounderReplies.createdAt));
    } catch (error) {
      console.error("Error getting amFounder replies:", error);
      return [];
    }
  }

  // Starlit Speaker operations
  async createStarlitSpeaker(speaker: InsertStarlitSpeaker): Promise<StarlitSpeaker> {
    const [newSpeaker] = await db.insert(starlitSpeaker).values(speaker).returning();
    return newSpeaker;
  }

  async getStarlitSpeaker(): Promise<StarlitSpeaker[]> {
    try {
      return await db.select().from(starlitSpeaker).orderBy(desc(starlitSpeaker.createdAt));
    } catch (error) {
      console.error("Error getting starlitSpeaker:", error);
      return [];
    }
  }

  async updateSpeakerParticipants(id: number, participants: number): Promise<void> {
    try {
      await db
        .update(starlitSpeaker)
        .set({ currentParticipants: participants })
        .where(eq(starlitSpeaker.id, id));
    } catch (error) {
      console.error("Error updating speaker participants:", error);
    }
  }

  // Moon Messenger operations
  async createMoonMessage(message: InsertMoonMessenger): Promise<MoonMessenger> {
    const [newMessage] = await db.insert(moonMessenger).values(message).returning();
    return newMessage;
  }

  async getMoonMessages(sessionId: string): Promise<MoonMessenger[]> {
    try {
      return await db
        .select()
        .from(moonMessenger)
        .where(eq(moonMessenger.sessionId, sessionId))
        .orderBy(moonMessenger.timestamp);
    } catch (error) {
      console.error("Error getting moon messages:", error);
      return [];
    }
  }

  async getActiveSessions(): Promise<string[]> {
    try {
      const sessions = await db
        .selectDistinct({ sessionId: moonMessenger.sessionId })
        .from(moonMessenger)
        .where(eq(moonMessenger.isActive, true));
      return sessions.map(s => s.sessionId);
    } catch (error) {
      console.error("Error getting active sessions:", error);
      return [];
    }
  }

  // Saved Stations
  async toggleSavedStation(userId: number, stationId: string): Promise<boolean> {
    try {
      const [existing] = await db
        .select()
        .from(savedStations)
        .where(sql`${savedStations.userId} = ${userId} AND ${savedStations.stationId} = ${stationId}`);

      if (existing) {
        await db.delete(savedStations).where(eq(savedStations.id, existing.id));
        return false;
      } else {
        await db.insert(savedStations).values({ userId, stationId });
        return true;
      }
    } catch (error) {
      console.error("Error toggling saved station:", error);
      return false;
    }
  }

  async getSavedStations(userId: number): Promise<string[]> {
    try {
      const stations = await db
        .select()
        .from(savedStations)
        .where(eq(savedStations.userId, userId));
      return stations.map(s => s.stationId);
    } catch (error) {
      console.error("Error getting saved stations:", error);
      return [];
    }
  }

  async getUserWhispers(userId: number): Promise<Whisper[]> {
    try {
      return await db.select().from(whispers).where(eq(whispers.authorId, userId)).orderBy(desc(whispers.createdAt));
    } catch (error) {
      console.error("Error getting user whispers", error);
      return [];
    }
  }

  async getUserCafePosts(userId: number): Promise<MidnightCafe[]> {
    try {
      return await db.select().from(midnightCafe).where(eq(midnightCafe.authorId, userId)).orderBy(desc(midnightCafe.createdAt));
    } catch (error) {
      console.error("Error getting user cafe posts", error);
      return [];
    }
  }

  async getUserDiaries(userId: number): Promise<Diary[]> {
    try {
      return await db.select().from(diaries).where(eq(diaries.authorId, userId)).orderBy(desc(diaries.createdAt));
    } catch (error) {
      console.error("Error getting user diaries", error);
      return [];
    }
  }

  async getUserFounders(userId: number): Promise<AmFounder[]> {
    try {
      return await db.select().from(amFounder).where(eq(amFounder.authorId, userId)).orderBy(desc(amFounder.createdAt));
    } catch (error) {
      console.error("Error getting user founder posts", error);
      return [];
    }
  }

  // Nightly Reflection operations
  async createNightlyPrompt(prompt: InsertNightlyPrompt): Promise<NightlyPrompt> {
    try {
      const [newPrompt] = await db.insert(nightlyPrompts).values(prompt).returning();
      return newPrompt;
    } catch (error) {
      console.error("Error creating nightly prompt:", error);
      throw error;
    }
  }

  async getActivePrompt(type?: 'diary' | 'inspection'): Promise<NightlyPrompt | undefined> {
    try {
      const now = new Date();
      // First check if we have a valid active prompt in DB
      let query = db
        .select()
        .from(nightlyPrompts)
        .where(
          and(
            sql`${nightlyPrompts.expiresAt} > ${now}`,
            type === 'diary'
              ? eq(nightlyPrompts.shiftMode, 'diary')
              : ne(nightlyPrompts.shiftMode, 'diary')
          )
        )
        .orderBy(desc(nightlyPrompts.createdAt))
        .limit(1);

      const [activePrompt] = await query;

      if (activePrompt) return activePrompt;

      // If no active prompt, return undefined to trigger generation in service
      return undefined;
    } catch (error) {
      console.error("Error getting active prompt:", error);
      return undefined;
    }
  }


  async getNightlyPrompt(id: number): Promise<NightlyPrompt | undefined> {
    try {
      const [prompt] = await db.select().from(nightlyPrompts).where(eq(nightlyPrompts.id, id));
      return prompt || undefined;
    } catch (error) {
      console.error("Error getting nightly prompt:", error);
      return undefined;
    }
  }

  async createUserReflection(reflection: InsertUserReflection, aiEvaluation: any): Promise<UserReflection> {
    try {
      const [newReflection] = await db
        .insert(userReflections)
        .values({ ...reflection, aiEvaluation })
        .returning();

      // Update streak logic (same as diary)
      if (reflection.userId) {
        try {
          const user = await this.getUser(reflection.userId);
          if (user) {
            const now = new Date();
            const lastEntry = user.lastEntryDate ? new Date(user.lastEntryDate) : null;
            let newStreak = user.currentStreak || 0;

            if (!lastEntry) {
              newStreak = 1;
            } else {
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const last = new Date(lastEntry.getFullYear(), lastEntry.getMonth(), lastEntry.getDate());

              const diffTime = Math.abs(today.getTime() - last.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays === 1) {
                newStreak++;
              } else if (diffDays > 1) {
                newStreak = 1;
              }
            }

            // Only update if it's a new day or streak change
            if (!lastEntry || newStreak !== user.currentStreak || now.getDate() !== lastEntry.getDate()) {
              await db.update(users)
                .set({ currentStreak: newStreak, lastEntryDate: now })
                .where(eq(users.id, reflection.userId));
            }
          }
        } catch (error) {
          console.error("Error updating user streak from reflection:", error);
        }
      }

      return newReflection;
    } catch (error) {
      console.error("Error creating user reflection:", error);
      throw error;
    }
  }

  async createCafeReply(reply: InsertCafeReply): Promise<CafeReply> {
    const [newReply] = await db.insert(cafeReplies).values(reply).returning();
    return newReply;
  }

  async getCafeReplies(cafeId: number): Promise<CafeReply[]> {
    return await db.select()
      .from(cafeReplies)
      .where(eq(cafeReplies.cafeId, cafeId))
      .orderBy(asc(cafeReplies.createdAt));
  }

  async deleteCafePost(id: number): Promise<void> {
    // Delete replies first (cascade normally handles this but explicit safe here)
    await db.delete(cafeReplies).where(eq(cafeReplies.cafeId, id));
    await db.delete(midnightCafe).where(eq(midnightCafe.id, id));
  }

  async deleteCafeReply(id: number): Promise<void> {
    await db.delete(cafeReplies).where(eq(cafeReplies.id, id));
  }

  async getUserReflections(userId: number, limit = 20): Promise<UserReflection[]> {
    try {
      return await db
        .select()
        .from(userReflections)
        .where(eq(userReflections.userId, userId))
        .orderBy(desc(userReflections.createdAt))
        .limit(limit);
    } catch (error) {
      console.error("Error getting user reflections:", error);
      return [];
    }
  }

  async createPersonalReflection(reflection: InsertPersonalReflection, aiReflection: string): Promise<PersonalReflection> {
    try {
      const [newReflection] = await db
        .insert(personalReflections)
        .values({ ...reflection, aiReflection })
        .returning();
      return newReflection;
    } catch (error) {
      console.error("Error creating personal reflection:", error);
      throw error;
    }
  }

  async getPersonalReflections(userId: number, limit = 20): Promise<PersonalReflection[]> {
    try {
      return await db
        .select()
        .from(personalReflections)
        .where(eq(personalReflections.userId, userId))
        .orderBy(desc(personalReflections.createdAt))
        .limit(limit);
    } catch (error) {
      console.error("Error getting personal reflections:", error);
      return [];
    }
  }
}

// Choose storage implementation based on environment
// If no DATABASE_URL is provided, use in-memory storage for local development.
const useDatabase = Boolean(process.env.DATABASE_URL && db);

if (useDatabase) {
  logger.info("Using DatabaseStorage");
} else {
  logger.info("Using MemoryStorage (DATABASE_URL not set or db connection failed)");
}

export const storage = useDatabase ? new DatabaseStorage() : new MemoryStorage();
