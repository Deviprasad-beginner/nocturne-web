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

  pool = new Pool({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || '5432'),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1), // Remove leading slash
    ssl: {
      rejectUnauthorized: false,
      // If hostname is an IP, use the SNI servername from env or construct from components
      servername: process.env.DB_SNI_SERVERNAME || dbUrl.hostname
    },
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  dbInstance = drizzle(pool, { schema });
} else {
  console.error("❌ DATABASE_URL is not set. Database operations will fail.");
  console.error("Please set DATABASE_URL in your .env file");
}

// Export db with proper null check
export const db = dbInstance!;

// Check if db is properly initialized
// Check if db is properly initialized
// if (!db) {
//   throw new Error("Database not initialized. Please set DATABASE_URL environment variable.");
// }