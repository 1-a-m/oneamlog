-- Add detailed fields to works table
ALTER TABLE works
  ADD COLUMN IF NOT EXISTS position VARCHAR(255),
  ADD COLUMN IF NOT EXISTS category VARCHAR(100),
  ADD COLUMN IF NOT EXISTS languages TEXT[],
  ADD COLUMN IF NOT EXISTS libraries TEXT[],
  ADD COLUMN IF NOT EXISTS environments TEXT[],
  ADD COLUMN IF NOT EXISTS tools TEXT[];
