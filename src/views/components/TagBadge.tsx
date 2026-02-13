import type { Tag } from '../../types';

interface TagBadgeProps {
  tag: Tag;
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <a href={`/blog?tag=${tag.slug}`} class="tag-badge">
      {tag.name}
    </a>
  );
}
