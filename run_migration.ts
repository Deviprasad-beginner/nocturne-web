import { db } from './server/db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function run() {
  try {
    const migrationPath = path.join(process.cwd(), 'migrations', '0002_blue_dragon_lord.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    
    console.log("Running migration...");
    
    // Split by statement-breakpoint to run statements individually
    const statements = sqlContent.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      try {
        await db.execute(sql.raw(statement));
      } catch (err: any) {
        // 42P07 = duplicate_table, 42701 = duplicate_column, 42710 = duplicate_object
        if (err.code === '42P07' || err.code === '42701' || err.code === '42710') {
          console.log(`Skipped (already exists): ${statement.substring(0, 30)}...`);
        } else {
          throw err;
        }
      }
    }
    
    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

run();
