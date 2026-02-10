import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table supporting both Firebase and Replit Auth
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password"),
  googleId: text("google_id").unique(),
  displayName: text("display_name"),
  email: text("email").unique(),
  profileImageUrl: text("profile_image_url"),
  hasSeenOnboarding: boolean("has_seen_onboarding").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const diaries = pgTable("diaries", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  isPublic: boolean("is_public").default(false),
  mood: varchar("mood", { length: 100 }),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const whispers = pgTable("whispers", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  hearts: integer("hearts").default(0),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mindMaze = pgTable("mind_maze", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  options: text("options").array(),
  responses: integer("responses").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nightCircles = pgTable("night_circles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  maxMembers: integer("max_members").default(8),
  currentMembers: integer("current_members").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const midnightCafe = pgTable("midnight_cafe", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  replies: integer("replies").default(0),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cafeReplies = pgTable("cafe_replies", {
  id: serial("id").primaryKey(),
  cafeId: integer("cafe_id").references(() => midnightCafe.id).notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved Stations for Music
export const savedStations = pgTable("saved_stations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stationId: text("station_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Upsert user schema for auth systems
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  id: z.number().optional(),
});

export const insertDiarySchema = createInsertSchema(diaries).omit({
  id: true,
  createdAt: true,
});

export const insertWhisperSchema = createInsertSchema(whispers).omit({
  id: true,
  hearts: true,
  createdAt: true,
});

export const insertMindMazeSchema = createInsertSchema(mindMaze).omit({
  id: true,
  responses: true,
  createdAt: true,
});

export const insertNightCircleSchema = createInsertSchema(nightCircles).omit({
  id: true,
  currentMembers: true,
  isActive: true,
  createdAt: true,
});

export const insertMidnightCafeSchema = createInsertSchema(midnightCafe).omit({
  id: true,
  replies: true,
  createdAt: true,
});

export const insertCafeReplySchema = createInsertSchema(cafeReplies).omit({
  id: true,
  createdAt: true,
});

export const insertSavedStationSchema = createInsertSchema(savedStations).omit({
  id: true,
  createdAt: true
});

export type User = typeof users.$inferSelect;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Diary = typeof diaries.$inferSelect;
export type InsertDiary = z.infer<typeof insertDiarySchema>;

export type Whisper = typeof whispers.$inferSelect;
export type InsertWhisper = z.infer<typeof insertWhisperSchema>;

export type MindMaze = typeof mindMaze.$inferSelect;
export type InsertMindMaze = z.infer<typeof insertMindMazeSchema>;

export type NightCircle = typeof nightCircles.$inferSelect;
export type InsertNightCircle = z.infer<typeof insertNightCircleSchema>;

export type MidnightCafe = typeof midnightCafe.$inferSelect;
export type InsertMidnightCafe = z.infer<typeof insertMidnightCafeSchema>;

export type CafeReply = typeof cafeReplies.$inferSelect;
export type InsertCafeReply = z.infer<typeof insertCafeReplySchema>;


export type SavedStation = typeof savedStations.$inferSelect;
export type InsertSavedStation = z.infer<typeof insertSavedStationSchema>;

// Unified Night Thoughts - Merges diaries, whispers, and midnight cafe
export const nightThoughts = pgTable("night_thoughts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),

  // Smart categorization - auto-detected based on content and user intent
  thoughtType: varchar("thought_type", { length: 50 }), // "whisper" | "diary" | "discussion"
  topic: text("topic"), // For discussion-style posts

  // Privacy and interaction settings
  isPrivate: boolean("is_private").default(false),
  allowReplies: boolean("allow_replies").default(true),

  // Engagement metrics
  hearts: integer("hearts").default(0),
  replies: integer("replies").default(0),

  // Metadata
  authorId: integer("author_id").references(() => users.id),
  mood: varchar("mood", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // For ephemeral whisper-style thoughts
});

// 3AM Founder - Anonymous thoughts for entrepreneurs and late-night innovators
export const amFounder = pgTable("am_founder", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  upvotes: integer("upvotes").default(0),
  comments: integer("comments").default(0),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Starlit Speaker - Voice chat rooms for audio conversations
export const starlitSpeaker = pgTable("starlit_speaker", {
  id: serial("id").primaryKey(),
  roomName: text("room_name").notNull(),
  description: text("description").notNull(),
  topic: text("topic").notNull(),
  maxParticipants: integer("max_participants").default(8),
  currentParticipants: integer("current_participants").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Moon Messenger - Random text pairing for anonymous conversations
export const moonMessenger = pgTable("moon_messenger", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  message: text("message").notNull(),
  sender: text("sender").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Nightly Reflections - AI-powered quiet thinking prompts
export const nightlyPrompts = pgTable("nightly_prompts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  shiftMode: varchar("shift_mode", { length: 50 }).notNull(), // reverse_causality|silence_variable|assumption_test|skipped_detail|two_futures
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const userReflections = pgTable("user_reflections", {
  id: serial("id").primaryKey(),
  promptId: integer("prompt_id").references(() => nightlyPrompts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  responseContent: text("response_content").notNull(),
  aiEvaluation: jsonb("ai_evaluation"), // Stores AI's reflection on the response
  createdAt: timestamp("created_at").defaultNow(),
});

export const personalReflections = pgTable("personal_reflections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  userQuery: text("user_query").notNull(),
  aiReflection: text("ai_reflection").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAmFounderSchema = createInsertSchema(amFounder).omit({
  id: true,
  upvotes: true,
  comments: true,
  createdAt: true,
});

export const insertStarlitSpeakerSchema = createInsertSchema(starlitSpeaker).omit({
  id: true,
  currentParticipants: true,
  isActive: true,
  createdAt: true,
});

export const insertMoonMessengerSchema = createInsertSchema(moonMessenger).omit({
  id: true,
  isActive: true,
  timestamp: true,
});

export type AmFounder = typeof amFounder.$inferSelect;
export type InsertAmFounder = z.infer<typeof insertAmFounderSchema>;

export type StarlitSpeaker = typeof starlitSpeaker.$inferSelect;
export type InsertStarlitSpeaker = z.infer<typeof insertStarlitSpeakerSchema>;

export type MoonMessenger = typeof moonMessenger.$inferSelect;
export type InsertMoonMessenger = z.infer<typeof insertMoonMessengerSchema>;

// Nightly Reflection schemas
export const insertNightlyPromptSchema = createInsertSchema(nightlyPrompts).omit({
  id: true,
  createdAt: true,
});

export const insertUserReflectionSchema = createInsertSchema(userReflections).omit({
  id: true,
  createdAt: true,
  aiEvaluation: true,
});

export const insertPersonalReflectionSchema = createInsertSchema(personalReflections).omit({
  id: true,
  createdAt: true,
  aiReflection: true,
});

export type NightlyPrompt = typeof nightlyPrompts.$inferSelect;
export type InsertNightlyPrompt = z.infer<typeof insertNightlyPromptSchema>;

export type UserReflection = typeof userReflections.$inferSelect;
export type InsertUserReflection = z.infer<typeof insertUserReflectionSchema>;

export type PersonalReflection = typeof personalReflections.$inferSelect;
export type InsertPersonalReflection = z.infer<typeof insertPersonalReflectionSchema>;
// Night Thoughts schemas
export const insertNightThoughtSchema = createInsertSchema(nightThoughts).omit({
  id: true,
  hearts: true,
  replies: true,
  createdAt: true,
});

export type NightThought = typeof nightThoughts.$inferSelect;
export type InsertNightThought = z.infer<typeof insertNightThoughtSchema>;

// Read Card Feature Tables

// Reads table - stores uploaded and curated reading content
export const reads = pgTable("reads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author"),
  content: text("content"), // For short text content
  contentUrl: text("content_url"), // For uploaded files
  estimatedReadTimeMinutes: integer("estimated_read_time_minutes"),

  // Ownership & Visibility
  ownerId: integer("owner_id").references(() => users.id, { onDelete: "cascade" }),
  visibility: text("visibility", { enum: ["private", "tonight", "curated"] }).default("private"),

  // Content Metadata
  contentType: text("content_type", { enum: ["text", "pdf", "epub", "curated"] }).default("text"),
  sourceAttribution: text("source_attribution"),
  intention: text("intention", { enum: ["learn", "feel", "think", "sleep"] }),

  // Moderation
  moderationStatus: text("moderation_status", { enum: ["pending", "approved", "rejected"] }).default("approved"),
  moderationNotes: text("moderation_notes"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  lastAccessedAt: timestamp("last_accessed_at"),
}, (table) => [
  index("idx_reads_visibility").on(table.visibility, table.moderationStatus),
  index("idx_reads_owner_visibility").on(table.ownerId, table.visibility),
  index("idx_reads_expires_at").on(table.expiresAt),
]);

// Read Sessions - track user reading progress
export const readSessions = pgTable("read_sessions", {
  id: serial("id").primaryKey(),
  readId: integer("read_id").references(() => reads.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),

  // Progress Tracking
  lastPosition: integer("last_position").default(0),
  lastPositionType: text("last_position_type", { enum: ["page", "percentage"] }).default("percentage"),
  intention: text("intention", { enum: ["learn", "feel", "think", "sleep"] }),

  // Analytics
  totalTimeSeconds: integer("total_time_seconds").default(0),
  completed: boolean("completed").default(false),

  // Timestamps
  startedAt: timestamp("started_at").defaultNow(),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
}, (table) => [
  index("idx_read_sessions_user").on(table.userId),
  index("idx_read_sessions_read").on(table.readId),
]);

// Private Highlights - user's personal annotations
export const privateHighlights = pgTable("private_highlights", {
  id: serial("id").primaryKey(),
  readId: integer("read_id").references(() => reads.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),

  // Content
  startPosition: integer("start_position").notNull(),
  endPosition: integer("end_position").notNull(),
  highlightedText: text("highlighted_text"),
  note: text("note"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
}, (table) => [
  index("idx_private_highlights_user_read").on(table.userId, table.readId),
  index("idx_private_highlights_expires").on(table.expiresAt),
]);

// Silent Lines - anonymous annotations for Read Together mode
export const silentLines = pgTable("silent_lines", {
  id: serial("id").primaryKey(),
  readId: integer("read_id").references(() => reads.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),

  // Content
  text: text("text").notNull(),
  position: integer("position"),

  // Moderation
  flagged: boolean("flagged").default(false),
  flagReason: text("flag_reason"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
}, (table) => [
  index("idx_silent_lines_read_expires").on(table.readId, table.expiresAt),
]);

// Read Card Insert Schemas
export const insertReadSchema = createInsertSchema(reads).omit({
  id: true,
  createdAt: true,
  lastAccessedAt: true,
  moderationStatus: true,
  moderationNotes: true,
});

export const insertReadSessionSchema = createInsertSchema(readSessions).omit({
  id: true,
  startedAt: true,
  lastActivityAt: true,
  totalTimeSeconds: true,
  completed: true,
});

export const insertPrivateHighlightSchema = createInsertSchema(privateHighlights).omit({
  id: true,
  createdAt: true,
});

export const insertSilentLineSchema = createInsertSchema(silentLines).omit({
  id: true,
  createdAt: true,
  flagged: true,
  flagReason: true,
});

// Read Card Types
export type Read = typeof reads.$inferSelect;
export type InsertRead = z.infer<typeof insertReadSchema>;

export type ReadSession = typeof readSessions.$inferSelect;
export type InsertReadSession = z.infer<typeof insertReadSessionSchema>;

export type PrivateHighlight = typeof privateHighlights.$inferSelect;
export type InsertPrivateHighlight = z.infer<typeof insertPrivateHighlightSchema>;

export type SilentLine = typeof silentLines.$inferSelect;
export type InsertSilentLine = z.infer<typeof insertSilentLineSchema>;
