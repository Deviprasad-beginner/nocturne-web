
import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function migrate() {
    try {
        console.log("Creating am_founder_replies table...");
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS am_founder_replies (
        id SERIAL PRIMARY KEY,
        founder_id INTEGER NOT NULL REFERENCES am_founder(id),
        content TEXT NOT NULL,
        author_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
        console.log("Migration successful!");
    } catch (error) {
        console.error("Migration failed:", error);
    }
    process.exit(0);
}

migrate();
