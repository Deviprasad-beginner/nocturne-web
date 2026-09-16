import fs from 'fs';
import { db, pool } from './db';
import { sql } from 'drizzle-orm';

async function run() {
  try {
    const migration = fs.readFileSync('migrations/0004_conscious_vanisher.sql', 'utf8');
    await db.execute(sql.raw(migration));
    console.log('Migration successfully applied!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    pool?.end();
    process.exit(0);
  }
}

run();
