import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function run() {
  try {
    console.log("Adding embedding to night_thoughts...");
    await db.execute(sql`ALTER TABLE night_thoughts ADD COLUMN IF NOT EXISTS embedding vector(384);`);
    console.log("Migration complete.");
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
