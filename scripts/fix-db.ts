import { config } from "dotenv";
config({ override: true });
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { sql } from 'drizzle-orm';

const { Pool } = pg;

async function run() {
  const dbUrl = new URL(process.env.DATABASE_URL!);
  const connectionString = new URL(process.env.DATABASE_URL!);
  connectionString.searchParams.delete('sslmode');
  connectionString.searchParams.delete('ssl');

  const pool = new Pool({
    connectionString: connectionString.toString(),
    ssl: {
      rejectUnauthorized: false,
      servername: process.env.DB_SNI_SERVERNAME || dbUrl.hostname,
      checkServerIdentity: () => undefined
    },
  });

  const db = drizzle(pool);

  console.log("Adding state column to night_circles...");
  try {
    await db.execute(sql`ALTER TABLE night_circles ADD COLUMN state VARCHAR(20) DEFAULT 'forming'`);
    console.log("Success!");
  } catch(e: any) {}

  try {
    await db.execute(sql`ALTER TABLE night_circles ADD COLUMN primary_emotion VARCHAR(50)`);
    console.log("Success primary_emotion!");
  } catch(e: any) {}

  try {
    await db.execute(sql`ALTER TABLE night_circles ADD COLUMN vibe_score INTEGER DEFAULT 0`);
    console.log("Success vibe_score!");
  } catch(e: any) {}

  try {
    await db.execute(sql`ALTER TABLE night_circles ADD COLUMN expires_at TIMESTAMP`);
    console.log("Success expires_at!");
  } catch(e: any) {}

  console.log("Creating circle_members if missing...");
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS circle_members (
        id SERIAL PRIMARY KEY,
        circle_id INTEGER REFERENCES night_circles(id) ON DELETE CASCADE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        alias VARCHAR(50) NOT NULL,
        avatar VARCHAR(30) DEFAULT 'moon_1',
        mode VARCHAR(20) DEFAULT 'listener',
        state VARCHAR(20) DEFAULT 'active',
        joined_at TIMESTAMP DEFAULT NOW(),
        left_at TIMESTAMP
      )
    `);
    console.log("Success!");
  } catch(e: any) {
    console.error(e.message);
  }

  console.log("Creating circle_messages if missing...");
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS circle_messages (
        id SERIAL PRIMARY KEY,
        circle_id INTEGER REFERENCES night_circles(id) ON DELETE CASCADE NOT NULL,
        sender_alias VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        sentiment_score INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("Success!");
  } catch(e: any) {
    console.error(e.message);
  }

  process.exit(0);
}
run();
