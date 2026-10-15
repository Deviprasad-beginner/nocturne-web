require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  try {
    await sql`ALTER TABLE whispers DROP COLUMN embedding;`;
    console.log('Dropped embedding from whispers');
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
})();
