import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function checkColumn() {
    try {
        const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'current_streak';
    `);

        if (result.rows.length > 0) {
            console.log("✅ Column 'current_streak' exists in 'users' table.");
        } else {
            console.error("❌ Column 'current_streak' does NOT exist in 'users' table.");
        }
        process.exit(0);
    } catch (error) {
        console.error("Error checking column:", error);
        process.exit(1);
    }
}

checkColumn();
