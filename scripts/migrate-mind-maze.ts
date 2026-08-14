import { db, pool } from "../server/db";
import { sql } from "drizzle-orm";

async function run() {
    try {
        console.log("Migrating mind maze...");
        await db.execute(sql`ALTER TABLE "mind_maze" ADD COLUMN IF NOT EXISTS "author_id" integer REFERENCES "users"("id");`);
        await db.execute(sql`ALTER TABLE "mind_maze" ADD COLUMN IF NOT EXISTS "is_system" boolean DEFAULT false;`);

        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "mind_maze_sparks" (
        "id" serial PRIMARY KEY,
        "maze_id" integer NOT NULL REFERENCES "mind_maze"("id") ON DELETE CASCADE,
        "author_id" integer NOT NULL REFERENCES "users"("id"),
        "content" text NOT NULL,
        "spark_type" varchar(20) NOT NULL,
        "resonance" integer DEFAULT 0,
        "created_at" timestamp DEFAULT now()
      );
    `);
        await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_mind_maze_sparks_maze" ON "mind_maze_sparks"("maze_id");`);
        await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_mind_maze_sparks_author" ON "mind_maze_sparks"("author_id");`);
        console.log("Done.");
    } catch (e) {
        console.error(e);
    } finally {
        pool?.end();
    }
}
run();
