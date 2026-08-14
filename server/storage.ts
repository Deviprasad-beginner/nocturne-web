
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
  type MindMazeSpark,
  type InsertMindMazeSpark,
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
  playlists,
  playlistTracks,
  type Playlist,
  type InsertPlaylist,
  type PlaylistTrack,
  type InsertPlaylistTrack,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, or, and, ne, count } from "drizzle-orm";
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
  createMindMazeSpark(spark: InsertMindMazeSpark): Promise<MindMazeSpark>;
  getMindMazeSparks(mazeId: number): Promise<MindMazeSpark[]>;
  incrementSparkResonance(id: number): Promise<void>;

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

  // Custom platform metrics and analytics
  getUserProfileStats(userId: number): Promise<any>;
  getUserAchievements(userId: number): Promise<any[]>;
  getTrendingTopics(): Promise<any[]>;
  getRecentActivity(limit: number): Promise<any[]>;
  getActivityStats(): Promise<any>;

  // Playlist operations
  createPlaylist(userId: number, name: string): Promise<Playlist>;
  getUserPlaylists(userId: number): Promise<Playlist[]>;
  getPlaylist(playlistId: number): Promise<Playlist | undefined>;
  addTrackToPlaylist(playlistId: number, track: Omit<InsertPlaylistTrack, "playlistId">): Promise<PlaylistTrack>;
  removeTrackFromPlaylist(playlistId: number, trackId: string): Promise<void>;
  getPlaylistTracks(playlistId: number): Promise<PlaylistTrack[]>;
  deletePlaylist(playlistId: number): Promise<void>;
}

// In-memory storage implementation
export class MemoryStorage implements IStorage {
  sessionStore: session.Store;
  users: User[];
  diaries: Diary[];
  whispers: Whisper[];
  mindMazes: MindMaze[];
  mindMazeSparks: MindMazeSpark[];
  nightCircles: NightCircle[];
  midnightCafes: MidnightCafe[];
  amFounders: AmFounder[];
  amFounderReplies: AmFounderReply[];
  starlitSpeakers: StarlitSpeaker[];
  moonMessages: MoonMessenger[];
  savedStations: SavedStation[];
  playlists: Playlist[];
  playlistTracks: PlaylistTrack[];
  private nextId = 1;

  constructor() {
    this.sessionStore = new session.MemoryStore();
    this.users = [];
    this.diaries = [];
    this.whispers = [];
    this.mindMazes = [];
    this.mindMazeSparks = [];
    this.nightCircles = [];
    this.midnightCafes = [];
    this.amFounders = [];
    this.amFounderReplies = [];
    this.starlitSpeakers = [];
    this.moonMessages = [];
    this.savedStations = [];
    this.playlists = [];
    this.playlistTracks = [];
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
      authorId: mindMaze.authorId || null,
      isSystem: mindMaze.isSystem || false,
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

  async createMindMazeSpark(spark: InsertMindMazeSpark): Promise<MindMazeSpark> {
    const newSpark: MindMazeSpark = {
      id: this.nextId++,
      mazeId: spark.mazeId,
      authorId: spark.authorId,
      content: spark.content,
      sparkType: spark.sparkType,
      resonance: 0,
      createdAt: new Date()
    };
    this.mindMazeSparks.push(newSpark);
    return newSpark;
  }

  async getMindMazeSparks(mazeId: number): Promise<MindMazeSpark[]> {
    return this.mindMazeSparks
      .filter(s => s.mazeId === mazeId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async incrementSparkResonance(id: number): Promise<void> {
    const spark = this.mindMazeSparks.find(s => s.id === id);
    if (spark && spark.resonance !== null) {
      spark.resonance++;
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

  async getUserProfileStats(userId: number): Promise<any> {
    const diary_posts = this.diaries.filter(d => d.authorId === userId).length;
    const whisper_posts = this.whispers.filter(w => w.authorId === userId).length;
    const cafe_posts = this.midnightCafes.filter(c => c.authorId === userId).length;
    const total_hearts = this.whispers.filter(w => w.authorId === userId).reduce((sum, w) => sum + (w.hearts || 0), 0);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeDaysSet = new Set<string>();
    const addActiveDay = (d: Date | null) => {
      if (d && d > sevenDaysAgo) {
        activeDaysSet.add(d.toDateString());
      }
    };
    this.diaries.filter(d => d.authorId === userId).forEach(d => addActiveDay(d.createdAt));
    this.whispers.filter(w => w.authorId === userId).forEach(w => addActiveDay(w.createdAt));
    this.midnightCafes.filter(c => c.authorId === userId).forEach(c => addActiveDay(c.createdAt));
    const activeDaysLastWeek = activeDaysSet.size;

    const user = this.users.find(u => u.id === userId);
    const createdAt = user?.createdAt ? new Date(user.createdAt) : new Date();
    const accountAgeDays = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));

    const totalPosts = diary_posts + whisper_posts + cafe_posts;
    const experiencePoints = (totalPosts * 10) + (total_hearts * 2);
    const nightOwlLevel = Math.floor(experiencePoints / 100) || 1;
    const streakDays = activeDaysLastWeek;

    return {
      nightOwlLevel,
      totalHearts: total_hearts,
      postsShared: totalPosts,
      conversationsJoined: cafe_posts,
      streakDays,
      experiencePoints,
      breakdown: {
        diaryPosts: diary_posts,
        whisperPosts: whisper_posts,
        cafePosts: cafe_posts
      },
      accountAgeDays
    };
  }

  async getUserAchievements(userId: number): Promise<any[]> {
    const diary_posts = this.diaries.filter(d => d.authorId === userId).length;
    const whisper_posts = this.whispers.filter(w => w.authorId === userId).length;
    const cafe_posts = this.midnightCafes.filter(c => c.authorId === userId).length;
    const total_hearts = this.whispers.filter(w => w.authorId === userId).reduce((sum, w) => sum + (w.hearts || 0), 0);
    const has_first_heart = this.whispers.some(w => w.authorId === userId && (w.hearts || 0) > 0);

    const achievements = [];
    if (diary_posts >= 1) {
      achievements.push({
        id: 'first_diary',
        icon: 'moon',
        title: 'Night Owl Initiate',
        description: 'Wrote your first diary entry',
        color: 'purple'
      });
    }
    if (whisper_posts >= 1) {
      achievements.push({
        id: 'first_whisper',
        icon: 'star',
        title: 'Whisper in the Dark',
        description: 'Shared your first whisper',
        color: 'pink'
      });
    }
    if (has_first_heart) {
      achievements.push({
        id: 'first_heart',
        icon: 'heart',
        title: 'First Heart Received',
        description: 'Someone loved your whisper',
        color: 'red'
      });
    }
    if (cafe_posts >= 1) {
      achievements.push({
        id: 'first_cafe',
        icon: 'message',
        title: 'Conversation Starter',
        description: 'Started a cafe conversation',
        color: 'blue'
      });
    }
    if (diary_posts >= 10) {
      achievements.push({
        id: 'ten_diaries',
        icon: 'trophy',
        title: 'Dedicated Diarist',
        description: 'Wrote 10 diary entries',
        color: 'yellow'
      });
    }
    if (whisper_posts >= 10) {
      achievements.push({
        id: 'ten_whispers',
        icon: 'trophy',
        title: 'Voice of the Night',
        description: 'Shared 10 whispers',
        color: 'purple'
      });
    }
    if (total_hearts >= 50) {
      achievements.push({
        id: 'fifty_hearts',
        icon: 'trophy',
        title: 'Beloved Night Soul',
        description: 'Received 50 hearts total',
        color: 'gold'
      });
    }
    return achievements;
  }

  async getTrendingTopics(): Promise<any[]> {
    const hashtagMap = new Map<string, { tag: string; posts: number; recent: number; previous: number; lastUsed: Date }>();
    const addHashtags = (content: string, date: Date | null) => {
      if (!content) return;
      const matches = content.match(/#[a-zA-Z0-9_]+/g);
      if (!matches) return;
      const now = Date.now();
      const isRecent = date ? (now - date.getTime() <= 24 * 60 * 60 * 1000) : false;
      const isPrevious = date ? (now - date.getTime() > 24 * 60 * 60 * 1000 && now - date.getTime() <= 48 * 60 * 60 * 1000) : false;

      matches.forEach(match => {
        const tag = match.slice(1).toLowerCase();
        const existing = hashtagMap.get(tag) || { tag, posts: 0, recent: 0, previous: 0, lastUsed: date || new Date() };
        existing.posts++;
        if (isRecent) existing.recent++;
        if (isPrevious) existing.previous++;
        if (date && date > existing.lastUsed) existing.lastUsed = date;
        hashtagMap.set(tag, existing);
      });
    };

    this.diaries.forEach(d => addHashtags(d.content, d.createdAt));
    this.whispers.forEach(w => addHashtags(w.content, w.createdAt));
    this.midnightCafes.forEach(c => addHashtags(c.content, c.createdAt));

    const items = Array.from(hashtagMap.values());
    const formattedTopics = items.map((topic, index) => {
      let growth = 0;
      if (topic.previous > 0) {
        growth = Math.round(((topic.recent - topic.previous) / topic.previous) * 100);
      } else if (topic.recent > 0) {
        growth = 100;
      }

      let category = 'social';
      if (/(thought|philosophy|wisdom|mind|contemplat)/.test(topic.tag)) category = 'philosophy';
      else if (/(music|song|sound|melody|beat)/.test(topic.tag)) category = 'music';
      else if (/(art|creat|design|draw|paint|write)/.test(topic.tag)) category = 'creative';
      else if (/(startup|business|founder|entrepreneur)/.test(topic.tag)) category = 'business';
      else if (/(journal|diary|personal|feeling|emotion)/.test(topic.tag)) category = 'personal';

      let destination = '/whispers';
      if (/(journal|diary)/.test(topic.tag)) destination = '/diaries';
      else if (/(whisper|secret|confess)/.test(topic.tag)) destination = '/whispers';
      else if (/(cafe|conversation|discuss)/.test(topic.tag)) destination = '/midnight-cafe';
      else if (/(music|song)/.test(topic.tag)) destination = '/music-mood';
      else if (/(founder|startup)/.test(topic.tag)) destination = '/3am-founder';
      else if (/(puzzle|riddle|maze)/.test(topic.tag)) destination = '/mind-maze';
      else if (/(circle|community|group)/.test(topic.tag)) destination = '/night-circles';

      return {
        id: index + 1,
        tag: topic.tag,
        posts: topic.posts,
        growth,
        category,
        destination
      };
    });

    if (formattedTopics.length === 0) {
      return [
        { id: 1, tag: "3amthoughts", posts: 0, growth: 0, category: "philosophy", destination: "/diaries" },
        { id: 2, tag: "insomniacreations", posts: 0, growth: 0, category: "creative", destination: "/whispers" },
        { id: 3, tag: "midnightmusic", posts: 0, growth: 0, category: "music", destination: "/music-mood" },
        { id: 4, tag: "nightowlstartup", posts: 0, growth: 0, category: "business", destination: "/3am-founder" },
        { id: 5, tag: "dreamjournal", posts: 0, growth: 0, category: "personal", destination: "/diaries" },
        { id: 6, tag: "starlitconversations", posts: 0, growth: 0, category: "social", destination: "/midnight-cafe" }
      ];
    }

    return formattedTopics.sort((a, b) => b.posts - a.posts).slice(0, 10);
  }

  async getRecentActivity(limit: number): Promise<any[]> {
    const recentDiaries = [...this.diaries].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)).slice(0, 5);
    const recentWhispers = [...this.whispers].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)).slice(0, 5);
    const recentCafe = [...this.midnightCafes].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)).slice(0, 5);

    const combined = [
      ...recentDiaries.map((d) => ({
        id: `post-${d.id}`,
        type: "post",
        user: "A Night Owl",
        content: "shared a diary entry",
        timestamp: d.createdAt,
        category: "diaries",
        link: "/diaries",
      })),
      ...recentWhispers.map((w) => ({
        id: `whisper-${w.id}`,
        type: "whisper",
        user: "Anonymous",
        content: "whispered into the night",
        timestamp: w.createdAt,
        category: "whispers",
        link: "/whispers",
      })),
      ...recentCafe.map((m) => ({
        id: `comment-${m.id}`,
        type: "comment",
        user: "A Night Wanderer",
        content: `started a conversation about ${m.topic?.slice(0, 30) ?? "..."}`,
        timestamp: m.createdAt,
        category: "cafe",
        link: "/midnight-cafe",
      })),
    ]
      .sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime())
      .slice(0, limit);

    return combined;
  }

  async getActivityStats(): Promise<any> {
    return {
      diaries_today: this.diaries.length,
      whispers_today: this.whispers.length,
      cafe_today: this.midnightCafes.length,
      active_users_today: 0,
    };
  }

  // Playlist operations
  async createPlaylist(userId: number, name: string): Promise<Playlist> {
    const playlist: Playlist = {
      id: this.nextId++,
      userId,
      name,
      createdAt: new Date()
    };
    this.playlists.push(playlist);
    return playlist;
  }

  async getUserPlaylists(userId: number): Promise<Playlist[]> {
    return this.playlists.filter(p => p.userId === userId);
  }

  async getPlaylist(playlistId: number): Promise<Playlist | undefined> {
    return this.playlists.find(p => p.id === playlistId);
  }

  async addTrackToPlaylist(playlistId: number, track: Omit<InsertPlaylistTrack, "playlistId">): Promise<PlaylistTrack> {
    const playlistTrack: PlaylistTrack = {
      id: this.nextId++,
      playlistId,
      trackId: track.trackId,
      trackTitle: track.trackTitle,
      trackArtist: track.trackArtist,
      trackUrl: track.trackUrl,
      trackCoverArt: track.trackCoverArt ?? null,
      createdAt: new Date()
    };
    this.playlistTracks.push(playlistTrack);
    return playlistTrack;
  }

  async removeTrackFromPlaylist(playlistId: number, trackId: string): Promise<void> {
    const index = this.playlistTracks.findIndex(t => t.playlistId === playlistId && t.trackId === trackId);
    if (index >= 0) {
      this.playlistTracks.splice(index, 1);
    }
  }

  async getPlaylistTracks(playlistId: number): Promise<PlaylistTrack[]> {
    return this.playlistTracks.filter(t => t.playlistId === playlistId);
  }

  async deletePlaylist(playlistId: number): Promise<void> {
    this.playlists = this.playlists.filter(p => p.id !== playlistId);
    this.playlistTracks = this.playlistTracks.filter(t => t.playlistId !== playlistId);
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
import * as PlaylistRepo from "./repositories/playlist.repository";

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

  // ── Playlists ─────────────────────────────────────────────────────────────
  createPlaylist = PlaylistRepo.createPlaylist;
  getUserPlaylists = PlaylistRepo.getUserPlaylists;
  getPlaylist = PlaylistRepo.getPlaylist;
  addTrackToPlaylist = PlaylistRepo.addTrackToPlaylist;
  removeTrackFromPlaylist = PlaylistRepo.removeTrackFromPlaylist;
  getPlaylistTracks = PlaylistRepo.getPlaylistTracks;
  deletePlaylist = PlaylistRepo.deletePlaylist;

  // ── MindMaze ──────────────────────────────────────────────────────────────
  createMindMaze = MiscRepo.createMindMaze;
  getMindMaze = MiscRepo.getMindMaze;
  incrementMindMazeResponses = MiscRepo.incrementMindMazeResponses;
  createMindMazeSpark = MiscRepo.createMindMazeSpark;
  getMindMazeSparks = MiscRepo.getMindMazeSparks;
  incrementSparkResonance = MiscRepo.incrementSparkResonance;

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

  async getUserProfileStats(userId: number): Promise<any> {
    const stats = await db.execute(sql`
        SELECT 
            COALESCE((SELECT COUNT(*) FROM ${diaries} WHERE author_id = ${userId}), 0) as diary_posts,
            COALESCE((SELECT COUNT(*) FROM ${whispers} WHERE author_id = ${userId}), 0) as whisper_posts,
            COALESCE((SELECT COUNT(*) FROM ${midnightCafe} WHERE author_id = ${userId}), 0) as cafe_posts,
            COALESCE((SELECT SUM(hearts) FROM ${whispers} WHERE author_id = ${userId}), 0) as total_hearts,
            COALESCE((
                SELECT COUNT(DISTINCT DATE(created_at))
                FROM (
                    SELECT created_at FROM ${diaries} WHERE author_id = ${userId} AND created_at > NOW() - INTERVAL '7 days'
                    UNION ALL
                    SELECT created_at FROM ${whispers} WHERE author_id = ${userId} AND created_at > NOW() - INTERVAL '7 days'
                    UNION ALL
                    SELECT created_at FROM ${midnightCafe} WHERE author_id = ${userId} AND created_at > NOW() - INTERVAL '7 days'
                ) as all_posts
            ), 0) as active_days_last_week,
            COALESCE(EXTRACT(DAY FROM (NOW() - (SELECT created_at FROM ${users} WHERE id = ${userId}))), 0) as account_age_days
    `);

    const rawStats = stats.rows[0] as any;

    const totalPosts = Number(rawStats.diary_posts || 0) +
      Number(rawStats.whisper_posts || 0) +
      Number(rawStats.cafe_posts || 0);

    const totalHearts = Number(rawStats.total_hearts || 0);
    const activeDaysLastWeek = Number(rawStats.active_days_last_week || 0);
    const accountAgeDays = Number(rawStats.account_age_days || 0);

    const experiencePoints = (totalPosts * 10) + (totalHearts * 2);
    const nightOwlLevel = Math.floor(experiencePoints / 100) || 1;
    const streakDays = activeDaysLastWeek;

    return {
      nightOwlLevel,
      totalHearts,
      postsShared: totalPosts,
      conversationsJoined: Number(rawStats.cafe_posts || 0),
      streakDays,
      experiencePoints,
      breakdown: {
        diaryPosts: Number(rawStats.diary_posts || 0),
        whisperPosts: Number(rawStats.whisper_posts || 0),
        cafePosts: Number(rawStats.cafe_posts || 0)
      },
      accountAgeDays
    };
  }

  async getUserAchievements(userId: number): Promise<any[]> {
    const achievementChecks = await db.execute(sql`
        SELECT 
            EXISTS(SELECT 1 FROM ${diaries} WHERE author_id = ${userId} LIMIT 1) as has_first_diary,
            EXISTS(SELECT 1 FROM ${whispers} WHERE author_id = ${userId} LIMIT 1) as has_first_whisper,
            EXISTS(SELECT 1 FROM ${whispers} WHERE author_id = ${userId} AND hearts > 0 LIMIT 1) as has_first_heart,
            EXISTS(SELECT 1 FROM ${midnightCafe} WHERE author_id = ${userId} LIMIT 1) as has_first_cafe,
            (SELECT COUNT(*) FROM ${diaries} WHERE author_id = ${userId}) >= 10 as has_ten_diaries,
            (SELECT COUNT(*) FROM ${whispers} WHERE author_id = ${userId}) >= 10 as has_ten_whispers,
            (SELECT SUM(hearts) FROM ${whispers} WHERE author_id = ${userId}) >= 50 as has_fifty_hearts
    `);

    const checks = achievementChecks.rows[0] as any;
    const achievements = [];

    if (checks.has_first_diary) {
      achievements.push({
        id: 'first_diary',
        icon: 'moon',
        title: 'Night Owl Initiate',
        description: 'Wrote your first diary entry',
        color: 'purple'
      });
    }

    if (checks.has_first_whisper) {
      achievements.push({
        id: 'first_whisper',
        icon: 'star',
        title: 'Whisper in the Dark',
        description: 'Shared your first whisper',
        color: 'pink'
      });
    }

    if (checks.has_first_heart) {
      achievements.push({
        id: 'first_heart',
        icon: 'heart',
        title: 'First Heart Received',
        description: 'Someone loved your whisper',
        color: 'red'
      });
    }

    if (checks.has_first_cafe) {
      achievements.push({
        id: 'first_cafe',
        icon: 'message',
        title: 'Conversation Starter',
        description: 'Started a cafe conversation',
        color: 'blue'
      });
    }

    if (checks.has_ten_diaries) {
      achievements.push({
        id: 'ten_diaries',
        icon: 'trophy',
        title: 'Dedicated Diarist',
        description: 'Wrote 10 diary entries',
        color: 'yellow'
      });
    }

    if (checks.has_ten_whispers) {
      achievements.push({
        id: 'ten_whispers',
        icon: 'trophy',
        title: 'Voice of the Night',
        description: 'Shared 10 whispers',
        color: 'purple'
      });
    }

    if (checks.has_fifty_hearts) {
      achievements.push({
        id: 'fifty_hearts',
        icon: 'trophy',
        title: 'Beloved Night Soul',
        description: 'Received 50 hearts total',
        color: 'gold'
      });
    }

    return achievements;
  }

  async getTrendingTopics(): Promise<any[]> {
    const trendingTopics = await db.execute(sql`
        WITH hashtag_counts AS (
            SELECT 
                LOWER(SUBSTRING(content FROM '#([a-zA-Z0-9_]+)')) as hashtag,
                COUNT(*) as post_count,
                MAX(created_at) as last_used,
                'diaries' as source
            FROM ${diaries}
            WHERE content ~ '#[a-zA-Z0-9_]+'
            GROUP BY LOWER(SUBSTRING(content FROM '#([a-zA-Z0-9_]+)'))
            
            UNION ALL
            
            SELECT 
                LOWER(SUBSTRING(content FROM '#([a-zA-Z0-9_]+)')) as hashtag,
                COUNT(*) as post_count,
                MAX(created_at) as last_used,
                'whispers' as source
            FROM ${whispers}
            WHERE content ~ '#[a-zA-Z0-9_]+'
            GROUP BY LOWER(SUBSTRING(content FROM '#([a-zA-Z0-9_]+)'))
            
            UNION ALL
            
            SELECT 
                LOWER(SUBSTRING(content FROM '#([a-zA-Z0-9_]+)')) as hashtag,
                COUNT(*) as post_count,
                MAX(created_at) as last_used,
                'cafe' as source
            FROM ${midnightCafe}
            WHERE content ~ '#[a-zA-Z0-9_]+'
            GROUP BY LOWER(SUBSTRING(content FROM '#([a-zA-Z0-9_]+)'))
        ),
        aggregated AS (
            SELECT 
                hashtag,
                SUM(post_count) as total_posts,
                MAX(last_used) as last_used,
                SUM(CASE WHEN last_used > NOW() - INTERVAL '24 hours' THEN post_count ELSE 0 END) as recent_posts,
                SUM(CASE WHEN last_used BETWEEN NOW() - INTERVAL '48 hours' AND NOW() - INTERVAL '24 hours' THEN post_count ELSE 0 END) as previous_posts
            FROM hashtag_counts
            GROUP BY hashtag
        )
        SELECT 
            hashtag as tag,
            total_posts as posts,
            CASE 
                WHEN previous_posts > 0 THEN ROUND(((recent_posts - previous_posts)::numeric / previous_posts * 100), 0)
                WHEN recent_posts > 0 THEN 100
                ELSE 0
            END as growth,
            CASE 
                WHEN hashtag ~ '(thought|philosophy|wisdom|mind|contemplat)' THEN 'philosophy'
                WHEN hashtag ~ '(music|song|sound|melody|beat)' THEN 'music'
                WHEN hashtag ~ '(art|creat|design|draw|paint|write)' THEN 'creative'
                WHEN hashtag ~ '(startup|business|founder|entrepreneur)' THEN 'business'
                WHEN hashtag ~ '(journal|diary|personal|feeling|emotion)' THEN 'personal'
                ELSE 'social'
            END as category,
            CASE 
                WHEN hashtag ~ '(journal|diary)' THEN '/diaries'
                WHEN hashtag ~ '(whisper|secret|confess)' THEN '/whispers'
                WHEN hashtag ~ '(cafe|conversation|discuss)' THEN '/midnight-cafe'
                WHEN hashtag ~ '(music|song)' THEN '/music-mood'
                WHEN hashtag ~ '(founder|startup)' THEN '/3am-founder'
                WHEN hashtag ~ '(puzzle|riddle|maze)' THEN '/mind-maze'
                WHEN hashtag ~ '(circle|community|group)' THEN '/night-circles'
                ELSE '/whispers'
            END as destination
        FROM aggregated
        WHERE total_posts > 0
        ORDER BY 
            recent_posts DESC,
            total_posts DESC
        LIMIT 10
    `);

    const formattedTopics = (trendingTopics.rows || []).map((topic: any, index: number) => ({
      id: index + 1,
      tag: topic.tag,
      posts: parseInt(topic.posts) || 0,
      growth: parseInt(topic.growth) || 0,
      category: topic.category,
      destination: topic.destination
    }));

    if (formattedTopics.length === 0) {
      return [
        { id: 1, tag: "3amthoughts", posts: 0, growth: 0, category: "philosophy", destination: "/diaries" },
        { id: 2, tag: "insomniacreations", posts: 0, growth: 0, category: "creative", destination: "/whispers" },
        { id: 3, tag: "midnightmusic", posts: 0, growth: 0, category: "music", destination: "/music-mood" },
        { id: 4, tag: "nightowlstartup", posts: 0, growth: 0, category: "business", destination: "/3am-founder" },
        { id: 5, tag: "dreamjournal", posts: 0, growth: 0, category: "personal", destination: "/diaries" },
        { id: 6, tag: "starlitconversations", posts: 0, growth: 0, category: "social", destination: "/midnight-cafe" }
      ];
    }

    return formattedTopics;
  }

  async getRecentActivity(limit: number): Promise<any[]> {
    const [recentDiaries, recentWhispers, recentCafe] = await Promise.all([
      db
        .select({ id: diaries.id, createdAt: diaries.createdAt })
        .from(diaries)
        .orderBy(desc(diaries.createdAt))
        .limit(5),

      db
        .select({ id: whispers.id, createdAt: whispers.createdAt })
        .from(whispers)
        .orderBy(desc(whispers.createdAt))
        .limit(5),

      db
        .select({ id: midnightCafe.id, createdAt: midnightCafe.createdAt, topic: midnightCafe.topic })
        .from(midnightCafe)
        .orderBy(desc(midnightCafe.createdAt))
        .limit(5),
    ]);

    const combined = [
      ...recentDiaries.map((d) => ({
        id: `post-${d.id}`,
        type: "post",
        user: "A Night Owl",
        content: "shared a diary entry",
        timestamp: d.createdAt,
        category: "diaries",
        link: "/diaries",
      })),
      ...recentWhispers.map((w) => ({
        id: `whisper-${w.id}`,
        type: "whisper",
        user: "Anonymous",
        content: "whispered into the night",
        timestamp: w.createdAt,
        category: "whispers",
        link: "/whispers",
      })),
      ...recentCafe.map((m) => ({
        id: `comment-${m.id}`,
        type: "comment",
        user: "A Night Wanderer",
        content: `started a conversation about ${m.topic?.slice(0, 30) ?? "..."}`,
        timestamp: m.createdAt,
        category: "cafe",
        link: "/midnight-cafe",
      })),
    ]
      .sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime())
      .slice(0, limit);

    return combined;
  }

  async getActivityStats(): Promise<any> {
    const [diaryCount, whisperCount, cafeCount] = await Promise.all([
      db.select({ value: count() }).from(diaries),
      db.select({ value: count() }).from(whispers),
      db.select({ value: count() }).from(midnightCafe),
    ]);

    return {
      diaries_today: Number(diaryCount[0]?.value || 0),
      whispers_today: Number(whisperCount[0]?.value || 0),
      cafe_today: Number(cafeCount[0]?.value || 0),
      active_users_today: 0,
    };
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
