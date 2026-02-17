-- Add slug field to works table for URL-friendly routes
ALTER TABLE works ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Add index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_works_slug ON works(slug);

-- Add comment
COMMENT ON COLUMN works.slug IS 'URL-friendly slug for work detail pages';
