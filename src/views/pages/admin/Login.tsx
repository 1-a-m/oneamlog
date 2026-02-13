interface LoginProps {
  errorMsg?: string;
}

export function Login({ errorMsg }: LoginProps = {}) {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Login - oneamlog Admin</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <div class="login-container">
          <div class="login-card">
            <h1 class="login-title">oneamlog Admin</h1>
            <p class="login-subtitle">管理画面にログイン</p>

            {errorMsg && (
              <div class="alert alert-error">
                {errorMsg}
              </div>
            )}

            <form method="POST" action="/api/auth/login" class="login-form">
              <div class="form-group">
                <label for="email">メールアドレス</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  autofocus
                />
              </div>

              <div class="form-group">
                <label for="password">パスワード</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                />
              </div>

              <button type="submit" class="btn btn-primary btn-block">
                ログイン
              </button>
            </form>

            <div class="login-footer">
              <a href="/" class="login-back-link">← サイトに戻る</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
