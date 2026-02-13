-- Seed data for development

-- Insert sample tags
INSERT INTO tags (name, slug) VALUES
  ('TypeScript', 'typescript'),
  ('Hono', 'hono'),
  ('Cloudflare', 'cloudflare'),
  ('Supabase', 'supabase'),
  ('Web Development', 'web-development');

-- Note: Posts will be created via the admin panel
-- This seed file is kept minimal for development purposes
