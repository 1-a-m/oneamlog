import { BaseLayout } from '../layouts/BaseLayout';
import type { Post, Time } from '../../types';

interface HomeProps {
  recentPosts?: Post[];
  recentTimes?: Time[];
}

export function Home({ recentPosts = [], recentTimes = [] }: HomeProps) {
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
            <section class="skills">
              <h2>Skills</h2>
              <div class="skills-grid">
                <div class="skill-card">
                  <h3>フロントエンド</h3>
                  <ul>
                    <li>TypeScript / JavaScript</li>
                    <li>React / Vue / Hono</li>
                    <li>HTML / CSS</li>
                  </ul>
                </div>
                <div class="skill-card">
                  <h3>バックエンド</h3>
                  <ul>
                    <li>Python / Go</li>
                    <li>Node.js / Deno</li>
                    <li>Cloudflare Workers</li>
                    <li>Supabase / PostgreSQL</li>
                  </ul>
                </div>
                <div class="skill-card">
                  <h3>インフラ</h3>
                  <ul>
                    <li>AWS</li>
                    <li>Google Cloud / Azure</li>
                    <li>Cloudflare</li>
                    <li>Docker</li>
                    <li>CI/CD</li>
                  </ul>
                </div>
              </div>
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
                      <div class="recent-post-content">
                        <h3 class="recent-post-title">{post.title}</h3>
                        {post.excerpt && <p class="recent-post-excerpt">{post.excerpt}</p>}
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
              <h2>Check out my work</h2>
              <div class="cta-buttons">
                <a href="/blog" class="btn btn-primary">View Blog</a>
                <a href="/about" class="btn btn-secondary">About Me</a>
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
