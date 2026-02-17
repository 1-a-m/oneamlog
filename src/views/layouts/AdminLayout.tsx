interface AdminLayoutProps {
  title?: string;
  children: any;
}

export function AdminLayout({
  title = 'Admin - oneamlog',
  children
}: AdminLayoutProps) {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/dist/editor.css" />
      </head>
      <body>
        <div class="admin-container">
          <aside class="admin-sidebar">
            <div class="admin-logo">
              <a href="/admin">oneamlog Admin</a>
            </div>
            <nav class="admin-nav">
              <a href="/admin" class="admin-nav-item">
                📊 ダッシュボード
              </a>
              <a href="/admin/posts/new" class="admin-nav-item">
                ✏️ 新規記事
              </a>
              <a href="/admin/works" class="admin-nav-item">
                💼 Work管理
              </a>
              <a href="/admin/times" class="admin-nav-item">
                💬 Times
              </a>
              <a href="/admin/tags" class="admin-nav-item">
                🏷️ タグ管理
              </a>
              <a href="/admin/contacts" class="admin-nav-item">
                📧 お問い合わせ
              </a>
              <a href="/" class="admin-nav-item" target="_blank">
                🌐 サイトを見る
              </a>
              <form method="POST" action="/api/auth/logout" class="admin-logout-form">
                <button type="submit" class="admin-nav-item admin-logout-btn">
                  🚪 ログアウト
                </button>
              </form>
            </nav>
          </aside>
          <main class="admin-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
