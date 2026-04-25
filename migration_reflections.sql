-- Migration for Nightly Reflections Feature
-- Creates tables for AI-powered reflection prompts and user responses

CREATE TABLE IF NOT EXISTS nightly_prompts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  shift_mode VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS user_reflections (
  id SERIAL PRIMARY KEY,
  prompt_id INTEGER NOT NULL REFERENCES nightly_prompts(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  response_content TEXT NOT NULL,
  ai_evaluation JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personal_reflections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  user_query TEXT NOT NULL,
  ai_reflection TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_nightly_prompts_expires ON nightly_prompts(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_reflections_user_id ON user_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reflections_prompt_id ON user_reflections(prompt_id);
CREATE INDEX IF NOT EXISTS idx_personal_reflections_user_id ON personal_reflections(user_id);
