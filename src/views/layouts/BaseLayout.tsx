import { html } from 'hono/html';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface BaseLayoutProps {
  title?: string;
  description?: string;
  children: any;
}

export function BaseLayout({
  title = 'oneamlog - Engineer Portfolio & Blog',
  description = 'エンジニアのポートフォリオとブログサイト',
  children
}: BaseLayoutProps) {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Header />
        <main class="main">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
