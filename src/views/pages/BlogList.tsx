import { BaseLayout } from '../layouts/BaseLayout';
import { BlogCard } from '../components/BlogCard';
import type { Post, Tag } from '../../types';

interface BlogListProps {
  posts: Post[];
  currentTag?: string;
  allTags?: Tag[];
}

export function BlogList({ posts, currentTag, allTags = [] }: BlogListProps) {
  const title = currentTag
    ? `Blog - ${currentTag} - oneamlog`
    : 'Blog - oneamlog';

  return (
    <BaseLayout title={title} description="エンジニアブログ記事一覧">
      <div class="container">
        <section class="blog-list">
          <h1>Blog</h1>

          {allTags.length > 0 && (
            <div class="tag-filter">
              <a
                href="/blog"
                class={`tag-filter-item ${!currentTag ? 'active' : ''}`}
              >
                All
              </a>
              {allTags.map((tag) => (
                <a
                  href={`/blog?tag=${tag.slug}`}
                  class={`tag-filter-item ${currentTag === tag.slug ? 'active' : ''}`}
                  key={tag.id}
                >
                  {tag.name}
                </a>
              ))}
            </div>
          )}

          {posts.length === 0 ? (
            <p class="no-posts">記事がまだありません。</p>
          ) : (
            <div class="blog-grid">
              {posts.map((post) => (
                <BlogCard post={post} key={post.id} />
              ))}
            </div>
          )}
        </section>
      </div>
    </BaseLayout>
  );
}
