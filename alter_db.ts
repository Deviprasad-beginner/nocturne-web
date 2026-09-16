import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function run() {
  try {
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS moon_phase_level INTEGER DEFAULT 0;`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS permanent_stars INTEGER DEFAULT 0;`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_check_in TIMESTAMP;`);
    console.log("Migration complete.");
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
