import { BaseLayout } from '../layouts/BaseLayout';

export function Home() {
  return (
    <BaseLayout title="Home - oneamlog" description="エンジニアポートフォリオとブログ">
      <div class="container">
        <section class="hero">
          <h1>Welcome to oneamlog</h1>
          <p class="hero-subtitle">エンジニアのポートフォリオ &amp; ブログサイト</p>
        </section>

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
                <li>Node.js / Deno</li>
                <li>Cloudflare Workers</li>
                <li>Supabase / PostgreSQL</li>
              </ul>
            </div>
            <div class="skill-card">
              <h3>インフラ</h3>
              <ul>
                <li>Cloudflare</li>
                <li>Docker</li>
                <li>CI/CD</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="cta">
          <h2>Check out my work</h2>
          <div class="cta-buttons">
            <a href="/blog" class="btn btn-primary">View Blog</a>
            <a href="/about" class="btn btn-secondary">About Me</a>
          </div>
        </section>
      </div>
    </BaseLayout>
  );
}
