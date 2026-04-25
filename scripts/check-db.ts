import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function checkSchema() {
    try {
        console.log("Checking database schema...");
        const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);

        console.log("Columns in 'users' table:");
        const columns = result.rows.map((row: any) => row.column_name);
        console.log(columns);

        if (columns.includes('night_streak')) {
            console.log("SUCCESS: night_streak column exists.");
        } else {
            console.log("FAILURE: night_streak column is MISSING.");
        }
    } catch (error) {
        console.error("Error checking schema:", error);
    }
    process.exit(0);
}

checkSchema();
