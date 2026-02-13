import { marked } from 'marked';

// Configure marked with safe options
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Simple HTML sanitization for Cloudflare Workers
function sanitizeHtml(html: string): string {
  // Allow common safe HTML tags
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'del', 'ins'
  ];

  // Basic XSS prevention - remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');

  return sanitized;
}

export function parseMarkdown(content: string): string {
  const html = marked.parse(content) as string;
  return sanitizeHtml(html);
}
