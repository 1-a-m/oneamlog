import { Hono } from 'hono';
import type { Bindings } from '../types';
import { createSupabaseClient, createSupabaseAdminClient } from '../lib/supabase';
import { validateContact } from '../lib/validation';
import { Home } from '../views/pages/Home';
import { About } from '../views/pages/About';
import { Contact } from '../views/pages/Contact';
import { BlogList } from '../views/pages/BlogList';
import { BlogPost } from '../views/pages/BlogPost';

const app = new Hono<{ Bindings: Bindings }>();

// Home page
app.get('/', (c) => {
  return c.html(<Home />);
});

// About page
app.get('/about', (c) => {
  return c.html(<About />);
});

// Contact page
app.get('/contact', (c) => {
  const success = c.req.query('success') === 'true';
  return c.html(<Contact success={success} />);
});

// Contact form submission
app.post('/contact', async (c) => {
  // Use admin client to bypass RLS for public contact submissions
  const supabase = createSupabaseAdminClient(c.env);
  const body = await c.req.parseBody();

  const validation = validateContact(body);

  if (!validation.success) {
    return c.html(<Contact error={validation.error} />);
  }

  const { error } = await supabase
    .from('contacts')
    .insert(validation.data);

  if (error) {
    console.error('Contact submission error:', error);
    return c.html(<Contact error="送信に失敗しました。もう一度お試しください。" />);
  }

  return c.redirect('/contact?success=true');
});

// Blog list page
app.get('/blog', async (c) => {
  const supabase = createSupabaseClient(c.env);
  const tag = c.req.query('tag');

  // Get all tags
  const { data: allTags } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  // Get posts query
  let query = supabase
    .from('posts')
    .select(`
      *,
      post_tags(
        tags(*)
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const { data: posts, error } = await query;

  if (error) {
    console.error('Blog list error:', error);
    return c.text('Error loading posts', 500);
  }

  // Transform data to match Post type with tags
  const transformedPosts = posts?.map((post: any) => ({
    ...post,
    tags: post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || []
  })) || [];

  // Filter by tag if specified
  const filteredPosts = tag
    ? transformedPosts.filter((post: any) =>
        post.tags.some((t: any) => t.slug === tag)
      )
    : transformedPosts;

  return c.html(<BlogList posts={filteredPosts} currentTag={tag} allTags={allTags || []} />);
});

// Blog post detail page
app.get('/blog/:slug', async (c) => {
  const slug = c.req.param('slug');
  const supabase = createSupabaseClient(c.env);

  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      post_tags(
        tags(*)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !post) {
    return c.text('Post not found', 404);
  }

  // Transform data to match Post type with tags
  const transformedPost = {
    ...post,
    tags: post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || []
  };

  // Increment view count
  await supabase
    .from('posts')
    .update({ view_count: (post.view_count || 0) + 1 })
    .eq('id', post.id);

  return c.html(<BlogPost post={transformedPost} />);
});

export default app;
