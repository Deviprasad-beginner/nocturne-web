/**
 * Migration script: creates user_books table if it doesn't exist.
 * Run with: npx tsx server/migrate-user-books.ts
 */
import { config } from "dotenv";
config({ override: true });

import pg from "pg";
const { Pool } = pg;

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    console.log("Creating user_books table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_books (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        gutenberg_id INTEGER NOT NULL,
        title VARCHAR(500) NOT NULL,
        author VARCHAR(300),
        cover_url VARCHAR(1000),
        epub_url VARCHAR(1000) NOT NULL,
        current_cfi VARCHAR(2000),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_user_books_user_id ON user_books(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_books_gutenberg_id ON user_books(gutenberg_id);
    `);
    console.log("✅ user_books table ready.");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
