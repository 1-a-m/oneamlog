import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { createSupabaseClient } from '../lib/supabase';
import { setAuthCookie } from '../lib/session';
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
    // アクセストークンが切れている場合、リフレッシュトークンで更新を試みる
    const refreshToken = getCookie(c, 'sb-refresh-token');
    if (!refreshToken) {
      return c.redirect('/admin/login');
    }

    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (refreshError || !refreshData.session) {
      return c.redirect('/admin/login');
    }

    // 新しいトークンをCookieに保存
    setAuthCookie(c, refreshData.session.access_token, refreshData.session.refresh_token);
    c.set('user', refreshData.session.user);

    await next();
    return;
  }

  // Store user in context
  c.set('user', user);

  await next();
}
