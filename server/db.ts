// Load .env FIRST with override:true before anything reads process.env.
// This is critical because db.ts runs at module-load time (before dotenv
// in index.ts fires), and any OS-level env var would otherwise win.
import { config } from "dotenv";
config({ override: true });

import { drizzle } from 'drizzle-orm/node-postgres';

import pg from 'pg';
const { Pool } = pg;
import * as schema from "@shared/schema";

// Initialize drizzle only when DATABASE_URL is provided.
// Works with Supabase, Neon, or any Postgres-compatible connection string.
export let pool: pg.Pool | undefined;
let dbInstance: ReturnType<typeof drizzle> | undefined;

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL to extract components
  // Format: postgresql://user:password@host:port/database
  const dbUrl = new URL(process.env.DATABASE_URL);

  // Create a connection string without SSL parameters to prevent conflicts
  // and ensure our manual SSL config takes precedence
  const connectionString = new URL(process.env.DATABASE_URL);
  connectionString.searchParams.delete('sslmode');
  connectionString.searchParams.delete('ssl');

  // Log connection details for debugging (masking password)
  const safeUrl = new URL(process.env.DATABASE_URL);
  safeUrl.password = "*****";
  console.log(`[DB] Connecting to: ${safeUrl.toString()}`);
  console.log(`[DB] SNI Servername: ${process.env.DB_SNI_SERVERNAME || dbUrl.hostname}`);
  console.log(`[DB] Password length: ${dbUrl.password.length}`);

  pool = new Pool({
    connectionString: connectionString.toString(),
    // ── Connection pool tuning ──────────────────────────────────────────────
    // Neon free tier allows up to 20 simultaneous connections.
    // Paid tiers support 50+; raise `max` accordingly.
    max: 20,
    // Release idle connections after 30 s to avoid Neon's idle-timeout drops.
    idleTimeoutMillis: 30_000,
    // Neon free tier can take up to 8 s to wake from sleep (cold start).
    // 10 s gives it enough headroom without hanging forever.
    connectionTimeoutMillis: 10_000,
    // ── SSL (required for Neon) ─────────────────────────────────────────────
    ssl: {
      rejectUnauthorized: false,
      servername: process.env.DB_SNI_SERVERNAME || dbUrl.hostname,
      checkServerIdentity: () => undefined,
    },
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  dbInstance = drizzle(pool, { schema });
} else {
  // Fail fast at startup rather than silently allowing undefined, which causes
  // cryptic "Cannot read properties of undefined (reading 'execute')" errors
  // at runtime on every DB call.
  throw new Error(
    "❌ DATABASE_URL is not set. Cannot start the server without a database connection.\n" +
    "Please create a .env file with DATABASE_URL set to your Postgres connection string."
  );
}

// db is guaranteed to be defined here because we throw above if DATABASE_URL is missing
export const db = dbInstance!;