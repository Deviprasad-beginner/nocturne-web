-- Migration: Add is_ephemeral column to reads table
-- The expiresAt column already exists in the schema

ALTER TABLE reads ADD COLUMN IF NOT EXISTS is_ephemeral BOOLEAN DEFAULT FALSE;
