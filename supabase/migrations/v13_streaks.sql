-- v13: Add streak tracking columns to profiles
-- Run this in your Supabase SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_checkin_date date,
  ADD COLUMN IF NOT EXISTS current_streak    int  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak    int  NOT NULL DEFAULT 0;

-- Index for fast streak queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_checkin
  ON profiles (last_checkin_date);
