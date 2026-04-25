
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Adding missing columns to database...");

    try {
        // Diaries Table - Add missing columns
        console.log("Updating 'diaries' table...");
        await db.execute(sql`
      ALTER TABLE diaries 
      ADD COLUMN IF NOT EXISTS detected_emotion VARCHAR(50),
      ADD COLUMN IF NOT EXISTS sentiment_score INTEGER,
      ADD COLUMN IF NOT EXISTS reflection_depth INTEGER;
    `);

        // Whispers Table - Add missing columns
        console.log("Updating 'whispers' table...");
        await db.execute(sql`
      ALTER TABLE whispers 
      ADD COLUMN IF NOT EXISTS detected_emotion VARCHAR(50),
      ADD COLUMN IF NOT EXISTS sentiment_score INTEGER,
      ADD COLUMN IF NOT EXISTS reflection_depth INTEGER;
    `);

        console.log("✅ Migration completed successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }

    process.exit(0);
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
