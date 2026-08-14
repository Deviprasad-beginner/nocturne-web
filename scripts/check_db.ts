import { db } from './server/db';
import { sql } from 'drizzle-orm';
async function run() {
  const result = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`);
  console.log(result.rows);
  process.exit(0);
}
run();
