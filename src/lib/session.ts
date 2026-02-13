import { Context } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';

export function setAuthCookie(c: Context, accessToken: string, refreshToken: string) {
  setCookie(c, 'sb-access-token', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  setCookie(c, 'sb-refresh-token', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

export function clearAuthCookies(c: Context) {
  deleteCookie(c, 'sb-access-token');
  deleteCookie(c, 'sb-refresh-token');
}
