-- Create times table
CREATE TABLE times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL CHECK (char_length(content) <= 280),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index for efficient sorting by created_at (most recent first)
CREATE INDEX idx_times_created_at ON times(created_at DESC);

-- Enable Row Level Security
ALTER TABLE times ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can read times
CREATE POLICY "Times are viewable by everyone"
  ON times FOR SELECT
  USING (true);

-- Authenticated users can insert times
CREATE POLICY "Authenticated users can insert times"
  ON times FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete their own times
CREATE POLICY "Authenticated users can delete their own times"
  ON times FOR DELETE
  USING (auth.uid() = author_id);

-- Authenticated users can update their own times
CREATE POLICY "Authenticated users can update their own times"
  ON times FOR UPDATE
  USING (auth.uid() = author_id);
