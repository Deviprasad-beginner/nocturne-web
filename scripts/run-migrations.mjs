import { config } from 'dotenv';
config({ override: true });

import pg from 'pg';
const { Pool } = pg;

const dbUrl = new URL(process.env.DATABASE_URL);
const connStr = new URL(process.env.DATABASE_URL);
connStr.searchParams.delete('sslmode');
connStr.searchParams.delete('ssl');

const pool = new Pool({
  connectionString: connStr.toString(),
  ssl: {
    rejectUnauthorized: false,
    servername: process.env.DB_SNI_SERVERNAME || dbUrl.hostname,
    checkServerIdentity: () => undefined
  }
});

const migrations = [
  {
    name: 'cafe_replies',
    sql: `
      CREATE TABLE IF NOT EXISTS cafe_replies (
        id          SERIAL PRIMARY KEY,
        cafe_id     INTEGER NOT NULL REFERENCES midnight_cafe(id) ON DELETE CASCADE,
        content     TEXT NOT NULL,
        author_id   INTEGER REFERENCES users(id),
        created_at  TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_cafe_replies_cafe_id ON cafe_replies(cafe_id);
    `
  },
  {
    name: 'night_thought_replies',
    sql: `
      CREATE TABLE IF NOT EXISTS night_thought_replies (
        id          SERIAL PRIMARY KEY,
        thought_id  INTEGER NOT NULL REFERENCES night_thoughts(id) ON DELETE CASCADE,
        content     TEXT NOT NULL,
        author_id   INTEGER REFERENCES users(id),
        created_at  TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_night_thought_replies_thought_id ON night_thought_replies(thought_id);
    `
  }
];

async function main() {
  const client = await pool.connect();
  try {
    for (const m of migrations) {
      console.log(`Creating: ${m.name}`);
      await client.query(m.sql);
      console.log(`Done: ${m.name}`);
    }
    console.log('\nAll migrations applied!');
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
