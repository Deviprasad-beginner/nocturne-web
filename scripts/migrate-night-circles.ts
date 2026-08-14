import { db, pool } from "../server/db";
import { sql } from "drizzle-orm";

async function run() {
    try {
        console.log("Migrating night circles...");
        await db.execute(sql`ALTER TABLE "night_circles" ADD COLUMN IF NOT EXISTS "topic" text;`);
        await db.execute(sql`ALTER TABLE "night_circles" ADD COLUMN IF NOT EXISTS "category" varchar(50);`);
        await db.execute(sql`ALTER TABLE "night_circles" ADD COLUMN IF NOT EXISTS "room_type" varchar(20) DEFAULT 'random';`);
        await db.execute(sql`ALTER TABLE "circle_messages" ADD COLUMN IF NOT EXISTS "image_url" text;`);
        console.log("Done.");
    } catch (e) {
        console.error(e);
    } finally {
        pool?.end();
    }
}
run();
