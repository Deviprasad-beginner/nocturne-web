import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function checkSchema() {
    try {
        const fk = await db.execute(sql`
          SELECT
              tc.table_name, 
              kcu.column_name, 
              ccu.table_name AS foreign_table_name,
              ccu.column_name AS foreign_column_name 
          FROM information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'users';
        `);
        console.log("Foreign keys referencing users:", fk.rows);
    } catch (error) {
        console.error("Error checking FKs:", error);
    }
    process.exit(0);
}

checkSchema();
