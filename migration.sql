-- SQL Migration Script for Nocturne Database
-- Run these queries in your Neon SQL Editor to sync the database with the schema

-- 1. Add author_id to whispers table (if not exists)
ALTER TABLE whispers 
ADD COLUMN IF NOT EXISTS author_id INTEGER REFERENCES users(id);

-- 2. Add author_id to diaries table (if not exists)
ALTER TABLE diaries 
ADD COLUMN IF NOT EXISTS author_id INTEGER REFERENCES users(id);

-- 3. Add author_id to midnight_cafe table (if not exists)
ALTER TABLE midnight_cafe 
ADD COLUMN IF NOT EXISTS author_id INTEGER REFERENCES users(id);

-- 4. Create saved_stations table (if not exists)
CREATE TABLE IF NOT EXISTS saved_stations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    station_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Add has_seen_onboarding field to users table (for First Night onboarding)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS has_seen_onboarding BOOLEAN DEFAULT false;

-- 6. Verify the changes
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('whispers', 'diaries', 'midnight_cafe', 'saved_stations', 'users')
    AND column_name IN ('author_id', 'has_seen_onboarding')
ORDER BY table_name;

-- 7. Check saved_stations table structure
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'saved_stations'
ORDER BY ordinal_position;
