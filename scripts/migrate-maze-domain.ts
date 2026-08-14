import { db, pool } from "../server/db";
import { sql } from "drizzle-orm";

async function run() {
    try {
        console.log("Adding domain to mind_maze...");
        await db.execute(sql`ALTER TABLE "mind_maze" ADD COLUMN IF NOT EXISTS "domain" varchar(50);`);
        console.log("Done.");
    } catch (e) {
        console.error(e);
    } finally {
        pool?.end();
    }
}
run();
