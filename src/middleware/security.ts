import type { Context, Next } from 'hono';

export async function securityHeaders(c: Context, next: Next) {
  await next();

  // MIMEスニッフィング防止
  c.res.headers.set('X-Content-Type-Options', 'nosniff');

  // クリックジャッキング防止
  c.res.headers.set('X-Frame-Options', 'DENY');

  // 古いXSSフィルタ無効化（CSPで代替）
  c.res.headers.set('X-XSS-Protection', '0');

  // リファラー情報の制限
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 不要なブラウザAPI無効化
  c.res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HTTPS強制（1年間）
  c.res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Content Security Policy
  c.res.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https://*.supabase.co data:",
    "connect-src 'self' https://*.supabase.co",
    "font-src 'self'",
  ].join('; '));
}
