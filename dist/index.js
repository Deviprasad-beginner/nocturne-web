var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/utils/logger.ts
import pino from "pino";
var isDev, _pino, logger;
var init_logger = __esm({
  "server/utils/logger.ts"() {
    "use strict";
    isDev = process.env.NODE_ENV !== "production";
    _pino = pino({
      level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
      ...isDev ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:HH:MM:ss",
            ignore: "pid,hostname"
          }
        }
      } : {}
    });
    logger = {
      info: (message, meta) => meta !== void 0 ? _pino.info({ meta }, message) : _pino.info(message),
      warn: (message, meta) => meta !== void 0 ? _pino.warn({ meta }, message) : _pino.warn(message),
      /** Accepts legacy (message, error) order used across the codebase. */
      error: (message, error) => {
        if (error instanceof Error) {
          _pino.error({ err: error }, message);
        } else if (error !== void 0) {
          _pino.error({ meta: error }, message);
        } else {
          _pino.error(message);
        }
      },
      debug: (message, meta) => meta !== void 0 ? _pino.debug({ meta }, message) : _pino.debug(message),
      /** Expose the underlying pino instance for pino-http */
      child: _pino.child.bind(_pino),
      /** For pino-http compatibility */
      _pino
    };
  }
});

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  amFounder: () => amFounder,
  amFounderReplies: () => amFounderReplies,
  cafeReplies: () => cafeReplies,
  circleMembers: () => circleMembers,
  circleMessages: () => circleMessages,
  diaries: () => diaries,
  diaryComments: () => diaryComments,
  globalConsciousness: () => globalConsciousness,
  insertAmFounderReplySchema: () => insertAmFounderReplySchema,
  insertAmFounderSchema: () => insertAmFounderSchema,
  insertCafeReplySchema: () => insertCafeReplySchema,
  insertCircleMemberSchema: () => insertCircleMemberSchema,
  insertCircleMessageSchema: () => insertCircleMessageSchema,
  insertDiaryCommentSchema: () => insertDiaryCommentSchema,
  insertDiarySchema: () => insertDiarySchema,
  insertGlobalConsciousnessSchema: () => insertGlobalConsciousnessSchema,
  insertMidnightCafeSchema: () => insertMidnightCafeSchema,
  insertMindMazeSchema: () => insertMindMazeSchema,
  insertMindMazeSparkSchema: () => insertMindMazeSparkSchema,
  insertMoonMessengerSchema: () => insertMoonMessengerSchema,
  insertNightCircleSchema: () => insertNightCircleSchema,
  insertNightThoughtReplySchema: () => insertNightThoughtReplySchema,
  insertNightThoughtSchema: () => insertNightThoughtSchema,
  insertNightlyPromptSchema: () => insertNightlyPromptSchema,
  insertPersonalReflectionSchema: () => insertPersonalReflectionSchema,
  insertPlaylistSchema: () => insertPlaylistSchema,
  insertPlaylistTrackSchema: () => insertPlaylistTrackSchema,
  insertPrivateHighlightSchema: () => insertPrivateHighlightSchema,
  insertReadSchema: () => insertReadSchema,
  insertReadSessionSchema: () => insertReadSessionSchema,
  insertSavedStationSchema: () => insertSavedStationSchema,
  insertSilentLineSchema: () => insertSilentLineSchema,
  insertStarlitSpeakerSchema: () => insertStarlitSpeakerSchema,
  insertUserReflectionSchema: () => insertUserReflectionSchema,
  insertUserSchema: () => insertUserSchema,
  insertWhisperInteractionSchema: () => insertWhisperInteractionSchema,
  insertWhisperSchema: () => insertWhisperSchema,
  midnightCafe: () => midnightCafe,
  mindMaze: () => mindMaze,
  mindMazeSparks: () => mindMazeSparks,
  moodLogs: () => moodLogs,
  moonMessenger: () => moonMessenger,
  nightCircles: () => nightCircles,
  nightThoughtReplies: () => nightThoughtReplies,
  nightThoughts: () => nightThoughts,
  nightlyPrompts: () => nightlyPrompts,
  personalReflections: () => personalReflections,
  playlistTracks: () => playlistTracks,
  playlists: () => playlists,
  privateHighlights: () => privateHighlights,
  readSessions: () => readSessions,
  reads: () => reads,
  savedStations: () => savedStations,
  sessions: () => sessions,
  silentLines: () => silentLines,
  starlitSpeaker: () => starlitSpeaker,
  upsertUserSchema: () => upsertUserSchema,
  userReflections: () => userReflections,
  users: () => users,
  whisperInteractions: () => whisperInteractions,
  whispers: () => whispers
});
import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions, users, diaries, diaryComments, whispers, globalConsciousness, whisperInteractions, mindMaze, mindMazeSparks, nightCircles, circleMembers, circleMessages, midnightCafe, cafeReplies, savedStations, moodLogs, upsertUserSchema, insertUserSchema, insertDiarySchema, insertDiaryCommentSchema, insertWhisperSchema, insertGlobalConsciousnessSchema, insertWhisperInteractionSchema, insertMindMazeSchema, insertMindMazeSparkSchema, insertNightCircleSchema, insertCircleMemberSchema, insertCircleMessageSchema, insertMidnightCafeSchema, insertCafeReplySchema, insertSavedStationSchema, nightThoughts, nightThoughtReplies, amFounder, amFounderReplies, starlitSpeaker, moonMessenger, nightlyPrompts, userReflections, personalReflections, insertAmFounderSchema, insertAmFounderReplySchema, insertStarlitSpeakerSchema, insertMoonMessengerSchema, insertNightlyPromptSchema, insertUserReflectionSchema, insertPersonalReflectionSchema, insertNightThoughtSchema, insertNightThoughtReplySchema, reads, readSessions, privateHighlights, silentLines, insertReadSchema, insertReadSessionSchema, insertPrivateHighlightSchema, insertSilentLineSchema, playlists, playlistTracks, insertPlaylistSchema, insertPlaylistTrackSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable("users", {
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
      lastActiveTime: timestamp("last_active_time")
    }, (table) => [
      index("idx_users_last_active_time").on(table.lastActiveTime)
    ]);
    diaries = pgTable("diaries", {
      id: serial("id").primaryKey(),
      content: text("content").notNull(),
      isPublic: boolean("is_public").default(false),
      mood: varchar("mood", { length: 100 }),
      authorId: integer("author_id").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow(),
      // Emotional Analysis
      detectedEmotion: varchar("detected_emotion", { length: 50 }),
      sentimentScore: integer("sentiment_score"),
      // multiplied by 100 to store as int or use real/double precision if supported by driver, but drizzle pg-core usually supports real. Let's use real.
      reflectionDepth: integer("reflection_depth")
      // scaled 0-100
    }, (table) => [
      index("idx_diaries_author_id").on(table.authorId),
      index("idx_diaries_created_at").on(table.createdAt)
    ]);
    diaryComments = pgTable("diary_comments", {
      id: serial("id").primaryKey(),
      diaryId: integer("diary_id").references(() => diaries.id, { onDelete: "cascade" }).notNull(),
      authorId: integer("author_id").references(() => users.id).notNull(),
      content: text("content").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_diary_comments_diary_id").on(table.diaryId),
      index("idx_diary_comments_author_id").on(table.authorId)
    ]);
    whispers = pgTable("whispers", {
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
      decayProgress: integer("decay_progress").default(0),
      // 0-100 representing 0.0-1.0
      visibilityOpacity: integer("visibility_opacity").default(100),
      // 0-100 representing 0.0-1.0
      audioFrequency: integer("audio_frequency"),
      // Resonance tracking
      resonanceScore: integer("resonance_score").default(0),
      interactionCount: integer("interaction_count").default(0)
    }, (table) => [
      index("idx_whispers_author_id").on(table.authorId),
      index("idx_whispers_created_at").on(table.createdAt),
      index("idx_whispers_decay_stage").on(table.decayStage)
    ]);
    globalConsciousness = pgTable("global_consciousness", {
      id: serial("id").primaryKey(),
      activityLevel: varchar("activity_level", { length: 20 }).default("low"),
      connectedEntities: integer("connected_entities").default(0),
      currentDominantEmotion: varchar("current_dominant_emotion", { length: 50 }),
      realmStability: integer("realm_stability").default(100),
      // 0-100 representing 0.0-1.0
      lastUpdated: timestamp("last_updated").defaultNow()
    });
    whisperInteractions = pgTable("whisper_interactions", {
      id: serial("id").primaryKey(),
      whisperId: integer("whisper_id").references(() => whispers.id, { onDelete: "cascade" }).notNull(),
      userId: integer("user_id").references(() => users.id).notNull(),
      type: varchar("type", { length: 20 }).notNull(),
      // "resonate", "echo", "absorb"
      weight: integer("weight").default(1),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_whisper_interactions_whisper").on(table.whisperId),
      index("idx_whisper_interactions_user").on(table.userId)
    ]);
    mindMaze = pgTable("mind_maze", {
      id: serial("id").primaryKey(),
      type: text("type").notNull(),
      content: text("content").notNull(),
      options: text("options").array(),
      responses: integer("responses").default(0),
      authorId: integer("author_id").references(() => users.id),
      isSystem: boolean("is_system").default(false),
      domain: varchar("domain", { length: 50 }),
      createdAt: timestamp("created_at").defaultNow()
    });
    mindMazeSparks = pgTable("mind_maze_sparks", {
      id: serial("id").primaryKey(),
      mazeId: integer("maze_id").references(() => mindMaze.id, { onDelete: "cascade" }).notNull(),
      authorId: integer("author_id").references(() => users.id).notNull(),
      content: text("content").notNull(),
      sparkType: varchar("spark_type", { length: 20 }).notNull(),
      // 'analytical' | 'abstract'
      resonance: integer("resonance").default(0),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_mind_maze_sparks_maze").on(table.mazeId),
      index("idx_mind_maze_sparks_author").on(table.authorId)
    ]);
    nightCircles = pgTable("night_circles", {
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
      state: varchar("state", { length: 20 }).default("forming"),
      // forming | active | deep_phase | closing | ended
      // Emotion tracking
      primaryEmotion: varchar("primary_emotion", { length: 50 }),
      vibeScore: integer("vibe_score").default(0),
      // Auto-expiry
      expiresAt: timestamp("expires_at"),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_night_circles_state").on(table.state),
      index("idx_night_circles_expires_at").on(table.expiresAt)
    ]);
    circleMembers = pgTable("circle_members", {
      id: serial("id").primaryKey(),
      circleId: integer("circle_id").references(() => nightCircles.id, { onDelete: "cascade" }).notNull(),
      userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
      alias: varchar("alias", { length: 50 }).notNull(),
      avatar: varchar("avatar", { length: 30 }).default("moon_1"),
      mode: varchar("mode", { length: 20 }).default("listener"),
      // silent | listener | speaker
      state: varchar("state", { length: 20 }).default("active"),
      // active | inactive
      joinedAt: timestamp("joined_at").defaultNow(),
      leftAt: timestamp("left_at")
    }, (table) => [
      index("idx_circle_members_circle_id").on(table.circleId),
      index("idx_circle_members_user_id").on(table.userId)
    ]);
    circleMessages = pgTable("circle_messages", {
      id: serial("id").primaryKey(),
      circleId: integer("circle_id").references(() => nightCircles.id, { onDelete: "cascade" }).notNull(),
      senderAlias: varchar("sender_alias", { length: 50 }).notNull(),
      content: text("content").notNull(),
      imageUrl: text("image_url"),
      sentimentScore: integer("sentiment_score"),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_circle_messages_circle_id").on(table.circleId)
    ]);
    midnightCafe = pgTable("midnight_cafe", {
      id: serial("id").primaryKey(),
      topic: text("topic").notNull(),
      content: text("content").notNull(),
      category: varchar("category", { length: 100 }),
      replies: integer("replies").default(0),
      authorId: integer("author_id").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_midnight_cafe_author_id").on(table.authorId)
    ]);
    cafeReplies = pgTable("cafe_replies", {
      id: serial("id").primaryKey(),
      cafeId: integer("cafe_id").references(() => midnightCafe.id).notNull(),
      content: text("content").notNull(),
      authorId: integer("author_id").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_cafe_replies_cafe_id").on(table.cafeId),
      index("idx_cafe_replies_author_id").on(table.authorId)
    ]);
    savedStations = pgTable("saved_stations", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id).notNull(),
      stationId: text("station_id").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_saved_stations_user_id").on(table.userId)
    ]);
    moodLogs = pgTable("mood_logs", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id).notNull(),
      emotion: varchar("emotion", { length: 50 }).notNull(),
      sentimentScore: integer("sentiment_score").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_mood_logs_user_id").on(table.userId)
    ]);
    upsertUserSchema = createInsertSchema(users).omit({
      createdAt: true
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true
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
      lastActiveTime: z.date().optional()
    });
    insertDiarySchema = createInsertSchema(diaries).omit({
      id: true,
      createdAt: true
    });
    insertDiaryCommentSchema = createInsertSchema(diaryComments).omit({
      id: true,
      createdAt: true
    });
    insertWhisperSchema = createInsertSchema(whispers).omit({
      id: true,
      hearts: true,
      createdAt: true,
      interactionCount: true,
      resonanceScore: true
    });
    insertGlobalConsciousnessSchema = createInsertSchema(globalConsciousness).omit({
      id: true,
      lastUpdated: true
    });
    insertWhisperInteractionSchema = createInsertSchema(whisperInteractions).omit({
      id: true,
      createdAt: true
    });
    insertMindMazeSchema = createInsertSchema(mindMaze).omit({
      id: true,
      responses: true,
      createdAt: true
    });
    insertMindMazeSparkSchema = createInsertSchema(mindMazeSparks).omit({
      id: true,
      resonance: true,
      createdAt: true
    });
    insertNightCircleSchema = createInsertSchema(nightCircles).omit({
      id: true,
      currentMembers: true,
      isActive: true,
      state: true,
      vibeScore: true,
      createdAt: true
    });
    insertCircleMemberSchema = createInsertSchema(circleMembers).omit({
      id: true,
      joinedAt: true,
      leftAt: true
    });
    insertCircleMessageSchema = createInsertSchema(circleMessages).omit({
      id: true,
      createdAt: true
    });
    insertMidnightCafeSchema = createInsertSchema(midnightCafe).omit({
      id: true,
      replies: true,
      createdAt: true
    });
    insertCafeReplySchema = createInsertSchema(cafeReplies).omit({
      id: true,
      createdAt: true
    });
    insertSavedStationSchema = createInsertSchema(savedStations).omit({
      id: true,
      createdAt: true
    });
    nightThoughts = pgTable("night_thoughts", {
      id: serial("id").primaryKey(),
      content: text("content").notNull(),
      // Smart categorization - auto-detected based on content and user intent
      thoughtType: varchar("thought_type", { length: 50 }),
      // "whisper" | "diary" | "discussion"
      topic: text("topic"),
      // For discussion-style posts
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
      expiresAt: timestamp("expires_at")
      // For ephemeral whisper-style thoughts
    });
    nightThoughtReplies = pgTable("night_thought_replies", {
      id: serial("id").primaryKey(),
      thoughtId: integer("thought_id").references(() => nightThoughts.id, { onDelete: "cascade" }).notNull(),
      content: text("content").notNull(),
      authorId: integer("author_id").references(() => users.id),
      // nullable = anonymous
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_night_thought_replies_thought_id").on(table.thoughtId)
    ]);
    amFounder = pgTable("am_founder", {
      id: serial("id").primaryKey(),
      content: text("content").notNull(),
      category: text("category").notNull(),
      upvotes: integer("upvotes").default(0),
      comments: integer("comments").default(0),
      authorId: integer("author_id").references(() => users.id),
      createdAt: timestamp("created_at").defaultNow()
    });
    amFounderReplies = pgTable("am_founder_replies", {
      id: serial("id").primaryKey(),
      founderId: integer("founder_id").references(() => amFounder.id).notNull(),
      content: text("content").notNull(),
      authorId: integer("author_id").references(() => users.id),
      // Nullable for anonymous
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_am_founder_replies_founder_id").on(table.founderId),
      index("idx_am_founder_replies_author_id").on(table.authorId)
    ]);
    starlitSpeaker = pgTable("starlit_speaker", {
      id: serial("id").primaryKey(),
      roomName: text("room_name").notNull(),
      description: text("description").notNull(),
      topic: text("topic").notNull(),
      maxParticipants: integer("max_participants").default(8),
      currentParticipants: integer("current_participants").default(1),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_starlit_speaker_is_active").on(table.isActive),
      index("idx_starlit_speaker_created_at").on(table.createdAt)
    ]);
    moonMessenger = pgTable("moon_messenger", {
      id: serial("id").primaryKey(),
      sessionId: text("session_id").notNull(),
      message: text("message").notNull(),
      sender: text("sender").notNull(),
      timestamp: timestamp("timestamp").defaultNow(),
      isActive: boolean("is_active").default(true)
    });
    nightlyPrompts = pgTable("nightly_prompts", {
      id: serial("id").primaryKey(),
      content: text("content").notNull(),
      shiftMode: varchar("shift_mode", { length: 50 }).notNull(),
      // reverse_causality|silence_variable|assumption_test|skipped_detail|two_futures
      createdAt: timestamp("created_at").defaultNow(),
      expiresAt: timestamp("expires_at").notNull()
    });
    userReflections = pgTable("user_reflections", {
      id: serial("id").primaryKey(),
      promptId: integer("prompt_id").references(() => nightlyPrompts.id).notNull(),
      userId: integer("user_id").references(() => users.id).notNull(),
      responseContent: text("response_content").notNull(),
      aiEvaluation: jsonb("ai_evaluation"),
      // Stores AI's reflection on the response
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_user_reflections_prompt_id").on(table.promptId),
      index("idx_user_reflections_user_id").on(table.userId)
    ]);
    personalReflections = pgTable("personal_reflections", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id).notNull(),
      userQuery: text("user_query").notNull(),
      aiReflection: text("ai_reflection").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_personal_reflections_user_id").on(table.userId)
    ]);
    insertAmFounderSchema = createInsertSchema(amFounder).omit({
      id: true,
      upvotes: true,
      comments: true,
      createdAt: true
    });
    insertAmFounderReplySchema = createInsertSchema(amFounderReplies).omit({
      id: true,
      createdAt: true
    });
    insertStarlitSpeakerSchema = createInsertSchema(starlitSpeaker).omit({
      id: true,
      currentParticipants: true,
      isActive: true,
      createdAt: true
    });
    insertMoonMessengerSchema = createInsertSchema(moonMessenger).omit({
      id: true,
      isActive: true,
      timestamp: true
    });
    insertNightlyPromptSchema = createInsertSchema(nightlyPrompts).omit({
      id: true,
      createdAt: true
    });
    insertUserReflectionSchema = createInsertSchema(userReflections).omit({
      id: true,
      createdAt: true,
      aiEvaluation: true
    });
    insertPersonalReflectionSchema = createInsertSchema(personalReflections).omit({
      id: true,
      createdAt: true,
      aiReflection: true
    });
    insertNightThoughtSchema = createInsertSchema(nightThoughts).omit({
      id: true,
      hearts: true,
      replies: true,
      createdAt: true
    });
    insertNightThoughtReplySchema = createInsertSchema(nightThoughtReplies).omit({
      id: true,
      createdAt: true
    });
    reads = pgTable("reads", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      author: text("author"),
      content: text("content"),
      // For short text content
      contentUrl: text("content_url"),
      // For uploaded files
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
      lastAccessedAt: timestamp("last_accessed_at")
    }, (table) => [
      index("idx_reads_visibility").on(table.visibility, table.moderationStatus),
      index("idx_reads_owner_visibility").on(table.ownerId, table.visibility),
      index("idx_reads_expires_at").on(table.expiresAt)
    ]);
    readSessions = pgTable("read_sessions", {
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
      lastActivityAt: timestamp("last_activity_at").defaultNow()
    }, (table) => [
      index("idx_read_sessions_user").on(table.userId),
      index("idx_read_sessions_read").on(table.readId)
    ]);
    privateHighlights = pgTable("private_highlights", {
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
      expiresAt: timestamp("expires_at")
    }, (table) => [
      index("idx_private_highlights_user_read").on(table.userId, table.readId),
      index("idx_private_highlights_expires").on(table.expiresAt)
    ]);
    silentLines = pgTable("silent_lines", {
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
      expiresAt: timestamp("expires_at")
    }, (table) => [
      index("idx_silent_lines_read_expires").on(table.readId, table.expiresAt),
      index("idx_silent_lines_user_id").on(table.userId)
    ]);
    insertReadSchema = createInsertSchema(reads).omit({
      id: true,
      createdAt: true,
      lastAccessedAt: true,
      moderationStatus: true,
      moderationNotes: true
    });
    insertReadSessionSchema = createInsertSchema(readSessions).omit({
      id: true,
      startedAt: true,
      lastActivityAt: true,
      totalTimeSeconds: true,
      completed: true
    });
    insertPrivateHighlightSchema = createInsertSchema(privateHighlights).omit({
      id: true,
      createdAt: true
    });
    insertSilentLineSchema = createInsertSchema(silentLines).omit({
      id: true,
      createdAt: true,
      flagged: true,
      flagReason: true
    });
    playlists = pgTable("playlists", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id).notNull(),
      name: text("name").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_playlists_user_id").on(table.userId)
    ]);
    playlistTracks = pgTable("playlist_tracks", {
      id: serial("id").primaryKey(),
      playlistId: integer("playlist_id").references(() => playlists.id, { onDelete: "cascade" }).notNull(),
      trackId: text("track_id").notNull(),
      trackTitle: text("track_title").notNull(),
      trackArtist: text("track_artist").notNull(),
      trackUrl: text("track_url").notNull(),
      trackCoverArt: text("track_cover_art"),
      createdAt: timestamp("created_at").defaultNow()
    }, (table) => [
      index("idx_playlist_tracks_playlist_id").on(table.playlistId)
    ]);
    insertPlaylistSchema = createInsertSchema(playlists).omit({
      id: true,
      createdAt: true
    });
    insertPlaylistTrackSchema = createInsertSchema(playlistTracks).omit({
      id: true,
      createdAt: true
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  pool: () => pool
});
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
var Pool, pool, dbInstance, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    config({ override: true });
    ({ Pool } = pg);
    if (process.env.DATABASE_URL) {
      const dbUrl = new URL(process.env.DATABASE_URL);
      const connectionString = new URL(process.env.DATABASE_URL);
      connectionString.searchParams.delete("sslmode");
      connectionString.searchParams.delete("ssl");
      const safeUrl = new URL(process.env.DATABASE_URL);
      safeUrl.password = "*****";
      console.log(`[DB] Connecting to: ${safeUrl.toString()}`);
      console.log(`[DB] SNI Servername: ${process.env.DB_SNI_SERVERNAME || dbUrl.hostname}`);
      console.log(`[DB] Password length: ${dbUrl.password.length}`);
      pool = new Pool({
        connectionString: connectionString.toString(),
        // ── Connection pool tuning ──────────────────────────────────────────────
        // Neon free tier allows up to 20 simultaneous connections.
        // Paid tiers support 50+; raise `max` accordingly.
        max: 20,
        // Release idle connections after 30 s to avoid Neon's idle-timeout drops.
        idleTimeoutMillis: 3e4,
        // Neon free tier can take up to 8 s to wake from sleep (cold start).
        // 10 s gives it enough headroom without hanging forever.
        connectionTimeoutMillis: 1e4,
        // ── SSL (required for Neon) ─────────────────────────────────────────────
        ssl: {
          rejectUnauthorized: false,
          servername: process.env.DB_SNI_SERVERNAME || dbUrl.hostname,
          checkServerIdentity: () => void 0
        }
      });
      pool.on("error", (err) => {
        console.error("Unexpected error on idle client", err);
      });
      dbInstance = drizzle(pool, { schema: schema_exports });
    } else {
      throw new Error(
        "\u274C DATABASE_URL is not set. Cannot start the server without a database connection.\nPlease create a .env file with DATABASE_URL set to your Postgres connection string."
      );
    }
    db = dbInstance;
  }
});

// server/repositories/user.repository.ts
import { eq } from "drizzle-orm";
async function getUser(id) {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  } catch (error) {
    logger.error("Error getting user:", error);
    throw error;
  }
}
async function getUserByUsername(username) {
  try {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  } catch (error) {
    logger.error("Error getting user by username:", error);
    return void 0;
  }
}
async function getUserByEmail(email) {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  } catch (error) {
    logger.error("Error getting user by email:", error);
    return void 0;
  }
}
async function getUserByGoogleId(googleId) {
  try {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || void 0;
  } catch (error) {
    logger.error("Error getting user by googleId:", error);
    return void 0;
  }
}
async function createUser(insertUser) {
  const [user] = await db.insert(users).values(insertUser).returning();
  return user;
}
async function upsertUser(_user) {
  throw new Error("Upsert not implemented for standard auth");
}
async function updateUserOnboarding(userId, completed) {
  await db.update(users).set({ hasSeenOnboarding: completed }).where(eq(users.id, userId));
}
async function updateUser(userId, data) {
  try {
    const [updatedUser] = await db.update(users).set(data).where(eq(users.id, userId)).returning();
    return updatedUser || void 0;
  } catch (error) {
    logger.error("Error updating user:", error);
    return void 0;
  }
}
var init_user_repository = __esm({
  "server/repositories/user.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_logger();
  }
});

// server/repositories/diary.repository.ts
var diary_repository_exports = {};
__export(diary_repository_exports, {
  createDiary: () => createDiary,
  createDiaryComment: () => createDiaryComment,
  deleteDiary: () => deleteDiary,
  getDiaries: () => getDiaries,
  getDiary: () => getDiary,
  getDiaryComments: () => getDiaryComments,
  getUserDiaries: () => getUserDiaries
});
import { eq as eq2, desc, or } from "drizzle-orm";
function capLimit(limit) {
  return Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT);
}
async function createDiary(diary) {
  const [newDiary] = await db.insert(diaries).values(diary).returning();
  if (diary.authorId) {
    try {
      const [user] = await db.select().from(users).where(eq2(users.id, diary.authorId));
      if (user) {
        const now = /* @__PURE__ */ new Date();
        const lastEntry = user.lastEntryDate ? new Date(user.lastEntryDate) : null;
        let newStreak = user.currentStreak || 0;
        if (!lastEntry) {
          newStreak = 1;
        } else {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const last = new Date(lastEntry.getFullYear(), lastEntry.getMonth(), lastEntry.getDate());
          const diffDays = Math.ceil(Math.abs(today.getTime() - last.getTime()) / (1e3 * 60 * 60 * 24));
          if (diffDays === 1) {
            newStreak++;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        }
        await db.update(users).set({ currentStreak: newStreak, lastEntryDate: now }).where(eq2(users.id, diary.authorId));
      }
    } catch (error) {
      logger.error("Error updating user streak:", error);
    }
  }
  return newDiary;
}
async function getDiaries(viewerId, limit) {
  try {
    const safeLimit = capLimit(limit);
    if (viewerId) {
      const results = await db.select({ diary: diaries, author: users }).from(diaries).leftJoin(users, eq2(diaries.authorId, users.id)).where(or(eq2(diaries.isPublic, true), eq2(diaries.authorId, viewerId))).orderBy(desc(diaries.createdAt)).limit(safeLimit);
      return results.map((r) => ({ ...r.diary, author: r.author || void 0 }));
    } else {
      const results = await db.select({ diary: diaries, author: users }).from(diaries).leftJoin(users, eq2(diaries.authorId, users.id)).where(eq2(diaries.isPublic, true)).orderBy(desc(diaries.createdAt)).limit(safeLimit);
      return results.map((r) => ({ ...r.diary, author: r.author || void 0 }));
    }
  } catch (error) {
    logger.error("Error getting diaries:", error);
    return [];
  }
}
async function getDiary(id) {
  try {
    const [diary] = await db.select().from(diaries).where(eq2(diaries.id, id));
    return diary || void 0;
  } catch (error) {
    logger.error("Error getting diary:", error);
    return void 0;
  }
}
async function deleteDiary(id) {
  try {
    const result = await db.delete(diaries).where(eq2(diaries.id, id)).returning();
    return result.length > 0;
  } catch (error) {
    logger.error("Error deleting diary:", error);
    return false;
  }
}
async function getUserDiaries(userId, limit) {
  try {
    return await db.select().from(diaries).where(eq2(diaries.authorId, userId)).orderBy(desc(diaries.createdAt)).limit(capLimit(limit));
  } catch (error) {
    logger.error("Error getting user diaries:", error);
    return [];
  }
}
async function createDiaryComment(comment) {
  try {
    const [newComment] = await db.insert(diaryComments).values(comment).returning();
    return newComment;
  } catch (error) {
    logger.error("Error creating diary comment:", error);
    throw error;
  }
}
async function getDiaryComments(diaryId, limit) {
  try {
    const results = await db.select({ comment: diaryComments, author: users }).from(diaryComments).leftJoin(users, eq2(diaryComments.authorId, users.id)).where(eq2(diaryComments.diaryId, diaryId)).orderBy(desc(diaryComments.createdAt)).limit(capLimit(limit));
    return results.map((r) => ({ ...r.comment, author: r.author || void 0 }));
  } catch (error) {
    logger.error("Error getting diary comments:", error);
    return [];
  }
}
var DEFAULT_LIMIT, MAX_LIMIT;
var init_diary_repository = __esm({
  "server/repositories/diary.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_logger();
    DEFAULT_LIMIT = 20;
    MAX_LIMIT = 100;
  }
});

// server/repositories/whisper.repository.ts
import { eq as eq3, desc as desc2, sql } from "drizzle-orm";
async function createWhisper(whisper) {
  const [newWhisper] = await db.insert(whispers).values(whisper).returning();
  return newWhisper;
}
async function getWhispers(limit) {
  try {
    const safeLimit = Math.min(limit ?? 20, MAX_LIMIT2);
    const results = await db.select({ whisper: whispers, author: users }).from(whispers).leftJoin(users, eq3(whispers.authorId, users.id)).orderBy(desc2(whispers.createdAt)).limit(safeLimit);
    return results.map((r) => ({ ...r.whisper, author: r.author || void 0 }));
  } catch (error) {
    logger.error("Error getting whispers:", error);
    return [];
  }
}
async function incrementWhisperHearts(id) {
  try {
    await db.update(whispers).set({ hearts: sql`${whispers.hearts} + 1` }).where(eq3(whispers.id, id));
  } catch (error) {
    logger.error("Error incrementing whisper hearts:", error);
  }
}
async function getUserWhispers(userId, limit) {
  try {
    return await db.select().from(whispers).where(eq3(whispers.authorId, userId)).orderBy(desc2(whispers.createdAt)).limit(Math.min(limit ?? 20, MAX_LIMIT2));
  } catch (error) {
    logger.error("Error getting user whispers:", error);
    return [];
  }
}
var MAX_LIMIT2;
var init_whisper_repository = __esm({
  "server/repositories/whisper.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_logger();
    MAX_LIMIT2 = 100;
  }
});

// server/repositories/night-circle.repository.ts
import { eq as eq4, desc as desc3 } from "drizzle-orm";
async function createNightCircle(circle) {
  const [newCircle] = await db.insert(nightCircles).values(circle).returning();
  return newCircle;
}
async function getNightCircles(limit) {
  try {
    return await db.select().from(nightCircles).orderBy(desc3(nightCircles.createdAt)).limit(Math.min(limit ?? 20, MAX_LIMIT3));
  } catch (error) {
    logger.error("Error getting night circles:", error);
    return [];
  }
}
async function updateNightCircleMembers(id, members) {
  try {
    await db.update(nightCircles).set({ currentMembers: members }).where(eq4(nightCircles.id, id));
  } catch (error) {
    logger.error("Error updating night circle members:", error);
  }
}
var MAX_LIMIT3;
var init_night_circle_repository = __esm({
  "server/repositories/night-circle.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_logger();
    MAX_LIMIT3 = 100;
  }
});

// server/repositories/midnight-cafe.repository.ts
import { eq as eq5, desc as desc4, asc, sql as sql3 } from "drizzle-orm";
async function createMidnightCafe(cafe) {
  const [newCafe] = await db.insert(midnightCafe).values(cafe).returning();
  return newCafe;
}
async function getMidnightCafe(limit) {
  try {
    const safeLimit = Math.min(limit ?? 20, MAX_LIMIT4);
    const results = await db.select({ cafe: midnightCafe, author: users }).from(midnightCafe).leftJoin(users, eq5(midnightCafe.authorId, users.id)).orderBy(desc4(midnightCafe.createdAt)).limit(safeLimit);
    return results.map((r) => ({ ...r.cafe, author: r.author || void 0 }));
  } catch (error) {
    logger.error("Error getting midnight cafe:", error);
    return [];
  }
}
async function getMidnightCafeById(id) {
  try {
    const results = await db.select({ cafe: midnightCafe, author: users }).from(midnightCafe).leftJoin(users, eq5(midnightCafe.authorId, users.id)).where(eq5(midnightCafe.id, id)).limit(1);
    if (results.length === 0) return void 0;
    const r = results[0];
    return { ...r.cafe, author: r.author || void 0 };
  } catch (error) {
    logger.error("Error getting midnight cafe by id:", error);
    return void 0;
  }
}
async function incrementCafeReplies(id) {
  try {
    await db.update(midnightCafe).set({ replies: sql3`${midnightCafe.replies} + 1` }).where(eq5(midnightCafe.id, id));
  } catch (error) {
    logger.error("Error incrementing cafe replies:", error);
  }
}
async function getCafeReplies(cafeId) {
  try {
    return await db.select().from(cafeReplies).where(eq5(cafeReplies.cafeId, cafeId)).orderBy(asc(cafeReplies.createdAt));
  } catch (error) {
    logger.error("Error getting cafe replies:", error);
    return [];
  }
}
async function createCafeReply(reply) {
  const [newReply] = await db.insert(cafeReplies).values(reply).returning();
  return newReply;
}
async function deleteCafePost(id) {
  await db.delete(cafeReplies).where(eq5(cafeReplies.cafeId, id));
  await db.delete(midnightCafe).where(eq5(midnightCafe.id, id));
}
async function deleteCafeReply(id) {
  await db.delete(cafeReplies).where(eq5(cafeReplies.id, id));
}
async function getUserCafePosts(userId, limit) {
  try {
    return await db.select().from(midnightCafe).where(eq5(midnightCafe.authorId, userId)).orderBy(desc4(midnightCafe.createdAt)).limit(Math.min(limit ?? 20, MAX_LIMIT4));
  } catch (error) {
    logger.error("Error getting user cafe posts:", error);
    return [];
  }
}
var MAX_LIMIT4;
var init_midnight_cafe_repository = __esm({
  "server/repositories/midnight-cafe.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_logger();
    MAX_LIMIT4 = 100;
  }
});

// server/repositories/am-founder.repository.ts
import { eq as eq6, desc as desc5, asc as asc2, sql as sql4 } from "drizzle-orm";
async function createAmFounder(founder) {
  const [newFounder] = await db.insert(amFounder).values(founder).returning();
  return newFounder;
}
async function getAmFounder() {
  try {
    const results = await db.select({ founder: amFounder, author: users }).from(amFounder).leftJoin(users, eq6(amFounder.authorId, users.id)).orderBy(desc5(amFounder.createdAt));
    return results.map((r) => ({ ...r.founder, author: r.author || void 0 }));
  } catch (error) {
    logger.error("Error getting amFounder:", error);
    return [];
  }
}
async function incrementFounderUpvotes(id) {
  try {
    await db.update(amFounder).set({ upvotes: sql4`${amFounder.upvotes} + 1` }).where(eq6(amFounder.id, id));
  } catch (error) {
    logger.error("Error incrementing founder upvotes:", error);
  }
}
async function incrementFounderComments(id) {
  try {
    await db.update(amFounder).set({ comments: sql4`${amFounder.comments} + 1` }).where(eq6(amFounder.id, id));
  } catch (error) {
    logger.error("Error incrementing founder comments:", error);
  }
}
async function createAmFounderReply(reply) {
  const [newReply] = await db.insert(amFounderReplies).values(reply).returning();
  return newReply;
}
async function getAmFounderReplies(founderId) {
  try {
    return await db.select().from(amFounderReplies).where(eq6(amFounderReplies.founderId, founderId)).orderBy(asc2(amFounderReplies.createdAt));
  } catch (error) {
    logger.error("Error getting amFounder replies:", error);
    return [];
  }
}
async function getUserFounders(userId, limit) {
  try {
    return await db.select().from(amFounder).where(eq6(amFounder.authorId, userId)).orderBy(desc5(amFounder.createdAt)).limit(Math.min(limit ?? 20, MAX_LIMIT5));
  } catch (error) {
    logger.error("Error getting user founder posts:", error);
    return [];
  }
}
var MAX_LIMIT5;
var init_am_founder_repository = __esm({
  "server/repositories/am-founder.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_logger();
    MAX_LIMIT5 = 100;
  }
});

// server/repositories/misc.repository.ts
import { eq as eq7, desc as desc6, sql as sql5, and, lt, count } from "drizzle-orm";
async function createMindMaze(maze) {
  const [newMaze] = await db.insert(mindMaze).values(maze).returning();
  return newMaze;
}
async function getMindMaze(limit) {
  try {
    return await db.select().from(mindMaze).orderBy(desc6(mindMaze.createdAt)).limit(Math.min(limit ?? 20, MAX_LIMIT6));
  } catch (error) {
    logger.error("Error getting mind maze:", error);
    return [];
  }
}
async function incrementMindMazeResponses(id) {
  try {
    await db.update(mindMaze).set({ responses: sql5`${mindMaze.responses} + 1` }).where(eq7(mindMaze.id, id));
  } catch (error) {
    logger.error("Error incrementing mind maze responses:", error);
  }
}
async function createMindMazeSpark(spark) {
  const [newSpark] = await db.insert(mindMazeSparks).values(spark).returning();
  return newSpark;
}
async function getMindMazeSparks(mazeId) {
  try {
    return await db.select().from(mindMazeSparks).where(eq7(mindMazeSparks.mazeId, mazeId)).orderBy(desc6(mindMazeSparks.createdAt));
  } catch (error) {
    logger.error("Error getting mind maze sparks:", error);
    return [];
  }
}
async function incrementSparkResonance(id) {
  try {
    await db.update(mindMazeSparks).set({ resonance: sql5`${mindMazeSparks.resonance} + 1` }).where(eq7(mindMazeSparks.id, id));
  } catch (error) {
    logger.error("Error incrementing spark resonance:", error);
  }
}
async function createStarlitSpeaker(speaker) {
  const [newSpeaker] = await db.insert(starlitSpeaker).values(speaker).returning();
  return newSpeaker;
}
async function getStarlitSpeaker(limit = MAX_LIMIT6) {
  try {
    await deactivateStaleRooms();
    return await db.select().from(starlitSpeaker).where(eq7(starlitSpeaker.isActive, true)).orderBy(desc6(starlitSpeaker.createdAt)).limit(Math.min(limit, MAX_LIMIT6));
  } catch (error) {
    logger.error("Error getting starlitSpeaker:", error);
    return [];
  }
}
async function deactivateRoom(id) {
  try {
    await db.update(starlitSpeaker).set({ isActive: false, currentParticipants: 0 }).where(eq7(starlitSpeaker.id, id));
  } catch (error) {
    logger.error("Error deactivating speaker room:", error);
  }
}
async function deactivateStaleRooms() {
  try {
    const cutoff = new Date(Date.now() - STALE_ROOM_HOURS * 60 * 60 * 1e3);
    await db.update(starlitSpeaker).set({ isActive: false, currentParticipants: 0 }).where(and(eq7(starlitSpeaker.isActive, true), lt(starlitSpeaker.createdAt, cutoff)));
  } catch (error) {
    logger.error("Error deactivating stale rooms:", error);
  }
}
async function getActiveSpeakerStats() {
  try {
    const [activeResult] = await db.select({ n: count() }).from(starlitSpeaker).where(eq7(starlitSpeaker.isActive, true));
    const [totalResult] = await db.select({ n: count() }).from(starlitSpeaker);
    return {
      activeRooms: Number(activeResult?.n ?? 0),
      totalSessions: Number(totalResult?.n ?? 0)
    };
  } catch (error) {
    logger.error("Error getting speaker stats:", error);
    return { activeRooms: 0, totalSessions: 0 };
  }
}
async function updateSpeakerParticipants(id, participants) {
  try {
    await db.update(starlitSpeaker).set({ currentParticipants: participants }).where(eq7(starlitSpeaker.id, id));
  } catch (error) {
    logger.error("Error updating speaker participants:", error);
  }
}
async function createMoonMessage(message) {
  const [newMessage] = await db.insert(moonMessenger).values(message).returning();
  return newMessage;
}
async function getMoonMessages(sessionId) {
  try {
    return await db.select().from(moonMessenger).where(eq7(moonMessenger.sessionId, sessionId)).orderBy(moonMessenger.timestamp);
  } catch (error) {
    logger.error("Error getting moon messages:", error);
    return [];
  }
}
async function getActiveSessions() {
  try {
    const sessions2 = await db.selectDistinct({ sessionId: moonMessenger.sessionId }).from(moonMessenger).where(eq7(moonMessenger.isActive, true));
    return sessions2.map((s) => s.sessionId);
  } catch (error) {
    logger.error("Error getting active sessions:", error);
    return [];
  }
}
async function toggleSavedStation(userId, stationId) {
  try {
    const [existing] = await db.select().from(savedStations).where(sql5`${savedStations.userId} = ${userId} AND ${savedStations.stationId} = ${stationId}`);
    if (existing) {
      await db.delete(savedStations).where(eq7(savedStations.id, existing.id));
      return false;
    } else {
      await db.insert(savedStations).values({ userId, stationId });
      return true;
    }
  } catch (error) {
    logger.error("Error toggling saved station:", error);
    return false;
  }
}
async function getSavedStations(userId) {
  try {
    const stations = await db.select().from(savedStations).where(eq7(savedStations.userId, userId));
    return stations.map((s) => s.stationId);
  } catch (error) {
    logger.error("Error getting saved stations:", error);
    return [];
  }
}
var MAX_LIMIT6, STALE_ROOM_HOURS;
var init_misc_repository = __esm({
  "server/repositories/misc.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_logger();
    MAX_LIMIT6 = 20;
    STALE_ROOM_HOURS = 2;
  }
});

// server/repositories/reflection.repository.ts
import { eq as eq8, desc as desc7, and as and2, ne, sql as sql6 } from "drizzle-orm";
async function createNightlyPrompt(prompt) {
  try {
    const [newPrompt] = await db.insert(nightlyPrompts).values(prompt).returning();
    return newPrompt;
  } catch (error) {
    logger.error("Error creating nightly prompt:", error);
    throw error;
  }
}
async function getActivePrompt(type) {
  try {
    const now = /* @__PURE__ */ new Date();
    const [activePrompt] = await db.select().from(nightlyPrompts).where(
      and2(
        sql6`${nightlyPrompts.expiresAt} > ${now}`,
        type === "diary" ? eq8(nightlyPrompts.shiftMode, "diary") : ne(nightlyPrompts.shiftMode, "diary")
      )
    ).orderBy(desc7(nightlyPrompts.createdAt)).limit(1);
    return activePrompt || void 0;
  } catch (error) {
    logger.error("Error getting active prompt:", error);
    return void 0;
  }
}
async function getNightlyPrompt(id) {
  try {
    const [prompt] = await db.select().from(nightlyPrompts).where(eq8(nightlyPrompts.id, id));
    return prompt || void 0;
  } catch (error) {
    logger.error("Error getting nightly prompt:", error);
    return void 0;
  }
}
async function createUserReflection(reflection, aiEvaluation) {
  try {
    const [newReflection] = await db.insert(userReflections).values({ ...reflection, aiEvaluation }).returning();
    if (reflection.userId) {
      try {
        const [user] = await db.select().from(users).where(eq8(users.id, reflection.userId));
        if (user) {
          const now = /* @__PURE__ */ new Date();
          const lastEntry = user.lastEntryDate ? new Date(user.lastEntryDate) : null;
          let newStreak = user.currentStreak || 0;
          if (!lastEntry) {
            newStreak = 1;
          } else {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const last = new Date(lastEntry.getFullYear(), lastEntry.getMonth(), lastEntry.getDate());
            const diffDays = Math.ceil(Math.abs(today.getTime() - last.getTime()) / (1e3 * 60 * 60 * 24));
            if (diffDays === 1) newStreak++;
            else if (diffDays > 1) newStreak = 1;
          }
          if (!lastEntry || newStreak !== user.currentStreak || now.getDate() !== lastEntry.getDate()) {
            await db.update(users).set({ currentStreak: newStreak, lastEntryDate: now }).where(eq8(users.id, reflection.userId));
          }
        }
      } catch (error) {
        logger.error("Error updating user streak from reflection:", error);
      }
    }
    return newReflection;
  } catch (error) {
    logger.error("Error creating user reflection:", error);
    throw error;
  }
}
async function getUserReflections(userId, limit = 20) {
  try {
    return await db.select().from(userReflections).where(eq8(userReflections.userId, userId)).orderBy(desc7(userReflections.createdAt)).limit(Math.min(limit, 100));
  } catch (error) {
    logger.error("Error getting user reflections:", error);
    return [];
  }
}
async function createPersonalReflection(reflection, aiReflection) {
  try {
    const [newReflection] = await db.insert(personalReflections).values({ ...reflection, aiReflection }).returning();
    return newReflection;
  } catch (error) {
    logger.error("Error creating personal reflection:", error);
    throw error;
  }
}
async function getPersonalReflections(userId, limit = 20) {
  try {
    return await db.select().from(personalReflections).where(eq8(personalReflections.userId, userId)).orderBy(desc7(personalReflections.createdAt)).limit(Math.min(limit, 100));
  } catch (error) {
    logger.error("Error getting personal reflections:", error);
    return [];
  }
}
var init_reflection_repository = __esm({
  "server/repositories/reflection.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_logger();
  }
});

// server/repositories/playlist.repository.ts
import { eq as eq9, and as and3 } from "drizzle-orm";
async function createPlaylist(userId, name) {
  const [newPlaylist] = await db.insert(playlists).values({ userId, name }).returning();
  return newPlaylist;
}
async function getUserPlaylists(userId) {
  try {
    return await db.select().from(playlists).where(eq9(playlists.userId, userId));
  } catch (error) {
    logger.error("Error getting user playlists:", error);
    return [];
  }
}
async function getPlaylist(playlistId) {
  try {
    const [playlist] = await db.select().from(playlists).where(eq9(playlists.id, playlistId));
    return playlist;
  } catch (error) {
    logger.error("Error getting playlist by ID:", error);
    return void 0;
  }
}
async function addTrackToPlaylist(playlistId, track) {
  const [newTrack] = await db.insert(playlistTracks).values({
    playlistId,
    trackId: track.trackId,
    trackTitle: track.trackTitle,
    trackArtist: track.trackArtist,
    trackUrl: track.trackUrl,
    trackCoverArt: track.trackCoverArt
  }).returning();
  return newTrack;
}
async function removeTrackFromPlaylist(playlistId, trackId) {
  try {
    await db.delete(playlistTracks).where(and3(eq9(playlistTracks.playlistId, playlistId), eq9(playlistTracks.trackId, trackId)));
  } catch (error) {
    logger.error("Error removing track from playlist:", error);
  }
}
async function getPlaylistTracks(playlistId) {
  try {
    return await db.select().from(playlistTracks).where(eq9(playlistTracks.playlistId, playlistId));
  } catch (error) {
    logger.error("Error getting playlist tracks:", error);
    return [];
  }
}
async function deletePlaylist(playlistId) {
  try {
    await db.delete(playlists).where(eq9(playlists.id, playlistId));
  } catch (error) {
    logger.error("Error deleting playlist:", error);
  }
}
var init_playlist_repository = __esm({
  "server/repositories/playlist.repository.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_logger();
  }
});

// server/storage.ts
import { desc as desc8, sql as sql7, count as count2 } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
var PostgresSessionStore, MemoryStorage, DatabaseStorage, useDatabase, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_db();
    init_logger();
    init_user_repository();
    init_diary_repository();
    init_whisper_repository();
    init_night_circle_repository();
    init_midnight_cafe_repository();
    init_am_founder_repository();
    init_misc_repository();
    init_reflection_repository();
    init_playlist_repository();
    PostgresSessionStore = connectPg(session);
    MemoryStorage = class {
      sessionStore;
      users;
      diaries;
      whispers;
      mindMazes;
      mindMazeSparks;
      nightCircles;
      midnightCafes;
      amFounders;
      amFounderReplies;
      starlitSpeakers;
      moonMessages;
      savedStations;
      playlists;
      playlistTracks;
      nextId = 1;
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
      async getUser(id) {
        return this.users.find((u) => u.id === id);
      }
      async getUserByUsername(username) {
        return this.users.find((u) => u.username === username);
      }
      async getUserByEmail(email) {
        return this.users.find((u) => u.email === email);
      }
      async getUserByGoogleId(googleId) {
        return this.users.find((u) => u.googleId === googleId);
      }
      async createUser(insertUser) {
        const id = this.nextId++;
        const user = {
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
          createdAt: /* @__PURE__ */ new Date()
        };
        this.users.push(user);
        return user;
      }
      async upsertUser(user) {
        throw new Error("Upsert not implemented for MemoryStorage");
      }
      async updateUser(id, data) {
        const index2 = this.users.findIndex((u) => u.id === id);
        if (index2 !== -1) {
          this.users[index2] = { ...this.users[index2], ...data };
          return this.users[index2];
        }
        return void 0;
      }
      async updateUserOnboarding(userId, completed) {
        const user = this.users.find((u) => u.id === userId);
        if (user) {
          user.hasSeenOnboarding = completed;
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
          detectedEmotion: diary.detectedEmotion || null,
          sentimentScore: diary.sentimentScore || null,
          reflectionDepth: diary.reflectionDepth || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.diaries.push(newDiary);
        if (diary.authorId) {
          const user = this.users.find((u) => u.id === diary.authorId);
          if (user) {
            const now = /* @__PURE__ */ new Date();
            const lastEntry = user.lastEntryDate ? new Date(user.lastEntryDate) : null;
            if (!lastEntry) {
              user.currentStreak = 1;
            } else {
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const last = new Date(lastEntry.getFullYear(), lastEntry.getMonth(), lastEntry.getDate());
              const diffTime = Math.abs(today.getTime() - last.getTime());
              const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
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
      async getDiaries(viewerId, limit) {
        const diaries2 = Array.from(this.diaries.values()).filter((diary) => diary.isPublic || viewerId && diary.authorId === viewerId).sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
        return limit ? diaries2.slice(0, limit) : diaries2;
      }
      async getDiary(id) {
        return this.diaries.find((d) => d.id === id);
      }
      async deleteDiary(id) {
        const index2 = this.diaries.findIndex((d) => d.id === id);
        if (index2 === -1) return false;
        this.diaries.splice(index2, 1);
        return true;
      }
      // Whisper operations
      async createWhisper(whisper) {
        const newWhisper = {
          id: this.nextId++,
          content: whisper.content,
          hearts: 0,
          authorId: whisper.authorId || null,
          detectedEmotion: whisper.detectedEmotion || null,
          sentimentScore: whisper.sentimentScore || null,
          reflectionDepth: whisper.reflectionDepth || null,
          createdAt: /* @__PURE__ */ new Date(),
          decayStage: whisper.decayStage || "fresh",
          decayProgress: whisper.decayProgress || 0,
          visibilityOpacity: whisper.visibilityOpacity || 100,
          audioFrequency: whisper.audioFrequency || 444,
          resonanceScore: 0,
          interactionCount: 0
        };
        this.whispers.push(newWhisper);
        return newWhisper;
      }
      async getWhispers(limit) {
        const whispers2 = [...this.whispers].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        return limit ? whispers2.slice(0, limit) : whispers2;
      }
      async incrementWhisperHearts(id) {
        const whisper = this.whispers.find((w) => w.id === id);
        if (whisper && whisper.hearts !== null) {
          whisper.hearts++;
        }
      }
      // Mind Maze operations
      async createMindMaze(mindMaze3) {
        const newMindMaze = {
          id: this.nextId++,
          type: mindMaze3.type,
          content: mindMaze3.content,
          options: mindMaze3.options || null,
          responses: 0,
          authorId: mindMaze3.authorId || null,
          isSystem: mindMaze3.isSystem || false,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.mindMazes.push(newMindMaze);
        return newMindMaze;
      }
      async getMindMaze(limit) {
        const mindMazes = [...this.mindMazes].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        return limit ? mindMazes.slice(0, limit) : mindMazes;
      }
      async incrementMindMazeResponses(id) {
        const mindMaze3 = this.mindMazes.find((m) => m.id === id);
        if (mindMaze3 && mindMaze3.responses !== null) {
          mindMaze3.responses++;
        }
      }
      async createMindMazeSpark(spark) {
        const newSpark = {
          id: this.nextId++,
          mazeId: spark.mazeId,
          authorId: spark.authorId,
          content: spark.content,
          sparkType: spark.sparkType,
          resonance: 0,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.mindMazeSparks.push(newSpark);
        return newSpark;
      }
      async getMindMazeSparks(mazeId) {
        return this.mindMazeSparks.filter((s) => s.mazeId === mazeId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async incrementSparkResonance(id) {
        const spark = this.mindMazeSparks.find((s) => s.id === id);
        if (spark && spark.resonance !== null) {
          spark.resonance++;
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
          state: "forming",
          primaryEmotion: null,
          vibeScore: 0,
          expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1e3),
          createdAt: /* @__PURE__ */ new Date()
        };
        this.nightCircles.push(newNightCircle);
        return newNightCircle;
      }
      async getNightCircles(limit) {
        const circles = [...this.nightCircles].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        return limit ? circles.slice(0, limit) : circles;
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
          authorId: midnightCafe2.authorId || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.midnightCafes.push(newMidnightCafe);
        return newMidnightCafe;
      }
      async getMidnightCafe(limit) {
        const cafes = [...this.midnightCafes].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
        return limit ? cafes.slice(0, limit) : cafes;
      }
      async getMidnightCafeById(id) {
        return this.midnightCafes.find((c) => c.id === id);
      }
      async incrementCafeReplies(id) {
        const cafe = this.midnightCafes.find((c) => c.id === id);
        if (cafe && cafe.replies !== null) {
          cafe.replies++;
        }
      }
      async createCafeReply(reply) {
        const id = this.nextId++;
        const newReply = {
          ...reply,
          id,
          authorId: reply.authorId || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        return newReply;
      }
      async getCafeReplies(cafeId) {
        return [];
      }
      async deleteCafePost(id) {
        const index2 = this.midnightCafes.findIndex((c) => c.id === id);
        if (index2 !== -1) {
          this.midnightCafes.splice(index2, 1);
        }
      }
      async deleteCafeReply(id) {
      }
      // 3AM Founder operations
      async createAmFounder(amFounder3) {
        const newFounder = {
          id: this.nextId++,
          ...amFounder3,
          upvotes: 0,
          comments: 0,
          authorId: amFounder3.authorId || null,
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
      async createStarlitSpeaker(starlitSpeaker3) {
        const newSpeaker = {
          id: this.nextId++,
          ...starlitSpeaker3,
          maxParticipants: starlitSpeaker3.maxParticipants || 8,
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
      async createAmFounderReply(reply) {
        const newReply = {
          id: this.nextId++,
          ...reply,
          authorId: reply.authorId ?? null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.amFounderReplies.push(newReply);
        return newReply;
      }
      async getAmFounderReplies(founderId) {
        return this.amFounderReplies.filter((r) => r.founderId === founderId).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
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
      // Saved Stations
      async toggleSavedStation(userId, stationId) {
        const existingIndex = this.savedStations.findIndex((s) => s.userId === userId && s.stationId === stationId);
        if (existingIndex >= 0) {
          this.savedStations.splice(existingIndex, 1);
          return false;
        } else {
          this.savedStations.push({
            id: this.nextId++,
            userId,
            stationId,
            createdAt: /* @__PURE__ */ new Date()
          });
          return true;
        }
      }
      async getSavedStations(userId) {
        return this.savedStations.filter((s) => s.userId === userId).map((s) => s.stationId);
      }
      async getUserWhispers(userId, limit) {
        return this.whispers.filter((w) => w.authorId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async getUserCafePosts(userId, limit) {
        return this.midnightCafes.filter((c) => c.authorId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async getUserDiaries(userId, limit) {
        return this.diaries.filter((diary) => diary.authorId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      async getUserFounders(userId, limit) {
        return this.amFounders.filter((f) => f.authorId === userId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
      }
      // Nightly Reflection operations
      async createNightlyPrompt(prompt) {
        const newPrompt = {
          id: this.nextId++,
          ...prompt,
          createdAt: /* @__PURE__ */ new Date()
        };
        return newPrompt;
      }
      async getActivePrompt(type) {
        const now = /* @__PURE__ */ new Date();
        return void 0;
      }
      async getNightlyPrompt(id) {
        const prompts = [
          "Something you felt today but didn't say.",
          "A moment that stayed with you today.",
          "What are you avoiding right now?",
          "What felt heavy today?"
        ];
        const dayIndex = (/* @__PURE__ */ new Date()).getDate() % prompts.length;
        return {
          id: 1,
          content: prompts[dayIndex],
          shiftMode: "silence_variable",
          createdAt: /* @__PURE__ */ new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1e3)
        };
      }
      async createUserReflection(reflection, aiEvaluation) {
        const newReflection = {
          id: this.nextId++,
          ...reflection,
          aiEvaluation,
          createdAt: /* @__PURE__ */ new Date()
        };
        return newReflection;
      }
      async getUserReflections(userId, limit = 20) {
        return [];
      }
      async createPersonalReflection(reflection, aiReflection) {
        const newReflection = {
          id: this.nextId++,
          ...reflection,
          aiReflection,
          createdAt: /* @__PURE__ */ new Date()
        };
        return newReflection;
      }
      async getPersonalReflections(userId, limit = 20) {
        return [];
      }
      async getUserProfileStats(userId) {
        const diary_posts = this.diaries.filter((d) => d.authorId === userId).length;
        const whisper_posts = this.whispers.filter((w) => w.authorId === userId).length;
        const cafe_posts = this.midnightCafes.filter((c) => c.authorId === userId).length;
        const total_hearts = this.whispers.filter((w) => w.authorId === userId).reduce((sum, w) => sum + (w.hearts || 0), 0);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
        const activeDaysSet = /* @__PURE__ */ new Set();
        const addActiveDay = (d) => {
          if (d && d > sevenDaysAgo) {
            activeDaysSet.add(d.toDateString());
          }
        };
        this.diaries.filter((d) => d.authorId === userId).forEach((d) => addActiveDay(d.createdAt));
        this.whispers.filter((w) => w.authorId === userId).forEach((w) => addActiveDay(w.createdAt));
        this.midnightCafes.filter((c) => c.authorId === userId).forEach((c) => addActiveDay(c.createdAt));
        const activeDaysLastWeek = activeDaysSet.size;
        const user = this.users.find((u) => u.id === userId);
        const createdAt = user?.createdAt ? new Date(user.createdAt) : /* @__PURE__ */ new Date();
        const accountAgeDays = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / (1e3 * 60 * 60 * 24)));
        const totalPosts = diary_posts + whisper_posts + cafe_posts;
        const experiencePoints = totalPosts * 10 + total_hearts * 2;
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
      async getUserAchievements(userId) {
        const diary_posts = this.diaries.filter((d) => d.authorId === userId).length;
        const whisper_posts = this.whispers.filter((w) => w.authorId === userId).length;
        const cafe_posts = this.midnightCafes.filter((c) => c.authorId === userId).length;
        const total_hearts = this.whispers.filter((w) => w.authorId === userId).reduce((sum, w) => sum + (w.hearts || 0), 0);
        const has_first_heart = this.whispers.some((w) => w.authorId === userId && (w.hearts || 0) > 0);
        const achievements = [];
        if (diary_posts >= 1) {
          achievements.push({
            id: "first_diary",
            icon: "moon",
            title: "Night Owl Initiate",
            description: "Wrote your first diary entry",
            color: "purple"
          });
        }
        if (whisper_posts >= 1) {
          achievements.push({
            id: "first_whisper",
            icon: "star",
            title: "Whisper in the Dark",
            description: "Shared your first whisper",
            color: "pink"
          });
        }
        if (has_first_heart) {
          achievements.push({
            id: "first_heart",
            icon: "heart",
            title: "First Heart Received",
            description: "Someone loved your whisper",
            color: "red"
          });
        }
        if (cafe_posts >= 1) {
          achievements.push({
            id: "first_cafe",
            icon: "message",
            title: "Conversation Starter",
            description: "Started a cafe conversation",
            color: "blue"
          });
        }
        if (diary_posts >= 10) {
          achievements.push({
            id: "ten_diaries",
            icon: "trophy",
            title: "Dedicated Diarist",
            description: "Wrote 10 diary entries",
            color: "yellow"
          });
        }
        if (whisper_posts >= 10) {
          achievements.push({
            id: "ten_whispers",
            icon: "trophy",
            title: "Voice of the Night",
            description: "Shared 10 whispers",
            color: "purple"
          });
        }
        if (total_hearts >= 50) {
          achievements.push({
            id: "fifty_hearts",
            icon: "trophy",
            title: "Beloved Night Soul",
            description: "Received 50 hearts total",
            color: "gold"
          });
        }
        return achievements;
      }
      async getTrendingTopics() {
        const hashtagMap = /* @__PURE__ */ new Map();
        const addHashtags = (content, date) => {
          if (!content) return;
          const matches = content.match(/#[a-zA-Z0-9_]+/g);
          if (!matches) return;
          const now = Date.now();
          const isRecent = date ? now - date.getTime() <= 24 * 60 * 60 * 1e3 : false;
          const isPrevious = date ? now - date.getTime() > 24 * 60 * 60 * 1e3 && now - date.getTime() <= 48 * 60 * 60 * 1e3 : false;
          matches.forEach((match) => {
            const tag = match.slice(1).toLowerCase();
            const existing = hashtagMap.get(tag) || { tag, posts: 0, recent: 0, previous: 0, lastUsed: date || /* @__PURE__ */ new Date() };
            existing.posts++;
            if (isRecent) existing.recent++;
            if (isPrevious) existing.previous++;
            if (date && date > existing.lastUsed) existing.lastUsed = date;
            hashtagMap.set(tag, existing);
          });
        };
        this.diaries.forEach((d) => addHashtags(d.content, d.createdAt));
        this.whispers.forEach((w) => addHashtags(w.content, w.createdAt));
        this.midnightCafes.forEach((c) => addHashtags(c.content, c.createdAt));
        const items = Array.from(hashtagMap.values());
        const formattedTopics = items.map((topic, index2) => {
          let growth = 0;
          if (topic.previous > 0) {
            growth = Math.round((topic.recent - topic.previous) / topic.previous * 100);
          } else if (topic.recent > 0) {
            growth = 100;
          }
          let category = "social";
          if (/(thought|philosophy|wisdom|mind|contemplat)/.test(topic.tag)) category = "philosophy";
          else if (/(music|song|sound|melody|beat)/.test(topic.tag)) category = "music";
          else if (/(art|creat|design|draw|paint|write)/.test(topic.tag)) category = "creative";
          else if (/(startup|business|founder|entrepreneur)/.test(topic.tag)) category = "business";
          else if (/(journal|diary|personal|feeling|emotion)/.test(topic.tag)) category = "personal";
          let destination = "/whispers";
          if (/(journal|diary)/.test(topic.tag)) destination = "/diaries";
          else if (/(whisper|secret|confess)/.test(topic.tag)) destination = "/whispers";
          else if (/(cafe|conversation|discuss)/.test(topic.tag)) destination = "/midnight-cafe";
          else if (/(music|song)/.test(topic.tag)) destination = "/music-mood";
          else if (/(founder|startup)/.test(topic.tag)) destination = "/3am-founder";
          else if (/(puzzle|riddle|maze)/.test(topic.tag)) destination = "/mind-maze";
          else if (/(circle|community|group)/.test(topic.tag)) destination = "/night-circles";
          return {
            id: index2 + 1,
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
      async getRecentActivity(limit) {
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
            link: "/diaries"
          })),
          ...recentWhispers.map((w) => ({
            id: `whisper-${w.id}`,
            type: "whisper",
            user: "Anonymous",
            content: "whispered into the night",
            timestamp: w.createdAt,
            category: "whispers",
            link: "/whispers"
          })),
          ...recentCafe.map((m) => ({
            id: `comment-${m.id}`,
            type: "comment",
            user: "A Night Wanderer",
            content: `started a conversation about ${m.topic?.slice(0, 30) ?? "..."}`,
            timestamp: m.createdAt,
            category: "cafe",
            link: "/midnight-cafe"
          }))
        ].sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()).slice(0, limit);
        return combined;
      }
      async getActivityStats() {
        return {
          diaries_today: this.diaries.length,
          whispers_today: this.whispers.length,
          cafe_today: this.midnightCafes.length,
          active_users_today: 0
        };
      }
      // Playlist operations
      async createPlaylist(userId, name) {
        const playlist = {
          id: this.nextId++,
          userId,
          name,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.playlists.push(playlist);
        return playlist;
      }
      async getUserPlaylists(userId) {
        return this.playlists.filter((p) => p.userId === userId);
      }
      async getPlaylist(playlistId) {
        return this.playlists.find((p) => p.id === playlistId);
      }
      async addTrackToPlaylist(playlistId, track) {
        const playlistTrack = {
          id: this.nextId++,
          playlistId,
          trackId: track.trackId,
          trackTitle: track.trackTitle,
          trackArtist: track.trackArtist,
          trackUrl: track.trackUrl,
          trackCoverArt: track.trackCoverArt ?? null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.playlistTracks.push(playlistTrack);
        return playlistTrack;
      }
      async removeTrackFromPlaylist(playlistId, trackId) {
        const index2 = this.playlistTracks.findIndex((t) => t.playlistId === playlistId && t.trackId === trackId);
        if (index2 >= 0) {
          this.playlistTracks.splice(index2, 1);
        }
      }
      async getPlaylistTracks(playlistId) {
        return this.playlistTracks.filter((t) => t.playlistId === playlistId);
      }
      async deletePlaylist(playlistId) {
        this.playlists = this.playlists.filter((p) => p.id !== playlistId);
        this.playlistTracks = this.playlistTracks.filter((t) => t.playlistId !== playlistId);
      }
    };
    DatabaseStorage = class {
      sessionStore;
      constructor() {
        try {
          this.sessionStore = new PostgresSessionStore({
            pool,
            tableName: "sessions",
            // Explicitly use the Drizzle-managed table
            createTableIfMissing: true,
            errorLog: (error) => {
              if ("code" in error && error.code === "42P07") return;
              logger.error("Session store error:", error);
            }
          });
        } catch (err) {
          logger.warn("PostgresSessionStore failed to init \u2014 falling back to MemoryStore:", err);
          this.sessionStore = new session.MemoryStore();
        }
      }
      // ── Users ─────────────────────────────────────────────────────────────────
      getUser = getUser;
      getUserByUsername = getUserByUsername;
      getUserByEmail = getUserByEmail;
      getUserByGoogleId = getUserByGoogleId;
      createUser = createUser;
      upsertUser = upsertUser;
      updateUser = updateUser;
      updateUserOnboarding = updateUserOnboarding;
      // ── Diaries ───────────────────────────────────────────────────────────────
      createDiary = createDiary;
      getDiaries = getDiaries;
      getDiary = getDiary;
      deleteDiary = deleteDiary;
      getUserDiaries = getUserDiaries;
      // ── Whispers ──────────────────────────────────────────────────────────────
      createWhisper = createWhisper;
      getWhispers = getWhispers;
      incrementWhisperHearts = incrementWhisperHearts;
      getUserWhispers = getUserWhispers;
      // ── Night Circles ─────────────────────────────────────────────────────────
      createNightCircle = createNightCircle;
      getNightCircles = getNightCircles;
      updateNightCircleMembers = updateNightCircleMembers;
      // ── Midnight Cafe ─────────────────────────────────────────────────────────
      createMidnightCafe = createMidnightCafe;
      getMidnightCafe = getMidnightCafe;
      getMidnightCafeById = getMidnightCafeById;
      incrementCafeReplies = incrementCafeReplies;
      getCafeReplies = getCafeReplies;
      createCafeReply = createCafeReply;
      deleteCafePost = deleteCafePost;
      deleteCafeReply = deleteCafeReply;
      getUserCafePosts = getUserCafePosts;
      // ── 3AM Founder ───────────────────────────────────────────────────────────
      createAmFounder = createAmFounder;
      getAmFounder = getAmFounder;
      incrementFounderUpvotes = incrementFounderUpvotes;
      incrementFounderComments = incrementFounderComments;
      createAmFounderReply = createAmFounderReply;
      getAmFounderReplies = getAmFounderReplies;
      getUserFounders = getUserFounders;
      // ── Playlists ─────────────────────────────────────────────────────────────
      createPlaylist = createPlaylist;
      getUserPlaylists = getUserPlaylists;
      getPlaylist = getPlaylist;
      addTrackToPlaylist = addTrackToPlaylist;
      removeTrackFromPlaylist = removeTrackFromPlaylist;
      getPlaylistTracks = getPlaylistTracks;
      deletePlaylist = deletePlaylist;
      // ── MindMaze ──────────────────────────────────────────────────────────────
      createMindMaze = createMindMaze;
      getMindMaze = getMindMaze;
      incrementMindMazeResponses = incrementMindMazeResponses;
      createMindMazeSpark = createMindMazeSpark;
      getMindMazeSparks = getMindMazeSparks;
      incrementSparkResonance = incrementSparkResonance;
      // ── Starlit Speaker ───────────────────────────────────────────────────────
      createStarlitSpeaker = createStarlitSpeaker;
      getStarlitSpeaker = getStarlitSpeaker;
      updateSpeakerParticipants = updateSpeakerParticipants;
      // ── Moon Messenger ────────────────────────────────────────────────────────
      createMoonMessage = createMoonMessage;
      getMoonMessages = getMoonMessages;
      getActiveSessions = getActiveSessions;
      // ── Saved Stations ────────────────────────────────────────────────────────
      toggleSavedStation = toggleSavedStation;
      getSavedStations = getSavedStations;
      // ── Reflections ───────────────────────────────────────────────────────────
      createNightlyPrompt = createNightlyPrompt;
      getActivePrompt = getActivePrompt;
      getNightlyPrompt = getNightlyPrompt;
      createUserReflection = createUserReflection;
      getUserReflections = getUserReflections;
      createPersonalReflection = createPersonalReflection;
      getPersonalReflections = getPersonalReflections;
      async getUserProfileStats(userId) {
        const stats = await db.execute(sql7`
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
        const rawStats = stats.rows[0];
        const totalPosts = Number(rawStats.diary_posts || 0) + Number(rawStats.whisper_posts || 0) + Number(rawStats.cafe_posts || 0);
        const totalHearts = Number(rawStats.total_hearts || 0);
        const activeDaysLastWeek = Number(rawStats.active_days_last_week || 0);
        const accountAgeDays = Number(rawStats.account_age_days || 0);
        const experiencePoints = totalPosts * 10 + totalHearts * 2;
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
      async getUserAchievements(userId) {
        const achievementChecks = await db.execute(sql7`
        SELECT 
            EXISTS(SELECT 1 FROM ${diaries} WHERE author_id = ${userId} LIMIT 1) as has_first_diary,
            EXISTS(SELECT 1 FROM ${whispers} WHERE author_id = ${userId} LIMIT 1) as has_first_whisper,
            EXISTS(SELECT 1 FROM ${whispers} WHERE author_id = ${userId} AND hearts > 0 LIMIT 1) as has_first_heart,
            EXISTS(SELECT 1 FROM ${midnightCafe} WHERE author_id = ${userId} LIMIT 1) as has_first_cafe,
            (SELECT COUNT(*) FROM ${diaries} WHERE author_id = ${userId}) >= 10 as has_ten_diaries,
            (SELECT COUNT(*) FROM ${whispers} WHERE author_id = ${userId}) >= 10 as has_ten_whispers,
            (SELECT SUM(hearts) FROM ${whispers} WHERE author_id = ${userId}) >= 50 as has_fifty_hearts
    `);
        const checks = achievementChecks.rows[0];
        const achievements = [];
        if (checks.has_first_diary) {
          achievements.push({
            id: "first_diary",
            icon: "moon",
            title: "Night Owl Initiate",
            description: "Wrote your first diary entry",
            color: "purple"
          });
        }
        if (checks.has_first_whisper) {
          achievements.push({
            id: "first_whisper",
            icon: "star",
            title: "Whisper in the Dark",
            description: "Shared your first whisper",
            color: "pink"
          });
        }
        if (checks.has_first_heart) {
          achievements.push({
            id: "first_heart",
            icon: "heart",
            title: "First Heart Received",
            description: "Someone loved your whisper",
            color: "red"
          });
        }
        if (checks.has_first_cafe) {
          achievements.push({
            id: "first_cafe",
            icon: "message",
            title: "Conversation Starter",
            description: "Started a cafe conversation",
            color: "blue"
          });
        }
        if (checks.has_ten_diaries) {
          achievements.push({
            id: "ten_diaries",
            icon: "trophy",
            title: "Dedicated Diarist",
            description: "Wrote 10 diary entries",
            color: "yellow"
          });
        }
        if (checks.has_ten_whispers) {
          achievements.push({
            id: "ten_whispers",
            icon: "trophy",
            title: "Voice of the Night",
            description: "Shared 10 whispers",
            color: "purple"
          });
        }
        if (checks.has_fifty_hearts) {
          achievements.push({
            id: "fifty_hearts",
            icon: "trophy",
            title: "Beloved Night Soul",
            description: "Received 50 hearts total",
            color: "gold"
          });
        }
        return achievements;
      }
      async getTrendingTopics() {
        const trendingTopics = await db.execute(sql7`
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
        const formattedTopics = (trendingTopics.rows || []).map((topic, index2) => ({
          id: index2 + 1,
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
      async getRecentActivity(limit) {
        const [recentDiaries, recentWhispers, recentCafe] = await Promise.all([
          db.select({ id: diaries.id, createdAt: diaries.createdAt }).from(diaries).orderBy(desc8(diaries.createdAt)).limit(5),
          db.select({ id: whispers.id, createdAt: whispers.createdAt }).from(whispers).orderBy(desc8(whispers.createdAt)).limit(5),
          db.select({ id: midnightCafe.id, createdAt: midnightCafe.createdAt, topic: midnightCafe.topic }).from(midnightCafe).orderBy(desc8(midnightCafe.createdAt)).limit(5)
        ]);
        const combined = [
          ...recentDiaries.map((d) => ({
            id: `post-${d.id}`,
            type: "post",
            user: "A Night Owl",
            content: "shared a diary entry",
            timestamp: d.createdAt,
            category: "diaries",
            link: "/diaries"
          })),
          ...recentWhispers.map((w) => ({
            id: `whisper-${w.id}`,
            type: "whisper",
            user: "Anonymous",
            content: "whispered into the night",
            timestamp: w.createdAt,
            category: "whispers",
            link: "/whispers"
          })),
          ...recentCafe.map((m) => ({
            id: `comment-${m.id}`,
            type: "comment",
            user: "A Night Wanderer",
            content: `started a conversation about ${m.topic?.slice(0, 30) ?? "..."}`,
            timestamp: m.createdAt,
            category: "cafe",
            link: "/midnight-cafe"
          }))
        ].sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()).slice(0, limit);
        return combined;
      }
      async getActivityStats() {
        const [diaryCount, whisperCount, cafeCount] = await Promise.all([
          db.select({ value: count2() }).from(diaries),
          db.select({ value: count2() }).from(whispers),
          db.select({ value: count2() }).from(midnightCafe)
        ]);
        return {
          diaries_today: Number(diaryCount[0]?.value || 0),
          whispers_today: Number(whisperCount[0]?.value || 0),
          cafe_today: Number(cafeCount[0]?.value || 0),
          active_users_today: 0
        };
      }
    };
    useDatabase = Boolean(process.env.DATABASE_URL && db);
    if (useDatabase) {
      logger.info("Using DatabaseStorage");
    } else {
      logger.info("Using MemoryStorage (DATABASE_URL not set or db connection failed)");
    }
    storage = useDatabase ? new DatabaseStorage() : new MemoryStorage();
  }
});

// server/auth.ts
var auth_exports = {};
__export(auth_exports, {
  setupAuth: () => setupAuth
});
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt as scrypt2, randomBytes as randomBytes2, timingSafeEqual as timingSafeEqual2 } from "crypto";
import { promisify as promisify2 } from "util";
import { z as z12 } from "zod";
async function hashPassword2(password) {
  const salt = randomBytes2(16).toString("hex");
  const buf = await scryptAsync2(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  if (!stored || typeof stored !== "string" || !stored.includes(".")) {
    return false;
  }
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) return false;
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync2(supplied, salt, 64);
  return timingSafeEqual2(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const isProduction2 = app2.get("env") === "production" || process.env.NODE_ENV === "production";
  if (!process.env.SESSION_SECRET) {
    if (isProduction2) {
      throw new Error("FATAL: SESSION_SECRET environment variable is required in production");
    }
    logger.warn("SESSION_SECRET not set \u2014 using insecure default. Set it in .env for production.");
  }
  if (isProduction2) {
    app2.set("trust proxy", 1);
  }
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "dev_only_insecure_secret_do_not_use_in_prod",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      // Secure cookies for production (HTTPS only)
      secure: isProduction2,
      // HttpOnly prevents XSS attacks
      httpOnly: true,
      // SameSite prevents CSRF attacks
      // 'none' allows cross-site cookies (needed if frontend/backend on different domains)
      // 'lax' is safer if they're on the same domain
      sameSite: isProduction2 ? "none" : "lax",
      // Cookie expiration - 7 days
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      // Path where cookie is valid
      path: "/"
    }
  };
  if (storage.sessionStore && typeof storage.sessionStore.on === "function") {
    storage.sessionStore.on("error", (err) => {
      logger.warn("[session-store] error (sessions may not persist):", err.message);
    });
  }
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  app2.post("/api/auth/firebase", async (req, res, next) => {
    try {
      const { idToken, uid, email, displayName, photoURL } = req.body;
      if (!uid) return res.status(400).send("UID required");
      if (isProduction2 && !idToken) {
        return res.status(401).json({ error: "idToken is required in production" });
      }
      let verifiedUid = uid;
      let verifiedEmail = email ? email.toLowerCase() : null;
      let adminInitialised = false;
      try {
        const admin = await import("firebase-admin").then((m) => m.default).catch(() => null);
        if (admin) {
          if (!admin.apps.length) {
            if (process.env.FIREBASE_SERVICE_ACCOUNT) {
              const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
              admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
              logger.info("Firebase Admin initialized via FIREBASE_SERVICE_ACCOUNT env var");
            } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
              admin.initializeApp({ credential: admin.credential.applicationDefault() });
              logger.info("Firebase Admin initialized via GOOGLE_APPLICATION_CREDENTIALS file path");
            } else {
              logger.warn("No Firebase Admin credentials found (FIREBASE_SERVICE_ACCOUNT / GOOGLE_APPLICATION_CREDENTIALS). Token verification skipped \u2014 trusting client UID.");
            }
          }
          adminInitialised = admin.apps.length > 0;
          if (idToken && adminInitialised) {
            try {
              const decodedToken = await admin.auth().verifyIdToken(idToken);
              verifiedUid = decodedToken.uid;
              verifiedEmail = decodedToken.email ? decodedToken.email.toLowerCase() : verifiedEmail;
              logger.info("Firebase ID token verified server-side");
            } catch (verifyError) {
              logger.error("Firebase token verification failed", verifyError.message);
              return res.status(401).json({ error: "Invalid Firebase token" });
            }
          } else if (idToken && !adminInitialised) {
            logger.warn("Firebase Admin not initialised \u2014 skipping token verification, trusting client UID. Set FIREBASE_SERVICE_ACCOUNT for production security.");
          } else {
            logger.warn("No idToken provided \u2014 trusting client-side Firebase UID (insecure).");
          }
        } else {
          logger.warn("firebase-admin package not available \u2014 trusting client-side Firebase UID.");
        }
      } catch (initError) {
        logger.error("Firebase Admin initialization error:", initError.message);
      }
      let user = await storage.getUserByGoogleId(verifiedUid);
      if (!user && verifiedEmail) {
        user = await storage.getUserByEmail(verifiedEmail);
        if (user && !user.googleId) {
        }
      }
      if (!user) {
        const baseUsername = (verifiedEmail ? verifiedEmail.split("@")[0] : uid).toLowerCase().replace(/[^a-z0-9]/g, "");
        const randomSuffix = randomBytes2(4).toString("hex");
        const safeUsername = `${baseUsername}_${randomSuffix}`;
        const randomPwd = await hashPassword2(randomBytes2(16).toString("hex"));
        try {
          user = await storage.createUser({
            username: safeUsername,
            password: randomPwd,
            googleId: verifiedUid,
            displayName: displayName || "Nocturne User",
            email: verifiedEmail,
            // Use the verified, lowercased email
            profileImageUrl: photoURL
          });
        } catch (createError) {
          logger.warn("User creation failed, checking for existing user...", createError.message);
          user = await storage.getUserByGoogleId(verifiedUid);
          if (!user && verifiedEmail) {
            user = await storage.getUserByEmail(verifiedEmail);
          }
          if (!user) {
            logger.error("Failed to recover from user creation error", createError);
            throw createError;
          }
        }
      }
      req.login(user, (err) => {
        if (err) return next(err);
        return res.json(user);
      });
    } catch (error) {
      console.error("Auth Error:", error);
      next(error);
    }
  });
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        let user = await storage.getUserByUsername(username);
        if (!user && username.includes("@")) {
          user = await storage.getUserByEmail(username.toLowerCase());
        }
        if (!user || !user.password) {
          return done(null, false, { message: "Invalid credentials" });
        }
        const passwordMatch = await comparePasswords(password, user.password);
        if (!passwordMatch) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const parseResult = registerSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: { message: "Validation failed", code: "VALIDATION_ERROR", details: parseResult.error.errors }
        });
      }
      const existingUser = await storage.getUserByUsername(parseResult.data.username);
      if (existingUser) {
        return res.status(400).json({ success: false, error: { message: "Username already exists", code: "CONFLICT" } });
      }
      const hashedPassword = await hashPassword2(parseResult.data.password);
      const user = await storage.createUser({
        ...req.body,
        username: parseResult.data.username,
        password: hashedPassword
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: { message: "Validation failed", code: "VALIDATION_ERROR", details: parseResult.error.errors }
      });
    }
    passport.authenticate("local", (err, user, _info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ success: false, error: { message: "Invalid credentials", code: "UNAUTHORIZED" } });
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) return res.sendStatus(401);
    res.json(req.user);
  });
}
var registerSchema, loginSchema, scryptAsync2;
var init_auth = __esm({
  "server/auth.ts"() {
    "use strict";
    init_storage();
    init_logger();
    registerSchema = z12.object({
      username: z12.string().min(3, "Username must be at least 3 characters").max(30, "Username too long").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
      password: z12.string().min(8, "Password must be at least 8 characters"),
      email: z12.string().email("Invalid email").optional()
    });
    loginSchema = z12.object({
      username: z12.string().min(1, "Username is required"),
      password: z12.string().min(1, "Password is required")
    });
    scryptAsync2 = promisify2(scrypt2);
  }
});

// server/index.ts
init_logger();
import "dotenv/config";
import { config as config2 } from "dotenv";
import express3 from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import compression from "compression";

// server/routes.ts
async function registerRoutes(app2, httpServer) {
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import sitemap from "vite-plugin-sitemap";
var publicRoutes = [
  "/",
  "/diaries",
  "/whispers",
  "/mind-maze",
  "/night-circles",
  "/midnight-cafe",
  "/music-mood",
  "/nightly-reflection",
  "/night-conversations",
  "/digital-journals",
  "/mindful-spaces",
  "/3am-founder",
  "/starlit-speaker",
  "/moon-messenger",
  "/night-thoughts",
  "/read-card",
  "/read-alone",
  "/read-tonight",
  "/privacy",
  "/help"
];
var vite_config_default = defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: "https://nocturnesocial.in",
      dynamicRoutes: publicRoutes,
      changefreq: "weekly",
      priority: 0.8,
      lastmod: /* @__PURE__ */ new Date(),
      outDir: path.resolve(import.meta.dirname, "dist/public")
    })
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
    },
    // Proxy /api to the Express backend so Vite and the backend can run
    // on different ports in development without CORS/ERR_CONNECTION_REFUSED.
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
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
  app2.use(express.static(distPath));
  app2.use("*", (req, res) => {
    const lastSegment = req.path.split("/").pop() ?? "";
    const hasExtension = lastSegment.includes(".");
    if (hasExtension) {
      res.status(404).send("Not found");
      return;
    }
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/websocket.ts
init_logger();
init_storage();
import { WebSocketServer, WebSocket } from "ws";
import cookie from "cookie";
var WebSocketManager = class {
  wss;
  rooms = /* @__PURE__ */ new Map();
  connections = /* @__PURE__ */ new Map();
  waitingForRandom = [];
  constructor(server) {
    this.wss = new WebSocketServer({ noServer: true });
    this.setupWebSocket();
    server.on("upgrade", async (request, socket, head) => {
      if (request.url === "/ws") {
        try {
          const sessionUser = await this.extractUserFromSession(request);
          if (sessionUser) {
            request.authenticatedUser = sessionUser;
          } else {
            const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            request.authenticatedUser = { id: null, guestId };
            logger.info(`WebSocket guest connection allowed: ${guestId}`);
          }
          this.wss.handleUpgrade(request, socket, head, (ws) => {
            this.wss.emit("connection", ws, request);
          });
        } catch (error) {
          logger.error("WebSocket upgrade error", error);
          socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
          socket.destroy();
        }
      }
    });
  }
  /**
   * Extract user from session cookie.
   * Parses the connect.sid cookie, looks up the session in the store,
   * and returns the user if found.
   */
  async extractUserFromSession(request) {
    try {
      const cookies = cookie.parse(request.headers.cookie || "");
      const sid = cookies["connect.sid"];
      if (!sid) return null;
      const sessionId = sid.startsWith("s:") ? sid.slice(2).split(".")[0] : sid;
      if (!sessionId) return null;
      return new Promise((resolve) => {
        storage.sessionStore.get(sessionId, (err, session3) => {
          if (err || !session3 || !session3.passport?.user) {
            resolve(null);
          } else {
            resolve({ id: session3.passport.user });
          }
        });
      });
    } catch {
      return null;
    }
  }
  setupWebSocket() {
    this.wss.on("connection", (ws) => {
      logger.info("WebSocket connection established");
      let messageCount = 0;
      const rateLimitWindow = setInterval(() => {
        messageCount = 0;
      }, 60 * 1e3);
      const MAX_MESSAGES_PER_MINUTE = 30;
      const MAX_MESSAGE_BYTES = 64 * 1024;
      ws.on("message", (data) => {
        const byteLength = Array.isArray(data) ? data.reduce((sum, chunk) => sum + chunk.length, 0) : Buffer.isBuffer(data) ? data.length : data.byteLength;
        if (byteLength > MAX_MESSAGE_BYTES) {
          logger.warn(`WebSocket message too large (${byteLength} bytes), dropping`);
          return;
        }
        messageCount++;
        if (messageCount > MAX_MESSAGES_PER_MINUTE) {
          logger.warn("WebSocket rate limit exceeded, dropping message");
          return;
        }
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          logger.error("Failed to parse WebSocket message", error);
        }
      });
      ws.on("close", () => {
        clearInterval(rateLimitWindow);
        this.handleDisconnection(ws);
      });
      ws.on("error", (error) => {
        logger.error("WebSocket error", error);
        clearInterval(rateLimitWindow);
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
      // Night Circles 2.0 events
      case "CIRCLE_JOIN":
        this.handleCircleJoin(ws, message.circleId, message.alias, message.lifecycle);
        break;
      case "CIRCLE_LEAVE":
        this.handleCircleLeave(ws, message.circleId, message.alias);
        break;
      case "CIRCLE_MESSAGE":
        this.handleCircleMessage(ws, message.circleId, message.alias, message.content, message.emotion);
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
      if (otherConnection && otherWs.readyState === WebSocket.OPEN) {
        const roomId = `random_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
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
      if (participant !== ws && participant.readyState === WebSocket.OPEN) {
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
    if (room.type === "random") {
      if (room.participants.size === 1) {
        const remainingParticipant = Array.from(room.participants)[0];
        this.sendToSocket(remainingParticipant, {
          type: "partner_disconnected"
        });
      }
      room.participants.clear();
      this.rooms.delete(connection.roomId);
    } else {
      if (room.participants.size > 0) {
        this.broadcastToRoom(connection.roomId, {
          type: "user_left",
          memberCount: room.participants.size
        });
      } else {
        this.rooms.delete(connection.roomId);
      }
    }
    this.connections.delete(ws);
  }
  handleDisconnection(ws) {
    const waitingIndex = this.waitingForRandom.indexOf(ws);
    if (waitingIndex > -1) {
      this.waitingForRandom.splice(waitingIndex, 1);
    }
    const conn = this.connections.get(ws);
    if (conn?.circleId) {
      this.handleCircleLeave(ws, conn.circleId, conn.circleAlias ?? "Unknown Voice");
    }
    this.handleLeaveRoom(ws);
  }
  // ── Night Circles Room Handlers ───────────────────────────────────────────
  handleCircleJoin(ws, circleId, alias, lifecycle) {
    const roomId = `circle_${circleId}`;
    let room = this.rooms.get(roomId);
    if (!room) {
      room = { id: roomId, participants: /* @__PURE__ */ new Set(), type: "circle" };
      this.rooms.set(roomId, room);
    }
    room.participants.add(ws);
    const conn = this.connections.get(ws) ?? { ws, username: alias };
    conn.roomId = roomId;
    conn.circleAlias = alias;
    conn.circleId = circleId;
    this.connections.set(ws, conn);
    this.broadcastToRoom(roomId, {
      type: "MEMBER_JOINED",
      circleId,
      alias,
      memberCount: room.participants.size,
      lifecycle
    }, ws);
    this.sendToSocket(ws, {
      type: "CIRCLE_JOINED",
      circleId,
      alias,
      memberCount: room.participants.size
    });
  }
  handleCircleLeave(ws, circleId, alias) {
    const roomId = `circle_${circleId}`;
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.participants.delete(ws);
    const conn = this.connections.get(ws);
    if (conn) {
      conn.circleId = void 0;
      conn.circleAlias = void 0;
    }
    if (room.participants.size === 0) {
      this.rooms.delete(roomId);
      return;
    }
    this.broadcastToRoom(roomId, {
      type: "MEMBER_LEFT",
      circleId,
      alias,
      memberCount: room.participants.size
    });
  }
  handleCircleMessage(ws, circleId, alias, content, emotion) {
    const roomId = `circle_${circleId}`;
    this.broadcastToRoom(roomId, {
      type: "CIRCLE_MESSAGE",
      circleId,
      alias,
      content,
      emotion,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }, ws);
  }
  // Broadcast lifecycle change to all in a circle
  broadcastCircleLifecycle(circleId, state, memberCount) {
    const roomId = `circle_${circleId}`;
    this.broadcastToRoom(roomId, {
      type: "LIFECYCLE_CHANGED",
      circleId,
      state,
      memberCount
    });
    if (state === "ended") {
      this.broadcastToRoom(roomId, { type: "CIRCLE_ENDED", circleId });
      this.rooms.delete(roomId);
    }
  }
  // Broadcast emotion update to all in a circle
  broadcastEmotionUpdate(circleId, primaryEmotion, vibeScore) {
    const roomId = `circle_${circleId}`;
    this.broadcastToRoom(roomId, {
      type: "EMOTION_UPDATED",
      circleId,
      primaryEmotion,
      vibeScore
    });
  }
  sendToSocket(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
  broadcastToRoom(roomId, message, excludeWs) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.participants.forEach((ws) => {
      if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
        this.sendToSocket(ws, message);
      }
    });
  }
};

// server/utils/errors.ts
var AppError = class _AppError extends Error {
  constructor(statusCode, message, code, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, _AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
  statusCode;
  message;
  code;
  isOperational;
};
var NotFoundError = class _NotFoundError extends AppError {
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(404, message, code);
    Object.setPrototypeOf(this, _NotFoundError.prototype);
  }
};
var ValidationError = class _ValidationError extends AppError {
  constructor(message = "Validation failed", code = "VALIDATION_ERROR", errors) {
    super(400, message, code);
    this.errors = errors;
    Object.setPrototypeOf(this, _ValidationError.prototype);
  }
  errors;
};
var UnauthorizedError = class _UnauthorizedError extends AppError {
  constructor(message = "Authentication required", code = "UNAUTHORIZED") {
    super(401, message, code);
    Object.setPrototypeOf(this, _UnauthorizedError.prototype);
  }
};
var ForbiddenError = class _ForbiddenError extends AppError {
  constructor(message = "Access forbidden", code = "FORBIDDEN") {
    super(403, message, code);
    Object.setPrototypeOf(this, _ForbiddenError.prototype);
  }
};

// server/utils/api-response.ts
function successResponse(data, meta) {
  return {
    success: true,
    data,
    ...meta && { meta }
  };
}
function errorResponse(message, code, details) {
  return {
    success: false,
    error: {
      message,
      code,
      ...details && { details }
    }
  };
}

// server/middleware/error.middleware.ts
import { ZodError } from "zod";
function errorHandler(err, req, res, next) {
  if (process.env.NODE_ENV !== "production") {
    console.error("Error:", err);
  }
  if (err instanceof ZodError) {
    return res.status(400).json(
      errorResponse(
        "Validation failed",
        "VALIDATION_ERROR",
        err.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message
        }))
      )
    );
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      errorResponse(err.message, err.code)
    );
  }
  if (err.message === "Failed to deserialize user out of session") {
    res.clearCookie("connect.sid");
    return res.status(401).json(errorResponse("Session invalid, please login again", "UNAUTHORIZED"));
  }
  const statusCode = 500;
  const message = process.env.NODE_ENV === "production" ? "Internal server error" : err.message;
  return res.status(statusCode).json(errorResponse(message, "INTERNAL_ERROR"));
}
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
function notFoundHandler(req, res, next) {
  res.status(404).json(
    errorResponse(
      `Route ${req.method} ${req.path} not found`,
      "ROUTE_NOT_FOUND"
    )
  );
}

// server/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
var isDev2 = process.env.NODE_ENV !== "production";
var apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: isDev2 ? 5e3 : 200,
  message: {
    success: false,
    error: {
      message: "Too many requests from this IP, please try again later."
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: isDev2 ? 1e3 : 20,
  message: {
    success: false,
    error: {
      message: "Too many authentication attempts, please try again later."
    }
  },
  skipSuccessfulRequests: true
});
var createContentLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // 1 hour
  max: 20,
  message: {
    success: false,
    error: {
      message: "Too many posts created, please slow down."
    }
  }
});

// server/middleware/requestId.middleware.ts
import { randomUUID } from "crypto";
function requestId(req, res, next) {
  req.id = randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
}

// server/routes/api/v1/index.ts
import { Router as Router20 } from "express";

// server/routes/api/v1/whispers.routes.ts
import { Router } from "express";

// server/config/database.ts
init_db();
async function testDatabaseConnection() {
  try {
    const { pool: pool2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    if (!pool2) {
      console.warn("\u26A0\uFE0F  Database pool not initialized (DATABASE_URL not set)");
      return false;
    }
    await pool2.query("SELECT 1");
    console.log("\u2705 Database connection successful");
    return true;
  } catch (error) {
    console.error("\u274C Database connection failed:", error);
    return false;
  }
}

// server/repositories/whispers.repository.ts
init_schema();
import { eq as eq11, desc as desc9, sql as sql8 } from "drizzle-orm";
var WhispersRepository = class {
  /**
   * Get all whispers, ordered by newest first
   */
  async getAll() {
    return await db.select().from(whispers).orderBy(desc9(whispers.createdAt));
  }
  /**
   * Get whisper by ID
   */
  async getById(id) {
    const result = await db.select().from(whispers).where(eq11(whispers.id, id)).limit(1);
    return result[0];
  }
  /**
   * Get whispers by author ID
   */
  async getByAuthorId(authorId) {
    return await db.select().from(whispers).where(eq11(whispers.authorId, authorId)).orderBy(desc9(whispers.createdAt));
  }
  /**
   * Create a new whisper
   */
  async create(data) {
    const result = await db.insert(whispers).values(data).returning();
    return result[0];
  }
  /**
   * Increment hearts count for a whisper
   */
  async incrementHearts(id) {
    await db.update(whispers).set({ hearts: sql8`${whispers.hearts} + 1` }).where(eq11(whispers.id, id));
  }
  /**
   * Delete a whisper
   */
  async delete(id) {
    await db.delete(whispers).where(eq11(whispers.id, id));
  }
  /**
   * Add an interaction (resonate, echo, absorb)
   */
  async addInteraction(whisperId, userId, type, weight) {
    await db.insert(whisperInteractions).values({
      whisperId,
      userId,
      type,
      weight
    });
    let resonanceIncrease = 1;
    if (type === "echo") resonanceIncrease = 2;
    if (type === "absorb") resonanceIncrease = 3;
    await db.update(whispers).set({
      resonanceScore: sql8`${whispers.resonanceScore} + ${resonanceIncrease}`,
      interactionCount: sql8`${whispers.interactionCount} + 1`
    }).where(eq11(whispers.id, whisperId));
  }
};
var whispersRepository = new WhispersRepository();

// server/services/whispers.service.ts
init_storage();
init_logger();

// server/services/emotion-analyzer.ts
import Sentiment from "sentiment";
var sentiment = new Sentiment();
var emotionKeywords = {
  lonely: ["alone", "empty", "silent", "solitude", "isolation", "quiet"],
  nostalgia: ["memory", "old", "past", "childhood", "remote", "remember"],
  ambition: ["goal", "future", "build", "dream", "career", "success"],
  anxiety: ["fear", "worried", "stress", "panic", "nervous", "dread"],
  joy: ["happy", "smile", "laugh", "excited", "content", "peace"],
  sadness: ["cry", "tears", "gloomy", "depressed", "blue", "pain"],
  love: ["heart", "love", "passion", "desire", "romance", "adore"]
};
function analyzeEmotion(text2) {
  const sentimentResult = sentiment.analyze(text2);
  const sentimentScore = sentimentResult.score;
  let detectedEmotion = "neutral";
  for (const emotion in emotionKeywords) {
    if (emotionKeywords[emotion].some(
      (word) => text2.toLowerCase().includes(word)
    )) {
      detectedEmotion = emotion;
      break;
    }
  }
  const lengthScore = Math.min(text2.length / 120, 5);
  const intensityScore = Math.min(Math.abs(sentimentScore), 5);
  const reflectionDepthScore = Math.round((lengthScore + intensityScore) * 10);
  return {
    detectedEmotion,
    sentimentScore: Math.round(sentimentScore),
    reflectionDepthScore
  };
}

// server/services/whispers.service.ts
var WhispersService = class {
  /**
   * Get all whispers
   */
  async getAllWhispers(limit) {
    logger.debug("Fetching all whispers");
    return await storage.getWhispers(limit);
  }
  /**
   * Get whisper by ID
   */
  async getWhisperById(id) {
    logger.debug(`Fetching whisper with id: ${id}`);
    const whisper = await whispersRepository.getById(id);
    if (!whisper) {
      throw new NotFoundError(`Whisper with id ${id} not found`);
    }
    return whisper;
  }
  /**
   * Get whispers by user
   */
  async getUserWhispers(userId) {
    logger.debug(`Fetching whispers for user: ${userId}`);
    return await whispersRepository.getByAuthorId(userId);
  }
  /**
   * Create a new whisper
   */
  async createWhisper(data, userId) {
    logger.info("Creating new whisper", { userId });
    const analysis = analyzeEmotion(data.content);
    const emotion = analysis.detectedEmotion || "neutral";
    const EMOTION_FREQ_MAP = {
      loneliness: 396,
      curiosity: 432,
      peace: 528,
      anxiety: 741,
      mystery: 639,
      neutral: 444,
      joy: 528,
      // Map joy to peace/love freq
      sadness: 396,
      // Map sadness to loneliness/release
      love: 639,
      // Map love to connection
      ambition: 432,
      // Map ambition to change
      nostalgia: 417
      // 417 is undoing situations/facilitating change
    };
    const frequency = EMOTION_FREQ_MAP[emotion] || 444;
    const whisperData = {
      ...data,
      authorId: userId,
      // Link to user if logged in
      detectedEmotion: emotion,
      sentimentScore: analysis.sentimentScore,
      reflectionDepth: analysis.reflectionDepthScore,
      audioFrequency: frequency,
      decayStage: "fresh",
      decayProgress: 0,
      visibilityOpacity: 100
    };
    return await whispersRepository.create(whisperData);
  }
  /**
   * Like a whisper (increment hearts)
   */
  async likeWhisper(id) {
    logger.info(`Incrementing hearts for whisper: ${id}`);
    await this.getWhisperById(id);
    await whispersRepository.incrementHearts(id);
  }
  /**
   * Delete a whisper
   * Only the author can delete their whisper
   */
  async deleteWhisper(id, userId) {
    logger.info(`Deleting whisper: ${id}`, { userId });
    const whisper = await this.getWhisperById(id);
    if (whisper.authorId && whisper.authorId !== userId) {
      throw new ForbiddenError("You can only delete your own whispers");
    }
    await whispersRepository.delete(id);
  }
  /**
   * Interact with a whisper (resonate, echo, absorb)
   */
  async interact(userId, whisperId, type) {
    logger.info(`Interaction: ${type} on whisper ${whisperId} by user ${userId}`);
    await this.getWhisperById(whisperId);
    await whispersRepository.addInteraction(whisperId, userId, type, type === "echo" ? 2 : 1);
  }
};
var whispersService = new WhispersService();

// server/controllers/whispers.controller.ts
var WhispersController = class {
  /**
   * GET /api/v1/whispers
   * Get all whispers
   */
  getAll = asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
    const whispers2 = await whispersService.getAllWhispers(limit);
    res.json(successResponse(whispers2));
  });
  /**
   * GET /api/v1/whispers/:id
   * Get whisper by ID
   */
  getById = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const whisper = await whispersService.getWhisperById(id);
    res.json(successResponse(whisper));
  });
  /**
   * POST /api/v1/whispers
   * Create new whisper
   */
  create = asyncHandler(async (req, res) => {
    const whisper = await whispersService.createWhisper(
      req.body,
      req.user?.id
    );
    res.status(201).json(successResponse(whisper));
  });
  /**
   * POST /api/v1/whispers/:id/like
   * Like a whisper
   */
  like = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    await whispersService.likeWhisper(id);
    res.json(successResponse({ message: "Whisper liked successfully" }));
  });
  /**
   * DELETE /api/v1/whispers/:id
   * Delete whisper (requires auth)
   */
  delete = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    await whispersService.deleteWhisper(id, req.user.id);
    res.json(successResponse({ message: "Whisper deleted successfully" }));
  });
  /**
   * POST /api/v1/whispers/:id/interaction
   * Interact with a whisper
   */
  interact = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const { type } = req.body;
    if (!["resonate", "echo", "absorb"].includes(type)) {
      res.status(400).json({ success: false, message: "Invalid interaction type" });
      return;
    }
    await whispersService.interact(req.user.id, id, type);
    res.json(successResponse({ message: `Interaction ${type} recorded` }));
  });
};
var whispersController = new WhispersController();

// server/middleware/auth.middleware.ts
init_storage();
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "nocturne-mobile-secret-change-in-prod";
async function attachJwtUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return false;
  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await storage.getUser(payload.sub);
    if (!user) return false;
    req.user = user;
    return true;
  } catch {
    return false;
  }
}
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  attachJwtUser(req).then((ok) => {
    if (ok) return next();
    throw new UnauthorizedError("Authentication required");
  }).catch(next);
}
function optionalAuth(req, res, next) {
  next();
}

// server/middleware/validation.middleware.ts
import { ZodError as ZodError2 } from "zod";
function validate(schema, target = "body") {
  return async (req, res, next) => {
    try {
      const data = req[target];
      const validated = await schema.parseAsync(data);
      req[target] = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError2) {
        next(error);
      } else {
        next(new ValidationError("Validation failed"));
      }
    }
  };
}

// server/routes/api/v1/whispers.routes.ts
init_schema();
import { z as z2 } from "zod";
var router = Router();
router.get("/", whispersController.getAll);
router.get(
  "/:id",
  validate(z2.object({ id: z2.string().regex(/^\d+$/) }), "params"),
  whispersController.getById
);
router.post(
  "/",
  validate(insertWhisperSchema),
  whispersController.create
);
router.post(
  "/:id/like",
  validate(z2.object({ id: z2.string().regex(/^\d+$/) }), "params"),
  whispersController.like
);
router.delete(
  "/:id",
  requireAuth,
  validate(z2.object({ id: z2.string().regex(/^\d+$/) }), "params"),
  whispersController.delete
);
router.post(
  "/:id/interaction",
  requireAuth,
  validate(z2.object({ id: z2.string().regex(/^\d+$/) }), "params"),
  validate(z2.object({ type: z2.enum(["resonate", "echo", "absorb"]) })),
  whispersController.interact
);
var whispers_routes_default = router;

// server/routes/api/v1/diaries.routes.ts
import { Router as Router2 } from "express";

// server/services/diaries.service.ts
init_storage();
init_logger();
var DiariesService = class {
  /**
   * Get all public diaries
   */
  async getAllDiaries(userId, limit) {
    logger.debug(`Fetching diaries for viewer: ${userId || "Guest"}`);
    return await storage.getDiaries(userId, limit);
  }
  /**
   * Get diary by ID
   */
  async getDiaryById(id) {
    logger.debug(`Fetching diary with id: ${id}`);
    const diary = await storage.getDiary(id);
    if (!diary) {
      throw new NotFoundError(`Diary with id ${id} not found`);
    }
    return diary;
  }
  /**
   * Get diaries by user
   * Note: This functionality may need to be implemented in storage layer
   * For now, getDiaries returns all public diaries, not user-specific ones
   */
  async getUserDiaries(userId) {
    logger.debug(`Fetching diaries for user: ${userId}`);
    return await storage.getUserDiaries(userId);
  }
  /**
   * Create a new diary
   */
  async createDiary(data, userId) {
    logger.info("Creating new diary", { userId });
    const analysis = analyzeEmotion(data.content);
    const diaryData = {
      ...data,
      authorId: userId,
      detectedEmotion: analysis.detectedEmotion,
      sentimentScore: analysis.sentimentScore,
      reflectionDepth: analysis.reflectionDepthScore
    };
    return await storage.createDiary(diaryData);
  }
  /**
   * Delete a diary
   * Only the author can delete their diary
   */
  async deleteDiary(id, userId) {
    logger.info(`Deleting diary: ${id}`, { userId });
    const diary = await this.getDiaryById(id);
    if (diary.authorId !== userId) {
      throw new ForbiddenError("You can only delete your own diaries");
    }
    const success = await storage.deleteDiary(id);
    if (!success) {
      throw new Error("Failed to delete diary");
    }
  }
};
var diariesService = new DiariesService();

// server/controllers/diaries.controller.ts
var DiariesController = class {
  /**
   * GET /api/v1/diaries
   * Get all public diaries
   */
  getAll = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
    const diaries2 = await diariesService.getAllDiaries(userId, limit);
    res.json(successResponse(diaries2));
  });
  /**
   * GET /api/v1/diaries/:id
   * Get diary by ID
   */
  getById = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const diary = await diariesService.getDiaryById(id);
    res.json(successResponse(diary));
  });
  /**
   * POST /api/v1/diaries
   * Create new diary (requires auth)
   */
  create = asyncHandler(async (req, res) => {
    const diary = await diariesService.createDiary(
      req.body,
      req.user.id
    );
    res.status(201).json(successResponse(diary));
  });
  /**
   * DELETE /api/v1/diaries/:id
   * Delete diary (requires auth)
   */
  delete = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    await diariesService.deleteDiary(id, req.user.id);
    res.json(successResponse({ message: "Diary deleted successfully" }));
  });
  /**
   * GET /api/v1/diaries/:id/comments
   * Get comments for a diary
   */
  getComments = asyncHandler(async (req, res) => {
    const diaryId = parseInt(req.params.id);
    const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
    const { getDiaryComments: getDiaryComments2 } = await Promise.resolve().then(() => (init_diary_repository(), diary_repository_exports));
    const comments = await getDiaryComments2(diaryId, limit);
    res.json(successResponse(comments));
  });
  /**
   * POST /api/v1/diaries/:id/comments
   * Add a comment to a diary
   */
  addComment = asyncHandler(async (req, res) => {
    const diaryId = parseInt(req.params.id);
    const { content } = req.body;
    const authorId = req.user.id;
    if (!content) {
      res.status(400).json({ success: false, error: "Content is required" });
      return;
    }
    const { createDiaryComment: createDiaryComment2 } = await Promise.resolve().then(() => (init_diary_repository(), diary_repository_exports));
    const comment = await createDiaryComment2({
      diaryId,
      content,
      authorId
    });
    const result = {
      ...comment,
      author: req.user
    };
    res.status(201).json(successResponse(result));
  });
};
var diariesController = new DiariesController();

// server/routes/api/v1/diaries.routes.ts
init_schema();
import { z as z3 } from "zod";
var router2 = Router2();
router2.get("/", diariesController.getAll);
router2.get(
  "/:id",
  validate(z3.object({ id: z3.string().regex(/^\d+$/) }), "params"),
  diariesController.getById
);
router2.post(
  "/",
  requireAuth,
  validate(insertDiarySchema),
  diariesController.create
);
router2.delete(
  "/:id",
  requireAuth,
  validate(z3.object({ id: z3.string().regex(/^\d+$/) }), "params"),
  diariesController.delete
);
router2.get(
  "/:id/comments",
  validate(z3.object({ id: z3.string().regex(/^\d+$/) }), "params"),
  diariesController.getComments
);
router2.post(
  "/:id/comments",
  requireAuth,
  validate(z3.object({ id: z3.string().regex(/^\d+$/) }), "params"),
  diariesController.addComment
);
var diaries_routes_default = router2;

// server/routes/api/v1/midnight-cafe.routes.ts
import { Router as Router3 } from "express";

// server/services/midnight-cafe.service.ts
init_storage();
init_logger();
var MidnightCafeService = class {
  /**
   * Get all cafe posts
   */
  async getAllPosts(limit) {
    logger.debug("Fetching all midnight cafe posts");
    return await storage.getMidnightCafe(limit);
  }
  /**
   * Get cafe post by ID
   */
  async getPostById(id) {
    logger.debug(`Fetching cafe post with id: ${id}`);
    const post = await storage.getMidnightCafeById(id);
    if (!post) {
      throw new NotFoundError(`Cafe post with id ${id} not found`);
    }
    return post;
  }
  /**
   * Get cafe posts by user
   */
  async getUserPosts(userId) {
    logger.debug(`Fetching cafe posts for user: ${userId}`);
    return await storage.getUserCafePosts(userId);
  }
  /**
   * Create a new cafe post
   */
  async createPost(data, userId) {
    logger.info("Creating new cafe post", { userId });
    const postData = {
      ...data,
      authorId: userId
    };
    return await storage.createMidnightCafe(postData);
  }
  /**
   * Increment reply count for a post
   */
  async incrementReplies(id) {
    logger.info(`Incrementing replies for cafe post: ${id}`);
    await this.getPostById(id);
    await storage.incrementCafeReplies(id);
  }
  /**
   * Get replies for a post
   */
  async getReplies(postId) {
    logger.debug(`Fetching replies for cafe post: ${postId}`);
    return await storage.getCafeReplies(postId);
  }
  /**
   * Create a reply
   */
  async createReply(data, userId) {
    logger.info("Creating new cafe reply", { userId, cafeId: data.cafeId });
    const replyData = {
      ...data,
      authorId: userId
    };
    const reply = await storage.createCafeReply(replyData);
    await storage.incrementCafeReplies(data.cafeId);
    return reply;
  }
  /**
   * Delete a post
   */
  async deletePost(id, userId) {
    logger.info(`Deleting cafe post: ${id} by user: ${userId}`);
    const post = await this.getPostById(id);
    if (post.authorId !== userId) {
      throw new ForbiddenError("You can only delete your own posts");
    }
    await storage.deleteCafePost(id);
  }
};
var midnightCafeService = new MidnightCafeService();

// server/controllers/midnight-cafe.controller.ts
init_schema();
init_logger();
var MidnightCafeController = class {
  /**
   * Get all posts
   */
  static async getAll(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const posts = await midnightCafeService.getAllPosts(limit);
      res.json(posts);
    } catch (error) {
      logger.error("Error fetching all cafe posts", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  }
  /**
   * Get post by ID
   */
  static async getById(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const post = await midnightCafeService.getPostById(id);
      res.json(post);
    } catch (error) {
      if (error.name === "NotFoundError") {
        return res.status(404).json({ error: error.message });
      }
      logger.error(`Error fetching post ${req.params.id}`, error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  }
  /**
   * Create a post
   */
  static async create(req, res) {
    try {
      const data = insertMidnightCafeSchema.parse(req.body);
      const post = await midnightCafeService.createPost(data, req.user?.id);
      res.status(201).json(post);
    } catch (error) {
      logger.error("Error creating post", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create post" });
    }
  }
  /**
   * Old reply endpoint (increment counter)
   * Kept for backward compatibility if needed, though we prefer real replies now.
   */
  static async reply(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      await midnightCafeService.incrementReplies(id);
      res.json({ success: true });
    } catch (error) {
      if (error.name === "NotFoundError") {
        return res.status(404).json({ error: error.message });
      }
      logger.error(`Error incrementing replies for ${req.params.id}`, error);
      res.status(500).json({ error: "Failed to increment replies" });
    }
  }
  /**
   * Get replies for a post
   */
  static async getReplies(req, res) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      const replies = await midnightCafeService.getReplies(id);
      res.json(replies);
    } catch (error) {
      logger.error("Error fetching replies", error);
      res.status(500).json({ error: "Failed to fetch replies" });
    }
  }
  /**
   * Create a reply
   */
  static async createReply(req, res) {
    try {
      const data = insertCafeReplySchema.parse(req.body);
      const reply = await midnightCafeService.createReply(data, req.user?.id);
      res.status(201).json(reply);
    } catch (error) {
      logger.error("Error creating reply", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create reply" });
    }
  }
  /**
   * Delete a post
   */
  static async deletePost(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }
      await midnightCafeService.deletePost(id, req.user.id);
      res.sendStatus(200);
    } catch (error) {
      logger.error("Error deleting post", error);
      if (error.message === "You can only delete your own posts") {
        return res.status(403).json({ error: error.message });
      }
      if (error.name === "NotFoundError") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to delete post" });
    }
  }
};

// server/routes/api/v1/midnight-cafe.routes.ts
init_schema();
import { z as z4 } from "zod";
var router3 = Router3();
router3.get("/", MidnightCafeController.getAll);
router3.get(
  "/:id",
  validate(z4.object({ id: z4.string().regex(/^\d+$/) }), "params"),
  MidnightCafeController.getById
);
router3.post(
  "/",
  optionalAuth,
  validate(insertMidnightCafeSchema),
  MidnightCafeController.create
);
router3.post(
  "/:id/reply",
  validate(z4.object({ id: z4.string().regex(/^\d+$/) }), "params"),
  MidnightCafeController.reply
);
router3.get("/:id/replies", MidnightCafeController.getReplies);
router3.post("/replies", MidnightCafeController.createReply);
router3.delete("/:id", requireAuth, MidnightCafeController.deletePost);
var midnight_cafe_routes_default = router3;

// server/routes/api/v1/night-circles.routes.ts
import { Router as Router4 } from "express";

// server/services/night-circles.service.ts
init_db();
init_schema();
import { eq as eq12, desc as desc10, and as and5, sql as sql9, ne as ne3 } from "drizzle-orm";
init_logger();
var ALIASES = [
  "Silent Moon",
  "Night Wanderer",
  "Unknown Voice",
  "Midnight Soul",
  "Fading Echo",
  "Lone Star",
  "Shadow Thinker",
  "Void Listener"
];
var AVATARS = ["moon_1", "moon_2", "moon_3", "star_1", "star_2", "void_1"];
var AI_SEED_MESSAGES = [
  "What keeps you awake tonight?",
  "What are you feeling right now?",
  "What changed you recently?",
  "What are you carrying that no one else knows about?",
  "If this moment had a color, what would it be?"
];
function deriveState(memberCount, isJoining) {
  if (memberCount === 0) return "ended";
  if (memberCount === 1 && !isJoining) return "closing";
  if (memberCount <= 2) return "forming";
  if (memberCount <= 3) return "active";
  return "deep_phase";
}
var EMOTION_VIBE_MAP = {
  calm: 20,
  lonely: 30,
  curious: 50,
  deep: 70,
  emotional: 80,
  chaotic: 95,
  neutral: 40
};
var NightCirclesService = class {
  // ── Assign a unique alias to a user joining a circle ──────────────────────
  async assignAlias(circleId) {
    const currentMembersResult = await db.select({ alias: circleMembers.alias }).from(circleMembers).where(and5(eq12(circleMembers.circleId, circleId), eq12(circleMembers.state, "active")));
    const usedAliases = new Set(currentMembersResult.map((m) => m.alias));
    const available = ALIASES.filter((a) => !usedAliases.has(a));
    const alias = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : `Night Soul ${Math.floor(Math.random() * 99)}`;
    const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    return { alias, avatar };
  }
  // ── Get all active (non-ended) circles ────────────────────────────────────
  async getAllCircles() {
    try {
      const now = /* @__PURE__ */ new Date();
      return await db.select().from(nightCircles).where(
        and5(
          eq12(nightCircles.isActive, true),
          ne3(nightCircles.state, "ended")
        )
      ).orderBy(desc10(nightCircles.createdAt));
    } catch (error) {
      logger.error("Error fetching night circles", error);
      return [];
    }
  }
  // ── Get a single circle by ID ─────────────────────────────────────────────
  async getCircleById(id) {
    const [circle] = await db.select().from(nightCircles).where(eq12(nightCircles.id, id));
    if (!circle) throw new NotFoundError(`Circle ${id} not found`);
    return circle;
  }
  // ── Quick Join: match engine ───────────────────────────────────────────────
  async quickJoin(userId, mood, preferredMode = "listener", preferredEmotion, size = "group") {
    let best = null;
    const targetMaxMembers = size === "duo" ? 2 : 8;
    if (preferredEmotion) {
      const matches = await db.select().from(nightCircles).where(
        and5(
          eq12(nightCircles.primaryEmotion, preferredEmotion),
          ne3(nightCircles.state, "ended"),
          ne3(nightCircles.state, "closing"),
          eq12(nightCircles.maxMembers, targetMaxMembers),
          sql9`COALESCE(${nightCircles.currentMembers}, 0) < COALESCE(${nightCircles.maxMembers}, ${targetMaxMembers})`
        )
      ).limit(1);
      if (matches.length > 0) best = matches[0];
    }
    if (!best) {
      const matches = await db.select().from(nightCircles).where(
        and5(
          ne3(nightCircles.state, "ended"),
          ne3(nightCircles.state, "closing"),
          eq12(nightCircles.maxMembers, targetMaxMembers),
          sql9`COALESCE(${nightCircles.currentMembers}, 0) < COALESCE(${nightCircles.maxMembers}, ${targetMaxMembers})`
        )
      ).orderBy(desc10(nightCircles.state)).limit(1);
      if (matches.length > 0) best = matches[0];
    }
    if (!best) {
      best = await this.createCircle({
        name: size === "duo" ? `Two Souls in the Night` : `Circle ${Math.floor(Math.random() * 900) + 100}`,
        description: size === "duo" ? "An intimate one-on-one connection" : "A space formed in the night",
        maxMembers: targetMaxMembers
      });
    }
    const member = await this.joinCircle(best.id, userId, preferredMode);
    const updatedCircle = await this.getCircleById(best.id);
    const isAiSeed = (updatedCircle.currentMembers ?? 0) < 2;
    return { circle: updatedCircle, member, isAiSeed };
  }
  // ── Create a new circle ───────────────────────────────────────────────────
  async createCircle(data) {
    logger.info("Creating new night circle", { name: data.name });
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1e3);
    const [circle] = await db.insert(nightCircles).values({
      ...data,
      state: "forming",
      expiresAt
    }).returning();
    return circle;
  }
  // ── Join a circle: assign alias, record membership, update lifecycle ───────
  async joinCircle(circleId, userId, mode = "listener") {
    return await db.transaction(async (tx) => {
      const [circle] = await tx.select().from(nightCircles).where(eq12(nightCircles.id, circleId));
      if (!circle) {
        throw new Error("Circle not found");
      }
      if ((circle.currentMembers ?? 0) >= (circle.maxMembers ?? 8)) {
        throw new Error("Circle is at full capacity");
      }
      const { alias, avatar } = await this.assignAlias(circleId);
      const [member] = await tx.insert(circleMembers).values({
        circleId,
        userId: userId ?? null,
        alias,
        avatar,
        mode,
        state: "active"
      }).returning();
      const newCount = (circle.currentMembers ?? 0) + 1;
      const newState = deriveState(newCount, true);
      await tx.update(nightCircles).set({
        currentMembers: newCount,
        state: newState,
        isActive: newState !== "ended"
      }).where(eq12(nightCircles.id, circleId));
      logger.info(`User joined circle ${circleId} as "${alias}" [${mode}]`);
      return member;
    });
  }
  // ── Leave a circle: decrement member count, update lifecycle ──────────────
  async leaveCircle(circleId, userId) {
    await db.transaction(async (tx) => {
      const [member] = await tx.select().from(circleMembers).where(
        and5(
          eq12(circleMembers.circleId, circleId),
          eq12(circleMembers.userId, userId),
          eq12(circleMembers.state, "active")
        )
      ).limit(1);
      if (!member) return;
      await tx.update(circleMembers).set({ state: "inactive", leftAt: /* @__PURE__ */ new Date() }).where(eq12(circleMembers.id, member.id));
      const [circle] = await tx.select().from(nightCircles).where(eq12(nightCircles.id, circleId));
      if (circle) {
        const newCount = Math.max(0, (circle.currentMembers ?? 1) - 1);
        const newState = deriveState(newCount, false);
        await tx.update(nightCircles).set({
          currentMembers: newCount,
          state: newState,
          isActive: newState !== "ended"
        }).where(eq12(nightCircles.id, circleId));
        logger.info(`User left circle ${circleId} (alias: ${member.alias})`);
      }
    });
  }
  // ── Send a message and update circle emotion ──────────────────────────────
  async sendMessage(circleId, senderAlias, content, imageUrl) {
    const emotion = analyzeEmotion(content || "image");
    const [message] = await db.insert(circleMessages).values({
      circleId,
      senderAlias,
      content: content || "",
      imageUrl,
      sentimentScore: emotion.sentimentScore
    }).returning();
    const recent = await db.select({ sentimentScore: circleMessages.sentimentScore }).from(circleMessages).where(eq12(circleMessages.circleId, circleId)).orderBy(desc10(circleMessages.createdAt)).limit(20);
    const avg = recent.length > 0 ? Math.round(recent.reduce((s, m) => s + (m.sentimentScore ?? 0), 0) / recent.length) : 0;
    let primary = "calm";
    if (avg > 3) primary = "curious";
    else if (avg > 1) primary = "deep";
    else if (avg < -3) primary = "emotional";
    else if (avg < -1) primary = "lonely";
    const vibeScore = EMOTION_VIBE_MAP[primary] ?? 40;
    await db.update(nightCircles).set({ primaryEmotion: primary, vibeScore }).where(eq12(nightCircles.id, circleId));
    return message;
  }
  // ── Get messages for a circle ─────────────────────────────────────────────
  async getMessages(circleId, limit = 50) {
    return await db.select().from(circleMessages).where(eq12(circleMessages.circleId, circleId)).orderBy(desc10(circleMessages.createdAt)).limit(limit);
  }
  // ── Get active members in a circle ────────────────────────────────────────
  async getMembers(circleId) {
    return await db.select().from(circleMembers).where(and5(eq12(circleMembers.circleId, circleId), eq12(circleMembers.state, "active")));
  }
  // ── Get a random AI seed message ─────────────────────────────────────────
  getAiSeedMessage() {
    return AI_SEED_MESSAGES[Math.floor(Math.random() * AI_SEED_MESSAGES.length)];
  }
  // ── Delete expired circles ────────────────────────────────────────────────
  async cleanupExpired() {
    const now = /* @__PURE__ */ new Date();
    const result = await db.update(nightCircles).set({ state: "ended", isActive: false }).where(
      and5(
        sql9`${nightCircles.expiresAt} < ${now}`,
        ne3(nightCircles.state, "ended")
      )
    ).returning();
    return result.length;
  }
};
var nightCirclesService = new NightCirclesService();

// server/routes/api/v1/night-circles.routes.ts
var router4 = Router4();
router4.get("/", async (req, res) => {
  try {
    const circles = await nightCirclesService.getAllCircles();
    res.json({ success: true, data: circles });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch circles" });
  }
});
router4.post("/", requireAuth, async (req, res) => {
  try {
    const { name, description, maxMembers, topic, category } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, error: "Name is required" });
    const circle = await nightCirclesService.createCircle({
      name,
      description,
      maxMembers,
      topic,
      category,
      roomType: "custom"
    });
    res.status(201).json({ success: true, data: circle });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to create circle" });
  }
});
router4.post("/quick-join", async (req, res) => {
  try {
    const { mood, preferredMode, preferredEmotion, size } = req.body;
    const userId = req.user?.id;
    const result = await nightCirclesService.quickJoin(userId, mood, preferredMode, preferredEmotion, size);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("QUICK JOIN ERROR:", err);
    res.status(500).json({ success: false, error: err.message || "Quick join failed" });
  }
});
router4.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: "Invalid circle ID" });
    const circle = await nightCirclesService.getCircleById(id);
    const members = await nightCirclesService.getMembers(id);
    const messages = await nightCirclesService.getMessages(id, 50);
    const aiSeed = circle.currentMembers !== null && circle.currentMembers < 2 ? nightCirclesService.getAiSeedMessage() : null;
    res.json({ success: true, data: { circle, members, messages, aiSeed } });
  } catch (err) {
    if (err.name === "NotFoundError") return res.status(404).json({ success: false, error: err.message });
    res.status(500).json({ success: false, error: "Failed to fetch circle" });
  }
});
router4.post("/:id/join", async (req, res) => {
  try {
    const circleId = parseInt(req.params.id);
    const mode = req.body.mode ?? "listener";
    const userId = req.user?.id;
    const member = await nightCirclesService.joinCircle(circleId, userId, mode);
    const circle = await nightCirclesService.getCircleById(circleId);
    const aiSeed = (circle.currentMembers ?? 0) < 2 ? nightCirclesService.getAiSeedMessage() : null;
    res.json({ success: true, data: { member, circle, aiSeed } });
  } catch (err) {
    const status = err.message?.includes("capacity") ? 409 : 500;
    res.status(status).json({ success: false, error: err.message || "Failed to join circle" });
  }
});
router4.post("/:id/leave", requireAuth, async (req, res) => {
  try {
    const circleId = parseInt(req.params.id);
    const userId = req.user?.id;
    await nightCirclesService.leaveCircle(circleId, userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to leave circle" });
  }
});
router4.get("/:id/messages", async (req, res) => {
  try {
    const circleId = parseInt(req.params.id);
    const messages = await nightCirclesService.getMessages(circleId);
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
});
router4.post("/:id/messages", async (req, res) => {
  try {
    const circleId = parseInt(req.params.id);
    const { senderAlias, content, imageUrl } = req.body;
    if (!senderAlias?.trim() || !content?.trim() && !imageUrl) {
      return res.status(400).json({ success: false, error: "Alias and content (or image) are required" });
    }
    const message = await nightCirclesService.sendMessage(circleId, senderAlias, content || "", imageUrl);
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
});
var night_circles_routes_default = router4;

// server/routes/api/v1/mind-maze.routes.ts
import { Router as Router5 } from "express";

// server/services/mind-maze.service.ts
init_storage();
init_logger();
var MindMazeService = class {
  /**
   * Get all mind maze questions
   */
  async getAllQuestions(limit) {
    logger.debug("Fetching all mind maze questions");
    return await storage.getMindMaze(limit);
  }
  /**
   * Get question by ID
   */
  async getQuestionById(id) {
    logger.debug(`Fetching mind maze question with id: ${id}`);
    const questions = await storage.getMindMaze();
    const question = questions.find((q) => q.id === id);
    if (!question) {
      throw new NotFoundError(`Question with id ${id} not found`);
    }
    return question;
  }
  /**
   * Create a new question
   */
  async createQuestion(data) {
    logger.info("Creating new mind maze question");
    return await storage.createMindMaze(data);
  }
  /**
   * Increment response count for a question
   */
  async incrementResponses(id) {
    logger.info(`Incrementing responses for question: ${id}`);
    await this.getQuestionById(id);
    await storage.incrementMindMazeResponses(id);
  }
  /**
   * Submit a Spark (response) to a Maze
   */
  async createSpark(data) {
    logger.info(`Creating spark for maze ${data.mazeId}`);
    await this.getQuestionById(data.mazeId);
    return await storage.createMindMazeSpark(data);
  }
  /**
   * Get sparks for a maze
   */
  async getSparks(mazeId) {
    logger.debug(`Fetching sparks for maze ${mazeId}`);
    return await storage.getMindMazeSparks(mazeId);
  }
  /**
   * Resonate with a spark
   */
  async resonateSpark(sparkId, raterId) {
    logger.info(`User ${raterId} resonating with spark ${sparkId}`);
    await storage.incrementSparkResonance(sparkId);
  }
};
var mindMazeService = new MindMazeService();

// server/controllers/mind-maze.controller.ts
var MindMazeController = class {
  /**
   * GET /api/v1/mind-maze
   */
  getAll = asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
    const questions = await mindMazeService.getAllQuestions(limit);
    res.json(successResponse(questions));
  });
  /**
   * GET /api/v1/mind-maze/:id
   */
  getById = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const question = await mindMazeService.getQuestionById(id);
    res.json(successResponse(question));
  });
  /**
   * POST /api/v1/mind-maze
   */
  create = asyncHandler(async (req, res) => {
    const question = await mindMazeService.createQuestion(req.body);
    res.status(201).json(successResponse(question));
  });
  /**
   * POST /api/v1/mind-maze/:id/respond
   */
  respond = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    await mindMazeService.incrementResponses(id);
    res.json(successResponse({ message: "Response recorded" }));
  });
  /**
   * GET /api/v1/mind-maze/:id/sparks
   */
  getSparks = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const sparks = await mindMazeService.getSparks(id);
    res.json(successResponse(sparks));
  });
  /**
   * POST /api/v1/mind-maze/:id/sparks
   */
  createSpark = asyncHandler(async (req, res) => {
    const mazeId = parseInt(req.params.id);
    const { content, sparkType } = req.body;
    const authorId = req.user?.id || 1;
    const spark = await mindMazeService.createSpark({ mazeId, content, sparkType, authorId });
    res.status(201).json(successResponse(spark));
  });
  /**
   * POST /api/v1/mind-maze/sparks/:sparkId/resonate
   */
  resonateSpark = asyncHandler(async (req, res) => {
    const sparkId = parseInt(req.params.sparkId);
    const raterId = req.user?.id || 1;
    await mindMazeService.resonateSpark(sparkId, raterId);
    res.json(successResponse({ message: "Spark resonated!" }));
  });
};
var mindMazeController = new MindMazeController();

// server/routes/api/v1/mind-maze.routes.ts
init_schema();
import { z as z5 } from "zod";
var router5 = Router5();
router5.get("/", mindMazeController.getAll);
router5.get(
  "/:id",
  validate(z5.object({ id: z5.string().regex(/^\d+$/) }), "params"),
  mindMazeController.getById
);
router5.post(
  "/",
  validate(insertMindMazeSchema),
  mindMazeController.create
);
router5.post(
  "/:id/respond",
  validate(z5.object({ id: z5.string().regex(/^\d+$/) }), "params"),
  mindMazeController.respond
);
router5.get(
  "/:id/sparks",
  validate(z5.object({ id: z5.string().regex(/^\d+$/) }), "params"),
  mindMazeController.getSparks
);
router5.post(
  "/:id/sparks",
  validate(z5.object({ id: z5.string().regex(/^\d+$/) }), "params"),
  // Also requires validation of body: content, sparkType. 
  // Handled broadly in controller for now based on fast-iteration requirement.
  mindMazeController.createSpark
);
router5.post(
  "/sparks/:sparkId/resonate",
  validate(z5.object({ sparkId: z5.string().regex(/^\d+$/) }), "params"),
  mindMazeController.resonateSpark
);
var mind_maze_routes_default = router5;

// server/routes/api/v1/music.routes.ts
import { Router as Router6 } from "express";

// server/services/music.service.ts
init_storage();
init_logger();
import memoize from "memoizee";
var MusicService = class {
  // Cache music searches for 15 minutes to reduce external API calls
  searchMusicCached = memoize(
    async (query) => {
      const clientId = process.env.JAMENDO_CLIENT_ID || "0d325310";
      logger.debug(`[MusicService] Searching Jamendo for: ${query}`);
      const therapyTags = /* @__PURE__ */ new Set([
        "binaural",
        "healing",
        "meditation",
        "relaxation",
        "sleep",
        "ambient",
        "nature",
        "piano",
        "relax",
        "therapy",
        "asmr"
      ]);
      const isTherapyQuery = therapyTags.has(query.toLowerCase());
      const tagUrl = new URL("https://api.jamendo.com/v3.0/tracks/");
      tagUrl.searchParams.set("client_id", clientId);
      tagUrl.searchParams.set("format", "json");
      tagUrl.searchParams.set("limit", "50");
      tagUrl.searchParams.set("tags", query);
      tagUrl.searchParams.set("fuzzytags", "1");
      tagUrl.searchParams.set("boost", "popularity_week");
      tagUrl.searchParams.set("audioformat", "mp32");
      if (isTherapyQuery) {
        tagUrl.searchParams.set("vocalinstrumental", "instrumental");
      }
      let response = await fetch(tagUrl.toString());
      let data = await response.json();
      let tracks = data.results || [];
      if (tracks.length < 5) {
        logger.debug(`[MusicService] Low tag results for "${query}". Trying text search...`);
        const searchUrl = new URL("https://api.jamendo.com/v3.0/tracks/");
        searchUrl.searchParams.set("client_id", clientId);
        searchUrl.searchParams.set("format", "json");
        searchUrl.searchParams.set("limit", "50");
        searchUrl.searchParams.set("search", query);
        searchUrl.searchParams.set("boost", "popularity_week");
        searchUrl.searchParams.set("audioformat", "mp32");
        if (isTherapyQuery) {
          searchUrl.searchParams.set("vocalinstrumental", "instrumental");
        }
        response = await fetch(searchUrl.toString());
        data = await response.json();
        tracks = data.results || [];
      }
      if (tracks.length === 0 && isTherapyQuery) {
        logger.debug(`[MusicService] 0 results for therapy query "${query}". Retrying without instrumental filter...`);
        const searchUrl = new URL("https://api.jamendo.com/v3.0/tracks/");
        searchUrl.searchParams.set("client_id", clientId);
        searchUrl.searchParams.set("format", "json");
        searchUrl.searchParams.set("limit", "50");
        searchUrl.searchParams.set("search", query);
        searchUrl.searchParams.set("boost", "popularity_week");
        searchUrl.searchParams.set("audioformat", "mp32");
        response = await fetch(searchUrl.toString());
        data = await response.json();
        tracks = data.results || [];
      }
      if (tracks.length === 0) {
        logger.debug(`[MusicService] STILL 0 results for "${query}". Falling back to generic relaxing...`);
        const fallbackUrl = new URL("https://api.jamendo.com/v3.0/tracks/");
        fallbackUrl.searchParams.set("client_id", clientId);
        fallbackUrl.searchParams.set("format", "json");
        fallbackUrl.searchParams.set("limit", "50");
        fallbackUrl.searchParams.set("search", "relaxing");
        fallbackUrl.searchParams.set("boost", "popularity_week");
        fallbackUrl.searchParams.set("audioformat", "mp32");
        response = await fetch(fallbackUrl.toString());
        data = await response.json();
        tracks = data.results || [];
      }
      if (tracks.length === 0) {
        throw new Error("No tracks found on Jamendo for these tags");
      }
      return tracks.map((track) => ({
        id: track.id,
        title: track.name,
        artist: track.artist_name || "Unknown Artist",
        url: track.audio,
        coverArt: track.album_image || track.image || null,
        mood: "dynamic"
      }));
    },
    {
      maxAge: 1e3 * 60 * 15,
      // 15 min cache
      promise: true,
      length: 1
    }
  );
  async searchMusic(query) {
    if (!query || typeof query !== "string") {
      throw new Error("Query parameter is required");
    }
    try {
      return await this.searchMusicCached(query);
    } catch (error) {
      this.searchMusicCached.delete(query);
      logger.warn(`[MusicService] Search failed for "${query}", cache entry cleared`);
      return [];
    }
  }
  async toggleFavorite(userId, stationId) {
    logger.info(`Toggling favorite station for user: ${userId}`, { stationId });
    return await storage.toggleSavedStation(userId, stationId);
  }
  async getFavorites(userId) {
    logger.debug(`Fetching favorite stations for user: ${userId}`);
    return await storage.getSavedStations(userId);
  }
};
var musicService = new MusicService();

// server/controllers/music.controller.ts
var MusicController = class {
  /**
   * GET /api/v1/music/search?query=
   */
  search = asyncHandler(async (req, res) => {
    const query = req.query.query;
    if (!query || !query.trim()) {
      return res.json([]);
    }
    const stations = await musicService.searchMusic(query);
    res.json(stations);
  });
  /**
   * POST /api/v1/music/favorites/:stationId
   */
  toggleFavorite = asyncHandler(async (req, res) => {
    const { stationId } = req.params;
    const saved = await musicService.toggleFavorite(req.user.id, stationId);
    res.json(successResponse({ saved }));
  });
  /**
   * GET /api/v1/music/favorites
   */
  getFavorites = asyncHandler(async (req, res) => {
    const stations = await musicService.getFavorites(req.user.id);
    res.json(successResponse(stations));
  });
};
var musicController = new MusicController();

// server/routes/api/v1/music.routes.ts
import { z as z6 } from "zod";
var router6 = Router6();
router6.get("/search", validate(z6.object({ query: z6.string().optional().default("") }), "query"), musicController.search);
router6.post("/favorites/:stationId", requireAuth, validate(z6.object({ stationId: z6.string() }), "params"), musicController.toggleFavorite);
router6.get("/favorites", requireAuth, musicController.getFavorites);
var music_routes_default = router6;

// server/routes/api/v1/3am-founder.routes.ts
import { Router as Router7 } from "express";

// server/services/3am-founder.service.ts
init_storage();
init_logger();
var AmFounderService = class {
  /**
   * Get all founder posts
   */
  async getAllPosts() {
    logger.debug("Fetching all 3AM founder posts");
    return await storage.getAmFounder();
  }
  /**
   * Create a new founder post
   */
  async createPost(data, userId) {
    logger.info("Creating new 3AM founder post", { userId });
    const postData = {
      ...data,
      authorId: userId
    };
    return await storage.createAmFounder(postData);
  }
  /**
   * Increment upvote count
   */
  async incrementUpvotes(id) {
    logger.info(`Incrementing upvotes for founder post: ${id}`);
    await storage.incrementFounderUpvotes(id);
  }
  /**
   * Increment comment count
   */
  async incrementComments(id) {
    logger.info(`Incrementing comments for founder post: ${id}`);
    await storage.incrementFounderComments(id);
  }
  /**
   * Create a reply to a founder post
   */
  async createReply(founderId, content, userId) {
    logger.info(`Creating reply for founder post: ${founderId}`, { userId });
    await Promise.all([
      storage.createAmFounderReply({
        founderId,
        content,
        authorId: userId
      }),
      storage.incrementFounderComments(founderId)
    ]);
  }
  /**
   * Get replies for a founder post
   */
  async getReplies(founderId) {
    logger.debug(`Fetching replies for founder post: ${founderId}`);
    return await storage.getAmFounderReplies(founderId);
  }
};
var amFounderService = new AmFounderService();

// server/controllers/3am-founder.controller.ts
var AmFounderController = class {
  /**
   * GET /api/v1/founder
   */
  getAll = asyncHandler(async (req, res) => {
    const posts = await amFounderService.getAllPosts();
    res.json(successResponse(posts));
  });
  /**
   * POST /api/v1/founder
   */
  create = asyncHandler(async (req, res) => {
    const post = await amFounderService.createPost(req.body, req.user?.id);
    res.status(201).json(successResponse(post));
  });
  /**
   * POST /api/v1/founder/:id/upvote
   */
  upvote = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    await amFounderService.incrementUpvotes(id);
    res.json(successResponse({ message: "Upvoted successfully" }));
  });
  /**
   * POST /api/v1/founder/:id/comment
   */
  comment = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    await amFounderService.incrementComments(id);
    res.json(successResponse({ message: "Comment count incremented" }));
  });
  /**
   * POST /api/v1/founder/:id/replies
   */
  createReply = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const { content } = req.body;
    await amFounderService.createReply(id, content, req.user?.id);
    res.status(201).json(successResponse({ message: "Reply created successfully" }));
  });
  /**
   * GET /api/v1/founder/:id/replies
   */
  getReplies = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const replies = await amFounderService.getReplies(id);
    res.json(successResponse(replies));
  });
};
var amFounderController = new AmFounderController();

// server/routes/api/v1/3am-founder.routes.ts
init_schema();
import { z as z7 } from "zod";
var router7 = Router7();
router7.get("/", amFounderController.getAll);
router7.post(
  "/",
  optionalAuth,
  validate(insertAmFounderSchema),
  amFounderController.create
);
router7.post(
  "/:id/upvote",
  validate(z7.object({ id: z7.string().regex(/^\d+$/) }), "params"),
  amFounderController.upvote
);
router7.post(
  "/:id/comment",
  validate(z7.object({ id: z7.string().regex(/^\d+$/) }), "params"),
  amFounderController.comment
);
router7.get(
  "/:id/replies",
  validate(z7.object({ id: z7.string().regex(/^\d+$/) }), "params"),
  amFounderController.getReplies
);
router7.post(
  "/:id/replies",
  optionalAuth,
  validate(z7.object({ id: z7.string().regex(/^\d+$/) }), "params"),
  validate(z7.object({ content: z7.string().min(1) })),
  amFounderController.createReply
);
var am_founder_routes_default = router7;

// server/routes/api/v1/starlit-speaker.routes.ts
import { Router as Router8 } from "express";

// server/services/starlit-speaker.service.ts
init_storage();
init_misc_repository();
init_logger();
var StarlitSpeakerService = class {
  /** Get active rooms only (stale rooms auto-swept inside the repo) */
  async getAllRooms() {
    logger.debug("Fetching active starlit speaker rooms");
    return await storage.getStarlitSpeaker();
  }
  /** Create a new room */
  async createRoom(data) {
    logger.info("Creating new starlit speaker room");
    return await storage.createStarlitSpeaker(data);
  }
  /** Update participant count */
  async updateParticipants(id, participants) {
    logger.info(`Updating participants for room: ${id}`, { participants });
    await storage.updateSpeakerParticipants(id, participants);
  }
  /** Mark a room as ended — called when speaker clicks Stop */
  async endRoom(id) {
    logger.info(`Ending speaker room: ${id}`);
    await deactivateRoom(id);
  }
  /** Real counts for the stats panel (no fake numbers) */
  async getStats() {
    return await getActiveSpeakerStats();
  }
};
var starlitSpeakerService = new StarlitSpeakerService();

// server/controllers/starlit-speaker.controller.ts
var StarlitSpeakerController = class {
  getAll = asyncHandler(async (req, res) => {
    const rooms = await starlitSpeakerService.getAllRooms();
    res.json(successResponse(rooms));
  });
  create = asyncHandler(async (req, res) => {
    const room = await starlitSpeakerService.createRoom(req.body);
    res.status(201).json(successResponse(room));
  });
  updateParticipants = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const { participants } = req.body;
    await starlitSpeakerService.updateParticipants(id, participants);
    res.json(successResponse({ message: "Participants updated" }));
  });
  /** Called when the speaker stops recording — marks room inactive */
  endRoom = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    await starlitSpeakerService.endRoom(id);
    res.json(successResponse({ message: "Room ended" }));
  });
  /** Real stats — replaces the hardcoded numbers on the frontend */
  getStats = asyncHandler(async (_req, res) => {
    const stats = await starlitSpeakerService.getStats();
    res.json(successResponse(stats));
  });
};
var starlitSpeakerController = new StarlitSpeakerController();

// server/routes/api/v1/starlit-speaker.routes.ts
init_schema();
import { z as z8 } from "zod";
var router8 = Router8();
router8.get("/stats", starlitSpeakerController.getStats);
router8.get("/", starlitSpeakerController.getAll);
router8.post(
  "/",
  validate(insertStarlitSpeakerSchema),
  starlitSpeakerController.create
);
router8.patch(
  "/:id/participants",
  validate(z8.object({ id: z8.string().regex(/^\d+$/) }), "params"),
  validate(z8.object({ participants: z8.number() })),
  starlitSpeakerController.updateParticipants
);
router8.patch(
  "/:id/end",
  validate(z8.object({ id: z8.string().regex(/^\d+$/) }), "params"),
  starlitSpeakerController.endRoom
);
var starlit_speaker_routes_default = router8;

// server/routes/api/v1/moon-messenger.routes.ts
import { Router as Router9 } from "express";

// server/services/moon-messenger.service.ts
init_storage();
init_logger();
var MoonMessengerService = class {
  /**
   * Get messages for a session
   */
  async getMessages(sessionId) {
    logger.debug(`Fetching messages for session: ${sessionId}`);
    return await storage.getMoonMessages(sessionId);
  }
  /**
   * Get active sessions
   */
  async getActiveSessions() {
    logger.debug("Fetching active sessions");
    return await storage.getActiveSessions();
  }
  /**
   * Create a new message
   */
  async createMessage(data) {
    logger.info("Creating new moon message");
    return await storage.createMoonMessage(data);
  }
};
var moonMessengerService = new MoonMessengerService();

// server/controllers/moon-messenger.controller.ts
var MoonMessengerController = class {
  getMessages = asyncHandler(async (req, res) => {
    const sessionId = req.query.sessionId || req.params.sessionId;
    const messages = await moonMessengerService.getMessages(sessionId);
    res.json(successResponse(messages));
  });
  getSessions = asyncHandler(async (req, res) => {
    const sessions2 = await moonMessengerService.getActiveSessions();
    res.json(successResponse(sessions2));
  });
  createMessage = asyncHandler(async (req, res) => {
    const message = await moonMessengerService.createMessage(req.body);
    res.status(201).json(successResponse(message));
  });
};
var moonMessengerController = new MoonMessengerController();

// server/routes/api/v1/moon-messenger.routes.ts
init_schema();
import { z as z9 } from "zod";
var router9 = Router9();
router9.get("/", moonMessengerController.getSessions);
router9.get(
  "/:sessionId",
  validate(z9.object({ sessionId: z9.string() }), "params"),
  moonMessengerController.getMessages
);
router9.post(
  "/",
  validate(insertMoonMessengerSchema),
  moonMessengerController.createMessage
);
var moon_messenger_routes_default = router9;

// server/routes/api/v1/user.routes.ts
import { Router as Router10 } from "express";

// server/services/user.service.ts
init_storage();
init_logger();
var UserService = class {
  /**
   * Get user's whispers
   */
  async getUserWhispers(userId) {
    logger.debug(`Fetching whispers for user: ${userId}`);
    return await storage.getUserWhispers(userId);
  }
  /**
   * Get user's cafe posts
   */
  async getUserCafePosts(userId) {
    logger.debug(`Fetching cafe posts for user: ${userId}`);
    return await storage.getUserCafePosts(userId);
  }
  /**
   * Get user's favorite music stations
   */
  async getUserFavoriteStations(userId) {
    logger.debug(`Fetching favorite stations for user: ${userId}`);
    return await storage.getSavedStations(userId);
  }
  /**
   * Update user settings
   */
  async updateUserSettings(userId, data) {
    logger.debug(`Updating settings for user: ${userId}`);
    const { displayName, bio, location, nightPersona, ...preferences } = data;
    const updateData = {};
    if (displayName !== void 0) updateData.displayName = displayName;
    if (bio !== void 0) updateData.bio = bio;
    if (location !== void 0) updateData.location = location;
    if (nightPersona !== void 0) updateData.nightPersona = nightPersona;
    const existingUser = await storage.getUser(userId);
    if (existingUser) {
      const currentPreferences = existingUser.preferences || {};
      updateData.preferences = { ...currentPreferences, ...preferences };
    } else {
      updateData.preferences = preferences;
    }
    const updatedUser = await storage.updateUser(userId, updateData);
    if (!updatedUser) {
      throw new Error("Failed to update user");
    }
    const { password, googleId, ...safeUser } = updatedUser;
    return safeUser;
  }
};
var userService = new UserService();

// server/controllers/user.controller.ts
var UserController = class {
  getMyWhispers = asyncHandler(async (req, res) => {
    const whispers2 = await userService.getUserWhispers(req.user.id);
    res.json(successResponse(whispers2));
  });
  getMyCafePosts = asyncHandler(async (req, res) => {
    const posts = await userService.getUserCafePosts(req.user.id);
    res.json(successResponse(posts));
  });
  getMyFavorites = asyncHandler(async (req, res) => {
    const stations = await userService.getUserFavoriteStations(req.user.id);
    res.json(successResponse(stations));
  });
  updateMySettings = asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateUserSettings(req.user.id, req.body);
    res.json(successResponse(updatedUser));
  });
};
var userController = new UserController();

// server/routes/api/v1/user.routes.ts
var router10 = Router10();
router10.use(requireAuth);
router10.get("/me/whispers", userController.getMyWhispers);
router10.get("/me/cafe", userController.getMyCafePosts);
router10.get("/me/favorites", userController.getMyFavorites);
router10.patch("/me/settings", userController.updateMySettings);
var user_routes_default = router10;

// server/routes/api/v1/onboarding.routes.ts
init_storage();
import { Router as Router11 } from "express";
var router11 = Router11();
router11.post("/complete", async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Authentication required" }
      });
    }
    const userId = req.user.id;
    await storage.updateUserOnboarding(userId, true);
    res.json({
      success: true,
      message: "Onboarding completed"
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
});
var onboarding_routes_default = router11;

// server/routes/api/v1/trending.routes.ts
import { Router as Router12 } from "express";

// server/controllers/trending.controller.ts
var TrendingController = class {
  constructor(storage3) {
    this.storage = storage3;
  }
  storage;
  getTopics = async (req, res) => {
    try {
      const trendingTopics = await this.storage.getTrendingTopics();
      res.json({
        success: true,
        data: trendingTopics
      });
    } catch (error) {
      console.error("Error fetching trending topics:", error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  };
};

// server/routes/api/v1/trending.routes.ts
init_storage();
var router12 = Router12();
var trendingController = new TrendingController(storage);
router12.get("/topics", trendingController.getTopics);
var trending_routes_default = router12;

// server/routes/api/v1/activity.routes.ts
import { Router as Router13 } from "express";

// server/controllers/activity.controller.ts
init_logger();
var ActivityController = class {
  constructor(storage3) {
    this.storage = storage3;
  }
  storage;
  getRecent = async (req, res) => {
    const MAX_RETRIES = 2;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const combined = await this.storage.getRecentActivity(20);
        return res.json({ success: true, data: combined });
      } catch (error) {
        const isNetworkError = ["ENOTFOUND", "ECONNREFUSED", "ETIMEDOUT"].includes(error.code);
        if (isNetworkError && attempt < MAX_RETRIES) {
          logger.warn(`[activity/recent] Network error on attempt ${attempt}, retrying...`);
          await new Promise((r) => setTimeout(r, 1e3));
          continue;
        }
        logger.error(`[activity/recent] Failed after ${attempt} attempt(s): ${error.message}`);
        return res.json({ success: true, data: [] });
      }
    }
  };
  getStats = async (req, res) => {
    try {
      const stats = await this.storage.getActivityStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error("Error fetching activity stats:", error);
      res.json({ success: true, data: { diaries_today: 0, whispers_today: 0, cafe_today: 0, active_users_today: 0 } });
    }
  };
};

// server/routes/api/v1/activity.routes.ts
init_storage();
var router13 = Router13();
var activityController = new ActivityController(storage);
router13.get("/recent", activityController.getRecent);
router13.get("/stats", activityController.getStats);
var activity_routes_default = router13;

// server/routes/api/v1/profile.routes.ts
import { Router as Router14 } from "express";

// server/controllers/profile.controller.ts
var ProfileController = class {
  constructor(storage3) {
    this.storage = storage3;
  }
  storage;
  getStats = async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({
          success: false,
          error: { message: "Authentication required" }
        });
      }
      const userId = req.user.id;
      const stats = await this.storage.getUserProfileStats(userId);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  };
  getAchievements = async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({
          success: false,
          error: { message: "Authentication required" }
        });
      }
      const userId = req.user.id;
      const achievements = await this.storage.getUserAchievements(userId);
      res.json({
        success: true,
        data: achievements
      });
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({
        success: false,
        error: { message: error.message }
      });
    }
  };
};

// server/routes/api/v1/profile.routes.ts
init_storage();
var router14 = Router14();
var profileController = new ProfileController(storage);
router14.get("/stats", profileController.getStats);
router14.get("/achievements", profileController.getAchievements);
var profile_routes_default = router14;

// server/routes/api/v1/night-thoughts.routes.ts
import { Router as Router15 } from "express";

// server/services/night-thoughts.service.ts
init_db();
init_schema();
import { eq as eq13, desc as desc11, and as and6, or as or3, sql as sql10 } from "drizzle-orm";
var NightThoughtsService = class {
  /**
   * Smart categorization logic - auto-detect thought type based on content
   */
  detectThoughtType(content, topic) {
    if (topic) {
      return "discussion";
    }
    if (content.length <= 280) {
      return "whisper";
    }
    return "diary";
  }
  /**
   * Create a new night thought with smart categorization
   */
  async create(thought) {
    const thoughtType = thought.thoughtType || this.detectThoughtType(thought.content, thought.topic);
    const expiresAt = thoughtType === "whisper" ? new Date(Date.now() + 24 * 60 * 60 * 1e3) : null;
    const [newThought] = await db.insert(nightThoughts).values({
      ...thought,
      thoughtType,
      expiresAt
    }).returning();
    return newThought;
  }
  /**
   * Get all thoughts (with optional filters)
   */
  async getAll(filters) {
    const conditions = [];
    if (filters?.authorId) {
      conditions.push(eq13(nightThoughts.authorId, filters.authorId));
    }
    if (filters?.thoughtType) {
      conditions.push(eq13(nightThoughts.thoughtType, filters.thoughtType));
    }
    if (filters?.isPrivate !== void 0) {
      conditions.push(eq13(nightThoughts.isPrivate, filters.isPrivate));
    }
    if (!filters?.includeExpired) {
      conditions.push(
        or3(
          eq13(nightThoughts.expiresAt, null),
          sql10`${nightThoughts.expiresAt} > NOW()`
        )
      );
    }
    const query = conditions.length > 0 ? db.select().from(nightThoughts).where(and6(...conditions)) : db.select().from(nightThoughts);
    return await query.orderBy(desc11(nightThoughts.createdAt));
  }
  /**
   * Get a single thought by ID
   */
  async getById(id) {
    const [thought] = await db.select().from(nightThoughts).where(eq13(nightThoughts.id, id));
    return thought;
  }
  /**
   * Update a thought
   */
  async update(id, updates) {
    const [updated] = await db.update(nightThoughts).set(updates).where(eq13(nightThoughts.id, id)).returning();
    return updated;
  }
  /**
   * Delete a thought
   */
  async delete(id) {
    await db.delete(nightThoughts).where(eq13(nightThoughts.id, id));
  }
  async addHeart(id) {
    const [updated] = await db.update(nightThoughts).set({ hearts: sql10`${nightThoughts.hearts} + 1` }).where(eq13(nightThoughts.id, id)).returning();
    return updated;
  }
  async incrementReplies(id) {
    const [updated] = await db.update(nightThoughts).set({ replies: sql10`${nightThoughts.replies} + 1` }).where(eq13(nightThoughts.id, id)).returning();
    return updated;
  }
  /**
   * Get all replies for a thought, oldest first
   */
  async getReplies(thoughtId) {
    return db.select().from(nightThoughtReplies).where(eq13(nightThoughtReplies.thoughtId, thoughtId)).orderBy(nightThoughtReplies.createdAt);
  }
  /**
   * Create a reply and atomically increment the replies counter
   */
  async addReply(data) {
    const [reply] = await db.insert(nightThoughtReplies).values(data).returning();
    await db.update(nightThoughts).set({ replies: sql10`${nightThoughts.replies} + 1` }).where(eq13(nightThoughts.id, data.thoughtId));
    return reply;
  }
  async cleanupExpired() {
    return 0;
  }
};
var nightThoughtsService = new NightThoughtsService();

// server/controllers/night-thoughts.controller.ts
init_schema();
init_logger();
import { z as z10 } from "zod";
var NightThoughtsController = class {
  /**
   * GET /api/v1/thoughts
   * Get all night thoughts with optional filters
   */
  getAll = async (req, res, next) => {
    try {
      const { thoughtType, isPrivate, authorId } = req.query;
      const filters = {};
      if (thoughtType) filters.thoughtType = thoughtType;
      if (isPrivate !== void 0) filters.isPrivate = isPrivate === "true";
      if (authorId) filters.authorId = parseInt(authorId);
      if (!authorId || req.user && parseInt(authorId) !== req.user.id) {
        filters.isPrivate = false;
      }
      const thoughts = await nightThoughtsService.getAll(filters);
      res.json(thoughts);
    } catch (error) {
      logger.error("Error fetching thoughts:", error);
      next(error);
    }
  };
  /**
   * GET /api/v1/thoughts/:id
   * Get a single thought by ID
   */
  getById = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const thought = await nightThoughtsService.getById(id);
      if (!thought) {
        return res.status(404).json({ error: "Thought not found" });
      }
      if (thought.isPrivate && (!req.user || thought.authorId !== req.user.id)) {
        return res.status(403).json({ error: "This thought is private" });
      }
      res.json(thought);
    } catch (error) {
      logger.error("Error fetching thought:", error);
      next(error);
    }
  };
  /**
   * POST /api/v1/thoughts
   * Create a new night thought
   */
  create = async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const validatedData = insertNightThoughtSchema.parse({
        ...req.body,
        authorId: req.user.id
      });
      const thought = await nightThoughtsService.create(validatedData);
      res.status(201).json(thought);
    } catch (error) {
      if (error instanceof z10.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      logger.error("Error creating thought:", error);
      next(error);
    }
  };
  /**
   * PATCH /api/v1/thoughts/:id
   * Update a thought
   */
  update = async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const id = parseInt(req.params.id);
      const existing = await nightThoughtsService.getById(id);
      if (!existing) {
        return res.status(404).json({ error: "Thought not found" });
      }
      if (existing.authorId !== req.user.id) {
        return res.status(403).json({ error: "You can only edit your own thoughts" });
      }
      const updated = await nightThoughtsService.update(id, req.body);
      res.json(updated);
    } catch (error) {
      logger.error("Error updating thought:", error);
      next(error);
    }
  };
  /**
   * DELETE /api/v1/thoughts/:id
   * Delete a thought
   */
  delete = async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const id = parseInt(req.params.id);
      const existing = await nightThoughtsService.getById(id);
      if (!existing) {
        return res.status(404).json({ error: "Thought not found" });
      }
      if (existing.authorId !== req.user.id) {
        return res.status(403).json({ error: "You can only delete your own thoughts" });
      }
      await nightThoughtsService.delete(id);
      res.json({ message: "Thought deleted successfully" });
    } catch (error) {
      logger.error("Error deleting thought:", error);
      next(error);
    }
  };
  /**
   * POST /api/v1/thoughts/:id/heart
   * Add a heart to a thought
   */
  addHeart = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const thought = await nightThoughtsService.addHeart(id);
      res.json(thought);
    } catch (error) {
      logger.error("Error adding heart:", error);
      next(error);
    }
  };
  /**
   * GET /api/v1/thoughts/:id/replies
   * Fetch all replies for a thought
   */
  getReplies = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const thought = await nightThoughtsService.getById(id);
      if (!thought) {
        return res.status(404).json({ error: "Thought not found" });
      }
      if (thought.isPrivate && (!req.user || thought.authorId !== req.user.id)) {
        return res.status(403).json({ error: "This thought is private" });
      }
      const replies = await nightThoughtsService.getReplies(id);
      res.json(replies);
    } catch (error) {
      logger.error("Error fetching replies:", error);
      next(error);
    }
  };
  /**
   * POST /api/v1/thoughts/:id/replies
   * Post a new reply to a thought
   */
  addReply = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const thought = await nightThoughtsService.getById(id);
      if (!thought) {
        return res.status(404).json({ error: "Thought not found" });
      }
      if (!thought.allowReplies) {
        return res.status(403).json({ error: "Replies are disabled for this thought" });
      }
      if (thought.isPrivate && (!req.user || thought.authorId !== req.user.id)) {
        return res.status(403).json({ error: "This thought is private" });
      }
      const validated = insertNightThoughtReplySchema.parse({
        thoughtId: id,
        content: req.body.content,
        authorId: req.user?.id ?? null
      });
      const reply = await nightThoughtsService.addReply(validated);
      res.status(201).json(reply);
    } catch (error) {
      if (error instanceof z10.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      logger.error("Error posting reply:", error);
      next(error);
    }
  };
};
var nightThoughtsController = new NightThoughtsController();

// server/routes/api/v1/night-thoughts.routes.ts
var router15 = Router15();
router15.get("/", nightThoughtsController.getAll);
router15.get("/:id", nightThoughtsController.getById);
router15.post("/", nightThoughtsController.create);
router15.patch("/:id", nightThoughtsController.update);
router15.delete("/:id", nightThoughtsController.delete);
router15.post("/:id/heart", nightThoughtsController.addHeart);
router15.get("/:id/replies", nightThoughtsController.getReplies);
router15.post("/:id/replies", nightThoughtsController.addReply);
var night_thoughts_routes_default = router15;

// server/routes/api/v1/reads.routes.ts
import { Router as Router16 } from "express";

// server/controllers/reads.controller.ts
init_db();
init_schema();
import { createRequire } from "module";
import { eq as eq14, and as and7, desc as desc12, or as or4, gt, isNull } from "drizzle-orm";
var require2 = createRequire(import.meta.url);
var pdfParse = require2("pdf-parse");
var readsController = {
  // Create a new read (upload or paste)
  async createRead(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      let content = "";
      let contentType = "text";
      const file = req.file;
      if (file) {
        if (file.mimetype === "application/pdf") {
          try {
            const pdfData = await pdfParse(file.buffer);
            content = pdfData.text;
            contentType = "pdf";
          } catch (error) {
            console.error("PDF parsing error:", error);
            return res.status(400).json({ error: "Failed to parse PDF file" });
          }
        } else if (file.mimetype === "text/plain" || file.originalname.endsWith(".txt")) {
          content = file.buffer.toString("utf-8");
          contentType = "text";
        }
      } else if (req.body.content) {
        content = req.body.content;
        contentType = "text";
      }
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: "No content provided" });
      }
      const { title, author, intention, estimatedReadTimeMinutes, isEphemeral } = req.body;
      const wordCount = content.split(/\s+/).length;
      const calculatedReadTime = estimatedReadTimeMinutes || Math.ceil(wordCount / 200);
      const expiresAt = isEphemeral ? new Date(Date.now() + 24 * 60 * 60 * 1e3) : null;
      const newRead = await db.insert(reads).values({
        title: title || "Untitled",
        author: author || null,
        content,
        contentType,
        estimatedReadTimeMinutes: calculatedReadTime,
        intention: intention || "think",
        ownerId: req.user.id,
        visibility: "private",
        moderationStatus: "approved",
        isEphemeral: isEphemeral || false,
        expiresAt
      }).returning();
      res.status(201).json(newRead[0]);
    } catch (error) {
      console.error("Error creating read:", error);
      res.status(500).json({ error: "Failed to create read" });
    }
  },
  // Get user's private bookshelf
  async getUserReads(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const userReads = await db.select().from(reads).where(
        and7(
          eq14(reads.ownerId, req.user.id),
          eq14(reads.visibility, "private"),
          or4(
            isNull(reads.expiresAt),
            gt(reads.expiresAt, /* @__PURE__ */ new Date())
          )
        )
      ).orderBy(desc12(reads.lastAccessedAt), desc12(reads.createdAt));
      res.json(userReads);
    } catch (error) {
      console.error("Error fetching user reads:", error);
      res.status(500).json({ error: "Failed to fetch reads" });
    }
  },
  // Get a specific read with session data
  async getRead(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const readId = parseInt(req.params.id);
      const [read] = await db.select().from(reads).where(eq14(reads.id, readId));
      if (!read) {
        return res.status(404).json({ error: "Read not found" });
      }
      if (read.visibility === "private" && read.ownerId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      let [session3] = await db.select().from(readSessions).where(
        and7(
          eq14(readSessions.readId, readId),
          eq14(readSessions.userId, req.user.id)
        )
      );
      if (!session3) {
        [session3] = await db.insert(readSessions).values({
          readId,
          userId: req.user.id,
          intention: read.intention,
          lastPosition: 0,
          lastPositionType: "percentage"
        }).returning();
      }
      await db.update(reads).set({ lastAccessedAt: /* @__PURE__ */ new Date() }).where(eq14(reads.id, readId));
      res.json({ read, session: session3 });
    } catch (error) {
      console.error("Error fetching read:", error);
      res.status(500).json({ error: "Failed to fetch read" });
    }
  },
  // Update reading progress
  async updateProgress(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const readId = parseInt(req.params.id);
      const { position, positionType, timeSpentSeconds, completed } = req.body;
      const [session3] = await db.select().from(readSessions).where(
        and7(
          eq14(readSessions.readId, readId),
          eq14(readSessions.userId, req.user.id)
        )
      );
      if (!session3) {
        return res.status(404).json({ error: "Session not found" });
      }
      await db.update(readSessions).set({
        lastPosition: position,
        lastPositionType: positionType || "percentage",
        totalTimeSeconds: (session3.totalTimeSeconds || 0) + (timeSpentSeconds || 0),
        completed: completed || false,
        lastActivityAt: /* @__PURE__ */ new Date()
      }).where(eq14(readSessions.id, session3.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  },
  // Delete a read
  async deleteRead(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const readId = parseInt(req.params.id);
      const [read] = await db.select().from(reads).where(eq14(reads.id, readId));
      if (!read) {
        return res.status(404).json({ error: "Read not found" });
      }
      if (read.ownerId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      await db.delete(reads).where(eq14(reads.id, readId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting read:", error);
      res.status(500).json({ error: "Failed to delete read" });
    }
  },
  // Get tonight's curated reads (Phase 2)
  async getTonightReads(req, res) {
    try {
      const curatedReads = await db.select().from(reads).where(
        and7(
          eq14(reads.visibility, "curated"),
          eq14(reads.moderationStatus, "approved")
        )
      ).orderBy(desc12(reads.createdAt)).limit(5);
      const readsWithCounts = curatedReads.map((read) => ({
        ...read,
        readerCountLabel: "quiet"
        // Placeholder for now
      }));
      res.json(readsWithCounts);
    } catch (error) {
      console.error("Error fetching tonight's reads:", error);
      res.status(500).json({ error: "Failed to fetch curated reads" });
    }
  }
};

// server/controllers/read-analysis.controller.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
var genAI = null;
function getGenAI() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}
async function analyseWithGemini(textSample) {
  const ai = getGenAI();
  if (!ai) throw new Error("No Gemini key");
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `You are a reading-experience curator. Analyse the following text excerpt and decide which reading mode fits best.

Reading modes:
- "learn"  \u2014 informational, factual, educational, technical, how-to, news
- "feel"   \u2014 emotional, literary fiction, personal narrative, poetry, memoir
- "think"  \u2014 philosophical, speculative, essay, reflective, complex ideas
- "sleep"  \u2014 soothing, slow, minimalist, meditative, bedtime stories, calming

Respond ONLY with valid JSON in this exact shape (no markdown):
{"mode":"<one of: learn feel think sleep>","confidence":<0-100>,"reasoning":"<1 sentence>"}

Text:
"""
${textSample.slice(0, 1200)}
"""`;
  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const cleaned = raw.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
  const parsed = JSON.parse(cleaned);
  const validModes = ["learn", "feel", "think", "sleep"];
  const mode = validModes.includes(parsed.mode) ? parsed.mode : "think";
  return {
    suggestedMode: mode,
    confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 70)),
    reasoning: String(parsed.reasoning || "Based on content style and tone.")
  };
}
function analyseWithSentiment(textSample) {
  const text2 = textSample.toLowerCase();
  const scores = {
    learn: 0,
    feel: 0,
    think: 0,
    sleep: 0
  };
  const learnWords = ["research", "data", "study", "analysis", "result", "method", "process", "system", "algorithm", "technology", "science", "evidence", "theory", "model", "function"];
  const feelWords = ["love", "heart", "tears", "emotion", "beautiful", "pain", "joy", "remember", "dream", "soul", "hope", "grief", "longing", "warmth", "tenderness"];
  const thinkWords = ["perhaps", "therefore", "consciousness", "meaning", "existence", "philosophy", "question", "understand", "paradox", "truth", "reality", "perspective", "wonder", "contemplat"];
  const sleepWords = ["quiet", "gentle", "soft", "slowly", "drift", "calm", "breathe", "still", "moonlight", "whisper", "peace", "rest", "fade", "tender", "silence"];
  const countMatches = (words) => words.reduce((sum, w) => sum + (text2.split(w).length - 1), 0);
  scores.learn = countMatches(learnWords);
  scores.feel = countMatches(feelWords);
  scores.think = countMatches(thinkWords);
  scores.sleep = countMatches(sleepWords);
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const [top, second] = sorted;
  const totalSignals = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const confidence = Math.min(85, Math.round(top[1] / totalSignals * 100) + 30);
  const reasoningMap = {
    learn: "The text has informational and factual patterns typical of educational content.",
    feel: "The text contains emotionally rich language suggesting an immersive reading experience.",
    think: "The text uses reflective and philosophical language inviting deep contemplation.",
    sleep: "The text has a calm, slow-paced and soothing quality ideal for winding down."
  };
  return {
    suggestedMode: top[0],
    confidence,
    reasoning: reasoningMap[top[0]]
  };
}
var readAnalysisController = {
  async analyzeMood(req, res) {
    try {
      const { textSample } = req.body;
      if (!textSample || typeof textSample !== "string") {
        return res.status(400).json({ error: "textSample is required" });
      }
      const words = textSample.trim().split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 200));
      let core;
      try {
        core = await analyseWithGemini(textSample);
      } catch (geminiErr) {
        console.warn("[analyzeMood] Gemini unavailable, falling back to keyword analysis:", geminiErr);
        core = analyseWithSentiment(textSample);
      }
      const result = {
        ...core,
        wordCount,
        estimatedReadMinutes
      };
      res.json(result);
    } catch (error) {
      console.error("[analyzeMood] Error:", error);
      res.status(500).json({ error: "Failed to analyze mood" });
    }
  }
};

// server/middleware/upload.middleware.ts
import multer from "multer";
import path3 from "path";
var storage2 = multer.memoryStorage();
var fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "text/plain",
    "application/txt"
  ];
  const allowedExtensions = [".pdf", ".txt"];
  const ext = path3.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and TXT files are allowed"));
  }
};
var uploadMiddleware = multer({
  storage: storage2,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  }
});
var uploadSingle = uploadMiddleware.single("file");

// server/routes/api/v1/reads.routes.ts
var router16 = Router16();
router16.use(requireAuth);
router16.post("/analyze-mood", readAnalysisController.analyzeMood);
router16.post("/", uploadSingle, readsController.createRead);
router16.get("/mine", readsController.getUserReads);
router16.get("/tonight", readsController.getTonightReads);
router16.get("/:id", readsController.getRead);
router16.patch("/:id/progress", readsController.updateProgress);
router16.delete("/:id", readsController.deleteRead);
var reads_routes_default = router16;

// server/routes/api/v1/reflections.routes.ts
import express2 from "express";

// server/services/ai.service.ts
import { GoogleGenerativeAI as GoogleGenerativeAI2 } from "@google/generative-ai";
var MockAIService = class {
  async generateNightlyPrompt(shiftMode) {
    const prompts = [
      "What is a silence you are keeping that is actually speaking louder than words?",
      "If you could send a message to your younger self, what one belief would you ask them to question?",
      "Reflect on a small detail you ignored today that might be more significant than it seems.",
      "Imagine two futures: one where you stay the same, and one where you change one small habit. Which feels lighter?",
      "Look at where you are right now. Trace it back to a single decision you made three years ago."
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }
  async evaluateUserResponse(promptText, userResponse) {
    const responses = [
      "Your perspective holds a quiet truth. It is often in the spaces between our thoughts that clarity emerges.",
      "There is a weight to your words that suggests you have carried this thought for some time. Acknowledging it is the first step.",
      "The way you connect these ideas shows a deep self-awareness. Trust that inner voice; it speaks with reason.",
      "It is interesting how we frame our own narratives. Your reflection suggests a willingness to see beyond the surface.",
      "There is a calmness in your reasoning. Sometimes, just naming the feeling is enough to understand it."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  async generatePersonalReflection(query) {
    const responses = [
      "The question itself often holds the map to the answer. Allow yourself to sit with the uncertainty a little longer.",
      "Consider if what you are seeking is a solution, or simply permission to feel what you are already feeling.",
      "Sometimes the path forward is not about adding more, but about stripping away what is no longer true for you.",
      "Your curiosity is a compass. Follow it gently, without the need to arrive at a destination immediately.",
      "What would happen if you let go of the need to know the answer right now? There is wisdom in waiting."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  async analyzeSentiment(text2) {
    const sentiments = ["Reflective", "Calm", "Hopeful", "Melancholic", "Deep", "Anxious", "Peaceful"];
    return sentiments[Math.floor(Math.random() * sentiments.length)];
  }
};
var AIService = class {
  genAI;
  model;
  constructor(config3) {
    this.genAI = new GoogleGenerativeAI2(config3.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config3.model });
  }
  /**
   * Generate a nightly reflection prompt using the shift engine
   * @param shiftMode The cognitive framework to use
   * @returns The generated prompt
   */
  async generateNightlyPrompt(shiftMode) {
    try {
      const systemPrompt = this.getShiftModePrompt(shiftMode);
      const prompt = `${systemPrompt}

Generate a single nightly reflection prompt...`;
      const fullPrompt = `${systemPrompt}

Generate a single nightly reflection prompt that follows this cognitive framework. The prompt should:
- Be calm and contemplative
- Encourage quiet thinking
- Be 1-2 sentences only
- Contain no emojis or exclamation marks
- Not be motivational or hype-driven
- Feel slightly unfinished, inviting thought

Output only the prompt text, nothing else.`;
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("Gemini API Error (generateNightlyPrompt):", error);
      return new MockAIService().generateNightlyPrompt(shiftMode);
    }
  }
  async evaluateUserResponse(promptText, userResponse) {
    try {
      const prompt = `You are an AI in a night-time reflection app called Nocturne...`;
      const fullPrompt = `You are an AI in a night-time reflection app called Nocturne. Your role is to support quiet thinking, not to judge or advise.

The user responded to this prompt:
"${promptText}"

Their response:
"${userResponse}"

Provide a brief, calm reflection on their response. Follow these strict rules:
- Compare meaning, not keywords
- Value reasoning more than correctness
- Use non-judgmental, observational language
- Never say "wrong", "incorrect", or "failed"
- Avoid praise inflation or criticism
- No emojis, no exclamation marks
- Short paragraph only (2-3 sentences)
- Quiet, neutral, human tone
- Slightly unfinished

Output only your reflection, nothing else.`;
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("Gemini API Error (evaluateUserResponse):", error);
      return new MockAIService().evaluateUserResponse(promptText, userResponse);
    }
  }
  async generatePersonalReflection(query) {
    try {
      const fullPrompt = `You are an AI in a night-time reflection app called Nocturne. Your role is to support quiet thinking.

The user asked:
"${query}"

Provide a thoughtful reflection. Follow these strict rules:
- Calm over excitement
- Reflection over reaction
- Silence over noise
- Insight over information
- No emojis, no exclamation marks
- No lists unless absolutely required
- Short paragraph only (2-3 sentences)
- Quiet, neutral, human tone
- Slightly unfinished
- Never diagnose, advise, or moralize
- Never sound like a teacher, judge, or therapist

Output only your reflection, nothing else.`;
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("Gemini API Error (generatePersonalReflection):", error);
      return new MockAIService().generatePersonalReflection(query);
    }
  }
  /**
   * Get the system prompt for a specific shift mode
   */
  getShiftModePrompt(mode) {
    const prompts = {
      reverse_causality: "Create a prompt that asks the user to inspect a specific recent event where the outcome is known, and trace it back to a single moment of cause. Focus on the internal decision, not external events.",
      silence_variable: "Create a prompt that asks the user to inspect a moment of silence or inaction from today. What was felt but not said? What action was avoided?",
      assumption_test: "Create a prompt that asks the user to inspect a belief they held today that might be wrong. Ask them to look at the evidence against their own assumption.",
      skipped_detail: "Create a prompt that asks the user to inspect a small, specific detail from today that they initially ignored. Why did it matter?",
      two_futures: "Create a prompt that asks the user to inspect their current trajectory versus a slightly different one. Focus on the feeling of the path, not just the result.",
      diary: "Create a wide, open-ended prompt about the feeling of the night itself. Focus on the atmosphere, the silence, or the act of keeping a secret. It should feel like an invitation to unload a burden."
    };
    return prompts[mode];
  }
  /**
   * Analyze the sentiment of a text
   * @param text The user's reflection text
   * @returns A short sentiment tag (e.g. "Reflective", "Anxious", "Calm")
   */
  async analyzeSentiment(text2) {
    const prompt = `Analyze the sentiment/tone of this reflection:
"${text2}"

Output ONLY a single word or short phrase descriptions of the tone (e.g., "Reflective", "Heavy", "Hopeful", "Scattered", "Calm"). 
Choose the most accurate one.
No explanation.`;
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  }
};
var aiServiceInstance = null;
function getAIService() {
  if (!aiServiceInstance) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    if (!apiKey) {
      console.warn("\u26A0\uFE0F No valid GEMINI_API_KEY found. Using Mock AI Service.");
      aiServiceInstance = new MockAIService();
    } else {
      try {
        aiServiceInstance = new AIService({ apiKey, model });
      } catch (error) {
        console.error("Failed to initialize AI service, falling back to mock:", error);
        aiServiceInstance = new MockAIService();
      }
    }
  }
  return aiServiceInstance;
}

// server/services/reflections.service.ts
var ReflectionsService = class {
  constructor(storage3) {
    this.storage = storage3;
  }
  storage;
  /**
   * Analyze sentiment of reflection text.
   * Uses the local emotion-analyzer for a fast, synchronous result.
   * The AI service is not called here — it remains reserved for
   * deeper prompt generation and response evaluation.
   */
  async analyzeSentiment(text2) {
    const { detectedEmotion } = analyzeEmotion(text2);
    return { sentiment: detectedEmotion };
  }
  /**
   * Get the active (non-expired) nightly prompt, or generate a new one
   */
  async getActivePrompt(type) {
    const activePrompt = await this.storage.getActivePrompt(type);
    if (activePrompt) {
      return activePrompt;
    }
    return await this.generateNewPrompt(type);
  }
  /**
   * Generate a new nightly prompt using a random shift mode
   */
  async generateNewPrompt(type) {
    let shiftModes = [
      "reverse_causality",
      "silence_variable",
      "assumption_test",
      "skipped_detail",
      "two_futures"
    ];
    if (type === "diary") {
      shiftModes = ["diary"];
    } else {
    }
    const randomMode = shiftModes[Math.floor(Math.random() * shiftModes.length)];
    const aiService = getAIService();
    const content = await aiService.generateNightlyPrompt(randomMode);
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const promptData = {
      content,
      shiftMode: randomMode,
      expiresAt
    };
    return await this.storage.createNightlyPrompt(promptData);
  }
  /**
   * Submit a user's response to a prompt and get AI evaluation
   */
  async submitResponse(userId, promptId, responseContent) {
    const prompt = await this.storage.getNightlyPrompt(promptId);
    if (!prompt) {
      throw new Error("Prompt not found");
    }
    const aiService = getAIService();
    const aiEvaluation = await aiService.evaluateUserResponse(prompt.content, responseContent);
    const reflectionData = {
      userId,
      promptId,
      responseContent
    };
    return await this.storage.createUserReflection(reflectionData, { text: aiEvaluation });
  }
  /**
   * Get a user's reflection history
   */
  async getUserReflectionHistory(userId, limit = 20) {
    return await this.storage.getUserReflections(userId, limit);
  }
  /**
   * Request a personal AI reflection
   */
  async requestPersonalReflection(userId, userQuery) {
    const aiService = getAIService();
    const aiReflection = await aiService.generatePersonalReflection(userQuery);
    return await this.storage.createPersonalReflection({
      userId,
      userQuery
    }, aiReflection);
  }
  /**
   * Get a user's personal reflections
   */
  async getPersonalReflections(userId, limit = 20) {
    return await this.storage.getPersonalReflections(userId, limit);
  }
};

// server/controllers/reflections.controller.ts
var ReflectionsController = class {
  reflectionsService;
  constructor(storage3) {
    this.reflectionsService = new ReflectionsService(storage3);
  }
  /**
   * GET /api/reflections/prompt
   * Get today's active nightly prompt
   */
  getPrompt = async (req, res) => {
    try {
      const type = req.query.type;
      const prompt = await this.reflectionsService.getActivePrompt(type);
      res.json(prompt);
    } catch (error) {
      console.error("Error getting prompt:", error);
      res.status(500).json({ error: "Failed to get nightly prompt" });
    }
  };
  /**
   * POST /api/reflections/respond
   * Submit a response to a prompt
   */
  submitResponse = async (req, res) => {
    try {
      const { promptId, content } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      if (!promptId || !content) {
        return res.status(400).json({ error: "Prompt ID and content are required" });
      }
      const reflection = await this.reflectionsService.submitResponse(
        userId,
        promptId,
        content
      );
      res.json(reflection);
    } catch (error) {
      console.error("Error submitting response:", error);
      res.status(500).json({ error: "Failed to submit response" });
    }
  };
  /**
   * POST /api/reflections/sentiment
   * Analyze sentiment of a reflection
   */
  analyzeSentiment = async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }
      const result = await this.reflectionsService.analyzeSentiment(content);
      res.json(result);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      res.status(500).json({ error: "Failed to analyze sentiment" });
    }
  };
  /**
   * GET /api/reflections/history
   * Get user's reflection history
   */
  getHistory = async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const limit = parseInt(req.query.limit) || 20;
      const reflections = await this.reflectionsService.getUserReflectionHistory(userId, limit);
      res.json(reflections);
    } catch (error) {
      console.error("Error getting history:", error);
      res.status(500).json({ error: "Failed to get reflection history" });
    }
  };
  /**
   * POST /api/reflections/personal
   * Request a personal AI reflection
   */
  requestPersonal = async (req, res) => {
    try {
      const { query } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }
      const reflection = await this.reflectionsService.requestPersonalReflection(userId, query);
      res.json(reflection);
    } catch (error) {
      console.error("Error requesting personal reflection:", error);
      res.status(500).json({ error: "Failed to generate personal reflection" });
    }
  };
  /**
   * GET /api/reflections/personal
   * Get user's personal reflections
   */
  getPersonalHistory = async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      const limit = parseInt(req.query.limit) || 20;
      const reflections = await this.reflectionsService.getPersonalReflections(userId, limit);
      res.json(reflections);
    } catch (error) {
      console.error("Error getting personal reflections:", error);
      res.status(500).json({ error: "Failed to get personal reflections" });
    }
  };
};

// server/routes/api/v1/reflections.routes.ts
init_storage();
var router17 = express2.Router();
var reflectionsController = new ReflectionsController(storage);
router17.get("/prompt", reflectionsController.getPrompt);
router17.post("/respond", reflectionsController.submitResponse);
router17.post("/sentiment", reflectionsController.analyzeSentiment);
router17.get("/history", reflectionsController.getHistory);
router17.post("/personal", reflectionsController.requestPersonal);
router17.get("/personal", reflectionsController.getPersonalHistory);
var reflections_routes_default = router17;

// server/routes/api/v1/consciousness.routes.ts
import { Router as Router17 } from "express";

// server/services/consciousness.service.ts
init_db();
init_schema();
import { desc as desc13 } from "drizzle-orm";
var ConsciousnessService = class {
  static async getGlobalState() {
    const [state] = await db.select().from(globalConsciousness).orderBy(desc13(globalConsciousness.lastUpdated)).limit(1);
    if (state) return state;
    const [newState] = await db.insert(globalConsciousness).values({
      activityLevel: "low",
      connectedEntities: 1,
      currentDominantEmotion: "neutral",
      realmStability: 100
    }).returning();
    return newState;
  }
  static async updateGlobalState() {
    const recentWhispers = await db.select({
      emotion: whispers.detectedEmotion
    }).from(whispers).limit(100);
    const emotionCounts = {};
    recentWhispers.forEach((w) => {
      const e = w.emotion || "neutral";
      emotionCounts[e] = (emotionCounts[e] || 0) + 1;
    });
    let dominant = "neutral";
    let max = 0;
    for (const [e, count3] of Object.entries(emotionCounts)) {
      if (count3 > max) {
        max = count3;
        dominant = e;
      }
    }
    const activity = recentWhispers.length > 50 ? "high" : recentWhispers.length > 20 ? "moderate" : "low";
    const [newState] = await db.insert(globalConsciousness).values({
      activityLevel: activity,
      connectedEntities: Math.floor(Math.random() * 100) + 50,
      // Mock for now
      currentDominantEmotion: dominant,
      realmStability: 80 + Math.floor(Math.random() * 20)
    }).returning();
    return newState;
  }
};

// server/controllers/consciousness.controller.ts
var ConsciousnessController = class {
  /**
   * GET /api/v1/consciousness
   * Get global consciousness state
   */
  getState = asyncHandler(async (req, res) => {
    const state = await ConsciousnessService.getGlobalState();
    res.json(successResponse(state));
  });
};
var consciousnessController = new ConsciousnessController();

// server/routes/api/v1/consciousness.routes.ts
var router18 = Router17();
router18.get("/", consciousnessController.getState);
var consciousness_routes_default = router18;

// server/routes/api/v1/playlists.routes.ts
import { Router as Router18 } from "express";

// server/controllers/playlist.controller.ts
init_storage();
var PlaylistController = class {
  /**
   * POST /api/v1/playlists
   */
  createPlaylist = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Playlist name is required" });
    }
    const playlist = await storage.createPlaylist(req.user.id, name.trim());
    res.json(successResponse(playlist));
  });
  /**
   * GET /api/v1/playlists
   */
  getUserPlaylists = asyncHandler(async (req, res) => {
    const playlists3 = await storage.getUserPlaylists(req.user.id);
    res.json(successResponse(playlists3));
  });
  /**
   * GET /api/v1/playlists/:playlistId/tracks
   */
  getPlaylistTracks = asyncHandler(async (req, res) => {
    const playlistId = parseInt(req.params.playlistId);
    if (isNaN(playlistId)) {
      return res.status(400).json({ error: "Invalid playlist ID" });
    }
    const playlist = await storage.getPlaylist(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    if (playlist.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized access to playlist" });
    }
    const tracks = await storage.getPlaylistTracks(playlistId);
    res.json(successResponse(tracks));
  });
  /**
   * POST /api/v1/playlists/:playlistId/tracks
   */
  addTrackToPlaylist = asyncHandler(async (req, res) => {
    const playlistId = parseInt(req.params.playlistId);
    if (isNaN(playlistId)) {
      return res.status(400).json({ error: "Invalid playlist ID" });
    }
    const playlist = await storage.getPlaylist(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    if (playlist.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized access to playlist" });
    }
    const { trackId, trackTitle, trackArtist, trackUrl, trackCoverArt } = req.body;
    if (!trackId || !trackTitle || !trackArtist || !trackUrl) {
      return res.status(400).json({ error: "Missing required track details" });
    }
    const track = await storage.addTrackToPlaylist(playlistId, {
      trackId: String(trackId),
      trackTitle,
      trackArtist,
      trackUrl,
      trackCoverArt: trackCoverArt || null
    });
    res.json(successResponse(track));
  });
  /**
   * DELETE /api/v1/playlists/:playlistId/tracks/:trackId
   */
  removeTrackFromPlaylist = asyncHandler(async (req, res) => {
    const playlistId = parseInt(req.params.playlistId);
    const { trackId } = req.params;
    if (isNaN(playlistId) || !trackId) {
      return res.status(400).json({ error: "Invalid parameters" });
    }
    const playlist = await storage.getPlaylist(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    if (playlist.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized access to playlist" });
    }
    await storage.removeTrackFromPlaylist(playlistId, trackId);
    res.json(successResponse({ removed: true }));
  });
  /**
   * DELETE /api/v1/playlists/:playlistId
   */
  deletePlaylist = asyncHandler(async (req, res) => {
    const playlistId = parseInt(req.params.playlistId);
    if (isNaN(playlistId)) {
      return res.status(400).json({ error: "Invalid playlist ID" });
    }
    const playlist = await storage.getPlaylist(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    if (playlist.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized access to playlist" });
    }
    await storage.deletePlaylist(playlistId);
    res.json(successResponse({ deleted: true }));
  });
};
var playlistController = new PlaylistController();

// server/routes/api/v1/playlists.routes.ts
import { z as z11 } from "zod";
var router19 = Router18();
router19.use(requireAuth);
router19.get("/", playlistController.getUserPlaylists);
router19.post(
  "/",
  validate(z11.object({ name: z11.string().min(1, "Playlist name is required") }), "body"),
  playlistController.createPlaylist
);
router19.delete("/:playlistId", playlistController.deletePlaylist);
router19.get("/:playlistId/tracks", playlistController.getPlaylistTracks);
router19.post(
  "/:playlistId/tracks",
  validate(
    z11.object({
      trackId: z11.union([z11.string(), z11.number()]),
      trackTitle: z11.string(),
      trackArtist: z11.string(),
      trackUrl: z11.string(),
      trackCoverArt: z11.string().optional().nullable()
    }),
    "body"
  ),
  playlistController.addTrackToPlaylist
);
router19.delete("/:playlistId/tracks/:trackId", playlistController.removeTrackFromPlaylist);
var playlists_routes_default = router19;

// server/routes/api/v1/auth.routes.ts
import { Router as Router19 } from "express";
import jwt2 from "jsonwebtoken";
init_storage();
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
var router20 = Router19();
var JWT_SECRET2 = process.env.JWT_SECRET || "nocturne-mobile-secret-change-in-prod";
var JWT_EXPIRES_IN = "30d";
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function verifyPassword(supplied, stored) {
  if (!stored || typeof stored !== "string" || !stored.includes(".")) {
    return false;
  }
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) return false;
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function signToken(userId, username) {
  return jwt2.sign({ sub: userId, username }, JWT_SECRET2, { expiresIn: JWT_EXPIRES_IN });
}
router20.post("/token", asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password required" });
  }
  let user = await storage.getUserByUsername(username);
  if (!user && username.includes("@")) {
    user = await storage.getUserByEmail(username.toLowerCase());
  }
  if (!user || !user.password) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
  const token = signToken(user.id, user.username);
  return res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email
      }
    }
  });
}));
router20.post("/register", asyncHandler(async (req, res) => {
  const { username, password, email, displayName } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }
  const existing = await storage.getUserByUsername(username);
  if (existing) {
    return res.status(409).json({ success: false, message: "Username already taken" });
  }
  const hashed = await hashPassword(password);
  const user = await storage.createUser({
    username,
    password: hashed,
    email: email || null,
    displayName: displayName || username
  });
  const token = signToken(user.id, user.username);
  return res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email
      }
    }
  });
}));
router20.post("/refresh", asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  try {
    const token = authHeader.slice(7);
    const payload = jwt2.verify(token, JWT_SECRET2);
    const newToken = signToken(payload.sub, payload.username);
    return res.json({ success: true, data: { token: newToken } });
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}));
var auth_routes_default = router20;

// server/routes/api/v1/index.ts
var router21 = Router20();
router21.use("/auth", auth_routes_default);
router21.get("/user", requireAuth, async (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email ?? null
    }
  });
});
router21.use("/whispers", whispers_routes_default);
router21.use("/consciousness", consciousness_routes_default);
router21.use("/diaries", diaries_routes_default);
router21.use("/cafe", midnight_cafe_routes_default);
router21.use("/circles", night_circles_routes_default);
router21.use("/mind-maze", mind_maze_routes_default);
router21.use("/music", music_routes_default);
router21.use("/founder", am_founder_routes_default);
router21.use("/speaker", starlit_speaker_routes_default);
router21.use("/messenger", moon_messenger_routes_default);
router21.use("/users", user_routes_default);
router21.use("/onboarding", onboarding_routes_default);
router21.use("/trending", trending_routes_default);
router21.use("/activity", activity_routes_default);
router21.use("/profile", profile_routes_default);
router21.use("/thoughts", night_thoughts_routes_default);
router21.use("/reads", reads_routes_default);
router21.use("/reflections", reflections_routes_default);
router21.use("/playlists", playlists_routes_default);
router21.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0.0"
    }
  });
});
var v1_default = router21;

// server/routes/sitemap.routes.ts
import { Router as Router21 } from "express";
var router22 = Router21();
var BASE_URL = "https://nocturnesocial.in";
var routes = [
  { path: "/", changefreq: "daily", priority: 1 },
  { path: "/diaries", changefreq: "daily", priority: 0.9 },
  { path: "/whispers", changefreq: "daily", priority: 0.9 },
  { path: "/night-thoughts", changefreq: "daily", priority: 0.8 },
  { path: "/mind-maze", changefreq: "weekly", priority: 0.8 },
  { path: "/night-circles", changefreq: "weekly", priority: 0.8 },
  { path: "/midnight-cafe", changefreq: "weekly", priority: 0.8 },
  { path: "/music-mood", changefreq: "weekly", priority: 0.8 },
  { path: "/nightly-reflection", changefreq: "weekly", priority: 0.8 },
  { path: "/night-conversations", changefreq: "weekly", priority: 0.8 },
  { path: "/digital-journals", changefreq: "weekly", priority: 0.8 },
  { path: "/mindful-spaces", changefreq: "weekly", priority: 0.8 },
  { path: "/3am-founder", changefreq: "weekly", priority: 0.7 },
  { path: "/starlit-speaker", changefreq: "weekly", priority: 0.7 },
  { path: "/moon-messenger", changefreq: "weekly", priority: 0.7 },
  { path: "/read-card", changefreq: "weekly", priority: 0.7 },
  { path: "/read-alone", changefreq: "weekly", priority: 0.7 },
  { path: "/read-tonight", changefreq: "weekly", priority: 0.7 },
  { path: "/privacy", changefreq: "monthly", priority: 0.4 },
  { path: "/help", changefreq: "monthly", priority: 0.5 }
];
function buildSitemapXml() {
  const lastmod = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const urlEntries = routes.map(
    ({ path: path4, changefreq, priority }) => `
  <url>
    <loc>${BASE_URL}${path4}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`
  ).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;
}
router22.get("/sitemap.xml", (_req, res) => {
  const xml = buildSitemapXml();
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
  res.status(200).send(xml);
});
var ROBOTS_TXT = `User-agent: *
Allow: /

# Public feature pages \u2014 allow all crawlers
Allow: /diaries
Allow: /whispers
Allow: /night-thoughts
Allow: /mind-maze
Allow: /night-circles
Allow: /midnight-cafe
Allow: /music-mood
Allow: /nightly-reflection
Allow: /3am-founder
Allow: /starlit-speaker
Allow: /moon-messenger
Allow: /night-conversations
Allow: /digital-journals
Allow: /mindful-spaces
Allow: /read-card
Allow: /read-alone
Allow: /read-tonight
Allow: /privacy
Allow: /help

# Private / user-specific routes \u2014 no indexing
Disallow: /settings
Disallow: /profile
Disallow: /notifications
Disallow: /first-night
Disallow: /auth
Disallow: /login

# API routes \u2014 never index
Disallow: /api/

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
`;
router22.get("/robots.txt", (_req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.status(200).send(ROBOTS_TXT);
});
var SECURITY_TXT = `Contact: mailto:security@nocturnesocial.in
Preferred-Languages: en
Canonical: ${BASE_URL}/.well-known/security.txt
Policy: ${BASE_URL}/privacy
Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString()}
Acknowledgments: ${BASE_URL}/help
`;
router22.get("/.well-known/security.txt", (_req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.status(200).send(SECURITY_TXT);
});
var sitemap_routes_default = router22;

// server/index.ts
config2({ override: true });
var app = express3();
app.use(requestId);
var isProduction = process.env.NODE_ENV === "production";
if (isProduction && !process.env.FRONTEND_URL) {
  logger.warn("FRONTEND_URL not set in production \u2014 CORS will reject cross-origin requests. Set FRONTEND_URL to your domain.");
}
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com", "https://www.gstatic.com", "https://www.youtube.com", "https://replit.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https:", "wss:"],
      mediaSrc: ["'self'", "https:", "blob:"],
      frameSrc: ["'self'", "https://accounts.google.com", "https://*.firebaseapp.com", "https://www.youtube.com"],
      frameAncestors: ["'none'"],
      // blocks clickjacking
      upgradeInsecureRequests: []
      // force HTTPS sub-resources
    }
  },
  // HSTS — explicitly enabled for production HTTPS
  strictTransportSecurity: {
    maxAge: 31536e3,
    // 1 year
    includeSubDomains: true,
    preload: true
  },
  // X-Frame-Options: DENY
  frameguard: { action: "deny" },
  // X-Content-Type-Options: nosniff
  noSniff: true,
  // X-XSS-Protection: 1; mode=block (legacy browsers)
  xssFilter: true,
  // Referrer-Policy
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  originAgentCluster: false
}));
app.use((_req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
  );
  next();
});
var allowedOrigin = process.env.FRONTEND_URL || (isProduction ? false : "http://localhost:5173");
var mobileDevOrigins = [
  "http://localhost:8081",
  // Expo Metro bundler
  "http://localhost:19000",
  // Expo Go
  "http://localhost:19006",
  // Expo web
  "http://10.0.2.2:5000"
  // Android emulator → host
];
var allowedOrigins = [
  ...allowedOrigin ? [allowedOrigin] : [],
  ...!isProduction ? mobileDevOrigins : []
];
app.use((req, res, next) => {
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const host = req.get("host");
      if (host && origin.includes(host)) {
        return cb(null, true);
      }
      if (allowedOrigins.some((o) => origin.startsWith(o)) || !isProduction) {
        return cb(null, true);
      }
      logger.warn(`CORS: origin ${origin} not allowed`);
      cb(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
  })(req, res, next);
});
app.use(compression());
app.use("/api", apiLimiter);
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use(pinoHttp({ logger: logger._pino }));
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.use("/", sitemap_routes_default);
(async () => {
  const httpServer = createServer(app);
  logger.info("Testing database connection...");
  await testDatabaseConnection();
  await Promise.resolve().then(() => (init_auth(), auth_exports)).then(({ setupAuth: setupAuth2 }) => setupAuth2(app));
  const server = await registerRoutes(app, httpServer);
  app.use("/api", (req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });
  app.use("/api/v1", v1_default);
  new WebSocketManager(httpServer);
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  app.use("/api/*", notFoundHandler);
  app.use(errorHandler);
  const port = Number(process.env.PORT) || 5e3;
  httpServer.listen(port, "0.0.0.0", () => {
    logger.info(`\u{1F680} Server started on port ${port}`);
    logger.info(`\u{1F4CD} Environment: ${app.get("env")}`);
    logger.info(`\u{1F517} API v1: http://localhost:${port}/api/v1`);
  });
})();
