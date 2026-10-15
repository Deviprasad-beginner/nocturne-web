require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  try {
    await sql`ALTER TABLE night_thoughts ADD COLUMN embedding vector(768);`;
    console.log('Added embedding vector(768) to night_thoughts');
  } catch (e) {
    console.error(e);
  }
  try {
    await sql`ALTER TABLE whispers ADD COLUMN embedding vector(768);`;
    console.log('Added embedding vector(768) to whispers');
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
})();
