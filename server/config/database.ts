/**
 * Database configuration and connection management
 * Re-exports the existing database setup from db.ts
 */

export { db, pool } from "../db";

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
    try {
        const { pool } = await import("../db");
        if (!pool) {
            console.warn("⚠️  Database pool not initialized (DATABASE_URL not set)");
            return false;
        }
        await pool.query("SELECT 1");
        console.log("✅ Database connection successful");
        return true;
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        return false;
    }
}
