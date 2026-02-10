
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

} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

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
  getDiaries(filterPublic?: boolean): Promise<Diary[]>;
  getDiary(id: number): Promise<Diary | undefined>;
  deleteDiary(id: number): Promise<boolean>;

  // Whisper operations
  createWhisper(whisper: InsertWhisper): Promise<Whisper>;
  getWhispers(): Promise<Whisper[]>;
  incrementWhisperHearts(id: number): Promise<void>;

  // Mind Maze operations
  createMindMaze(mindMaze: InsertMindMaze): Promise<MindMaze>;
  getMindMaze(): Promise<MindMaze[]>;
  incrementMindMazeResponses(id: number): Promise<void>;

  // Night Circle operations
  createNightCircle(nightCircle: InsertNightCircle): Promise<NightCircle>;
  getNightCircles(): Promise<NightCircle[]>;
  updateNightCircleMembers(id: number, members: number): Promise<void>;

  // Midnight Cafe operations
  createMidnightCafe(midnightCafe: InsertMidnightCafe): Promise<MidnightCafe>;
  getMidnightCafe(): Promise<MidnightCafe[]>;
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
  getActivePrompt(): Promise<NightlyPrompt | undefined>; // Get non-expired prompt
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
    this.amFounders = [];
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
      createdAt: new Date()
    };
    this.diaries.push(newDiary);
    return newDiary;
  }

  async getDiaries(filterPublic = false): Promise<Diary[]> {
    let result = [...this.diaries];
    if (filterPublic) {
      result = result.filter(diary => diary.isPublic);
    }
    return result.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
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
      createdAt: new Date()
    };
    this.whispers.push(newWhisper);
    return newWhisper;
  }

  async getWhispers(): Promise<Whisper[]> {
    return [...this.whispers].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
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

  async getMindMaze(): Promise<MindMaze[]> {
    return [...this.mindMazes].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
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

  async getNightCircles(): Promise<NightCircle[]> {
    return [...this.nightCircles].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
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

  async getMidnightCafe(): Promise<MidnightCafe[]> {
    return [...this.midnightCafes].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
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

  async getActivePrompt(): Promise<NightlyPrompt | undefined> {
    const now = new Date();
    // In memory storage doesn't actually store prompts, so return undefined
    // This will trigger generation of new prompts
    return undefined;
  }

  async getNightlyPrompt(id: number): Promise<NightlyPrompt | undefined> {
    // For memory storage, not implemented
    return undefined;
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

  async getDiaries(filterPublic = false): Promise<Diary[]> {
    try {
      let result = await db.select().from(diaries).orderBy(desc(diaries.createdAt));

      if (filterPublic) {
        return result.filter(diary => diary.isPublic);
      }
      return result;
    } catch (error) {
      console.error("Error getting diaries:", error);
      // Return mock data when database is unavailable
      const mockDiaries = [
        {
          id: 1,
          content: "The city never sleeps, and neither do I. Tonight I watched the rain create patterns on my window, each drop a tiny universe of reflection. There's something magical about 3 AM thoughts - they feel more honest, more raw. I wonder if anyone else is awake right now, sharing this quiet moment with the night.",
          authorId: 1,
          isPublic: true,
          mood: null,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          id: 2,
          content: "Had the strangest dream about floating through a library made of stars. Each book contained a different lifetime, a different possibility. When I woke up, I felt like I'd lived a thousand lives in those few hours of sleep. Dreams are the night's way of showing us infinite potential.",
          authorId: 2,
          isPublic: true,
          mood: null,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
        },
        {
          id: 3,
          content: "Tonight's moon is a silver coin tossed into the velvet sky. I made myself some chamomile tea and sat on my balcony, just breathing. Sometimes the best therapy is silence and starlight. The world feels different at night - softer, more forgiving, full of possibilities.",
          authorId: 3,
          isPublic: true,
          mood: null,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
        },
        {
          id: 4,
          content: "Been thinking about time lately. How it moves differently in the dark. Minutes stretch like hours when you're lost in thought, but hours disappear like seconds when you're creating something beautiful. Tonight I wrote three poems and painted a small canvas. The night is my muse.",
          authorId: 4,
          isPublic: true,
          mood: null,
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
        },
        {
          id: 5,
          content: "There's a cat that visits my fire escape every night around midnight. Tonight I left out some milk and we shared a moment of understanding. Animals know something we've forgotten - how to simply exist without the weight of tomorrow's worries. Lessons from a midnight cat.",
          authorId: 5,
          isPublic: true,
          mood: null,
          createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000) // 10 hours ago
        },
        {
          id: 6,
          content: "Insomnia has become my unwanted companion again. But instead of fighting it, I've learned to dance with it. Tonight I reorganized my bookshelf by color, discovered a letter from my grandmother I'd forgotten about, and realized that sleepless nights can be gifts in disguise.",
          authorId: 6,
          isPublic: true,
          mood: null,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
        }
      ];

      if (filterPublic) {
        return mockDiaries.filter(diary => diary.isPublic);
      }
      return mockDiaries;
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

  async getWhispers(): Promise<Whisper[]> {
    try {
      return await db.select().from(whispers).orderBy(desc(whispers.createdAt));
    } catch (error) {
      console.error("Error getting whispers:", error);
      // Return mock whispers
      return [
        {
          id: 1,
          content: "Sometimes the darkest nights produce the brightest stars ✨",
          hearts: 23,
          authorId: null,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
        },
        {
          id: 2,
          content: "3 AM thoughts hit different... anyone else awake?",
          hearts: 45,
          authorId: null,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
        },
        {
          id: 3,
          content: "The sound of rain at night is nature's lullaby 🌧️",
          hearts: 67,
          authorId: null,
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

  async getMindMaze(): Promise<MindMaze[]> {
    try {
      return await db.select().from(mindMaze).orderBy(desc(mindMaze.createdAt));
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

  async getNightCircles(): Promise<NightCircle[]> {
    try {
      return await db.select().from(nightCircles).orderBy(desc(nightCircles.createdAt));
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

  async getMidnightCafe(): Promise<MidnightCafe[]> {
    try {
      return await db.select().from(midnightCafe).orderBy(desc(midnightCafe.createdAt));
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
      return await db.select().from(amFounder).orderBy(desc(amFounder.createdAt));
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

  async getActivePrompt(): Promise<NightlyPrompt | undefined> {
    try {
      const now = new Date();
      const [activePrompt] = await db
        .select()
        .from(nightlyPrompts)
        .where(sql`${nightlyPrompts.expiresAt} > ${now}`)
        .orderBy(desc(nightlyPrompts.createdAt))
        .limit(1);
      return activePrompt || undefined;
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
  console.log("Using DatabaseStorage");
} else {
  console.log("Using MemoryStorage (DATABASE_URL not set or db connection failed)");
}

export const storage = useDatabase ? new DatabaseStorage() : new MemoryStorage();
