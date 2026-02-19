-- Create works table for portfolio projects
CREATE TABLE IF NOT EXISTS works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  project_url TEXT,
  github_url TEXT,
  technologies TEXT[], -- Array of technology names
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on display_order for sorting
CREATE INDEX idx_works_display_order ON works(display_order);

-- Enable RLS
ALTER TABLE works ENABLE ROW LEVEL SECURITY;

-- Allow public to read works
CREATE POLICY "Allow public read access to works"
  ON works
  FOR SELECT
  USING (true);

-- Allow authenticated users (admin) to manage works
CREATE POLICY "Allow authenticated users to insert works"
  ON works
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update works"
  ON works
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete works"
  ON works
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_works_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER works_updated_at_trigger
  BEFORE UPDATE ON works
  FOR EACH ROW
  EXECUTE FUNCTION update_works_updated_at();
