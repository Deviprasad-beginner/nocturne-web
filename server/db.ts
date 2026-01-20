import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;
import * as schema from "@shared/schema";

// Initialize drizzle only when DATABASE_URL is provided.
// Works with Supabase, Neon, or any Postgres-compatible connection string.
export let pool: pg.Pool | undefined;
let dbInstance: ReturnType<typeof drizzle> | undefined;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  dbInstance = drizzle(pool, { schema });
}

export const db = dbInstance as unknown as ReturnType<typeof drizzle>;