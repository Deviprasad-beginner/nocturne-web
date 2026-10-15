import "dotenv/config";
import { config } from "dotenv";
config({ override: true });
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function check() {
  const result = await db.execute(sql`
    SELECT column_name, is_nullable, column_default, data_type
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position;
  `);
  console.log("USERS COLUMNS:", result.rows);
  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
