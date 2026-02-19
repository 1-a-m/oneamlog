import { BaseLayout } from '../layouts/BaseLayout';
import { WorkCard } from '../components/WorkCard';
import type { Post, Time, Work } from '../../types';

interface HomeProps {
  recentPosts?: Post[];
  recentTimes?: Time[];
  works?: Work[];
}

export function Home({ recentPosts = [], recentTimes = [], works = [] }: HomeProps) {
  return (
    <BaseLayout title="Home - oneamlog" description="エンジニアポートフォリオとブログ">
      <div class="container">
        <section class="hero">
          <h1>Welcome to oneamlog</h1>
          <p class="hero-subtitle">インフラエンジニアのポートフォリオ &amp; ブログサイト</p>
        </section>

        <div class="home-layout">
          {/* Main Content */}
          <div class="home-main">
            <section class="works-section">
              <div class="section-header">
                <h2>Work</h2>
              </div>
              {works.length === 0 ? (
                <p class="no-content">現在、公開できる実績はありません。</p>
              ) : (
                <div class="works-grid">
                  {works.map((work) => (
                    <WorkCard work={work} key={work.id} />
                  ))}
                </div>
              )}
            </section>

            {recentPosts.length > 0 && (
              <section class="recent-posts">
                <div class="section-header">
                  <h2>最新の記事</h2>
                  <a href="/blog" class="view-more">もっと見る →</a>
                </div>
                <div class="recent-posts-grid">
                  {recentPosts.map((post) => (
                    <a href={`/blog/${post.slug}`} class="recent-post-card">
                      {post.thumbnail_url && (
                        <div class="recent-post-thumbnail">
                          <img src={post.thumbnail_url} alt={post.title} loading="lazy" />
                        </div>
                      )}
                      <div class="recent-post-content">
                        <h3 class="recent-post-title">{post.title}</h3>
                        {post.excerpt && <p class="recent-post-excerpt">{post.excerpt}</p>}
                        {post.tags && post.tags.length > 0 && (
                          <div class="recent-post-tags">
                            {post.tags.map((tag) => (
                              <span class="tag-badge" key={tag.id}>{tag.name}</span>
                            ))}
                          </div>
                        )}
                        <div class="recent-post-meta">
                          <time datetime={post.published_at}>
                            {new Date(post.published_at).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </time>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            <section class="cta">
              <h2>Contents</h2>
              <div class="cta-buttons">
                <a href="/blog" class="btn btn-secondary">View Blog</a>
                <a href="/about" class="btn btn-secondary">About Me</a>
                <a href="/times" class="btn btn-secondary">Times</a>
                <a href="/contact" class="btn btn-secondary">Contact me</a>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside class="home-sidebar">
            {recentTimes.length > 0 && (
              <section class="recent-times">
                <div class="section-header">
                  <h2>💬 最新のTimes</h2>
                  <a href="/times" class="view-more">もっと見る →</a>
                </div>
                <div class="times-preview">
                  {recentTimes.map((time) => (
                    <article key={time.id} class="time-item-compact">
                      <time class="time-date" datetime={time.created_at}>
                        {new Date(time.created_at).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                      <p class="time-text">{time.content}</p>
                      {time.image_url && (
                        <img src={time.image_url} alt="" class="time-thumbnail" loading="lazy" />
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </BaseLayout>
  );
}
