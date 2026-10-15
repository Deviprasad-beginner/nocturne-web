import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("=== Starting V2 Schema Migration ===");

  // 1. Enable uuid-ossp / pgcrypto
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

  // 2. Create Enums
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE whisper_mood AS ENUM ('lonely', 'restless', 'nostalgic', 'inspired', 'anxious', 'grateful');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE whisper_visibility AS ENUM ('private', 'public', 'resonance');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE resonance_status AS ENUM ('searching', 'connected', 'closed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  console.log("✓ Enums created");

  // 3. Drop existing foreign keys referencing users.id so users.id can be converted to UUID
  const fks = await db.execute(sql`
    SELECT tc.constraint_name, tc.table_name
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'users';
  `);

  for (const row of fks.rows) {
    const constraintName = row.constraint_name as string;
    const tableName = row.table_name as string;
    try {
      await db.execute(sql.raw(`ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "${constraintName}";`));
      console.log(`✓ Dropped FK constraint ${constraintName} on ${tableName}`);
    } catch (e: any) {
      console.warn(`Warning dropping constraint ${constraintName}:`, e.message);
    }
  }

  // 4. Migrate users table to UUID PK & add firebase_uid, anonymous_handle
  await db.execute(sql`
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey CASCADE;
  `);

  // Change users.id to uuid with default gen_random_uuid()
  await db.execute(sql`
    ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
  `);
  await db.execute(sql`
    ALTER TABLE users ALTER COLUMN id TYPE uuid USING gen_random_uuid();
  `);
  await db.execute(sql`
    ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
  `);
  await db.execute(sql`
    ALTER TABLE users ADD PRIMARY KEY (id);
  `);

  // Add firebase_uid and anonymous_handle columns if they don't exist
  await db.execute(sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid text UNIQUE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS anonymous_handle text;
  `);

  // Create indexes on users
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
    CREATE INDEX IF NOT EXISTS idx_users_anonymous_handle ON users(anonymous_handle);
  `);

  // Assign midnight aliases to any users without one
  await db.execute(sql`
    UPDATE users 
    SET anonymous_handle = 'MidnightWanderer-' || floor(random() * 900 + 100)::text 
    WHERE anonymous_handle IS NULL;
  `);

  await db.execute(sql`
    ALTER TABLE users ALTER COLUMN anonymous_handle SET NOT NULL;
  `);
  console.log("✓ users table migrated to UUID PK with firebase_uid and anonymous_handle");

  // 5. Recreate whispers table with UUID PK and Task 1 specs
  await db.execute(sql`DROP TABLE IF EXISTS whispers CASCADE;`);
  await db.execute(sql`
    CREATE TABLE whispers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      author_id uuid REFERENCES users(id) ON DELETE CASCADE,
      content varchar(300) NOT NULL,
      mood whisper_mood NOT NULL,
      visibility whisper_visibility NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL,
      expires_at timestamp NOT NULL
    );
  `);
  await db.execute(sql`CREATE INDEX idx_whispers_author_id ON whispers(author_id);`);
  await db.execute(sql`CREATE INDEX idx_whispers_mood ON whispers(mood);`);
  await db.execute(sql`CREATE INDEX idx_whispers_visibility ON whispers(visibility);`);
  await db.execute(sql`CREATE INDEX idx_whispers_created_at_desc ON whispers(created_at DESC);`);
  await db.execute(sql`CREATE INDEX idx_whispers_visibility_expires ON whispers(visibility, expires_at);`);
  console.log("✓ whispers table recreated with UUID PK, indexes, and constraints");

  // 6. Create resonance_sessions table
  await db.execute(sql`DROP TABLE IF EXISTS resonance_sessions CASCADE;`);
  await db.execute(sql`
    CREATE TABLE resonance_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      initiator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      peer_id uuid REFERENCES users(id) ON DELETE CASCADE,
      mood whisper_mood NOT NULL,
      status resonance_status NOT NULL DEFAULT 'searching',
      created_at timestamp DEFAULT now() NOT NULL
    );
  `);
  await db.execute(sql`CREATE INDEX idx_resonance_sessions_initiator_id ON resonance_sessions(initiator_id);`);
  await db.execute(sql`CREATE INDEX idx_resonance_sessions_peer_id ON resonance_sessions(peer_id);`);
  await db.execute(sql`CREATE INDEX idx_resonance_sessions_status ON resonance_sessions(status);`);
  await db.execute(sql`CREATE INDEX idx_resonance_sessions_mood ON resonance_sessions(mood);`);
  console.log("✓ resonance_sessions table created with UUID PK and indexes");

  console.log("=== V2 Schema Migration Completed Successfully ===");
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
