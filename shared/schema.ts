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

  // Profile Information
  nightPersona: varchar("night_persona", { length: 50 }),
  bio: text("bio"),
  location: varchar("location", { length: 100 }),
  preferences: jsonb("preferences").default({}),

  currentStreak: integer("current_streak").default(0),
  lastEntryDate: timestamp("last_entry_date"),
  createdAt: timestamp("created_at").defaultNow(),
  // Profile System Fields
  nightStreak: integer("night_streak").default(0),
  meaningfulReplies: integer("meaningful_replies").default(0),
  reportCount: integer("report_count").default(0),
  trustScore: integer("trust_score").default(100),
  lastActiveTime: timestamp("last_active_time"),
}, (table) => [
  index("idx_users_last_active_time").on(table.lastActiveTime),
]);

export const diaries = pgTable("diaries", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  isPublic: boolean("is_public").default(false),
  mood: varchar("mood", { length: 100 }),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  // Emotional Analysis
  detectedEmotion: varchar("detected_emotion", { length: 50 }),
  sentimentScore: integer("sentiment_score"), // multiplied by 100 to store as int or use real/double precision if supported by driver, but drizzle pg-core usually supports real. Let's use real.
  reflectionDepth: integer("reflection_depth"), // scaled 0-100
}, (table) => [
  index("idx_diaries_author_id").on(table.authorId),
  index("idx_diaries_created_at").on(table.createdAt),
]);

export const diaryComments = pgTable("diary_comments", {
  id: serial("id").primaryKey(),
  diaryId: integer("diary_id").references(() => diaries.id, { onDelete: "cascade" }).notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_diary_comments_diary_id").on(table.diaryId),
  index("idx_diary_comments_author_id").on(table.authorId),
]);

export const whispers = pgTable("whispers", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  type: varchar("type", { length: 20 }).default("text"),
  hearts: integer("hearts").default(0),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  // Emotional Analysis
  detectedEmotion: varchar("detected_emotion", { length: 50 }),
  sentimentScore: integer("sentiment_score"),
  reflectionDepth: integer("reflection_depth"),

  // Whisper System 2.0 Fields
  decayStage: varchar("decay_stage", { length: 20 }).default("fresh"),
  decayProgress: integer("decay_progress").default(0), // 0-100 representing 0.0-1.0
  visibilityOpacity: integer("visibility_opacity").default(100), // 0-100 representing 0.0-1.0
  audioFrequency: integer("audio_frequency"),

  // Resonance tracking
  resonanceScore: integer("resonance_score").default(0),
  interactionCount: integer("interaction_count").default(0),
}, (table) => [
  index("idx_whispers_author_id").on(table.authorId),
  index("idx_whispers_created_at").on(table.createdAt),
  index("idx_whispers_decay_stage").on(table.decayStage),
]);

export const globalConsciousness = pgTable("global_consciousness", {
  id: serial("id").primaryKey(),
  activityLevel: varchar("activity_level", { length: 20 }).default("low"),
  connectedEntities: integer("connected_entities").default(0),
  currentDominantEmotion: varchar("current_dominant_emotion", { length: 50 }),
  realmStability: integer("realm_stability").default(100), // 0-100 representing 0.0-1.0
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const whisperInteractions = pgTable("whisper_interactions", {
  id: serial("id").primaryKey(),
  whisperId: integer("whisper_id").references(() => whispers.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // "resonate", "echo", "absorb"
  weight: integer("weight").default(1),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_whisper_interactions_whisper").on(table.whisperId),
  index("idx_whisper_interactions_user").on(table.userId),
]);

export const mindMaze = pgTable("mind_maze", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  options: text("options").array(),
  responses: integer("responses").default(0),
  authorId: integer("author_id").references(() => users.id),
  isSystem: boolean("is_system").default(false),
  domain: varchar("domain", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mindMazeSparks = pgTable("mind_maze_sparks", {
  id: serial("id").primaryKey(),
  mazeId: integer("maze_id").references(() => mindMaze.id, { onDelete: "cascade" }).notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  sparkType: varchar("spark_type", { length: 20 }).notNull(), // 'analytical' | 'abstract'
  resonance: integer("resonance").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_mind_maze_sparks_maze").on(table.mazeId),
  index("idx_mind_maze_sparks_author").on(table.authorId),
]);

export const nightCircles = pgTable("night_circles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  topic: text("topic"),
  category: varchar("category", { length: 50 }),
  roomType: varchar("room_type", { length: 20 }).default("random"),
  maxMembers: integer("max_members").default(8),
  currentMembers: integer("current_members").default(0),
  isActive: boolean("is_active").default(true),
  // Lifecycle state machine
  state: varchar("state", { length: 20 }).default("forming"), // forming | active | deep_phase | closing | ended
  // Emotion tracking
  primaryEmotion: varchar("primary_emotion", { length: 50 }),
  vibeScore: integer("vibe_score").default(0),
  // Auto-expiry
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_night_circles_state").on(table.state),
  index("idx_night_circles_expires_at").on(table.expiresAt),
]);

// Night Circle Members — anonymous identity per session
export const circleMembers = pgTable("circle_members", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").references(() => nightCircles.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  alias: varchar("alias", { length: 50 }).notNull(),
  avatar: varchar("avatar", { length: 30 }).default("moon_1"),
  mode: varchar("mode", { length: 20 }).default("listener"), // silent | listener | speaker
  state: varchar("state", { length: 20 }).default("active"), // active | inactive
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
}, (table) => [
  index("idx_circle_members_circle_id").on(table.circleId),
  index("idx_circle_members_user_id").on(table.userId),
]);

// Night Circle Messages — chat per circle
export const circleMessages = pgTable("circle_messages", {
  id: serial("id").primaryKey(),
  circleId: integer("circle_id").references(() => nightCircles.id, { onDelete: "cascade" }).notNull(),
  senderAlias: varchar("sender_alias", { length: 50 }).notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  sentimentScore: integer("sentiment_score"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_circle_messages_circle_id").on(table.circleId),
]);

export const midnightCafe = pgTable("midnight_cafe", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  replies: integer("replies").default(0),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_midnight_cafe_author_id").on(table.authorId),
]);

export const cafeReplies = pgTable("cafe_replies", {
  id: serial("id").primaryKey(),
  cafeId: integer("cafe_id").references(() => midnightCafe.id).notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_cafe_replies_cafe_id").on(table.cafeId),
  index("idx_cafe_replies_author_id").on(table.authorId),
]);

// Saved Stations for Music
export const savedStations = pgTable("saved_stations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stationId: text("station_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_saved_stations_user_id").on(table.userId),
]);

// Mood Analytics Logs
export const moodLogs = pgTable("mood_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  emotion: varchar("emotion", { length: 50 }).notNull(),
  sentimentScore: integer("sentiment_score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_mood_logs_user_id").on(table.userId),
]);

// Upsert user schema for auth systems
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  id: z.number().optional(),
  nightPersona: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  preferences: z.any().optional(),
  nightStreak: z.number().optional(),
  meaningfulReplies: z.number().optional(),
  reportCount: z.number().optional(),
  trustScore: z.number().optional(),
  lastActiveTime: z.date().optional(),
});

export const insertDiarySchema = createInsertSchema(diaries).omit({
  id: true,
  createdAt: true,
});

export const insertDiaryCommentSchema = createInsertSchema(diaryComments).omit({
  id: true,
  createdAt: true,
});

export const insertWhisperSchema = createInsertSchema(whispers).omit({
  id: true,
  hearts: true,
  createdAt: true,
  interactionCount: true,
  resonanceScore: true,
});

export const insertGlobalConsciousnessSchema = createInsertSchema(globalConsciousness).omit({
  id: true,
  lastUpdated: true,
});

export const insertWhisperInteractionSchema = createInsertSchema(whisperInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertMindMazeSchema = createInsertSchema(mindMaze).omit({
  id: true,
  responses: true,
  createdAt: true,
});

export const insertMindMazeSparkSchema = createInsertSchema(mindMazeSparks).omit({
  id: true,
  resonance: true,
  createdAt: true,
});

export const insertNightCircleSchema = createInsertSchema(nightCircles).omit({
  id: true,
  currentMembers: true,
  isActive: true,
  state: true,
  vibeScore: true,
  createdAt: true,
});

export const insertCircleMemberSchema = createInsertSchema(circleMembers).omit({
  id: true,
  joinedAt: true,
  leftAt: true,
});

export const insertCircleMessageSchema = createInsertSchema(circleMessages).omit({
  id: true,
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

// ─── Strongly-typed user preferences (stored in the jsonb `preferences` column) ──
export interface UserPreferences {
  // Privacy
  profileVisibility: "public" | "friends" | "private";
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  showActivity: boolean;
  anonymousPosting: boolean;
  // Notifications
  pushNotifications: boolean;
  emailNotifications: boolean;
  mentionNotifications: boolean;
  messageNotifications: boolean;
  circleUpdates: boolean;
  // Appearance
  darkMode: boolean;
  accentColor: "purple" | "blue" | "green" | "orange";
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
  // Night Diaries
  diariesPrivacy: "Private" | "Friends" | "Public";
  diariesAllowComments: boolean;
  diariesShowInFeed: boolean;
  // Whispers
  whispersAutoAnon: boolean;
  whispersReplyNotif: boolean;
  whispersVisibility: "Everyone" | "Night Owls" | "No one";
  // Midnight Cafe
  cafeAutoJoin: boolean;
  cafeShowInFeed: boolean;
  cafeTopic: "Anything" | "Tech" | "Philosophy" | "Art" | "Music";
  // Mind Maze
  mazeNotif: boolean;
  mazeDifficulty: "Easy" | "Medium" | "Hard" | "Any";
  mazeShowSolved: boolean;
  // 3AM Founder
  founderAnon: boolean;
  founderVisibility: "Everyone" | "Founders Only" | "Private";
  founderNotif: boolean;
  // Starlit Speaker
  speakerAutoMic: boolean;
  speakerNotif: boolean;
  speakerDiscoverable: boolean;
  // Night Circles
  circlesAutoJoin: boolean;
  circlesNotif: boolean;
  circlesDiscoverable: boolean;
  // Moon Messenger
  messengerPairing: boolean;
  messengerRequests: "Everyone" | "Mutuals Only" | "No one";
  messengerReadReceipts: boolean;
}

export type Diary = typeof diaries.$inferSelect;
export type InsertDiary = z.infer<typeof insertDiarySchema>;

export type DiaryComment = typeof diaryComments.$inferSelect;
export type InsertDiaryComment = z.infer<typeof insertDiaryCommentSchema>;

export type GlobalConsciousness = typeof globalConsciousness.$inferSelect;
export type InsertGlobalConsciousness = z.infer<typeof insertGlobalConsciousnessSchema>;

export type WhisperInteraction = typeof whisperInteractions.$inferSelect;
export type InsertWhisperInteraction = z.infer<typeof insertWhisperInteractionSchema>;

export type Whisper = typeof whispers.$inferSelect;
export type InsertWhisper = z.infer<typeof insertWhisperSchema>;

export type MindMaze = typeof mindMaze.$inferSelect;
export type InsertMindMaze = z.infer<typeof insertMindMazeSchema>;

export type MindMazeSpark = typeof mindMazeSparks.$inferSelect;
export type InsertMindMazeSpark = z.infer<typeof insertMindMazeSparkSchema>;

export type NightCircle = typeof nightCircles.$inferSelect;
export type InsertNightCircle = z.infer<typeof insertNightCircleSchema>;

export type CircleMember = typeof circleMembers.$inferSelect;
export type InsertCircleMember = z.infer<typeof insertCircleMemberSchema>;

export type CircleMessage = typeof circleMessages.$inferSelect;
export type InsertCircleMessage = z.infer<typeof insertCircleMessageSchema>;


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

// Replies for Night Thoughts — stores actual reply content
export const nightThoughtReplies = pgTable("night_thought_replies", {
  id: serial("id").primaryKey(),
  thoughtId: integer("thought_id").references(() => nightThoughts.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id), // nullable = anonymous
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_night_thought_replies_thought_id").on(table.thoughtId),
]);

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

// 3AM Founder Replies - Conversations around founder posts
export const amFounderReplies = pgTable("am_founder_replies", {
  id: serial("id").primaryKey(),
  founderId: integer("founder_id").references(() => amFounder.id).notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id), // Nullable for anonymous
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_am_founder_replies_founder_id").on(table.founderId),
  index("idx_am_founder_replies_author_id").on(table.authorId),
]);

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
}, (table) => [
  index("idx_starlit_speaker_is_active").on(table.isActive),
  index("idx_starlit_speaker_created_at").on(table.createdAt),
]);

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
}, (table) => [
  index("idx_user_reflections_prompt_id").on(table.promptId),
  index("idx_user_reflections_user_id").on(table.userId),
]);

export const personalReflections = pgTable("personal_reflections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  userQuery: text("user_query").notNull(),
  aiReflection: text("ai_reflection").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_personal_reflections_user_id").on(table.userId),
]);

export const insertAmFounderSchema = createInsertSchema(amFounder).omit({
  id: true,
  upvotes: true,
  comments: true,
  createdAt: true,
});

export const insertAmFounderReplySchema = createInsertSchema(amFounderReplies).omit({
  id: true,
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

export type AmFounderReply = typeof amFounderReplies.$inferSelect;
export type InsertAmFounderReply = z.infer<typeof insertAmFounderReplySchema>;



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

export const insertNightThoughtReplySchema = createInsertSchema(nightThoughtReplies).omit({
  id: true,
  createdAt: true,
});

export type NightThought = typeof nightThoughts.$inferSelect;
export type InsertNightThought = z.infer<typeof insertNightThoughtSchema>;

export type NightThoughtReply = typeof nightThoughtReplies.$inferSelect;
export type InsertNightThoughtReply = z.infer<typeof insertNightThoughtReplySchema>;

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
  isEphemeral: boolean("is_ephemeral").default(false),
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
  index("idx_silent_lines_user_id").on(table.userId),
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

// Playlists for Music
export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_playlists_user_id").on(table.userId),
]);

export const playlistTracks = pgTable("playlist_tracks", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").references(() => playlists.id, { onDelete: "cascade" }).notNull(),
  trackId: text("track_id").notNull(),
  trackTitle: text("track_title").notNull(),
  trackArtist: text("track_artist").notNull(),
  trackUrl: text("track_url").notNull(),
  trackCoverArt: text("track_cover_art"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_playlist_tracks_playlist_id").on(table.playlistId),
]);

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
});

export const insertPlaylistTrackSchema = createInsertSchema(playlistTracks).omit({
  id: true,
  createdAt: true,
});

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;

export type PlaylistTrack = typeof playlistTracks.$inferSelect;
export type InsertPlaylistTrack = z.infer<typeof insertPlaylistTrackSchema>;
