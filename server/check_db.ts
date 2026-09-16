import 'dotenv/config';
import { db, pool } from './db';
import { sql } from 'drizzle-orm';

async function checkColumns() {
  try {
    await db.execute(sql`SELECT topic FROM night_circles LIMIT 1`);
    console.log('topic exists on night_circles');
  } catch (err) {
    console.error('topic missing:', err);
  }
  
  try {
    await db.execute(sql`SELECT image_url FROM circle_messages LIMIT 1`);
    console.log('image_url exists on circle_messages');
  } catch (err) {
    console.error('image_url missing:', err);
  }

  try {
    await db.execute(sql`SELECT is_system FROM mind_maze LIMIT 1`);
    console.log('is_system exists on mind_maze');
  } catch (err) {
    console.error('is_system missing:', err);
  }
  
  pool?.end();
  process.exit(0);
}

checkColumns();
