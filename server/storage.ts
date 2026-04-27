
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
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
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
  getMidnightCafeById(id: number): Promise<MidnightCafe | undefined>;
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
  getActiveSessions(): Promise<string[]>;

  // Saved Stations
  toggleSavedStation(userId: number, stationId: string): Promise<boolean>; // Returns true if saved, false if removed
  getSavedStations(userId: number): Promise<string[]>;

  // User specific getters
  getUserWhispers(userId: number, limit?: number): Promise<Whisper[]>;
  getUserCafePosts(userId: number, limit?: number): Promise<MidnightCafe[]>;
  getUserDiaries(userId: number, limit?: number): Promise<Diary[]>;
  getUserFounders(userId: number, limit?: number): Promise<AmFounder[]>;

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
      nightPersona: insertUser.nightPersona ?? null,
      bio: insertUser.bio ?? null,
      location: insertUser.location ?? null,
      preferences: insertUser.preferences ?? {},
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

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...data };
      return this.users[index];
    }
    return undefined;
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
      createdAt: new Date(),
      decayStage: whisper.decayStage || 'fresh',
      decayProgress: whisper.decayProgress || 0,
      visibilityOpacity: whisper.visibilityOpacity || 100,
      audioFrequency: whisper.audioFrequency || 444,
      resonanceScore: 0,
      interactionCount: 0
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
      state: "forming",
      primaryEmotion: null,
      vibeScore: 0,
      expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
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

  async getMidnightCafeById(id: number): Promise<MidnightCafe | undefined> {
    return this.midnightCafes.find(c => c.id === id);
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

  async getUserWhispers(userId: number, limit?: number): Promise<Whisper[]> {
    return this.whispers.filter(w => w.authorId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getUserCafePosts(userId: number, limit?: number): Promise<MidnightCafe[]> {
    return this.midnightCafes.filter(c => c.authorId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getUserDiaries(userId: number, limit?: number): Promise<Diary[]> {
    return this.diaries.filter(diary => diary.authorId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getUserFounders(userId: number, limit?: number): Promise<AmFounder[]> {
    return this.amFounders.filter(f => f.authorId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
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

// ─────────────────────────────────────────────────────────────────────────────
// Import all domain repositories
// ─────────────────────────────────────────────────────────────────────────────
import * as UserRepo from "./repositories/user.repository";
import * as DiaryRepo from "./repositories/diary.repository";
import * as WhisperRepo from "./repositories/whisper.repository";
import * as CircleRepo from "./repositories/night-circle.repository";
import * as CafeRepo from "./repositories/midnight-cafe.repository";
import * as FounderRepo from "./repositories/am-founder.repository";
import * as MiscRepo from "./repositories/misc.repository";
import * as ReflectionRepo from "./repositories/reflection.repository";

/**
 * DatabaseStorage is a thin delegation layer over domain-specific repositories.
 * Each method simply forwards to the appropriate repository function.
 * This keeps storage.ts maintainable and repositories independently testable.
 */
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    try {
      this.sessionStore = new PostgresSessionStore({
        pool,
        tableName: 'sessions', // Explicitly use the Drizzle-managed table
        createTableIfMissing: true,
        errorLog: (error: Error) => {
          // Suppress harmless "index/table already exists" errors (PG code 42P07)
          if ('code' in error && (error as any).code === '42P07') return;
          logger.error('Session store error:', error);
        },
      });
    } catch (err) {
      logger.warn('PostgresSessionStore failed to init — falling back to MemoryStore:', err);
      this.sessionStore = new session.MemoryStore();
    }
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  getUser = UserRepo.getUser;
  getUserByUsername = UserRepo.getUserByUsername;
  getUserByEmail = UserRepo.getUserByEmail;
  getUserByGoogleId = UserRepo.getUserByGoogleId;
  createUser = UserRepo.createUser;
  upsertUser = UserRepo.upsertUser;
  updateUser = UserRepo.updateUser;
  updateUserOnboarding = UserRepo.updateUserOnboarding;

  // ── Diaries ───────────────────────────────────────────────────────────────
  createDiary = DiaryRepo.createDiary;
  getDiaries = DiaryRepo.getDiaries;
  getDiary = DiaryRepo.getDiary;
  deleteDiary = DiaryRepo.deleteDiary;
  getUserDiaries = DiaryRepo.getUserDiaries;

  // ── Whispers ──────────────────────────────────────────────────────────────
  createWhisper = WhisperRepo.createWhisper;
  getWhispers = WhisperRepo.getWhispers;
  incrementWhisperHearts = WhisperRepo.incrementWhisperHearts;
  getUserWhispers = WhisperRepo.getUserWhispers;

  // ── Night Circles ─────────────────────────────────────────────────────────
  createNightCircle = CircleRepo.createNightCircle;
  getNightCircles = CircleRepo.getNightCircles;
  updateNightCircleMembers = CircleRepo.updateNightCircleMembers;

  // ── Midnight Cafe ─────────────────────────────────────────────────────────
  createMidnightCafe = CafeRepo.createMidnightCafe;
  getMidnightCafe = CafeRepo.getMidnightCafe;
  getMidnightCafeById = CafeRepo.getMidnightCafeById;
  incrementCafeReplies = CafeRepo.incrementCafeReplies;
  getCafeReplies = CafeRepo.getCafeReplies;
  createCafeReply = CafeRepo.createCafeReply;
  deleteCafePost = CafeRepo.deleteCafePost;
  deleteCafeReply = CafeRepo.deleteCafeReply;
  getUserCafePosts = CafeRepo.getUserCafePosts;

  // ── 3AM Founder ───────────────────────────────────────────────────────────
  createAmFounder = FounderRepo.createAmFounder;
  getAmFounder = FounderRepo.getAmFounder;
  incrementFounderUpvotes = FounderRepo.incrementFounderUpvotes;
  incrementFounderComments = FounderRepo.incrementFounderComments;
  createAmFounderReply = FounderRepo.createAmFounderReply;
  getAmFounderReplies = FounderRepo.getAmFounderReplies;
  getUserFounders = FounderRepo.getUserFounders;

  // ── MindMaze ──────────────────────────────────────────────────────────────
  createMindMaze = MiscRepo.createMindMaze;
  getMindMaze = MiscRepo.getMindMaze;
  incrementMindMazeResponses = MiscRepo.incrementMindMazeResponses;

  // ── Starlit Speaker ───────────────────────────────────────────────────────
  createStarlitSpeaker = MiscRepo.createStarlitSpeaker;
  getStarlitSpeaker = MiscRepo.getStarlitSpeaker;
  updateSpeakerParticipants = MiscRepo.updateSpeakerParticipants;

  // ── Moon Messenger ────────────────────────────────────────────────────────
  createMoonMessage = MiscRepo.createMoonMessage;
  getMoonMessages = MiscRepo.getMoonMessages;
  getActiveSessions = MiscRepo.getActiveSessions;

  // ── Saved Stations ────────────────────────────────────────────────────────
  toggleSavedStation = MiscRepo.toggleSavedStation;
  getSavedStations = MiscRepo.getSavedStations;

  // ── Reflections ───────────────────────────────────────────────────────────
  createNightlyPrompt = ReflectionRepo.createNightlyPrompt;
  getActivePrompt = ReflectionRepo.getActivePrompt;
  getNightlyPrompt = ReflectionRepo.getNightlyPrompt;
  createUserReflection = ReflectionRepo.createUserReflection;
  getUserReflections = ReflectionRepo.getUserReflections;
  createPersonalReflection = ReflectionRepo.createPersonalReflection;
  getPersonalReflections = ReflectionRepo.getPersonalReflections;
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
