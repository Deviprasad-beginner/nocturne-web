-- Migration: Add night_thought_replies table
-- Stores actual reply content for Night Thoughts posts

CREATE TABLE IF NOT EXISTS night_thought_replies (
  id          SERIAL PRIMARY KEY,
  thought_id  INTEGER NOT NULL REFERENCES night_thoughts(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  author_id   INTEGER REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_night_thought_replies_thought_id ON night_thought_replies(thought_id);
