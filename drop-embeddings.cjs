require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  try {
    await sql`ALTER TABLE night_thoughts DROP COLUMN embedding;`;
    console.log('Dropped embedding from night_thoughts');
  } catch (e) {
    console.error(e);
  }
  try {
    await sql`ALTER TABLE night_circles DROP COLUMN embedding;`;
    console.log('Dropped embedding from night_circles');
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
})();
