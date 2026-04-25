-- Migration: Add has_seen_onboarding field to users table
-- This field tracks whether a user has completed the First Night onboarding

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS has_seen_onboarding BOOLEAN DEFAULT false;

-- Update existing users to have seen onboarding (optional - comment out if you want to show onboarding to all existing users)
-- UPDATE users SET has_seen_onboarding = true WHERE created_at < NOW();
