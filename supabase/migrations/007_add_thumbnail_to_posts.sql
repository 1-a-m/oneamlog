-- Add thumbnail_url to posts table
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
