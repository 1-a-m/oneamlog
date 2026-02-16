import { Hono } from 'hono';
import type { Bindings } from '../types';
import { createSupabaseClient, createSupabaseAdminClient } from '../lib/supabase';
import { setAuthCookie, clearAuthCookies } from '../lib/session';
import { authMiddleware } from '../middleware/auth';
import { validatePost, validateTag, validateTime } from '../lib/validation';
import { getCookie } from 'hono/cookie';

const app = new Hono<{ Bindings: Bindings }>();

// Auth endpoints (non-protected)
app.post('/auth/login', async (c) => {
  const body = await c.req.parseBody();
  const email = body.email as string;
  const password = body.password as string;

  if (!email || !password) {
    return c.redirect('/admin/login?error=missing-credentials');
  }

  const supabase = createSupabaseClient(c.env);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    console.error('Login error:', error);
    return c.redirect('/admin/login?error=invalid-credentials');
  }

  // Set auth cookies
  setAuthCookie(c, data.session.access_token, data.session.refresh_token);

  return c.redirect('/admin');
});

app.post('/auth/logout', async (c) => {
  const supabase = createSupabaseClient(c.env);
  await supabase.auth.signOut();
  clearAuthCookies(c);
  return c.redirect('/admin/login');
});

// Image upload endpoint (protected)
app.post('/upload/image', authMiddleware, async (c) => {
  const body = await c.req.parseBody();
  const file = body.image as File;

  if (!file) {
    return c.json({ error: 'No image file provided' }, 400);
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }, 400);
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return c.json({ error: 'File size exceeds 5MB limit.' }, 400);
  }

  try {
    const supabase = createSupabaseAdminClient(c.env);

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}-${randomStr}.${ext}`;
    const filePath = `uploads/${filename}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return c.json({ error: 'Failed to upload image' }, 500);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    return c.json({
      success: true,
      url: publicUrl,
      filename: filename,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

// Posts endpoints (protected)
app.use('/posts/*', authMiddleware);

// Create post
app.post('/posts', async (c) => {
  const body = await c.req.parseBody();
  const validation = validatePost(body);

  if (!validation.success) {
    return c.redirect(`/admin/posts/new?error=${encodeURIComponent(validation.error)}`);
  }

  // Use admin client to bypass RLS
  const supabase = createSupabaseAdminClient(c.env);

  // Get user from regular client for auth
  const authClient = createSupabaseClient(c.env);
  const token = getCookie(c, 'sb-access-token');
  const { data: { user } } = await authClient.auth.getUser(token!);

  const postData = {
    ...validation.data,
    author_id: user?.id,
  };

  const { data: post, error } = await supabase
    .from('posts')
    .insert(postData)
    .select()
    .single();

  if (error) {
    console.error('Create post error:', error);
    return c.redirect(`/admin/posts/new?error=${encodeURIComponent('記事の作成に失敗しました')}`);
  }

  // Handle tags
  const tags = Array.isArray(body.tags) ? body.tags : body.tags ? [body.tags] : [];
  if (tags.length > 0) {
    const postTags = tags.map((tagId) => ({
      post_id: post.id,
      tag_id: tagId,
    }));

    await supabase.from('post_tags').insert(postTags);
  }

  return c.redirect('/admin');
});

// Update post
app.put('/posts/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.parseBody();

  // Handle _method field for HTML form compatibility
  const actualBody = { ...body };
  delete actualBody._method;

  const validation = validatePost(actualBody);

  if (!validation.success) {
    return c.redirect(`/admin/posts/${id}/edit?error=${encodeURIComponent(validation.error)}`);
  }

  // Use admin client to bypass RLS
  const supabase = createSupabaseAdminClient(c.env);

  const { error } = await supabase
    .from('posts')
    .update(validation.data)
    .eq('id', id);

  if (error) {
    console.error('Update post error:', error);
    return c.redirect(`/admin/posts/${id}/edit?error=${encodeURIComponent('記事の更新に失敗しました')}`);
  }

  // Update tags
  await supabase.from('post_tags').delete().eq('post_id', id);

  const tags = Array.isArray(body.tags) ? body.tags : body.tags ? [body.tags] : [];
  if (tags.length > 0) {
    const postTags = tags.map((tagId) => ({
      post_id: id,
      tag_id: tagId,
    }));

    await supabase.from('post_tags').insert(postTags);
  }

  return c.redirect('/admin');
});

// Delete post
app.delete('/posts/:id', async (c) => {
  const id = c.req.param('id');

  // Use admin client to bypass RLS
  const supabase = createSupabaseAdminClient(c.env);

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete post error:', error);
    return c.json({ error: 'Failed to delete post' }, 500);
  }

  return c.json({ success: true });
});

// Tags endpoints (protected)
app.use('/tags/*', authMiddleware);

// Create tag
app.post('/tags', async (c) => {
  const body = await c.req.parseBody();
  const validation = validateTag(body);

  if (!validation.success) {
    return c.redirect(`/admin/tags?error=${encodeURIComponent(validation.error)}`);
  }

  // Use admin client to bypass RLS
  const supabase = createSupabaseAdminClient(c.env);

  // Check if tag with same slug already exists
  const { data: existingTag } = await supabase
    .from('tags')
    .select('id')
    .eq('slug', validation.data.slug)
    .single();

  if (existingTag) {
    return c.redirect(`/admin/tags?error=${encodeURIComponent('このスラッグは既に使用されています')}`);
  }

  const { error } = await supabase
    .from('tags')
    .insert(validation.data);

  if (error) {
    console.error('Create tag error:', error);
    return c.redirect(`/admin/tags?error=${encodeURIComponent('タグの作成に失敗しました')}`);
  }

  return c.redirect('/admin/tags?success=' + encodeURIComponent('タグを作成しました'));
});

// Delete tag (handle both DELETE and POST with _method)
app.post('/tags/:id', async (c) => {
  const body = await c.req.parseBody();

  // Check if this is a delete request
  if (body._method !== 'DELETE') {
    return c.redirect('/admin/tags?error=' + encodeURIComponent('Invalid request'));
  }

  const id = c.req.param('id');

  // Use admin client to bypass RLS
  const supabase = createSupabaseAdminClient(c.env);

  // First, delete all post_tags associations
  await supabase.from('post_tags').delete().eq('tag_id', id);

  // Then delete the tag
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete tag error:', error);
    return c.redirect(`/admin/tags?error=${encodeURIComponent('タグの削除に失敗しました')}`);
  }

  return c.redirect('/admin/tags?success=' + encodeURIComponent('タグを削除しました'));
});

app.delete('/tags/:id', async (c) => {
  const id = c.req.param('id');

  // Use admin client to bypass RLS
  const supabase = createSupabaseAdminClient(c.env);

  // First, delete all post_tags associations
  await supabase.from('post_tags').delete().eq('tag_id', id);

  // Then delete the tag
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete tag error:', error);
    return c.json({ error: 'Failed to delete tag' }, 500);
  }

  return c.json({ success: true });
});

// Contacts endpoints (protected)
app.use('/contacts/*', authMiddleware);

// Mark contact as read (handle both PATCH and POST with _method)
app.post('/contacts/:id/read', async (c) => {
  const body = await c.req.parseBody();

  // Check if this is a patch request
  if (body._method !== 'PATCH') {
    return c.redirect('/admin/contacts?error=' + encodeURIComponent('Invalid request'));
  }

  const id = c.req.param('id');

  // Use admin client to bypass RLS
  const supabase = createSupabaseAdminClient(c.env);

  const { error } = await supabase
    .from('contacts')
    .update({ is_read: true })
    .eq('id', id);

  if (error) {
    console.error('Mark contact as read error:', error);
    return c.redirect(`/admin/contacts?error=${encodeURIComponent('既読マークに失敗しました')}`);
  }

  return c.redirect('/admin/contacts?success=' + encodeURIComponent('既読にしました'));
});

app.patch('/contacts/:id/read', async (c) => {
  const id = c.req.param('id');

  // Use admin client to bypass RLS
  const supabase = createSupabaseAdminClient(c.env);

  const { error } = await supabase
    .from('contacts')
    .update({ is_read: true })
    .eq('id', id);

  if (error) {
    console.error('Mark contact as read error:', error);
    return c.json({ error: 'Failed to mark as read' }, 500);
  }

  return c.json({ success: true });
});

// Times endpoints

// Get all times (public, no auth required)
app.get('/times', async (c) => {
  const supabase = createSupabaseClient(c.env);

  const { data: times, error } = await supabase
    .from('times')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get times error:', error);
    return c.json({ error: 'Failed to fetch times' }, 500);
  }

  return c.json(times || []);
});

// Times endpoints (protected)
app.use('/times/*', authMiddleware);

// Create time
app.post('/times', async (c) => {
  try {
    const body = await c.req.json();
    const validation = validateTime(body);

    if (!validation.success) {
      return c.json({ error: validation.error }, 400);
    }

    // Use admin client to bypass RLS
    const supabase = createSupabaseAdminClient(c.env);

    // Get user from regular client for auth
    const authClient = createSupabaseClient(c.env);
    const token = getCookie(c, 'sb-access-token');
    const { data: { user } } = await authClient.auth.getUser(token!);

    const timeData = {
      ...validation.data,
      author_id: user?.id,
    };

    const { data: time, error } = await supabase
      .from('times')
      .insert(timeData)
      .select()
      .single();

    if (error) {
      console.error('Create time error:', error);
      return c.json({ error: 'Timeの作成に失敗しました' }, 500);
    }

    return c.json({ success: true, time });
  } catch (error) {
    console.error('Create time error:', error);
    return c.json({ error: 'Timeの作成に失敗しました' }, 500);
  }
});

// Delete time
app.delete('/times/:id', async (c) => {
  const id = c.req.param('id');

  // Use admin client to bypass RLS
  const supabase = createSupabaseAdminClient(c.env);

  const { error } = await supabase
    .from('times')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Delete time error:', error);
    return c.json({ error: 'Failed to delete time' }, 500);
  }

  return c.json({ success: true });
});

export default app;
