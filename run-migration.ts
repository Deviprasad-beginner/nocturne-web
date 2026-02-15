
import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function runMigration() {
    try {
        console.log("Running manual migration...");

        await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS night_streak integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS meaningful_replies integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS report_count integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS trust_score integer DEFAULT 100,
      ADD COLUMN IF NOT EXISTS last_active_time timestamp;
    `);

        console.log("Migration completed successfully.");
    } catch (error) {
        console.error("Error running migration:", error);
    }
    process.exit(0);
}

runMigration();
