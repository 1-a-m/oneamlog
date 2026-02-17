import { Hono } from 'hono';
import type { Bindings } from '../types';
import { authMiddleware } from '../middleware/auth';
import { createSupabaseClient, createSupabaseAdminClient } from '../lib/supabase';
import { Login } from '../views/pages/admin/Login';
import { Dashboard } from '../views/pages/admin/Dashboard';
import { PostEditor } from '../views/pages/admin/PostEditor';
import { TagManager } from '../views/pages/admin/TagManager';
import { ContactList } from '../views/pages/admin/ContactList';
import { TimesList } from '../views/pages/admin/TimesList';
import { TimeForm } from '../views/pages/admin/TimeForm';
import { WorkList } from '../views/pages/admin/WorkList';
import { WorkForm } from '../views/pages/admin/WorkForm';

const app = new Hono<{ Bindings: Bindings }>();

// Login page (non-authenticated)
app.get('/login', (c) => {
  const error = c.req.query('error');
  let errorMessage: string | undefined;

  if (error === 'missing-credentials') {
    errorMessage = 'メールアドレスとパスワードを入力してください';
  } else if (error === 'invalid-credentials') {
    errorMessage = 'メールアドレスまたはパスワードが正しくありません';
  }

  return c.html(<Login errorMsg={errorMessage} />);
});

// Protected admin routes
app.use('/*', authMiddleware);

// Dashboard
app.get('/', async (c) => {
  const supabase = createSupabaseClient(c.env);

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      post_tags(
        tags(*)
      )
    `)
    .order('created_at', { ascending: false });

  // Transform data
  const transformedPosts = posts?.map((post: any) => ({
    ...post,
    tags: post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || []
  })) || [];

  return c.html(<Dashboard posts={transformedPosts} />);
});

// New post
app.get('/posts/new', async (c) => {
  const supabase = createSupabaseClient(c.env);
  const errorMsg = c.req.query('error');

  const { data: allTags } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  return c.html(<PostEditor allTags={allTags || []} errorMsg={errorMsg} />);
});

// Edit post
app.get('/posts/:id/edit', async (c) => {
  const id = c.req.param('id');
  const supabase = createSupabaseClient(c.env);
  const errorMsg = c.req.query('error');

  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      post_tags(
        tags(*)
      )
    `)
    .eq('id', id)
    .single();

  if (!post) {
    return c.redirect('/admin');
  }

  // Transform data
  const transformedPost = {
    ...post,
    tags: post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || []
  };

  const { data: allTags } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  return c.html(<PostEditor post={transformedPost} allTags={allTags || []} errorMsg={errorMsg} />);
});

app.get('/tags', async (c) => {
  const supabase = createSupabaseClient(c.env);
  const errorMsg = c.req.query('error');
  const successMsg = c.req.query('success');

  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  return c.html(<TagManager tags={tags || []} errorMsg={errorMsg} successMsg={successMsg} />);
});

app.get('/contacts', async (c) => {
  // Use admin client to bypass RLS
  const supabase = createSupabaseAdminClient(c.env);
  const successMsg = c.req.query('success');

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  return c.html(<ContactList contacts={contacts || []} successMsg={successMsg} />);
});

// Times routes
app.get('/times', async (c) => {
  // Use admin client to bypass RLS
  const supabase = createSupabaseAdminClient(c.env);

  const { data: times } = await supabase
    .from('times')
    .select('*')
    .order('created_at', { ascending: false });

  return c.html(<TimesList times={times || []} />);
});

app.get('/times/new', (c) => {
  return c.html(<TimeForm />);
});

// Work routes
app.get('/works', async (c) => {
  // Use admin client to bypass RLS
  const supabase = createSupabaseAdminClient(c.env);
  const successMsg = c.req.query('success');

  let message: string | undefined;
  if (successMsg === 'created') message = 'Work created successfully';
  if (successMsg === 'updated') message = 'Work updated successfully';
  if (successMsg === 'deleted') message = 'Work deleted successfully';

  const { data: works } = await supabase
    .from('works')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  return c.html(<WorkList works={works || []} successMsg={message} />);
});

app.get('/works/new', (c) => {
  return c.html(<WorkForm />);
});

app.get('/works/:id/edit', async (c) => {
  const id = c.req.param('id');
  const supabase = createSupabaseAdminClient(c.env);

  const { data: work, error } = await supabase
    .from('works')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !work) {
    return c.text('Work not found', 404);
  }

  return c.html(<WorkForm work={work} />);
});

export default app;
