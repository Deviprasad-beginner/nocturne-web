import { db } from './server/db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function run() {
  try {
    const migrationPath = path.join(process.cwd(), 'migrations', '0003_curly_victor_mancha.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    
    console.log("Running migration...");
    
    // Split by statement-breakpoint to run statements individually
    const statements = sqlContent.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      try {
        await db.execute(sql.raw(statement));
      } catch (err: any) {
        const code = err.code || err.cause?.code;
        const msg = err.message || '';
        // 42P07 = duplicate_table/relation, 42701 = duplicate_column, 42710 = duplicate_object
        if (code === '42P07' || code === '42701' || code === '42710' || msg.includes('already exists')) {
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
