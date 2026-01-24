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

export type SavedStation = typeof savedStations.$inferSelect;
export type InsertSavedStation = z.infer<typeof insertSavedStationSchema>;

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