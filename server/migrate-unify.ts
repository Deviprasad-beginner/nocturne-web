import 'dotenv/config';
import { db } from './db';
import {
    diaries, whispers, midnightCafe, nightThoughts,
    type InsertNightThought
} from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Migration Script: Unify Content
 * Merges entries from diaries, whispers, and midnight_cafe into night_thoughts
 */
async function migrateContent() {
    console.log('🌙 Starting Nocturne Content Unification...');

    try {
        // 0. Ensure table exists (Safe fallback since db:push was aborted)
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS night_thoughts (
            id SERIAL PRIMARY KEY,
            content TEXT NOT NULL,
            thought_type VARCHAR(50) NOT NULL,
            topic TEXT,
            is_private BOOLEAN DEFAULT false,
            allow_replies BOOLEAN DEFAULT true,
            hearts INTEGER DEFAULT 0,
            replies INTEGER DEFAULT 0,
            author_id INTEGER REFERENCES users(id),
            mood VARCHAR(100),
            created_at TIMESTAMP DEFAULT NOW(),
            expires_at TIMESTAMP
          );
        `);
        console.log('✅ Ensured night_thoughts table exists.');

        // 1. Migrate Whispers
        console.log('Reading whispers...');
        const allWhispers = await db.select().from(whispers);
        console.log(`Found ${allWhispers.length} whispers to migrate.`);

        for (const w of allWhispers) {
            await db.insert(nightThoughts).values({
                content: w.content,
                thoughtType: 'whisper',
                authorId: w.authorId,
                hearts: w.hearts || 0,
                createdAt: w.createdAt,
                isPrivate: false,
                allowReplies: false,
                // Whispers expire in 24h from creation, so we calculate that
                expiresAt: w.createdAt ? new Date(new Date(w.createdAt).getTime() + 24 * 60 * 60 * 1000) : null
            });
        }
        console.log('✅ Whispers migrated.');

        // 2. Migrate Diaries
        console.log('Reading diaries...');
        const allDiaries = await db.select().from(diaries);
        console.log(`Found ${allDiaries.length} diary entries to migrate.`);

        for (const d of allDiaries) {
            await db.insert(nightThoughts).values({
                content: d.content,
                thoughtType: 'diary',
                authorId: d.authorId,
                mood: d.mood,
                createdAt: d.createdAt,
                isPrivate: !d.isPublic, // flip logic
                allowReplies: d.isPublic,
                expiresAt: null // Diaries don't expire
            });
        }
        console.log('✅ Diaries migrated.');

        // 3. Migrate Midnight Cafe Posts
        console.log('Reading cafe posts...');
        const allPosts = await db.select().from(midnightCafe);
        console.log(`Found ${allPosts.length} cafe posts to migrate.`);

        for (const p of allPosts) {
            await db.insert(nightThoughts).values({
                content: p.content,
                thoughtType: 'discussion',
                topic: p.topic, // Cafe posts have topics
                authorId: p.authorId,
                replies: p.replies || 0,
                createdAt: p.createdAt,
                isPrivate: false,
                allowReplies: true,
                expiresAt: null
            });
        }
        console.log('✅ Cafe posts migrated.');

        console.log('✨ Migration completed successfully! The Night Thoughts stream is now populated.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateContent();
