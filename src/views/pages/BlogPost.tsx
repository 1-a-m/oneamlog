import { BaseLayout } from '../layouts/BaseLayout';
import { TagBadge } from '../components/TagBadge';
import { formatDate } from '../../utils/date';
import { parseMarkdown } from '../../lib/markdown';
import type { Post } from '../../types';
import { raw } from 'hono/html';

interface BlogPostProps {
  post: Post;
}

export function BlogPost({ post }: BlogPostProps) {
  const htmlContent = parseMarkdown(post.content);

  return (
    <BaseLayout title={`${post.title} - oneamlog`} description={post.excerpt || post.title}>
      <div class="container">
        <article class="blog-post">
          <header class="blog-post-header">
            <h1>{post.title}</h1>
            <div class="blog-post-meta">
              <time datetime={post.published_at || post.created_at}>
                {formatDate(post.published_at || post.created_at)}
              </time>
              <span class="blog-post-views">{post.view_count} views</span>
            </div>
            {post.tags && post.tags.length > 0 && (
              <div class="blog-post-tags">
                {post.tags.map((tag) => (
                  <TagBadge tag={tag} key={tag.id} />
                ))}
              </div>
            )}
          </header>

          <div class="blog-post-content">
            {raw(htmlContent)}
          </div>

          <footer class="blog-post-footer">
            <a href="/blog" class="btn btn-secondary">← Back to Blog</a>
          </footer>
        </article>
      </div>
    </BaseLayout>
  );
}
