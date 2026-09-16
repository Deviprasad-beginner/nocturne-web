import 'dotenv/config';
import { db, pool } from './db';
import { sql } from 'drizzle-orm';

async function optimizeDb() {
  console.log('⚡ Optimizing Database...');
  try {
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_night_thoughts_author_id" ON "night_thoughts" ("author_id");
      CREATE INDEX IF NOT EXISTS "idx_night_thoughts_thought_type" ON "night_thoughts" ("thought_type");
      CREATE INDEX IF NOT EXISTS "idx_night_thoughts_is_private" ON "night_thoughts" ("is_private");
      CREATE INDEX IF NOT EXISTS "idx_night_thoughts_created_at" ON "night_thoughts" ("created_at");
      CREATE INDEX IF NOT EXISTS "idx_night_thoughts_expires_at" ON "night_thoughts" ("expires_at");

      CREATE INDEX IF NOT EXISTS "idx_am_founder_author_id" ON "am_founder" ("author_id");
      CREATE INDEX IF NOT EXISTS "idx_am_founder_category" ON "am_founder" ("category");
      CREATE INDEX IF NOT EXISTS "idx_am_founder_created_at" ON "am_founder" ("created_at");
    `);
    console.log('✅ Database indexes created successfully.');
  } catch (error) {
    console.error('❌ Failed to optimize database:', error);
  } finally {
    pool?.end();
    process.exit(0);
  }
}

optimizeDb();
