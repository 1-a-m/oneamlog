import { html } from 'hono/html';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface BaseLayoutProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  children: any;
}

export function BaseLayout({
  title = 'oneamlog - Engineer Portfolio & Blog',
  description = 'エンジニアのポートフォリオとブログサイト',
  ogImage = '/og-image.png',
  ogType = 'website',
  canonicalUrl,
  children
}: BaseLayoutProps) {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="description" content={description} />

        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={ogType} />
        <meta property="og:image" content={ogImage} />
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        <meta property="og:site_name" content="oneamlog" />
        <meta property="og:locale" content="ja_JP" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />

        {/* SEO */}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="oneam" />

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
