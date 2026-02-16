import "dotenv/config";
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function checkDiaries() {
    try {
        console.log("Checking diaries table schema...");
        const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'diaries';
    `);

        console.log("Columns in 'diaries' table:");
        const columns = result.rows.map((row: any) => row.column_name);
        console.log(JSON.stringify(columns, null, 2));

    } catch (error) {
        console.error("Error checking schema:", error);
    }
    process.exit(0);
}

checkDiaries();
