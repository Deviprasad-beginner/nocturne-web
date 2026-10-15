import "dotenv/config";
import { config } from "dotenv";
config({ override: true });
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function alter() {
  await db.execute(sql`ALTER TABLE users ALTER COLUMN username DROP NOT NULL;`);
  console.log("✓ Successfully made users.username nullable");
  process.exit(0);
}

alter().catch((err) => {
  console.error("Failed to alter table:", err);
  process.exit(1);
});
