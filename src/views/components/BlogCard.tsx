import type { Post } from '../../types';
import { formatDate } from '../../utils/date';
import { TagBadge } from './TagBadge';

interface BlogCardProps {
  post: Post;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article class="blog-card">
      <h2 class="blog-card-title">
        <a href={`/blog/${post.slug}`}>{post.title}</a>
      </h2>
      {post.excerpt && (
        <p class="blog-card-excerpt">{post.excerpt}</p>
      )}
      <div class="blog-card-meta">
        <span class="blog-card-date">{formatDate(post.published_at || post.created_at)}</span>
        {post.tags && post.tags.length > 0 && (
          <div class="blog-card-tags">
            {post.tags.map((tag) => (
              <TagBadge tag={tag} key={tag.id} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
