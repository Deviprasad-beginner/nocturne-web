import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function migrate() {
    try {
        console.log("Adding is_ephemeral column to reads table...");
        await db.execute(
            sql`ALTER TABLE reads ADD COLUMN IF NOT EXISTS is_ephemeral BOOLEAN DEFAULT FALSE`
        );
        console.log("✅ is_ephemeral column added successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

migrate();
