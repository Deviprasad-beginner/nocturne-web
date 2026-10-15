require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS vector;`;
    console.log('Recreated vector extension');
    
    await sql`INSERT INTO users (id, username, email) VALUES (1, 'test_author', 'test@test.com') ON CONFLICT DO NOTHING;`;
    console.log('Seed user created');
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
})();
