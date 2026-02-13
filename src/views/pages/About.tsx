import { BaseLayout } from '../layouts/BaseLayout';

export function About() {
  return (
    <BaseLayout title="About - oneamlog" description="エンジニアとしての経歴">
      <div class="container">
        <section class="about">
          <h1>About Me</h1>

          <div class="about-content">
            <h2>経歴</h2>
            <div class="timeline">
              <div class="timeline-item">
                <h3>現在</h3>
                <p>フルスタックエンジニアとして活動中</p>
                <p>主に TypeScript、Hono、Cloudflare Workers、Supabase を使用した Web アプリケーション開発に従事</p>
              </div>
              {/*
                経歴を追加する場合はここに追記してください
                <div class="timeline-item">
                  <h3>2023年</h3>
                  <p>...</p>
                </div>
              */}
            </div>

            <h2>技術スタック</h2>
            <p>モダンな Web 技術を活用した、高速で軽量なアプリケーション開発を得意としています。</p>
            <ul>
              <li>フロントエンド: TypeScript, React, Vue, Hono JSX</li>
              <li>バックエンド: Hono, Node.js, Cloudflare Workers</li>
              <li>データベース: Supabase (PostgreSQL), SQLite</li>
              <li>インフラ: Cloudflare Pages/Workers, Docker</li>
            </ul>

            <h2>興味・関心</h2>
            <p>エッジコンピューティング、サーバーレスアーキテクチャ、DX（開発者体験）の向上に興味があります。</p>
          </div>
        </section>
      </div>
    </BaseLayout>
  );
}
