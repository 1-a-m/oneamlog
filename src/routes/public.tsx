import { Hono } from 'hono';
import type { Bindings } from '../types';
import { createSupabaseClient, createSupabaseAdminClient } from '../lib/supabase';
import { validateContact } from '../lib/validation';
import { Home } from '../views/pages/Home';
import { About } from '../views/pages/About';
import { Contact } from '../views/pages/Contact';
import { WorkDetail } from '../views/pages/WorkDetail';
import { BlogList } from '../views/pages/BlogList';
import { BlogPost } from '../views/pages/BlogPost';
import { TimesPage } from '../views/pages/Times';

const app = new Hono<{ Bindings: Bindings }>();

// Home page
app.get('/', async (c) => {
  const supabase = createSupabaseClient(c.env);

  // Get recent posts (limit 4) with tags
  const { data: rawPosts } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      thumbnail_url,
      published_at,
      view_count,
      post_tags(tags(*))
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(4);

  const posts = rawPosts?.map((p: any) => ({
    ...p,
    tags: p.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || [],
  })) || [];

  // Get recent times (limit 3)
  const { data: times } = await supabase
    .from('times')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  // Get all works ordered by display_order
  const { data: works } = await supabase
    .from('works')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  return c.html(<Home recentPosts={posts} recentTimes={times || []} works={works || []} />);
});

// About page
app.get('/about', (c) => {
  return c.html(<About />);
});

// Work detail page by ID (fallback for works without slug)
app.get('/work/id/:id', async (c) => {
  const id = c.req.param('id');
  const supabase = createSupabaseClient(c.env);

  const { data: work, error } = await supabase
    .from('works')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !work) {
    return c.text('Work not found', 404);
  }

  return c.html(<WorkDetail work={work} />);
});

// Work detail page by slug
app.get('/work/:slug', async (c) => {
  const slug = c.req.param('slug');
  const supabase = createSupabaseClient(c.env);

  const { data: work, error } = await supabase
    .from('works')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !work) {
    return c.text('Work not found', 404);
  }

  return c.html(<WorkDetail work={work} />);
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

// Times page
app.get('/times', async (c) => {
  const supabase = createSupabaseClient(c.env);

  const { data: times } = await supabase
    .from('times')
    .select('*')
    .order('created_at', { ascending: false });

  return c.html(<TimesPage times={times || []} />);
});

// Sitemap
app.get('/sitemap.xml', async (c) => {
  const supabase = createSupabaseClient(c.env);

  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const baseUrl = 'https://oneamlog.pages.dev'; // TODO: Replace with your actual domain

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/blog', priority: '0.9', changefreq: 'daily' },
  ];

  const blogPages = posts?.map((post) => ({
    url: `/blog/${post.slug}`,
    lastmod: post.updated_at || post.published_at,
    priority: '0.6',
    changefreq: 'weekly',
  })) || [];

  const allPages = [...staticPages, ...blogPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return c.text(sitemap, 200, {
    'Content-Type': 'application/xml',
  });
});

// Robots.txt
app.get('/robots.txt', (c) => {
  const baseUrl = 'https://oneamlog.pages.dev'; // TODO: Replace with your actual domain

  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`;

  return c.text(robots, 200, {
    'Content-Type': 'text/plain',
  });
});

export default app;
