require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  try {
    await sql`DROP TABLE IF EXISTS night_thoughts CASCADE;`;
    await sql`DROP TABLE IF EXISTS night_circles CASCADE;`;
    console.log('Dropped tables');
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
})();
