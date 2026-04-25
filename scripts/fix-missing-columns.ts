import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function migrate() {
    try {
        console.log("Adding missing columns to database tables...\n");

        // Whispers table
        console.log("🔧 Updating 'whispers' table...");
        await db.execute(sql`ALTER TABLE whispers ADD COLUMN IF NOT EXISTS detected_emotion VARCHAR(50)`);
        await db.execute(sql`ALTER TABLE whispers ADD COLUMN IF NOT EXISTS sentiment_score INTEGER`);
        await db.execute(sql`ALTER TABLE whispers ADD COLUMN IF NOT EXISTS reflection_depth INTEGER`);
        console.log("   ✅ whispers columns added");

        // Diaries table
        console.log("🔧 Updating 'diaries' table...");
        await db.execute(sql`ALTER TABLE diaries ADD COLUMN IF NOT EXISTS detected_emotion VARCHAR(50)`);
        await db.execute(sql`ALTER TABLE diaries ADD COLUMN IF NOT EXISTS sentiment_score INTEGER`);
        await db.execute(sql`ALTER TABLE diaries ADD COLUMN IF NOT EXISTS reflection_depth INTEGER`);
        console.log("   ✅ diaries columns added");

        // Reads table (is_ephemeral was previously attempted)
        console.log("🔧 Updating 'reads' table...");
        await db.execute(sql`ALTER TABLE reads ADD COLUMN IF NOT EXISTS is_ephemeral BOOLEAN DEFAULT FALSE`);
        console.log("   ✅ reads columns added");

        console.log("\n🎉 All missing columns added successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();
