import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function run() {
  const statements = [
    `ALTER TABLE "users" ADD COLUMN "night_persona" varchar(50);`,
    `ALTER TABLE "users" ADD COLUMN "bio" text;`,
    `ALTER TABLE "users" ADD COLUMN "location" varchar(100);`,
    `ALTER TABLE "users" ADD COLUMN "preferences" jsonb DEFAULT '{}'::jsonb;`
  ];
  
  for (const statement of statements) {
    try {
      console.log(`Executing: ${statement}`);
      await db.execute(sql.raw(statement));
      console.log(`Success`);
    } catch (error: any) {
      if (error.code === '42701') {
        console.log(`Skipped: Column already exists`);
      } else {
        console.error(`Failed:`, error.message);
      }
    }
  }
  process.exit(0);
}

run();
