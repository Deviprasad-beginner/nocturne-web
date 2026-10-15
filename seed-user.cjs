require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  try {
    await sql`INSERT INTO users (id, username, email) VALUES (1, 'test_author', 'test@test.com') ON CONFLICT DO NOTHING;`;
    console.log('Test user inserted');
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
})();
