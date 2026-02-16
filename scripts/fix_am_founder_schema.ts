
import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function migrate() {
    try {
        console.log("Adding author_id to am_founder...");
        await db.execute(sql`
      ALTER TABLE am_founder 
      ADD COLUMN IF NOT EXISTS author_id INTEGER REFERENCES users(id);
    `);
        console.log("Migration successful!");
    } catch (error) {
        console.error("Migration failed:", error);
    }
    process.exit(0);
}

migrate();
