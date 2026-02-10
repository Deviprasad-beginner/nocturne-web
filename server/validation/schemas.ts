import { z } from 'zod';

// User validation schemas
export const createUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name too long'),
});

export const updateUserSchema = z.object({
    displayName: z.string().min(2).max(50).optional(),
    bio: z.string().max(500).optional(),
    profileImageUrl: z.string().url().optional(),
});

// Diary validation schemas
export const createDiarySchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
    mood: z.enum(['happy', 'sad', 'anxious', 'calm', 'excited', 'thoughtful']).optional(),
    isPublic: z.boolean().default(false),
});

export const updateDiarySchema = createDiarySchema.partial();

// Whisper validation schemas
export const createWhisperSchema = z.object({
    content: z.string().min(1, 'Content is required').max(500, 'Whisper too long'),
    category: z.enum(['confession', 'advice', 'vent', 'gratitude', 'random']).optional(),
});

// Mind Maze validation schemas
export const createMindMazeSchema = z.object({
    content: z.string().min(10, 'Content must be at least 10 characters').max(1000, 'Content too long'),
    type: z.enum(['puzzle', 'philosophy', 'question']),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export const createMindMazeResponseSchema = z.object({
    content: z.string().min(1, 'Response is required').max(1000, 'Response too long'),
    mindMazeId: z.number().int().positive(),
});

// Midnight Cafe validation schemas
export const createCafePostSchema = z.object({
    content: z.string().min(1, 'Content is required').max(5000, 'Post too long'),
    topic: z.string().min(1).max(100),
});

export const createCafeReplySchema = z.object({
    content: z.string().min(1, 'Reply is required').max(2000, 'Reply too long'),
    postId: z.number().int().positive(),
});

// Night Circle validation schemas
export const createNightCircleSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
    maxMembers: z.number().int().min(2).max(50).default(10),
    isPrivate: z.boolean().default(false),
});

// Onboarding validation schema
export const updateOnboardingSchema = z.object({
    hasSeenOnboarding: z.boolean(),
});

// Comment validation schema
export const createCommentSchema = z.object({
    content: z.string().min(1, 'Comment is required').max(500, 'Comment too long'),
    postType: z.enum(['diary', 'whisper', 'mindMaze', 'cafePost']),
    postId: z.number().int().positive(),
});

// Pagination schema
export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ID parameter schema
export const idParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

// Type exports for use in components
export type CreateDiary = z.infer<typeof createDiarySchema>;
export type UpdateDiary = z.infer<typeof updateDiarySchema>;
export type CreateWhisper = z.infer<typeof createWhisperSchema>;
export type CreateMindMaze = z.infer<typeof createMindMazeSchema>;
export type CreateCafePost = z.infer<typeof createCafePostSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
