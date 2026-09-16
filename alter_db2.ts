import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function run() {
  try {
    console.log("Enabling pgvector...");
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);

    console.log("Adding embedding to whispers...");
    await db.execute(sql`ALTER TABLE whispers ADD COLUMN IF NOT EXISTS embedding vector(384);`);

    console.log("Creating ephemeral_circles...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ephemeral_circles (
        id SERIAL PRIMARY KEY,
        theme_summary TEXT,
        member_count INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Creating ephemeral_circle_members...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ephemeral_circle_members (
        id SERIAL PRIMARY KEY,
        circle_id INTEGER NOT NULL REFERENCES ephemeral_circles(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Migration complete.");
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
