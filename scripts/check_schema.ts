
import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function checkSchema() {
    try {
        const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'am_founder';
    `);
        console.log("Columns in am_founder table:", result.rows);
    } catch (error) {
        console.error("Error checking schema:", error);
    }
    process.exit(0);
}

checkSchema();
