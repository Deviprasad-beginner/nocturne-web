
import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function addColumns() {
    try {
        console.log("Attempting to add missing columns...");

        await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
    `);
        console.log("Executed: ALTER TABLE users ADD COLUMN current_streak");

        await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_entry_date TIMESTAMP;
    `);
        console.log("Executed: ALTER TABLE users ADD COLUMN last_entry_date");

        console.log("✅ Columns added successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error adding columns:", error);
        process.exit(1);
    }
}

addColumns();
