-- Migration for Read Card feature
-- Phase 1: Core tables for reading functionality

-- Reads table: stores uploaded and curated reading content
CREATE TABLE IF NOT EXISTS reads (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    content TEXT, -- For short text content
    content_url TEXT, -- For uploaded files (PDF, etc.)
    estimated_read_time_minutes INTEGER,
    
    -- Ownership & Visibility
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    visibility TEXT CHECK (visibility IN ('private', 'tonight', 'curated')) DEFAULT 'private',
    
    -- Content Metadata
    content_type TEXT CHECK (content_type IN ('text', 'pdf', 'epub', 'curated')) DEFAULT 'text',
    source_attribution TEXT, -- For public domain works
    intention TEXT CHECK (intention IN ('learn', 'feel', 'think', 'sleep')),
    
    -- Moderation (Phase 2)
    moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    moderation_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ
);

-- Indexes for reads table
CREATE INDEX IF NOT EXISTS idx_reads_visibility ON reads(visibility, moderation_status);
CREATE INDEX IF NOT EXISTS idx_reads_owner_visibility ON reads(owner_id, visibility);
CREATE INDEX IF NOT EXISTS idx_reads_expires_at ON reads(expires_at);

-- Read Sessions: track user reading progress
CREATE TABLE IF NOT EXISTS read_sessions (
    id SERIAL PRIMARY KEY,
    read_id INTEGER REFERENCES reads(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    
    -- Progress Tracking
    last_position INTEGER DEFAULT 0, -- Page number or scroll percentage
    last_position_type TEXT CHECK (last_position_type IN ('page', 'percentage')) DEFAULT 'percentage',
    intention TEXT CHECK (intention IN ('learn', 'feel', 'think', 'sleep')),
    
    -- Analytics (Privacy-focused)
    total_time_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one session per user per read
    UNIQUE(read_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_read_sessions_user ON read_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_read_sessions_read ON read_sessions(read_id);

-- Private Highlights: user's personal annotations (Phase 1)
CREATE TABLE IF NOT EXISTS private_highlights (
    id SERIAL PRIMARY KEY,
    read_id INTEGER REFERENCES reads(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    
    -- Content
    start_position INTEGER NOT NULL,
    end_position INTEGER NOT NULL,
    highlighted_text TEXT,
    note TEXT, -- Optional personal note
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_private_highlights_user_read ON private_highlights(user_id, read_id);
CREATE INDEX IF NOT EXISTS idx_private_highlights_expires ON private_highlights(expires_at);

-- Silent Lines: anonymous annotations for Read Together (Phase 2)
CREATE TABLE IF NOT EXISTS silent_lines (
    id SERIAL PRIMARY KEY,
    read_id INTEGER REFERENCES reads(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- For moderation only
    
    -- Content
    text TEXT NOT NULL CHECK (LENGTH(text) <= 120),
    position INTEGER, -- Location in text (paragraph or page)
    
    -- Moderation
    flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_silent_lines_read_expires ON silent_lines(read_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_silent_lines_flagged ON silent_lines(flagged) WHERE flagged = TRUE;
