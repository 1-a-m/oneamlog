-- Add period field to works table
ALTER TABLE works ADD COLUMN IF NOT EXISTS period VARCHAR(100);

-- Add comment
COMMENT ON COLUMN works.period IS 'Project period (e.g., "2023年4月 - 2023年6月")';
