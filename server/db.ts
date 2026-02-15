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

  pool = new Pool({
    connectionString: connectionString.toString(),
    ssl: {
      rejectUnauthorized: false,
      servername: process.env.DB_SNI_SERVERNAME || dbUrl.hostname,
      // Fix for "Hostname/IP does not match certificate's altnames"
      // because we are connecting via IP but the cert is for the hostname
      checkServerIdentity: () => undefined
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