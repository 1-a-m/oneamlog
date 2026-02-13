import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { createSupabaseClient } from '../lib/supabase';
import type { Bindings } from '../types';

export async function authMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
  // Get access token from cookie or Authorization header
  const token = getCookie(c, 'sb-access-token') ||
                c.req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return c.redirect('/admin/login');
  }

  const supabase = createSupabaseClient(c.env);

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return c.redirect('/admin/login');
  }

  // Store user in context
  c.set('user', user);

  await next();
}
